// FirmSignal — Main app
const { useState, useEffect, useMemo, useRef } = React;

// ============== SIDEBAR ==============
function Sidebar({ data, activeFirms, toggleFirm, activeSignals, toggleSignal, view, setView }) {
  const consCount = data.filter(d => d.type === 'consulting').length;
  const techCount = data.filter(d => d.type === 'tech').length;

  const firmRow = (f) => {
    const cnt = data.filter(d => d.firm === f.id).length;
    const isActive = activeFirms.has(f.id);
    return (
      <button key={f.id} className={`sb-row ${isActive ? (f.type === 'tech' ? 'active tech' : 'active') : ''}`} onClick={() => toggleFirm(f.id)}>
        <span className="sb-dot" style={{ background: f.dot }} />
        {f.id}
        <span className="sb-count-mini">{cnt || ''}</span>
      </button>
    );
  };

  return (
    <aside className="sidebar">
      <div className="sb-section">
        <div className="sb-label">View</div>
        <button className={`sb-row ${view === 'all' ? 'active' : ''}`} onClick={() => setView('all')}>All signals</button>
        <button className={`sb-row ${view === 'week' ? 'active' : ''}`} onClick={() => setView('week')}>This week</button>
        <button className={`sb-row ${view === 'highimpact' ? 'active' : ''}`} onClick={() => setView('highimpact')}>High impact only</button>
      </div>

      <div className="sb-section">
        <div className="sb-label">Consulting <span className="sb-count">{consCount}</span></div>
        {window.CONSULTING_FIRMS.map(firmRow)}
      </div>

      <div className="sb-section">
        <div className="sb-label">AI-first labs <span className="sb-count">{data.filter(d => d.type === 'ai-first').length}</span></div>
        {window.AI_FIRST_FIRMS.map(firmRow)}
      </div>

      <div className="sb-section">
        <div className="sb-label">Tech &amp; AI partners <span className="sb-count">{techCount}</span></div>
        {window.TECH_FIRMS.map(firmRow)}
      </div>

      <div className="sb-section">
        <div className="sb-label">Signal type</div>
        <div className="sb-chip-row">
          {window.SIGNALS.map(s => (
            <button key={s} className={`sb-chip ${activeSignals.has(s) ? 'active' : ''}`} onClick={() => toggleSignal(s)}>{s}</button>
          ))}
        </div>
      </div>
    </aside>
  );
}

