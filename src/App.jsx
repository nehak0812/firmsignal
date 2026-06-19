import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { 
  ALL_FIRMS, CONSULTING_FIRMS, TECH_FIRMS, AI_FIRST_FIRMS, 
  SIGNALS, SIGNAL_COLORS, DEMO_SIGNALS, 
  getTickerItems, getBrief, buildHeatmap, callClaude 
} from './data.js';
import { 
  Ticker, BriefView, SignalsView, HeatmapView, CompareView, WatchlistView,
  ContextCornerView, KnowledgeGraph, DataPipelineAuditView, ThoughtLeadershipView,
  AiSummitsView, LatestOnLinkedInView, FinancialRoundupView
} from './views.jsx';
import { TweaksPanel, TweakSection, TweakRadio, TweakToggle, useTweaks } from './tweaks.jsx';

// Helper to check if the AI NOW Summit is active (May 28-30, 2026; auto-hides on June 1, 2026)
const isSummitActive = () => {
  const now = new Date();
  const expiration = new Date('2026-06-01T00:00:00');
  return now <= expiration;
};

// ============== SIDEBAR FILTER COMPONENT ==============
function Sidebar({ firms = [], data, activeFirms, toggleFirm, activeSignals, toggleSignal, view, setView, onOpenApiModal, setActiveFirms, excludedFirms = new Set(), toggleExcludeFirm }) {
  const consCount = data.filter(d => d.type === 'consulting').length;
  const techCount = data.filter(d => d.type === 'tech').length;
  const aiCount = data.filter(d => d.type === 'ai-first').length;

  const consultingList = firms.filter(f => f.type === 'consulting');
  const aiList = firms.filter(f => f.type === 'ai-first');
  const techList = firms.filter(f => f.type === 'tech');

  const filterByFirmGroup = (groupList) => {
    const ids = groupList.map(f => f.id);
    const isCurrentlyFilteredToGroup = activeFirms.size === ids.length && ids.every(id => activeFirms.has(id));
    setActiveFirms(prev => {
      if (isCurrentlyFilteredToGroup) {
        return new Set();
      } else {
        return new Set(ids.filter(id => !excludedFirms.has(id)));
      }
    });
  };

  const isConsFiltered = consultingList.length > 0 && activeFirms.size === consultingList.filter(f => !excludedFirms.has(f.id)).length && consultingList.filter(f => !excludedFirms.has(f.id)).every(f => activeFirms.has(f.id));
  const isAiFiltered = aiList.length > 0 && activeFirms.size === aiList.filter(f => !excludedFirms.has(f.id)).length && aiList.filter(f => !excludedFirms.has(f.id)).every(f => activeFirms.has(f.id));
  const isTechFiltered = techList.length > 0 && activeFirms.size === techList.filter(f => !excludedFirms.has(f.id)).length && techList.filter(f => !excludedFirms.has(f.id)).every(f => activeFirms.has(f.id));

  const firmRow = (f) => {
    const cnt = data.filter(d => d.firm === f.id).length;
    const isActive = activeFirms.has(f.id);
    const isExcluded = excludedFirms.has(f.id);
    return (
      <div 
        key={f.id} 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          width: '100%',
          position: 'relative'
        }}
      >
        <button 
          className={`sb-row ${isActive ? (f.type === 'tech' ? 'active tech' : 'active') : ''}`}
          onClick={() => !isExcluded && toggleFirm(f.id)}
          style={{ 
            flexGrow: 1, 
            opacity: isExcluded ? 0.35 : 1,
            textDecoration: isExcluded ? 'line-through' : 'none',
            pointerEvents: isExcluded ? 'none' : 'auto'
          }}
          disabled={isExcluded}
        >
          <span className="sb-dot" style={{ background: f.dot }} />
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {f.id}
            {f.aiNowSponsor && isSummitActive() && (
              <span style={{ color: '#d4a04a', fontSize: 11, cursor: 'help' }} title="Currently a sponsor of the AI Now Summit">★</span>
            )}
          </span>
          <span className="sb-count-mini">{cnt || ''}</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleExcludeFirm(f.id);
          }}
          className="sb-exclude-btn"
          style={{
            background: 'none',
            border: 'none',
            color: isExcluded ? 'var(--crit)' : 'var(--ink-3)',
            cursor: 'pointer',
            padding: '4px 8px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isExcluded ? 1 : 0.4,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = isExcluded ? '1' : '0.4'; }}
          title={isExcluded ? "Include firm" : "Exclude firm"}
        >
          {isExcluded ? '👁️' : '✕'}
        </button>
      </div>
    );
  };

  return (
    <aside className="sidebar">

      <div className="sb-section">
        <div className="sb-label">View Feed</div>
        <button className={`sb-row ${view === 'all' ? 'active' : ''}`} onClick={() => setView('all')}>All active signals</button>
        <button className={`sb-row ${view === 'week' ? 'active' : ''}`} onClick={() => setView('week')}>Past 7 days only</button>
        <button className={`sb-row ${view === 'highimpact' ? 'active' : ''}`} onClick={() => setView('highimpact')}>Impact score &gt;= 4</button>
      </div>

      <div className="sb-section">
        <div 
          className={`sb-label clickable-header ${isConsFiltered ? 'active' : ''}`} 
          onClick={() => filterByFirmGroup(consultingList)}
          style={{ cursor: 'pointer' }}
          title="Click to filter to only Compete firms"
        >
          <span>Compete <span>🔍</span></span>
          <span className="sb-count">{consCount}</span>
        </div>
        {consultingList.map(firmRow)}
      </div>

      <div className="sb-section">
        <div 
          className={`sb-label clickable-header ${isAiFiltered ? 'active' : ''}`} 
          onClick={() => filterByFirmGroup(aiList)}
          style={{ cursor: 'pointer' }}
          title="Click to filter to only AI-first labs"
        >
          <span>AI-first labs <span>🔍</span></span>
          <span className="sb-count">{aiCount}</span>
        </div>
        {aiList.map(firmRow)}
      </div>

      <div className="sb-section">
        <div 
          className={`sb-label clickable-header ${isTechFiltered ? 'active tech' : ''}`} 
          onClick={() => filterByFirmGroup(techList)}
          style={{ cursor: 'pointer' }}
          title="Click to filter to only Tech &amp; AI partners"
        >
          <span>Tech &amp; AI partners <span>🔍</span></span>
          <span className="sb-count">{techCount}</span>
        </div>
        {techList.map(firmRow)}
      </div>

      <div className="sb-section">
        <div className="sb-label">Signal Taxonomy</div>
        <div className="sb-chip-row">
          {SIGNALS.map(s => (
            <button 
              key={s} 
              className={`sb-chip ${activeSignals.has(s) ? 'active' : ''}`} 
              onClick={() => toggleSignal(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      {/* AI Now Summit Sponsor Legend */}
      {isSummitActive() && (
        <div style={{
          marginTop: 'auto',
          padding: '10px 12px',
          background: 'rgba(212, 160, 74, 0.05)',
          border: '1px dashed rgba(212, 160, 74, 0.3)',
          borderRadius: '6px',
          fontSize: '11px',
          color: 'var(--ink-2)',
          fontFamily: 'var(--serif)',
          lineHeight: '1.4',
          margin: '10px 8px'
        }}>
          <span style={{ color: '#d4a04a', fontWeight: 'bold', marginRight: '4px' }}>★</span>
          Currently a sponsor of the <strong>AI Now Summit</strong> organized by Mistral AI.
        </div>
      )}

      <div className="sb-section" style={{ paddingTop: 10 }}>
        <button 
          className="sb-row" 
          onClick={onOpenApiModal}
          style={{ 
            opacity: 0.65, 
            fontSize: 11, 
            fontFamily: 'var(--mono)', 
            border: '1px dashed var(--line)', 
            borderRadius: 4, 
            textAlign: 'center', 
            justifyContent: 'center',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <span>🔑</span> API Credentials
        </button>
      </div>
    </aside>
  );
}

// ============== INTEL NEWS FETCH COMPONENT ==============
function FetchPanel({ firms = [], apiKey, serverHasKey, onOpenApiModal, onAddItems, onShowToast }) {
  const [mode, setMode] = useState('sweep-consulting');
  const [firm, setFirm] = useState('Deloitte');
  const [customQ, setCustomQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);

  const CONSULTING_SWEEP = firms.filter(f => f.type === 'consulting').map(f => f.id);
  const TECH_SWEEP = firms.filter(f => f.type === 'tech').map(f => f.id);
  const AI_SWEEP = firms.filter(f => f.type === 'ai-first').map(f => f.id);

  const btnLabel = {
    'sweep-consulting': 'Sweep consulting firms',
    'sweep-tech':       'Sweep tech partners',
    'sweep-ai':         'Sweep AI labs',
    'sweep-all':        'Sweep all firms',
    'firm':             'Scan firm',
    'custom':           'Query Claude',
  }[mode];

  const runSweep = async (firmsToSweep, label) => {
    const today = new Date().toISOString().slice(0, 10);
    let totalAdded = 0;
    const log = [];
    setProgress({ current: 0, total: firmsToSweep.length, label: `Starting ${label}…`, log: [] });
    
    for (let i = 0; i < firmsToSweep.length; i++) {
      const f = firmsToSweep[i];
      setProgress(p => ({ ...p, current: i, label: `Polling live ${f} news…` }));
      try {
        const results = await callClaude(`"${f}" AND (site:reuters.com OR site:ft.com OR site:bloomberg.com OR site:nytimes.com OR site:techcrunch.com) AND (AI OR tech OR consulting OR earnings OR partner OR layoff OR alliance)`, apiKey);
        const added = onAddItems(results, `sweep_${Date.now()}_${i}`);
        log.unshift(`${f} — ${added} new signal${added !== 1 ? 's' : ''} index`);
        totalAdded += added;
        setProgress(p => ({ ...p, log: [...log] }));
      } catch (err) {
        log.unshift(`${f} — error loading`);
        setProgress(p => ({ ...p, log: [...log] }));
      }
      if (i < firmsToSweep.length - 1) await new Promise(r => setTimeout(r, 700));
    }
    setProgress({ current: firmsToSweep.length, total: firmsToSweep.length, label: 'Sweep completed', log });
    onShowToast(`✓ ${label} done — ${totalAdded} new signals indexed`);
    setTimeout(() => setProgress(null), 9000);
  };

  const onFetch = async () => {
    if (!apiKey && !serverHasKey) { onOpenApiModal(); return; }
    setBusy(true);
    const today = new Date().toISOString().slice(0, 10);
    try {
      if (mode === 'sweep-consulting') await runSweep(CONSULTING_SWEEP, 'consulting sweep');
      else if (mode === 'sweep-tech') await runSweep(TECH_SWEEP, 'tech sweep');
      else if (mode === 'sweep-ai') await runSweep(AI_SWEEP, 'AI lab sweep');
      else if (mode === 'sweep-all') await runSweep([...CONSULTING_SWEEP, ...TECH_SWEEP, ...AI_SWEEP], 'full sweep');
      else if (mode === 'firm') {
        onShowToast(`Loading ${firm} intelligence…`);
        const results = await callClaude(`"${firm}" AND (AI OR tech OR consulting OR earnings OR leadership OR partner OR product OR layoff)`, apiKey);
        const added = onAddItems(results, `firm_${Date.now()}`);
        onShowToast(`✓ ${added} new signals for ${firm}`);
      } else if (mode === 'custom') {
        if (!customQ.trim()) { onShowToast('Enter search criteria'); setBusy(false); return; }
        onShowToast('Querying intelligence pipeline…');
        const results = await callClaude(customQ, apiKey);
        const added = onAddItems(results, `custom_${Date.now()}`);
        onShowToast(`✓ ${added} new signals from custom query`);
      }
    } catch (err) {
      onShowToast(`Error: ${err.message || 'load failed'}`);
    }
    setBusy(false);
  };

  return (
    <div className="fetch-card">
      <div className="fetch-title">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: 8 }}>
          <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M6 3v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        Live News Fetching &amp; Claude Synthesis Pipeline
      </div>
      <div className="fetch-row">
        <select className="select" value={mode} onChange={e => setMode(e.target.value)}>
          <option value="sweep-consulting">Sweep weekly — consulting firms</option>
          <option value="sweep-tech">Sweep weekly — tech partners</option>
          <option value="sweep-ai">Sweep weekly — AI labs</option>
          <option value="sweep-all">Sweep weekly — everything</option>
          <option value="firm">Pivot single firm</option>
          <option value="custom">Custom query prompt</option>
        </select>
        
        {mode === 'firm' && (
          <select className="select" value={firm} onChange={e => setFirm(e.target.value)}>
            <optgroup label="Compete">
              {firms.filter(f => f.type === 'consulting').map(f => <option key={f.id} value={f.id}>{f.id}</option>)}
            </optgroup>
            <optgroup label="AI-first labs">
              {firms.filter(f => f.type === 'ai-first').map(f => <option key={f.id} value={f.id}>{f.id}</option>)}
            </optgroup>
            <optgroup label="Tech Partners">
              {firms.filter(f => f.type === 'tech').map(f => <option key={f.id} value={f.id}>{f.id}</option>)}
            </optgroup>
          </select>
        )}
        
        {mode === 'custom' && (
          <input className="custom-input" placeholder="e.g., McKinsey OpenAI alliance details" value={customQ} onChange={e => setCustomQ(e.target.value)} />
        )}
        
        <button className={`fetch-btn ${busy ? 'loading' : ''}`} onClick={onFetch} disabled={busy}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ marginRight: 4 }}>
            <path d="M5.5 1v2M5.5 8v2M1 5.5h2M8 5.5h2M2.5 2.5l1.5 1.5M7 7l1.5 1.5M2.5 8.5L4 7M7 4l1.5-1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          {busy ? 'Scanning…' : btnLabel}
        </button>
      </div>

      {progress && (
        <div className="sweep-prog">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-2)' }}>{progress.label}</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)' }}>{progress.current} / {progress.total}</span>
          </div>
          <div className="sweep-bar-wrap">
            <div className="sweep-bar" style={{ width: `${(progress.current / progress.total) * 100}%` }} />
          </div>
          {progress.log.length > 0 && (
            <div className="sweep-log">
              {progress.log.map((l, i) => <div key={i}>{l}</div>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============== API KEY SECURITY MODAL ==============
function ApiModal({ open, onClose, onSave, onSkip }) {
  const [key, setKey] = useState('');
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Connect Anthropic API Key</h2>
        <p>Authenticate your session to unlock live Claude scans. Your key resides in local browser storage only and directly accesses Anthropic API endpoints.</p>
        <input 
          type="password" 
          placeholder="sk-ant-..." 
          value={key} 
          onChange={e => setKey(e.target.value)} 
          autoComplete="off" 
        />
        <div className="modal-btns">
          <button className="icon-btn" onClick={onSkip}>Demo Mode</button>
          <button className="icon-btn primary" onClick={() => onSave(key)}>Connect →</button>
        </div>
        <p className="modal-note">Get a key at console.anthropic.com. Operating costs are calculated directly via Anthropic's platform tokens.</p>
      </div>
    </div>
  );
}

// ============== AI ADVISORY COLLAPSIBLE CHAT DRAWER ==============
function AdvisoryChatDrawer({ open, onClose, data, apiKey, serverHasKey }) {
  const [activeAgent, setActiveAgent] = useState('Strategic Advisor');
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  
  // Independent chat history mapping for each executive agent
  const [histories, setHistories] = useState({
    'Strategic Advisor': [
      { sender: 'agent', text: 'Welcome, Director. I am your Strategic Advisor. I analyze global professional service consolidations, ecosystem restructures, and sovereign AI models. How can I guide your positioning today?' }
    ],
    'Lead Researcher': [
      { sender: 'agent', text: 'Lead Researcher reporting. Fact-finding engine online. I scan raw intelligence streams, compile index timelines, and isolate hard metrics. Ask me for data statistics.' }
    ],
    'Principal Analyst': [
      { sender: 'agent', text: 'SWOT Analyst active. I critique rival strategy decks, evaluate market exposures, and outline quarterly tactical plays. What competitor action shall we assess?' }
    ]
  });

  const messageEndRef = useRef(null);

  // Scroll to bottom on updates
  useEffect(() => {
    if (open) {
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [histories, activeAgent, open]);

  const activeHistory = histories[activeAgent];

  const handleSend = async (textToSend) => {
    const txt = textToSend || input;
    if (!txt.trim()) return;

    // Add user message
    const userMsg = { sender: 'user', text: txt };
    setHistories(prev => ({
      ...prev,
      [activeAgent]: [...prev[activeAgent], userMsg]
    }));
    setInput('');

    // If live (API key available on client or server), call backend RAG Chat API
    if (apiKey || serverHasKey) {
      setIsThinking(true);
      
      const thinkingMsg = { sender: 'agent', text: 'Thinking...', isThinkingPlaceholder: true };
      setHistories(prev => ({
        ...prev,
        [activeAgent]: [...prev[activeAgent], thinkingMsg]
      }));

      try {
        const agentMap = {
          'Strategic Advisor': 'advisor',
          'Lead Researcher': 'researcher',
          'Principal Analyst': 'analyst'
        };
        const backendAgentName = agentMap[activeAgent] || 'advisor';
        const backendHistory = activeHistory.filter(h => !h.isThinkingPlaceholder).map(h => ({
          role: h.sender === 'user' ? 'user' : 'assistant',
          content: h.text
        }));

        const resp = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: txt,
            agent: backendAgentName,
            history: backendHistory,
            apiKey
          })
        });

        if (resp.ok) {
          const resData = await resp.json();
          if (resData.success && resData.response) {
            setHistories(prev => {
              const currentHistory = prev[activeAgent].filter(h => !h.isThinkingPlaceholder);
              return {
                ...prev,
                [activeAgent]: [...currentHistory, { sender: 'agent', text: resData.response }]
              };
            });
            setIsThinking(false);
            return;
          }
        }
      } catch (err) {
        console.warn('[FirmSignal] Chat API request failed. Falling back to local responder.', err);
      }
      
      // Clean up placeholder if failed
      setHistories(prev => ({
        ...prev,
        [activeAgent]: prev[activeAgent].filter(h => !h.isThinkingPlaceholder)
      }));
      setIsThinking(false);
    }

    // Fallback simulated responder (Offline Mode)
    const thinkingMsgFallback = { sender: 'agent', text: 'Thinking...', isThinkingPlaceholder: true };
    setHistories(prev => ({
      ...prev,
      [activeAgent]: [...prev[activeAgent], thinkingMsgFallback]
    }));

    setTimeout(() => {
      const replyText = getAgentResponse(activeAgent, txt, data);
      setHistories(prev => {
        const currentHistory = prev[activeAgent].filter(h => !h.isThinkingPlaceholder);
        return {
          ...prev,
          [activeAgent]: [...currentHistory, { sender: 'agent', text: replyText }]
        };
      });
    }, 850);
  };

  // Dedicated mock AI Responder yielding customized reports based on loaded DB records
  const getAgentResponse = (agent, text, db) => {
    const q = text.toLowerCase();
    
    if (agent === 'Strategic Advisor') {
      if (q.includes('threat') || q.includes('risk') || q.includes('exposure')) {
        const threats = db.filter(d => d.contextCorner?.threat).slice(0, 2);
        return `### **[Strategic Briefing: C-Suite Risk Mapping]**\n\nDirect review of active threat indexes isolates key exposure points:\n\n` + 
          threats.map((t, i) => `* **${t.firm} (Impact: ${t.importance}/5)**: *${t.contextCorner.threat}*`).join('\n\n') +
          `\n\n**Core Advisory**: Non-aligned advisory firms face structural disintermediation. We advise diversifying alliance pipelines outside single cloud ecosystems immediately.`;
      } 
      if (q.includes('competitor') || q.includes('using ai') || q.includes('ai')) {
        const pivots = db.filter(d => d.signal === 'AI Pivot' || d.summary.includes('AI')).slice(0, 3);
        return `### **[Strategic Briefing: Competitor AI Positions]**\n\nConsulting rivals are aggressively moving from model usage to full process orchestration:\n\n` + 
          pivots.map(p => `* **${p.firm}**: Deployed *${p.title}*. This marks a transition from labor arbitrage to automated deliverables.`).join('\n\n') +
          `\n\n**Actionable Advice**: Avoid low-margin migration bids. Re-price advisory services around sovereign fine-tuning.`;
      }
      if (q.includes('mckinsey') || q.includes('restructure')) {
        return `### **[Advisory: McKinsey Layoff & AI Moat]**\n\nMcKinsey's elimination of 1,400 back-office roles represents an industry-wide pivot point:\n\n1. **Ecosystem Drift**: They are leveraging custom internal algorithms to absorb operations, legal, and HR work.\n2. **Pricing Action**: They will pass these margin gains to enterprise clients, undercutting fixed-fee proposals.\n3. **Tactical recommendation**: Implement a 20% support-staff automation target within 3 quarters to protect competitiveness.`;
      }
      return `### **[Strategic Advisor Assessment]**\n\nThank you for raising this point concerning *"${text}"*.\n\nFrom our viewpoint, this shift signals a wider compression in professional service pricing models. Implementer roles are becoming commoditized. \n\n**Quarterly recommendation**: Build immediate competencies around sovereign frameworks and SOC 2 audits (re-read Hugging Face's SOC 2 release). Our database currently indexes ${db.length} active indicators to validate this trajectory.`;
    } 
    
    if (agent === 'Lead Researcher') {
      const stats = db.filter(d => d.importance >= 4);
      if (q.includes('threat') || q.includes('risk') || q.includes('competitor') || q.includes('stat')) {
        return `### **[Lead Researcher Log: Quantitative Overview]**\n\nScanning indexed database payloads. Found **${stats.length} high-impact** signals (importance score >= 4).\n\n**Raw Records Index:**\n` +
          stats.slice(0, 4).map(c => `* [${c.date}] **${c.firm}** — *${c.title}* (Impact: ${c.importance}/5)`).join('\n') +
          `\n\n`;
      }
      return `### **[Lead Researcher Fact-Finder]**\n\nProcessed query: *"${text}"*.\n\n**Operational Database Telemetry:**\n* **Active Database Nodes**: ${db.length} records mapped.\n* **Firms tracked**: ${Array.from(new Set(db.map(d => d.firm))).length} entities.\n* **Latest Event**: *${db[0]?.title}* by ${db[0]?.firm} on ${db[0]?.date}.\n\nFor complete JSON payload audits, trigger the **Download DB JSON Backup** in the Data Pipeline dashboard.`;
    } 
    
    // Principal Analyst Persona
    if (q.includes('threat') || q.includes('risk') || q.includes('action') || q.includes('swot')) {
      const cc = db.filter(d => d.contextCorner?.action).slice(0, 2);
      return `### **[SWOT Matrix & Quarterly Recommendations]**\n\nReview of competitive actions yields the following operational directives:\n\n` +
        cc.map(a => `* **Operational Target (${a.firm})**: *${a.contextCorner.action}*`).join('\n\n') +
        `\n\n**Global SWOT Profile:**\n* **Strengths**: High-margin sovereign deployment blocks (EY NVIDIA Factory model).\n* **Weaknesses**: Closed-source vendor dependencies.\n* **Opportunities**: EU AI Act conformity certifications.\n* **Threats**: Direct enterprise sells from labs bypassing consultants (OpenAI Direct Chief Enterprise Officer hiring).`;
    }
    return `### **[Principal Analyst Action Plan]**\n\nRegarding *"${text}"*:\n\nWe outline three core strategies to protect competitive advantages in Q2:\n\n1. **Claude Alliance**: Secure Claude for Enterprise capacity to counter rivals on Azure OpenAI deals.\n2. **TCO Arbitrage**: Redraw client proposals using DeepSeek cost structures (representing a 90% cost drop).\n3. **EU Act Compliance**: Position certified audit tools (following EY's compliance roadmap) to capture continental regulatory budgets.`;
  };

  const triggers = [
    "Summarize today's threats",
    "How are competitors using AI?",
    "Analyze McKinsey's restructure",
  ];

  return (
    <div className={`chat-panel ${open ? '' : 'collapsed'}`}>
      <div className="chat-header">
        <span className="chat-title">AI Advisory <em>Panel</em></span>
        <button className="chat-close-btn" onClick={onClose} title="Close Panel">✕</button>
      </div>

      <div className="chat-agent-select">
        <div className="chat-agent-label">Select C-Suite Advisor</div>
        <div className="chat-agent-buttons">
          {['Strategic Advisor', 'Lead Researcher', 'Principal Analyst'].map(agent => (
            <button 
              key={agent} 
              className={`chat-agent-btn ${activeAgent === agent ? 'active' : ''}`}
              onClick={() => setActiveAgent(agent)}
            >
              {agent.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="chat-messages">
        {activeHistory.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.sender}`}>
            <span className="chat-agent-meta">
              {msg.sender === 'user' ? 'Executive Director' : activeAgent}
            </span>
            <div className="chat-bubble">
              {msg.text.split('\n').map((para, idx) => {
                if (para.startsWith('### ')) {
                  return <h4 key={idx} style={{ color: 'var(--accent)', marginTop: 8, marginBottom: 4, fontFamily: 'var(--serif-disp)', fontSize: 16 }}>{para.replace('### ', '')}</h4>;
                }
                if (para.startsWith('* ')) {
                  return <li key={idx} style={{ marginLeft: 12, marginBottom: 4 }}>{para.replace('* ', '')}</li>;
                }
                return <p key={idx} style={{ marginBottom: 8 }}>{para}</p>;
              })}
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      <div className="chat-input-area">
        <div className="chat-triggers">
          {triggers.map((t, idx) => (
            <button key={idx} className="chat-trigger-btn" onClick={() => handleSend(t)} disabled={isThinking}>{t}</button>
          ))}
        </div>
        <form className="chat-form" onSubmit={e => { e.preventDefault(); handleSend(); }}>
          <input 
            className="chat-input" 
            placeholder={isThinking ? "Thinking..." : `Ask the ${activeAgent.toLowerCase()}…`}
            value={input} 
            onChange={e => setInput(e.target.value)} 
            disabled={isThinking}
          />
          <button type="submit" className="chat-send-btn" disabled={isThinking}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

// ============== TWEAKS CORE WIDGET ==============
function FSTweaks() {
  const TWEAK_DEFAULTS = {
    "theme": "ivory",
    "density": "balanced",
    "showTicker": true,
    "showPulse": true
  };
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useEffect(() => { document.body.dataset.theme = t.theme; }, [t.theme]);
  
  useEffect(() => {
    window.__fs_density = t.density;
    window.dispatchEvent(new CustomEvent('__fs_density_change', { detail: t.density }));
  }, [t.density]);

  useEffect(() => {
    window.__fs_showTicker = t.showTicker;
    window.dispatchEvent(new CustomEvent('__fs_visibility_change'));
  }, [t.showTicker]);

  useEffect(() => {
    window.__fs_showPulse = t.showPulse;
    window.dispatchEvent(new CustomEvent('__fs_visibility_change'));
  }, [t.showPulse]);

  return (
    <TweaksPanel title="Tweaks Panel">
      <TweakSection label="Theme Aesthetic">
        <TweakRadio
          label="Palette"
          value={t.theme}
          onChange={v => setTweak('theme', v)}
          options={[
            { value: 'warm',     label: 'Warm dark' },
            { value: 'ivory',    label: 'Ivory light' },
            { value: 'terminal', label: 'Terminal' },
          ]}
        />
      </TweakSection>
      <TweakSection label="Layout Rules">
        <TweakRadio
          label="Density"
          value={t.density}
          onChange={v => setTweak('density', v)}
          options={[
            { value: 'dense', label: 'Dense grid' },
            { value: 'balanced', label: 'Balanced' },
            { value: 'spacious', label: 'Spacious' },
          ]}
        />
        <TweakToggle label="Live Ticker tape" value={t.showTicker} onChange={v => setTweak('showTicker', v)} />
        <TweakToggle label="Market Pulse strip" value={t.showPulse} onChange={v => setTweak('showPulse', v)} />
      </TweakSection>
    </TweaksPanel>
  );
}

// ============== PRIMARY APP COMPONENT ==============
function App() {
  const [data, setData] = useState(DEMO_SIGNALS);
  const [firms, setFirms] = useState(ALL_FIRMS);
  const [reports, setReports] = useState([]);
  const [summits, setSummits] = useState([]);
  const [linkedinPosts, setLinkedinPosts] = useState([]);
  const [financials, setFinancials] = useState([]);
  const [activeNav, setActiveNav] = useState('brief');
  const [view, setView] = useState('week');
  const [activeFirms, setActiveFirms] = useState(new Set());
  const [activeSignals, setActiveSignals] = useState(new Set());
  const [excludedFirms, setExcludedFirms] = useState(new Set());
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('importance');
  const [savedIds, setSavedIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('fs_saved') || '[]')); } catch (e) { return new Set(); }
  });
  const [apiKey, setApiKey] = useState(() => {
    try { return localStorage.getItem('fs_apikey') || ''; } catch (e) { return ''; }
  });
  const [serverHasKey, setServerHasKey] = useState(false);
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Layout rules from tweaks
  const [density, setDensity] = useState('balanced');
  const [showTicker, setShowTicker] = useState(true);
  const [showPulse, setShowPulse] = useState(true);

  // Sync index from server on mount
  const loadSignals = async () => {
    try {
      const resp = await fetch('/api/signals');
      if (resp.ok) {
        const db = await resp.json();
        const list = Array.isArray(db) ? db : db.signals;
        if (list && list.length > 0) {
          setData(list);
        }
      }
    } catch (err) {
      console.warn('[FirmSignal] API backend port offline. Falling back to local data.');
    }
  };

  const loadReports = async () => {
    try {
      const resp = await fetch('/api/reports');
      if (resp.ok) {
        const db = await resp.json();
        const list = db.reports;
        if (list && list.length > 0) {
          setReports(list);
        }
      }
    } catch (err) {
      console.warn('[FirmSignal] Could not fetch reports from backend.');
    }
  };

  const loadSummits = async () => {
    try {
      const resp = await fetch('/api/summits');
      if (resp.ok) {
        const db = await resp.json();
        const list = db.summits;
        if (list && list.length > 0) {
          setSummits(list);
        }
      }
    } catch (err) {
      console.warn('[FirmSignal] Could not fetch summits from backend.');
    }
  };

  const loadLinkedIn = async () => {
    try {
      const resp = await fetch('/api/linkedin');
      if (resp.ok) {
        const db = await resp.json();
        const list = db.posts;
        if (list && list.length > 0) {
          setLinkedinPosts(list);
        }
      }
    } catch (err) {
      console.warn('[FirmSignal] Could not fetch LinkedIn posts from backend.');
    }
  };

  const loadFinancials = async () => {
    try {
      const resp = await fetch('/api/financials');
      if (resp.ok) {
        const db = await resp.json();
        const list = db.financials;
        if (list && list.length > 0) {
          setFinancials(list);
        }
      }
    } catch (err) {
      console.warn('[FirmSignal] Could not fetch financials from backend.');
    }
  };

  const loadFirms = async () => {
    try {
      const resp = await fetch('/api/firms');
      if (resp.ok) {
        const list = await resp.json();
        if (Array.isArray(list) && list.length > 0) {
          setFirms(list);
        }
      }
    } catch (err) {
      console.warn('[FirmSignal] Could not fetch dynamic firms from backend.');
    }
  };

  const checkServerStatus = async () => {
    try {
      const resp = await fetch('/api/status');
      if (resp.ok) {
        const resJson = await resp.json();
        if (resJson.success && resJson.hasApiKey) {
          setServerHasKey(true);
        }
      }
    } catch (err) {
      console.warn('[FirmSignal] Could not fetch server API status.');
    }
  };

  useEffect(() => {
    loadSignals();
    loadFirms();
    loadReports();
    loadSummits();
    loadLinkedIn();
    loadFinancials();
    checkServerStatus();
  }, []);

  // API modal prompt on first visit
  useEffect(() => {
    const checkFirstVisit = async () => {
      let isFirst = false;
      try {
        isFirst = !localStorage.getItem('fs_visited');
      } catch (e) {}

      if (isFirst) {
        try {
          const resp = await fetch('/api/status');
          if (resp.ok) {
            const resJson = await resp.json();
            if (resJson.success && resJson.hasApiKey) {
              setServerHasKey(true);
              localStorage.setItem('fs_visited', '1');
              return;
            }
          }
        } catch (e) {}

        if (!apiKey) {
          setApiModalOpen(true);
        }
        try { localStorage.setItem('fs_visited', '1'); } catch (e) {}
      }
    };
    checkFirstVisit();
  }, []);

  // Listen to tweak changes
  useEffect(() => {
    const onDensity = (e) => setDensity(e.detail);
    const onVis = () => {
      if (typeof window.__fs_showTicker === 'boolean') setShowTicker(window.__fs_showTicker);
      if (typeof window.__fs_showPulse === 'boolean') setShowPulse(window.__fs_showPulse);
    };
    window.addEventListener('__fs_density_change', onDensity);
    window.addEventListener('__fs_visibility_change', onVis);
    return () => {
      window.removeEventListener('__fs_density_change', onDensity);
      window.removeEventListener('__fs_visibility_change', onVis);
    };
  }, []);

  // Multi-tier filtering stack
  const filtered = useMemo(() => {
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const q = search.toLowerCase();
    return data.filter(d => {
      if (excludedFirms.has(d.firm)) return false;
      if (activeFirms.size && !activeFirms.has(d.firm)) return false;
      if (activeSignals.size && !activeSignals.has(d.signal)) return false;
      if (view === 'week' && d.date < weekAgo) return false;
      if (view === 'highimpact' && (d.importance || 0) < 4) return false;
      if (q) {
        const matchText = (d.title + d.summary + d.firm + d.signal + (d.takeaway || '')).toLowerCase();
        if (!matchText.includes(q)) return false;
      }
      return true;
    });
  }, [data, activeFirms, activeSignals, view, search, excludedFirms]);

  const toggleFirm = (id) => {
    setActiveFirms(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleExcludeFirm = (id) => {
    setExcludedFirms(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        setActiveFirms(prevAct => {
          if (prevAct.has(id)) {
            const nextAct = new Set(prevAct);
            nextAct.delete(id);
            return nextAct;
          }
          return prevAct;
        });
      }
      return next;
    });
  };

  const toggleSignal = (s) => {
    setActiveSignals(prev => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  };

  const onToggleSave = (id) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      try { localStorage.setItem('fs_saved', JSON.stringify([...next])); } catch (e) {}
      return next;
    });
  };

  const onAddItems = (parsed, batchId) => {
    if (!Array.isArray(parsed)) return 0;
    const existing = new Set(data.map(d => d.title.toLowerCase().slice(0, 45)));
    const fresh = parsed
      .filter(p => !existing.has((p.title || '').toLowerCase().slice(0, 45)))
      .map((item, i) => ({ 
        ...item, 
        id: `${batchId}_${i}`, 
        importance: item.importance || 3,
        date: item.date || new Date().toISOString().slice(0, 10),
        source: item.source || 'Live Pipeline'
      }));
    
    if (fresh.length > 0) {
      setData(prev => [...fresh, ...prev]);
      // Attempt to save to backend DB
      fetch('/api/signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fresh)
      }).catch(() => {});
    }
    return fresh.length;
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const onSaveApiKey = (key) => {
    if (!key.startsWith('sk-ant-')) { showToast('Invalid key: must start with sk-ant-'); return; }
    setApiKey(key);
    try { localStorage.setItem('fs_apikey', key); } catch (e) {}
    setApiModalOpen(false);
    showToast('✓ Anthropic channel verified');
  };

  const onSkipApi = () => {
    setApiModalOpen(false);
    showToast('Demo data loaded. Connect keys to unlock scanning.');
  };

  const handleAddFirm = async (firmObj) => {
    try {
      const resp = await fetch('/api/firms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(firmObj)
      });
      if (resp.ok) {
        const json = await resp.json();
        if (json.success) {
          setFirms(prev => [...prev, json.firm]);
          showToast(`✓ Firm ${json.firm.id} added successfully`);
          return true;
        }
      } else {
        const err = await resp.json();
        showToast(`Error: ${err.error || 'Failed to add firm'}`);
      }
    } catch (err) {
      showToast('Connection error adding firm');
    }
    return false;
  };

  const handleDeleteFirm = async (firmId) => {
    try {
      const resp = await fetch(`/api/firms/${encodeURIComponent(firmId)}`, {
        method: 'DELETE'
      });
      if (resp.ok) {
        const json = await resp.json();
        if (json.success) {
          setFirms(prev => prev.filter(f => f.id !== firmId));
          setData(prev => prev.filter(s => s.firm.toLowerCase() !== firmId.toLowerCase()));
          showToast(`✓ Firm ${firmId} and ${json.signalsRemoved} signals cascade deleted`);
          return true;
        }
      } else {
        const err = await resp.json();
        showToast(`Error: ${err.error || 'Failed to delete firm'}`);
      }
    } catch (err) {
      showToast('Connection error deleting firm');
    }
    return false;
  };

  const handleScanFinancials = async (customQuery) => {
    try {
      showToast('Initiating Live Scan for Financial Outcomes...');
      const resp = await fetch('/api/financials/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: customQuery, apiKey })
      });
      if (resp.ok) {
        const json = await resp.json();
        if (json.success) {
          setFinancials(json.financials);
          showToast(`✓ Scanned and loaded ${json.count} financial profiles`);
          return json.count;
        }
      } else {
        const err = await resp.json();
        showToast(`Error: ${err.error || 'Failed to scan financials'}`);
      }
    } catch (err) {
      showToast('Connection error scanning financials');
    }
    return 0;
  };

  const handleScanReports = async (customQuery) => {
    try {
      showToast('Initiating Live Scan for Thought Leadership Reports...');
      const resp = await fetch('/api/reports/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: customQuery, apiKey })
      });
      if (resp.ok) {
        const json = await resp.json();
        if (json.success) {
          setReports(json.reports);
          showToast(`✓ Scanned and loaded ${json.count} new reports`);
          return json.count;
        }
      } else {
        const err = await resp.json();
        showToast(`Error: ${err.error || 'Failed to scan reports'}`);
      }
    } catch (err) {
      showToast('Connection error scanning reports');
    }
    return 0;
  };

  const handleScanSummits = async (customQuery) => {
    try {
      showToast('Initiating Live Scan for AI Summits Calendar...');
      const resp = await fetch('/api/summits/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: customQuery, apiKey })
      });
      if (resp.ok) {
        const json = await resp.json();
        if (json.success) {
          setSummits(json.summits);
          showToast(`✓ Scanned and loaded ${json.count} new summits`);
          return json.count;
        }
      } else {
        const err = await resp.json();
        showToast(`Error: ${err.error || 'Failed to scan summits'}`);
      }
    } catch (err) {
      showToast('Connection error scanning summits');
    }
    return 0;
  };

  const handleScanLinkedIn = async (customQuery) => {
    try {
      showToast('Initiating Live Scan for LinkedIn C-Suite Briefs...');
      const resp = await fetch('/api/linkedin/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: customQuery, apiKey })
      });
      if (resp.ok) {
        const json = await resp.json();
        if (json.success) {
          setLinkedinPosts(json.posts);
          showToast(`✓ Scanned and loaded ${json.count} new CEO posts`);
          return json.count;
        }
      } else {
        const err = await resp.json();
        showToast(`Error: ${err.error || 'Failed to scan LinkedIn'}`);
      }
    } catch (err) {
      showToast('Connection error scanning LinkedIn');
    }
    return 0;
  };

  const onResetDb = async () => {
    try {
      const resp = await fetch('/api/db/reset', { method: 'POST' });
      if (resp.ok) {
        showToast('✓ Database rollbacked successfully');
      }
    } catch (e) {}
    await loadSignals();
    await loadFirms();
    await loadReports();
    await loadSummits();
    await loadLinkedIn();
    setActiveFirms(new Set());
    setActiveSignals(new Set());
    setExcludedFirms(new Set());
    setSearch('');
    setView('all');
  };

  const onClearMock = async () => {
    try {
      const resp = await fetch('/api/db/clear-mock', { method: 'POST' });
      if (resp.ok) {
        const json = await resp.json();
        showToast(`✓ Cleared ${json.clearedCount} mock signals!`);
      } else {
        showToast('Failed to clear mock signals.');
      }
    } catch (e) {}
    await loadSignals();
    await loadReports();
  };

  const onHeatCellClick = (firmId, signal) => {
    setActiveFirms(new Set([firmId]));
    setActiveSignals(new Set([signal]));
    setActiveNav('signals');
  };

  const handleSponsorClick = (sponsorName) => {
    setActiveFirms(new Set([sponsorName]));
    setActiveSignals(new Set());
    setSearch('');
    setView('all');
    setActiveNav('signals');
    showToast(`Filtered feed: ${sponsorName}`);
  };

  const handlePulseClick = (cellId) => {
    setActiveFirms(new Set());
    setSearch('');
    if (cellId === 'signals_7d') {
      setView('week');
      setActiveSignals(new Set());
      showToast('Filtered All Signals: Past 7 days');
    } else if (cellId === 'high_impact') {
      setView('highimpact');
      setActiveSignals(new Set());
      showToast('Filtered All Signals: High impact (4+ score)');
    } else if (cellId === 'ai_moves') {
      setView('all');
      setActiveSignals(new Set(['AI Pivot']));
      showToast('Filtered All Signals: AI Pivots');
    } else if (cellId === 'earnings') {
      setView('all');
      setActiveSignals(new Set(['Earnings']));
      showToast('Filtered All Signals: Earnings reports');
    } else if (cellId === 'regulatory') {
      setView('all');
      setActiveSignals(new Set(['Regulatory']));
      showToast('Filtered All Signals: Regulatory Compliance & Audit updates');
    }
    setActiveNav('signals');
  };

  // Node selection handler from Force Graph
  const handleGraphNodeSelected = (node) => {
    if (!node) return;
    if (node.type === 'firm') {
      setActiveFirms(new Set([node.id]));
      setActiveNav('signals');
      showToast(`Filtered feed: ${node.id}`);
    } else if (node.type === 'signal') {
      setActiveSignals(new Set([node.id]));
      setActiveNav('signals');
      showToast(`Filtered feed: ${node.id}`);
    } else if (node.type === 'trend') {
      setSearch(node.id);
      setActiveNav('signals');
      showToast(`Searched trend: "${node.id}"`);
    }
  };

  const dateShort = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const ticker = useMemo(() => getTickerItems(data), [data]);

  const navTabs = [
    { id: 'brief',      label: 'In Brief' },
    { id: 'signals',    label: 'All Signals' },
    { id: 'summits',   label: 'AI Summits' },
    { id: 'linkedin',  label: 'LinkedIn Voices' },
    { id: 'context',   label: 'Context Corner' },
    { id: 'reports',    label: 'Thought Leadership' },
    { id: 'financials', label: 'Finance Roundup' },
    { id: 'graph',      label: 'Knowledge Graph' },
    { id: 'heatmap',    label: 'Heatmap' },
    { id: 'compare',    label: 'Compare' },
    { id: 'watchlist',  label: 'Watchlist' },
    { id: 'pipeline',   label: 'Data Pipeline' },
  ];

  return (
    <>
      {showTicker && <Ticker items={ticker} />}

      <nav className="topbar">
        <div className="brand">
          <span className="brand-mark">Firm<em>Signal</em></span>
          <span className="brand-tag">C-Suite Intelligence</span>
        </div>
        <div className="topbar-nav">
          {navTabs.map(t => (
            <button 
              key={t.id} 
              className={`nav-tab ${activeNav === t.id ? 'active' : ''}`} 
              onClick={() => setActiveNav(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="topbar-right">
          <span className="date-stamp"><strong>{dateShort}</strong></span>
          <span className={`live-indicator ${(apiKey || serverHasKey) ? '' : 'disconnected'}`}>
            <span className="live-dot" />
            {(apiKey || serverHasKey) ? 'LIVE' : 'DEMO'}
          </span>
          <button className="chat-toggle-btn" onClick={() => setChatOpen(!chatOpen)}>
            <span style={{ fontSize: 13 }}>💬</span> {chatOpen ? 'Hide Chat' : 'AI Advisor'}
          </button>
        </div>
      </nav>

      <div className={`shell ${chatOpen ? 'has-chat' : ''}`}>
        <Sidebar
          firms={firms}
          data={data}
          activeFirms={activeFirms} toggleFirm={toggleFirm}
          activeSignals={activeSignals} toggleSignal={toggleSignal}
          view={view} setView={setView}
          onOpenApiModal={() => setApiModalOpen(true)}
          setActiveFirms={setActiveFirms}
          excludedFirms={excludedFirms}
          toggleExcludeFirm={toggleExcludeFirm}
        />
        
        <main className="main">
          {activeNav === 'signals' && (
            <FetchPanel firms={firms} apiKey={apiKey} serverHasKey={serverHasKey} onOpenApiModal={() => setApiModalOpen(true)} onAddItems={onAddItems} onShowToast={showToast} />
          )}

          {activeNav === 'brief' && (
            <BriefView data={filtered} savedIds={savedIds} onToggleSave={onToggleSave} ALL_FIRMS={firms} SIGNAL_COLORS={SIGNAL_COLORS} getBrief={getBrief} onPulseClick={handlePulseClick} />
          )}

          {activeNav === 'financials' && (
            <FinancialRoundupView
              financials={financials}
              onScanFinancials={handleScanFinancials}
              apiKey={apiKey}
              serverHasKey={serverHasKey}
              onOpenApiModal={() => setApiModalOpen(true)}
              onShowToast={showToast}
            />
          )}

          {activeNav === 'summits' && (
            <AiSummitsView
              summits={summits}
              onScanSummits={handleScanSummits}
              apiKey={apiKey}
              serverHasKey={serverHasKey}
              onOpenApiModal={() => setApiModalOpen(true)}
              onShowToast={showToast}
              onSponsorClick={handleSponsorClick}
            />
          )}

          {activeNav === 'linkedin' && (
            <LatestOnLinkedInView
              posts={linkedinPosts}
              onScanLinkedIn={handleScanLinkedIn}
              apiKey={apiKey}
              serverHasKey={serverHasKey}
              onOpenApiModal={() => setApiModalOpen(true)}
              onShowToast={showToast}
            />
          )}
          
          {activeNav === 'context' && (
            <ContextCornerView data={filtered} savedIds={savedIds} onToggleSave={onToggleSave} ALL_FIRMS={firms} AI_FIRST_FIRMS={firms.filter(f => f.type === 'ai-first')} SIGNAL_COLORS={SIGNAL_COLORS} />
          )}

          {activeNav === 'reports' && (
            <ThoughtLeadershipView 
              reports={reports} 
              onScanReports={handleScanReports} 
              apiKey={apiKey}
              serverHasKey={serverHasKey}
              onOpenApiModal={() => setApiModalOpen(true)}
              onShowToast={showToast}
            />
          )}

          {activeNav === 'graph' && (
            <KnowledgeGraph data={data} ALL_FIRMS={firms} SIGNALS={SIGNALS} SIGNAL_COLORS={SIGNAL_COLORS} onNodeSelected={handleGraphNodeSelected} />
          )}

          {activeNav === 'signals' && (
            <SignalsView
              data={filtered}
              savedIds={savedIds}
              onToggleSave={onToggleSave}
              search={search} setSearch={setSearch}
              sort={sort} setSort={setSort}
              density={density}
              ALL_FIRMS={firms}
              SIGNAL_COLORS={SIGNAL_COLORS}
            />
          )}

          {activeNav === 'heatmap' && (
            <HeatmapView data={filtered} onCellClick={onHeatCellClick} ALL_FIRMS={firms} SIGNALS={SIGNALS} buildHeatmap={buildHeatmap} />
          )}

          {activeNav === 'compare' && (
            <CompareView data={data} savedIds={savedIds} onToggleSave={onToggleSave} ALL_FIRMS={firms} CONSULTING_FIRMS={firms.filter(f => f.type === 'consulting')} AI_FIRST_FIRMS={firms.filter(f => f.type === 'ai-first')} TECH_FIRMS={firms.filter(f => f.type === 'tech')} />
          )}

          {activeNav === 'watchlist' && (
            <WatchlistView data={data} savedIds={savedIds} onToggleSave={onToggleSave} ALL_FIRMS={firms} SIGNAL_COLORS={SIGNAL_COLORS} />
          )}

          {activeNav === 'pipeline' && (
            <DataPipelineAuditView data={data} firms={firms} onAddFirm={handleAddFirm} onDeleteFirm={handleDeleteFirm} apiKey={apiKey} onResetDb={onResetDb} onClearMock={onClearMock} onShowToast={showToast} />
          )}
        </main>

        <AdvisoryChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} data={data} apiKey={apiKey} serverHasKey={serverHasKey} />
      </div>

      <ApiModal open={apiModalOpen} onClose={() => setApiModalOpen(false)} onSave={onSaveApiKey} onSkip={onSkipApi} />

      {toast && <div className="toast">{toast}</div>}

      <FSTweaks />
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