// ============== FETCH PANEL ==============
function FetchPanel({ apiKey, onOpenApiModal, onAddItems, onShowToast }) {
  const [mode, setMode] = useState('sweep-consulting');
  const [firm, setFirm] = useState('Deloitte');
  const [customQ, setCustomQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null); // { current, total, label, log: [] }

  const CONSULTING_SWEEP = ['Deloitte', 'PwC', 'EY', 'KPMG', 'McKinsey', 'BCG', 'Bain', 'Accenture', 'IBM Consulting', 'Capgemini'];
  const TECH_SWEEP = ['Microsoft', 'SAP', 'ServiceNow', 'Google', 'AuditBoard', 'Salesforce', 'AWS', 'Workday', 'Palantir'];
  const AI_SWEEP = ['OpenAI', 'Anthropic', 'Perplexity', 'Mistral AI', 'Cohere', 'xAI', 'Hugging Face', 'DeepSeek'];

  const btnLabel = {
    'sweep-consulting': 'Sweep consulting firms',
    'sweep-tech':       'Sweep tech partners',
    'sweep-ai':         'Sweep AI-first labs',
    'sweep-all':        'Sweep everything',
    'firm':             'Fetch firm',
    'custom':           'Run query',
  }[mode];

  const runSweep = async (firms, label) => {
    const today = new Date().toISOString().slice(0, 10);
    let totalAdded = 0;
    const log = [];
    setProgress({ current: 0, total: firms.length, label: `Starting ${label}…`, log: [] });
    for (let i = 0; i < firms.length; i++) {
      const f = firms[i];
      setProgress(p => ({ ...p, current: i, label: `Scanning ${f}…` }));
      try {
        const results = await window.callClaude(`${f} news this week ${today} site:reuters.com OR site:ft.com OR site:bloomberg.com OR site:wsj.com OR site:businessinsider.com`, apiKey);
        const added = onAddItems(results, `sweep_${Date.now()}_${i}`);
        log.unshift(`${f} — ${added} new signal${added !== 1 ? 's' : ''}`);
        totalAdded += added;
        setProgress(p => ({ ...p, log: [...log] }));
      } catch (err) {
        log.unshift(`${f} — fetch error`);
        setProgress(p => ({ ...p, log: [...log] }));
      }
      if (i < firms.length - 1) await new Promise(r => setTimeout(r, 700));
    }
    setProgress({ current: firms.length, total: firms.length, label: 'Sweep complete', log });
    onShowToast(`✓ ${label} done — ${totalAdded} new signal${totalAdded !== 1 ? 's' : ''} added`);
    setTimeout(() => setProgress(null), 9000);
  };

  const onFetch = async () => {
    if (!apiKey) { onOpenApiModal(); return; }
    setBusy(true);
    const today = new Date().toISOString().slice(0, 10);
    try {
      if (mode === 'sweep-consulting') await runSweep(CONSULTING_SWEEP, 'consulting sweep');
      else if (mode === 'sweep-tech') await runSweep(TECH_SWEEP, 'tech partner sweep');
      else if (mode === 'sweep-ai') await runSweep(AI_SWEEP, 'AI-first lab sweep');
      else if (mode === 'sweep-all') await runSweep([...CONSULTING_SWEEP, ...TECH_SWEEP, ...AI_SWEEP], 'full sweep');
      else if (mode === 'firm') {
        onShowToast(`Fetching ${firm}…`);
        const results = await window.callClaude(`${firm} news this week ${today}`, apiKey);
        const added = onAddItems(results, `firm_${Date.now()}`);
        onShowToast(`✓ ${added} new signal${added !== 1 ? 's' : ''} for ${firm}`);
      } else if (mode === 'custom') {
        if (!customQ.trim()) { onShowToast('Enter a query first'); setBusy(false); return; }
        onShowToast('Running query…');
        const results = await window.callClaude(customQ, apiKey);
        const added = onAddItems(results, `custom_${Date.now()}`);
        onShowToast(`✓ ${added} new signal${added !== 1 ? 's' : ''} from query`);
      }
    } catch (err) {
      onShowToast(`Error: ${err.message || 'fetch failed'}`);
    }
    setBusy(false);
  };

  return (
    <div className="fetch-card">
      <div className="fetch-title">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/><path d="M6 3v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
        Fetch live intelligence
      </div>
      <div className="fetch-row">
        <select className="select" value={mode} onChange={e => setMode(e.target.value)}>
          <option value="sweep-consulting">Weekly sweep — consulting firms</option>
          <option value="sweep-tech">Weekly sweep — tech partners</option>
          <option value="sweep-ai">Weekly sweep — AI-first labs</option>
          <option value="sweep-all">Weekly sweep — everything</option>
          <option value="firm">Single firm / partner</option>
          <option value="custom">Custom query</option>
        </select>
        {mode === 'firm' && (
          <select className="select" value={firm} onChange={e => setFirm(e.target.value)}>
            <optgroup label="Consulting">
              {window.CONSULTING_FIRMS.map(f => <option key={f.id} value={f.id}>{f.id}</option>)}
            </optgroup>
            <optgroup label="AI-first labs">
              {window.AI_FIRST_FIRMS.map(f => <option key={f.id} value={f.id}>{f.id}</option>)}
            </optgroup>
            <optgroup label="Tech &amp; AI Partners">
              {window.TECH_FIRMS.map(f => <option key={f.id} value={f.id}>{f.id}</option>)}
            </optgroup>
          </select>
        )}
        {mode === 'custom' && (
          <input className="custom-input" placeholder="e.g. OpenAI enterprise deals May 2026" value={customQ} onChange={e => setCustomQ(e.target.value)} />
        )}
        <button className={`fetch-btn ${busy ? 'loading' : ''}`} onClick={onFetch} disabled={busy}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M5.5 1v2M5.5 8v2M1 5.5h2M8 5.5h2M2.5 2.5l1.5 1.5M7 7l1.5 1.5M2.5 8.5L4 7M7 4l1.5-1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          {busy ? 'Working…' : btnLabel}
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

// ============== API MODAL ==============
function ApiModal({ open, onClose, onSave, onSkip }) {
  const [key, setKey] = useState('');
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Connect <em>FirmSignal</em></h2>
        <p>Enter your Anthropic API key to enable live news fetching across consulting firms and tech partners. Your key is stored only in your browser and sent only to Anthropic's API.</p>
        <input type="password" placeholder="sk-ant-api03-..." value={key} onChange={e => setKey(e.target.value)} autoComplete="off" />
        <div className="modal-btns">
          <button className="icon-btn" onClick={onSkip}>Use demo data</button>
          <button className="icon-btn primary" onClick={() => onSave(key)}>Connect →</button>
        </div>
        <p className="modal-note">Get a key at console.anthropic.com → API Keys. Usage charges apply per Anthropic pricing.</p>
      </div>
    </div>
  );
}

// ============== TWEAKS ==============
function FSTweaks() {
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "theme": "warm",
    "density": "balanced",
    "showTicker": true,
    "showPulse": true
  }/*EDITMODE-END*/;
  const { TweaksPanel, TweakSection, TweakRadio, TweakToggle, useTweaks } = window;
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply theme to body
  useEffect(() => { document.body.dataset.theme = t.theme; }, [t.theme]);
  // Broadcast density
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
    <TweaksPanel title="Tweaks">
      <TweakSection label="Theme">
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
      <TweakSection label="Layout">
        <TweakRadio
          label="Density"
          value={t.density}
          onChange={v => setTweak('density', v)}
          options={[
            { value: 'dense', label: 'Dense' },
            { value: 'balanced', label: 'Balanced' },
            { value: 'spacious', label: 'Spacious' },
          ]}
        />
        <TweakToggle label="Live ticker" value={t.showTicker} onChange={v => setTweak('showTicker', v)} />
        <TweakToggle label="Market pulse strip" value={t.showPulse} onChange={v => setTweak('showPulse', v)} />
      </TweakSection>
    </TweaksPanel>
  );
}

// ============== MAIN APP ==============
function App() {
  const [data, setData] = useState(window.DEMO_SIGNALS);
  const [activeNav, setActiveNav] = useState('brief'); // brief | signals | heatmap | compare | watchlist
  const [view, setView] = useState('all'); // all | week | highimpact
  const [activeFirms, setActiveFirms] = useState(new Set());
  const [activeSignals, setActiveSignals] = useState(new Set());
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('importance');
  const [savedIds, setSavedIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('fs_saved') || '[]')); } catch (e) { return new Set(); }
  });
  const [apiKey, setApiKey] = useState(() => {
    try { return localStorage.getItem('fs_apikey') || ''; } catch (e) { return ''; }
  });
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [density, setDensity] = useState('balanced');
  const [showTicker, setShowTicker] = useState(true);
  const [showPulse, setShowPulse] = useState(true);

  // Load data from backend with fallback
  useEffect(() => {
    const loadSignals = async () => {
      try {
        const resp = await fetch('/api/signals');
        if (resp.ok) {
          const db = await resp.json();
          if (db.signals && db.signals.length > 0) {
            setData(db.signals);
          }
        }
      } catch (err) {
        console.warn('[FirmSignal] Backend server offline, using static DEMO_SIGNALS fallback.', err);
      }
    };
    loadSignals();
  }, []);

  // First-load: prompt for API only on first visit
  useEffect(() => {
    let firstVisit = false;
    try { firstVisit = !localStorage.getItem('fs_visited'); localStorage.setItem('fs_visited', '1'); } catch (e) {}
    if (firstVisit && !apiKey) setApiModalOpen(true);
  }, []);

  // Listen to tweaks changes
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

  // Apply view-based filtering on top of section filtering
  const filtered = useMemo(() => {
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const q = search.toLowerCase();
    return data.filter(d => {
      if (activeFirms.size && !activeFirms.has(d.firm)) return false;
      if (activeSignals.size && !activeSignals.has(d.signal)) return false;
      if (view === 'week' && d.date < weekAgo) return false;
      if (view === 'highimpact' && (d.importance || 0) < 4) return false;
      if (q && !(d.title + d.summary + d.firm + d.signal + (d.takeaway || '')).toLowerCase().includes(q)) return false;
      return true;
    });
  }, [data, activeFirms, activeSignals, view, search]);

  const toggleFirm = (id) => {
    setActiveFirms(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
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
      .filter(p => p.url && p.url.startsWith('http'))
      .filter(p => !existing.has((p.title || '').toLowerCase().slice(0, 45)))
      .map((item, i) => ({ ...item, id: `${batchId}_${i}`, importance: item.importance || 3 }));
    setData(prev => [...fresh, ...prev]);
    return fresh.length;
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const onSaveApiKey = (key) => {
    if (!key.startsWith('sk-ant-')) { showToast('Key should start with sk-ant-'); return; }
    setApiKey(key);
    try { localStorage.setItem('fs_apikey', key); } catch (e) {}
    setApiModalOpen(false);
    showToast('✓ API key connected');
  };

  const onSkipApi = () => { setApiModalOpen(false); showToast('Using demo data — open API Key any time to fetch live'); };

  const dateShort = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const navTabs = [
    { id: 'brief',     label: 'Brief' },
    { id: 'aiwatch',   label: 'AI Watch' },
    { id: 'signals',   label: 'Signals' },
    { id: 'heatmap',   label: 'Heatmap' },
    { id: 'compare',   label: 'Compare' },
    { id: 'watchlist', label: 'Watchlist' },
    { id: 'advisory',  label: 'Advisory Chat' },
  ];

  const onHeatCellClick = (firmId, signal) => {
    setActiveFirms(new Set([firmId]));
    setActiveSignals(new Set([signal]));
    setActiveNav('signals');
  };

  const ticker = useMemo(() => window.getTickerItems(data), [data]);

  return (
    <>
      {showTicker && <Ticker items={ticker} />}

      <nav className="topbar" data-screen-label="00 Topbar">
        <div className="brand">
          <span className="brand-mark">Firm<em>Signal</em></span>
          <span className="brand-tag">Executive Intelligence</span>
        </div>
        <div className="topbar-nav">
          {navTabs.map(t => (
            <button key={t.id} className={`nav-tab ${activeNav === t.id ? 'active' : ''}`} onClick={() => setActiveNav(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="topbar-right">
          <span className="date-stamp">As of <strong>{dateShort}</strong></span>
          <span className={`live-indicator ${apiKey ? '' : 'disconnected'}`}>
            <span className="live-dot" />
            {apiKey ? 'LIVE' : 'DEMO'}
          </span>
          <button className="icon-btn" onClick={() => setApiModalOpen(true)}>API Key</button>
        </div>
      </nav>

      <div className="shell">
        <Sidebar
          data={data}
          activeFirms={activeFirms} toggleFirm={toggleFirm}
          activeSignals={activeSignals} toggleSignal={toggleSignal}
          view={view} setView={setView}
        />
        <main className="main" data-screen-label={`${activeNav}-view`}>
          {(activeNav === 'signals' || activeNav === 'heatmap') && (
            <FetchPanel apiKey={apiKey} onOpenApiModal={() => setApiModalOpen(true)} onAddItems={onAddItems} onShowToast={showToast} />
          )}

          {activeNav === 'brief' && <BriefView data={filtered} savedIds={savedIds} onToggleSave={onToggleSave} />}
          {activeNav === 'aiwatch' && <AiWatchView data={filtered} savedIds={savedIds} onToggleSave={onToggleSave} />}
          {activeNav === 'signals' && (
            <SignalsView
              data={filtered}
              savedIds={savedIds}
              onToggleSave={onToggleSave}
              search={search} setSearch={setSearch}
              sort={sort} setSort={setSort}
              density={density}
            />
          )}
          {activeNav === 'heatmap' && <HeatmapView data={filtered} onCellClick={onHeatCellClick} />}
          {activeNav === 'compare' && <CompareView data={data} savedIds={savedIds} onToggleSave={onToggleSave} />}
          {activeNav === 'watchlist' && <WatchlistView data={data} savedIds={savedIds} onToggleSave={onToggleSave} />}
          {activeNav === 'advisory' && <window.AdvisoryChatView data={data} onShowToast={showToast} />}
        </main>
      </div>

      <ApiModal open={apiModalOpen} onClose={() => setApiModalOpen(false)} onSave={onSaveApiKey} onSkip={onSkipApi} />

      {toast && <div className="toast">{toast}</div>}

      <FSTweaks />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
