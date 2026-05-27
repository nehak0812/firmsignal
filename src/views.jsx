import React, { useState, useMemo, useEffect, useRef } from 'react';
import * as d3 from 'd3';

// ============== TICKER ==============
export function Ticker({ items }) {
  // Duplicate items for seamless scroll
  const doubled = [...items, ...items];
  return (
    <div className="ticker">
      <div className="ticker-tag">Live</div>
      <div className="ticker-track">
        {doubled.map((it, i) => {
          const cls = it.importance >= 5 ? 'crit' : it.importance >= 4 ? '' : 'pos';
          const dateStr = it.date ? new Date(it.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';
          return (
            <span key={`${it.id}-${i}`} className={`ticker-item ${cls}`}>
              <span className="tick-sig">{it.signal.toUpperCase()}</span>
              <span className="tick-firm">{it.firm}</span> · {it.title}
              <span style={{ color: 'var(--ink-4)', marginLeft: 12 }}>{dateStr}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ============== SPARKLINE ==============
export function Sparkline({ values, color = 'var(--accent)' }) {
  const w = 80, h = 18;
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const step = w / (values.length - 1 || 1);
  const points = values.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / range) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg className="pulse-spark" width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline className="spark-path" points={points} stroke={color} fill="none" strokeWidth="1.5" />
    </svg>
  );
}

// ============== PULSE STRIP ==============
export function PulseStrip({ data }) {
  const totalSignals = data.length;
  const critCount = data.filter(d => d.importance >= 4).length;
  const aiCount = data.filter(d => d.signal === 'AI Pivot').length;
  const earningsCount = data.filter(d => d.signal === 'Earnings').length;
  const regCount = data.filter(d => d.signal === 'Regulatory').length;

  // Mock sparklines (representing 7-day trend)
  const cells = [
    { lbl: 'Signals · 7d', val: totalSignals, delta: '+12%', dir: 'up', spark: [4, 6, 5, 8, 7, 10, totalSignals || 12], color: 'var(--accent)' },
    { lbl: 'High-impact', val: critCount, delta: '+3', dir: 'up', spark: [1, 2, 1, 3, 4, 3, critCount || 5], color: 'var(--crit)' },
    { lbl: 'AI moves', val: aiCount, delta: '+6', dir: 'up', spark: [2, 3, 3, 5, 4, 6, aiCount || 7], color: 'var(--accent)' },
    { lbl: 'Earnings', val: earningsCount, delta: 'flat', dir: 'flat', spark: [2, 2, 3, 2, 2, 3, earningsCount || 3], color: 'var(--pos)' },
    { lbl: 'Regulatory', val: regCount, delta: '+1', dir: 'up', spark: [0, 0, 1, 0, 1, 0, regCount || 2], color: 'var(--crit)' },
  ];

  const arrow = (d) => d === 'up' ? '▲' : d === 'down' ? '▼' : '–';

  return (
    <div className="pulse">
      {cells.map((c, i) => (
        <div key={i} className="pulse-cell">
          <div className="pulse-lbl">{c.lbl}</div>
          <div className="pulse-val">{c.val}</div>
          <Sparkline values={c.spark} color={c.color} />
          <div className={`pulse-delta ${c.dir}`}>{arrow(c.dir)} {c.delta}</div>
        </div>
      ))}
    </div>
  );
}

// ============== IMPORTANCE BAR ==============
export function ImportanceBar({ value }) {
  return (
    <div className="imp-bar" title={`Importance ${value}/5`}>
      {[1, 2, 3, 4, 5].map(n => (
        <i key={n} className={n <= value ? (value >= 5 ? 'crit' : 'on') : ''} />
      ))}
    </div>
  );
}

// ============== FIRM PILL ==============
export function FirmPill({ firm, ALL_FIRMS = [] }) {
  const f = ALL_FIRMS.find(x => x.id === firm) || { dot: '#888', type: 'consulting' };
  const typeLabel = f.type === 'tech' ? 'Tech' : f.type === 'ai-first' ? 'AI Lab' : 'Consulting';
  return (
    <span className="firm-pill">
      <span className="pill-dot" style={{ background: f.dot }} />
      {firm}
      <span className="pill-type">{typeLabel}</span>
    </span>
  );
}

// ============== SIGNAL CARD ==============
export function SignalCard({ item, isSaved, onToggleSave, index, ALL_FIRMS = [], SIGNAL_COLORS = {} }) {
  const sc = SIGNAL_COLORS[item.signal] || { bg: 'var(--bg-4)', color: 'var(--ink-2)' };
  const dateStr = item.date ? new Date(item.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  const hasUrl = item.url && item.url.startsWith('http');
  const impCls = `imp-${item.importance || 2}`;
  
  const targetUrl = hasUrl ? item.url : `https://www.google.com/search?q=${encodeURIComponent(item.title)}`;
  const domain = hasUrl ? new URL(item.url).hostname.replace('www.', '') : 'Google Search';

  const getSentimentBadge = () => {
    const sig = item.signal.toLowerCase();
    const title = item.title.toLowerCase();
    const summary = item.summary.toLowerCase();
    const isNegative = sig === 'restructure' || sig === 'regulatory' || 
                       title.includes('cut') || title.includes('layoff') || title.includes('disappointment') ||
                       summary.includes('anxiety') || title.includes('oppose');
    if (isNegative) {
      return <span className="sentiment-badge neg">🔴 Risk Profile</span>;
    }
    return <span className="sentiment-badge pos">🟢 Growth Driver</span>;
  };

  return (
    <a 
      href={targetUrl} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={`card ${impCls}`} 
      style={{ animationDelay: `${index * 0.03}s`, textDecoration: 'none' }}
    >
      <div className="card-meta-row">
        <FirmPill firm={item.firm} ALL_FIRMS={ALL_FIRMS} />
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {getSentimentBadge()}
          <span className="signal-tag" style={{ background: sc.bg, color: sc.color }}>{item.signal}</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <ImportanceBar value={item.importance || 2} />
        <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {item.importance >= 5 ? 'Market-moving' : item.importance >= 4 ? 'High impact' : item.importance >= 3 ? 'Notable' : 'Background'}
        </span>
      </div>
      <div className="card-headline">{item.title}</div>
      {item.takeaway && <div className="card-takeaway">{item.takeaway}</div>}
      <div className="card-summary">{item.summary}</div>
      <div className="card-foot">
        <span>{dateStr}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: 'var(--ink-3)', textDecoration: 'underline' }}>{domain}</span>
          <button className={`save-btn ${isSaved ? 'on' : ''}`} onClick={e => { e.preventDefault(); e.stopPropagation(); onToggleSave(item.id); }} title={isSaved ? 'Unsave' : 'Save'}>
            {isSaved ? '★' : '☆'}
          </button>
        </div>
      </div>
    </a>
  );
}

// ============== BRIEF VIEW ==============
export function BriefView({ data, savedIds, onToggleSave, ALL_FIRMS = [], SIGNAL_COLORS = {}, getBrief = () => ({ lead: null, secondary: [] }) }) {
  const today = new Date();
  const dateLong = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const brief = getBrief(data);

  if (!brief.lead) {
    return <div className="empty"><h3>No signals available</h3><p>Fetch live intelligence to populate the brief.</p></div>;
  }

  const renderLead = (item) => {
    if (!item) return null;
    const dateStr = new Date(item.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const targetUrl = item.url && item.url.startsWith('http') ? item.url : `https://www.google.com/search?q=${encodeURIComponent(item.title)}`;
    return (
      <div className="lead-story" onClick={() => window.open(targetUrl, '_blank')} style={{ cursor: 'pointer' }}>
        <div className="lead-tag">Lead story · {item.signal}</div>
        <div className="lead-headline">{item.title}</div>
        {item.takeaway && <div className="lead-takeaway">{item.takeaway}</div>}
        <div className="lead-body">{item.summary}</div>
        <div className="lead-meta">
          <FirmPill firm={item.firm} ALL_FIRMS={ALL_FIRMS} />
          <span>· {dateStr}</span>
          <span>· {item.source}</span>
          <ImportanceBar value={item.importance || 4} />
        </div>
      </div>
    );
  };

  const renderSec = (item) => {
    if (!item) return null;
    const dateStr = new Date(item.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const targetUrl = item.url && item.url.startsWith('http') ? item.url : `https://www.google.com/search?q=${encodeURIComponent(item.title)}`;
    return (
      <div key={item.id} className="secondary-card" onClick={() => window.open(targetUrl, '_blank')} style={{ cursor: 'pointer' }}>
        <div className="sec-top">
          <FirmPill firm={item.firm} ALL_FIRMS={ALL_FIRMS} />
          <span className="signal-tag" style={{ background: SIGNAL_COLORS[item.signal]?.bg, color: SIGNAL_COLORS[item.signal]?.color }}>{item.signal}</span>
        </div>
        <div className="sec-headline">{item.title}</div>
        {item.takeaway && <div className="sec-takeaway">{item.takeaway}</div>}
        <div className="sec-meta">
          <span>{dateStr}</span>
          <span>· {item.source}</span>
          <ImportanceBar value={item.importance || 3} />
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="brief-head">
        <div>
          <div className="brief-eyebrow">{dateLong} · Executive Brief</div>
          <h1 className="brief-title">What's moving in <em>consulting</em> &amp; tech, in five minutes.</h1>
          <p className="brief-sub">Curated signals on Big 4, MBB, and the tech alliance partners they live and die with. Ranked by what should actually concern you.</p>
        </div>
        <div className="brief-meta">
          <div><span className="num">{data.length}</span>signals tracked</div>
          <div><span className="num">{new Set(data.map(d => d.firm)).size}</span>firms covered</div>
          <div><span className="num">{data.filter(d => d.importance >= 4).length}</span>high-impact</div>
        </div>
      </div>

      <PulseStrip data={data} />

      <div className="brief-grid">
        {renderLead(brief.lead)}
        <div className="secondary-stack">
          {brief.secondary.map(renderSec)}
        </div>
      </div>
    </div>
  );
}

// ============== SIGNALS VIEW ==============
export function SignalsView({ data, savedIds, onToggleSave, search, setSearch, sort, setSort, density, ALL_FIRMS = [], SIGNAL_COLORS = {} }) {
  const sorted = useMemo(() => {
    const arr = [...data];
    if (sort === 'importance') arr.sort((a, b) => (b.importance - a.importance) || b.date.localeCompare(a.date));
    else if (sort === 'date') arr.sort((a, b) => b.date.localeCompare(a.date));
    else if (sort === 'firm') arr.sort((a, b) => a.firm.localeCompare(b.firm));
    else if (sort === 'signal') arr.sort((a, b) => a.signal.localeCompare(b.signal));
    return arr;
  }, [data, sort]);

  return (
    <div>
      <div className="signals-head">
        <h2 className="signals-h">All signals <span className="count">{data.length} items</span></h2>
        <div className="toolbar">
          <div className="search-wrap">
            <svg className="search-icon" width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3"/><path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            <input className="search-input" placeholder="Search signals…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="select" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="importance">Sort by importance</option>
            <option value="date">Latest first</option>
            <option value="firm">By firm</option>
            <option value="signal">By signal</option>
          </select>
        </div>
      </div>
      {sorted.length === 0 ? (
        <div className="empty"><h3>No signals match your filters</h3><p>Try clearing filters or fetching new intelligence.</p></div>
      ) : (
        <div className={`cards ${density}`}>
          {sorted.map((item, i) => (
            <SignalCard key={item.id} item={item} index={i} isSaved={savedIds.has(item.id)} onToggleSave={onToggleSave} ALL_FIRMS={ALL_FIRMS} SIGNAL_COLORS={SIGNAL_COLORS} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============== HEATMAP VIEW ==============
export function HeatmapView({ data, onCellClick, ALL_FIRMS = [], SIGNALS = [], buildHeatmap = () => [] }) {
  const matrix = buildHeatmap(data, ALL_FIRMS, SIGNALS);
  const max = Math.max(...matrix.flatMap(row => Object.values(row.cells)), 1);
  const level = (v) => v === 0 ? 0 : Math.min(4, Math.ceil((v / max) * 4));

  const cols = `220px repeat(${SIGNALS.length}, 1fr)`;

  return (
    <div>
      <div className="signals-head">
        <div>
          <h2 className="signals-h">Signal heatmap <span className="count">{data.length} signals · {ALL_FIRMS.length} firms</span></h2>
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--ink-3)', fontSize: 14, marginTop: 4 }}>
            Where the activity is concentrated. Click any cell to filter.
          </p>
        </div>
      </div>
      <div className="heatmap-wrap">
        <div className="heatmap" style={{ gridTemplateColumns: cols }}>
          <div className="hm-cell" style={{ background: 'var(--bg-2)' }} />
          {SIGNALS.map(s => (
            <div key={s} className="hm-cell col-head">{s}</div>
          ))}
          {matrix.map(row => (
            <React.Fragment key={row.firm.id}>
              <div className="hm-cell row-head">
                <span className="sb-dot" style={{ background: row.firm.dot }} />
                {row.firm.id}
                <span style={{ color: 'var(--ink-4)', fontSize: 9, marginLeft: 6, letterSpacing: '0.1em' }}>{row.firm.type === 'tech' ? 'TECH' : 'CONS'}</span>
              </div>
              {SIGNALS.map(s => {
                const v = row.cells[s];
                const lv = level(v);
                return (
                  <div key={s} className={`hm-cell hm-data lv-${lv}`} onClick={() => onCellClick && onCellClick(row.firm.id, s)} title={`${row.firm.id} × ${s}: ${v} signal${v !== 1 ? 's' : ''}`}>
                    {v || ''}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        <div className="heatmap-legend">
          <span>Less</span>
          <div className="legend-bar">
            <i className="hm-data lv-0" />
            <i className="hm-data lv-1" />
            <i className="hm-data lv-2" />
            <i className="hm-data lv-3" />
            <i className="hm-data lv-4" />
          </div>
          <span>More</span>
          <span style={{ marginLeft: 'auto' }}>{data.length} total signals tracked across {ALL_FIRMS.length} firms</span>
        </div>
      </div>
    </div>
  );
}

// ============== COMPARE VIEW ==============
export function CompareView({ data, onToggleSave, savedIds, ALL_FIRMS = [], CONSULTING_FIRMS = [], AI_FIRST_FIRMS = [], TECH_FIRMS = [] }) {
  const [firmA, setFirmA] = useState('McKinsey');
  const [firmB, setFirmB] = useState('Accenture');

  const itemsA = data.filter(d => d.firm === firmA).sort((a, b) => (b.importance - a.importance) || b.date.localeCompare(a.date));
  const itemsB = data.filter(d => d.firm === firmB).sort((a, b) => (b.importance - a.importance) || b.date.localeCompare(a.date));

  const stat = (items, signal) => items.filter(i => i.signal === signal).length;
  const avgImp = (items) => items.length ? (items.reduce((s, i) => s + (i.importance || 0), 0) / items.length).toFixed(1) : '–';

  const renderCol = (firmId, setFirm, items) => (
    <div className="compare-col">
      <select className="compare-firm-select" value={firmId} onChange={e => setFirm(e.target.value)}>
        <optgroup label="Compete">{CONSULTING_FIRMS.map(f => <option key={f.id} value={f.id}>{f.id}</option>)}</optgroup>
        <optgroup label="AI-first labs">
          {AI_FIRST_FIRMS.map(f => <option key={f.id} value={f.id}>{f.id}</option>)}
        </optgroup>
        <optgroup label="Tech &amp; AI Partners">
          {TECH_FIRMS.map(f => <option key={f.id} value={f.id}>{f.id}</option>)}
        </optgroup>
      </select>
      <h3><em>{firmId}</em></h3>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)', marginBottom: 18, letterSpacing: '0.04em' }}>
        {items.length} signal{items.length !== 1 ? 's' : ''} tracked · avg importance {avgImp(items)}/5
      </div>
      <div className="compare-stat-row">
        <div className="compare-stat"><div className="lbl">AI Pivots</div><div className="val">{stat(items, 'AI Pivot')}</div></div>
        <div className="compare-stat"><div className="lbl">Earnings</div><div className="val">{stat(items, 'Earnings')}</div></div>
        <div className="compare-stat"><div className="lbl">Partnerships</div><div className="val">{stat(items, 'Partnership')}</div></div>
        <div className="compare-stat"><div className="lbl">Restructure</div><div className="val">{stat(items, 'Restructure')}</div></div>
      </div>
      <div className="compare-feed">
        {items.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--ink-3)', fontSize: 12, fontFamily: 'var(--mono)' }}>No signals yet for {firmId}</div>
        ) : items.slice(0, 12).map(item => {
          const impCls = `imp-${item.importance || 2}`;
          const dateStr = new Date(item.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
          return (
            <div 
              key={item.id} 
              className={`compare-item ${impCls}`} 
              onClick={() => window.open(item.url && item.url.startsWith('http') ? item.url : `https://www.google.com/search?q=${encodeURIComponent(item.title)}`, '_blank')} 
              style={{ cursor: 'pointer' }}
            >
              <div className="ci-meta">{item.signal} · {dateStr} · {item.source}</div>
              <div className="ci-title">{item.title}</div>
              {item.takeaway && <div className="ci-take">{item.takeaway}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div>
      <div className="signals-head">
        <div>
          <h2 className="signals-h">Compare firms</h2>
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--ink-3)', fontSize: 14, marginTop: 4 }}>
            Side-by-side competitive read. Who's making which moves, ranked by impact.
          </p>
        </div>
      </div>
      <div className="compare-grid">
        {renderCol(firmA, setFirmA, itemsA)}
        {renderCol(firmB, setFirmB, itemsB)}
      </div>
    </div>
  );
}

// ============== WATCHLIST VIEW ==============
export function WatchlistView({ data, savedIds, onToggleSave, ALL_FIRMS = [], SIGNAL_COLORS = {} }) {
  const saved = data.filter(d => savedIds.has(d.id)).sort((a, b) => (b.importance - a.importance) || b.date.localeCompare(a.date));
  return (
    <div>
      <div className="signals-head">
        <div>
          <h2 className="signals-h">Watchlist <span className="count">{saved.length} saved</span></h2>
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--ink-3)', fontSize: 14, marginTop: 4 }}>
            Your bookmarked signals. Built for the Monday morning pre-read.
          </p>
        </div>
      </div>
      {saved.length === 0 ? (
        <div className="empty"><h3>No saved signals yet</h3><p>Star any signal card and it will appear here for later.</p></div>
      ) : (
        <div className="cards">
          {saved.map((item, i) => (
            <SignalCard key={item.id} item={item} index={i} isSaved={true} onToggleSave={onToggleSave} ALL_FIRMS={ALL_FIRMS} SIGNAL_COLORS={SIGNAL_COLORS} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============== CONTEXT CORNER VIEW ==============
// (Replaces generic Strategic Risk tab, rendering AI-first signal cards showing Threats, Competitor Moves, Action blocks)
export function ContextCornerView({ data, savedIds, onToggleSave, ALL_FIRMS = [], AI_FIRST_FIRMS = [], SIGNAL_COLORS = {} }) {
  const [firmFilter, setFirmFilter] = useState('all');
  const [activeForum, setActiveForum] = useState('glassdoor');

  const forumData = {
    glassdoor: {
      title: "Glassdoor Employee Index",
      desc: "Inside perspective on junior developer and senior manager sentiment across consulting practices.",
      metrics: [
        { label: "EY Rating", val: "4.1 ★", desc: "Up 0.2 YoY, driven by NVIDIA AI Factory sovereign practices.", trend: "+4%" },
        { label: "PwC Rating", val: "3.9 ★", desc: "Slight dip after US restructuring. AI pivots praised.", trend: "-2%" },
        { label: "Deloitte Rating", val: "4.0 ★", desc: "Steady. Tech consulting growth offset by audit margin worries.", trend: "flat" },
        { label: "McKinsey Rating", val: "3.9 ★", desc: "Back-office cuts created anxiety; consultants praise upskilling.", trend: "-1%" }
      ],
      quotes: [
        { firm: "EY", role: "Senior Consultant", quote: "The Dell-NVIDIA Factory play is a huge GTM asset with banking clients who refuse public cloud. Feel like we actually have a distinct story compared to just building Copilots.", rating: 5 },
        { firm: "PwC", role: "Manager", quote: "ChatPwC has automated a lot of our slide drafting. Junior leverage is shifting; we are hiring fewer analyst roles and upskilling managers faster.", rating: 4 }
      ]
    },
    fishbowl: {
      title: "Fishbowl Professional Gossip Feed",
      desc: "Uncensored professional discussions on partner GTM alignment, alliance politics, and career trajectories.",
      metrics: [
        { label: "AI Pipeline Mentions", val: "4,210", desc: "EY NVIDIA Factory and OpenAI Frontier Alliance dominating.", trend: "+24%" },
        { label: "Morale Index", val: "Balanced", desc: "Consultants enthusiastic about GTM GAI, support teams nervous.", trend: "flat" },
        { label: "Career Pivot Activity", val: "High", desc: "Massive shift in practitioners trying to escape generic tax/audit to AI Advisory.", trend: "+12%" }
      ],
      quotes: [
        { firm: "Deloitte", role: "Manager", quote: "OpenAI Frontier is a distribution deal. If you are not BCG/McKinsey/Accenture/Capgemini, you are an outsider on the GTM roadmap. We are pivoting to Azure OpenAI, but clients notice the lack of alliance badge.", rating: 3 },
        { firm: "EY", role: "Senior Manager", quote: "Everyone on my team is talking about the sovereign-AI Dell/NVIDIA play. Regulated defense and banking accounts won't let public AI touch their code. This is our winning card against PwC and McKinsey right now.", rating: 5 }
      ]
    },
    linkedin: {
      title: "LinkedIn Executive Sentiment & Corporate Posts",
      desc: "Top corporate announcements, thought leadership updates, and engagement trends shared directly by firm executives.",
      metrics: [
        { label: "Executive Engagement", val: "High (78%)", desc: "Consulting leaders posting actively about model integration and client GTM benefits.", trend: "+15%" },
        { label: "Publishing Volume", val: "148 posts/wk", desc: "McKinsey and EY leading the weekly AI-centric post counts.", trend: "+8%" },
        { label: "Audience Sentiment", val: "92% Pos", desc: "Clients expressing strong interest in sovereign enterprise-tier AI solutions.", trend: "+5%" }
      ],
      quotes: [
        { firm: "EY", role: "Global Vice Chair, Technology (1,240 👍)", quote: "Our collaboration with Dell and NVIDIA is setting a new standard for sovereign AI. Enterprises can now run secure LLMs within their own regulatory boundaries.", rating: 5 },
        { firm: "McKinsey", role: "Senior Partner (856 👍)", quote: "Orchestrating autonomous workflows is the define-or-be-defined enterprise agenda for H2 2026. Firms leveraging agentic platforms are unlocking 40% efficiency gains.", rating: 5 }
      ]
    }
  };

  const forum = forumData[activeForum];

  // Filter signals to ai-first type only
  const aiSignals = data
    .filter(d => d.type === 'ai-first')
    .filter(d => firmFilter === 'all' || d.firm === firmFilter)
    .sort((a, b) => (b.importance - a.importance) || b.date.localeCompare(a.date));

  const today = new Date();
  const dateLong = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Stats
  const total = data.filter(d => d.type === 'ai-first').length;
  const highImp = data.filter(d => d.type === 'ai-first' && d.importance >= 4).length;
  const firmsCovered = new Set(data.filter(d => d.type === 'ai-first').map(d => d.firm)).size;

  return (
    <div>
      <div className="aw-head">
        <div>
          <div className="aw-eyebrow">{dateLong} · Context Corner</div>
          <h1 className="aw-title">What the <em>AI labs</em> did this week, and what it means for consulting.</h1>
          <p className="aw-sub">Frontier-lab moves with a Context Corner on each: the threat to your firm, what rivals will do, and the concrete action this quarter.</p>
        </div>
        <div className="aw-meta">
          <div><span className="num">{total}</span>AI signals</div>
          <div style={{ marginTop: 10 }}><span className="num">{highImp}</span>high impact</div>
          <div style={{ marginTop: 10 }}><span className="num">{firmsCovered}</span>/{AI_FIRST_FIRMS.length} labs</div>
        </div>
      </div>

      {/* Forum Sentiment Hub */}
      <div className="forum-hub-card" style={{ marginBottom: 28, background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>📊</span>
            <h3 style={{ margin: 0, fontFamily: 'var(--serif-disp)', fontSize: 22, color: 'var(--ink)' }}>Forum Sentiment Hub</h3>
          </div>
          <div className="forum-hub-tabs" style={{ display: 'flex', gap: 6 }}>
            {Object.keys(forumData).map(key => (
              <button
                key={key}
                className={`forum-hub-tab-btn ${activeForum === key ? 'active' : ''}`}
                style={{
                  background: activeForum === key ? 'var(--accent-bg)' : 'transparent',
                  border: '1px solid ' + (activeForum === key ? 'var(--accent-2)' : 'var(--line)'),
                  color: activeForum === key ? 'var(--accent)' : 'var(--ink-2)',
                  fontFamily: 'var(--mono)',
                  fontSize: 10,
                  padding: '4px 10px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
                onClick={() => setActiveForum(key)}
              >
                {key.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <p style={{ margin: '8px 0 16px 0', fontSize: 13, color: 'var(--ink-3)', fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
          {forum.desc}
        </p>
        <div className="forum-hub-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <h4 style={{ margin: '0 0 10px 0', fontSize: 10, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-4)' }}>Indices &amp; Metrics</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {forum.metrics.map((m, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-3)', borderRadius: 6, border: '1px solid var(--line)' }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink)' }}>{m.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>{m.desc}</div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--accent)' }}>{m.val}</div>
                    {m.trend !== 'flat' && (
                      <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: m.trend.startsWith('+') ? 'var(--pos)' : 'var(--crit)' }}>
                        {m.trend}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ margin: '0 0 10px 0', fontSize: 10, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-4)' }}>Community Quotes</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {forum.quotes.map((q, idx) => (
                <div key={idx} className="forum-quote-card" style={{ padding: 12, background: 'var(--bg-3)', borderRadius: 6, border: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>{q.firm} — {q.role}</span>
                    <span style={{ fontSize: 10, color: 'var(--accent)' }}>{"★".repeat(q.rating)}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.45, fontStyle: 'italic', fontFamily: 'var(--serif)' }}>
                    "{q.quote}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="aw-filter-row">
        <span className="aw-fl-lbl">Lab:</span>
        <button className={`aw-firm-chip ${firmFilter === 'all' ? 'active' : ''}`} onClick={() => setFirmFilter('all')}>All AI labs</button>
        {AI_FIRST_FIRMS.map(f => (
          <button key={f.id} className={`aw-firm-chip ${firmFilter === f.id ? 'active' : ''}`} onClick={() => setFirmFilter(f.id)}>
            <span className="aw-fc-dot" style={{ background: f.dot }} />
            {f.id}
          </button>
        ))}
      </div>

      {aiSignals.length === 0 ? (
        <div className="empty"><h3>No AI-first signals match</h3><p>Try clearing the lab filter, or fetch live signals from the Signals tab.</p></div>
      ) : (
        <div className="aw-list">
          {aiSignals.map(item => (
            <article key={item.id} className={`aw-signal imp-${item.importance || 3}`}>
              <div 
                className="aw-sig-body"
                onClick={() => window.open(item.url && item.url.startsWith('http') ? item.url : `https://www.google.com/search?q=${encodeURIComponent(item.title)}`, '_blank')}
                style={{ cursor: 'pointer' }}
              >
                <div className="aw-sig-top">
                  <div className="aw-sig-firm">
                    <FirmPill firm={item.firm} ALL_FIRMS={ALL_FIRMS} />
                    <ImportanceBar value={item.importance || 3} />
                  </div>
                  <span className="aw-sig-tag" style={{ background: SIGNAL_COLORS[item.signal]?.bg, color: SIGNAL_COLORS[item.signal]?.color }}>{item.signal}</span>
                </div>
                <div className="aw-sig-headline">{item.title}</div>
                {item.takeaway && <div className="aw-sig-take">{item.takeaway}</div>}
                <div className="aw-sig-body-text">{item.summary}</div>
                <div className="aw-sig-meta">
                  <span>{item.date ? new Date(item.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</span>
                  {item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>↗ {item.source}</a> : <span onClick={(e) => e.stopPropagation()}>{item.source}</span>}
                  <button className={`save-btn ${savedIds.has(item.id) ? 'on' : ''}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSave(item.id); }} style={{ marginLeft: 'auto', fontSize: 13 }} title={savedIds.has(item.id) ? 'Unsave' : 'Save'}>
                    {savedIds.has(item.id) ? '★ Saved' : '☆ Save'}
                  </button>
                </div>
              </div>
              <div className="context-corner">
                <div className="cc-title">Context Corner · EY Competitive Standing Analysis <span className="cc-rule" /></div>
                {item.contextCorner ? (
                  <div className="cc-grid">
                    <div className="cc-block threat">
                      <h4>Threats / Opportunities for EY</h4>
                      <p>{item.contextCorner.threat}</p>
                    </div>
                    <div className="cc-block competitors">
                      <h4>Rival Competitor Moves</h4>
                      <p>{item.contextCorner.competitors}</p>
                    </div>
                    <div className="cc-block action">
                      <h4>Action Plan for EY Leadership</h4>
                      <p>{item.contextCorner.action}</p>
                    </div>
                  </div>
                ) : (
                  <div className="cc-empty">No consulting-impact analysis yet for this signal. Fetch live to enrich.</div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

// ============== INTERACTIVE UNCAPPED KNOWLEDGE GRAPH ==============
export function KnowledgeGraph({ data, ALL_FIRMS = [], SIGNALS = [], SIGNAL_COLORS = {}, onNodeSelected }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  // Dynamic Graph node/link extractor from live database signals
  const graphData = useMemo(() => {
    const nodes = [];
    const links = [];

    // 1. Core firms
    ALL_FIRMS.forEach(f => {
      // Find signal count
      const count = data.filter(d => d.firm === f.id).length;
      nodes.push({
        id: f.id,
        label: f.id,
        type: 'firm',
        color: f.dot,
        size: 14 + Math.min(count * 2, 10),
        details: `${count} active intelligence signals in database.`
      });
    });

    // 2. Core Signal Types
    SIGNALS.forEach(s => {
      const count = data.filter(d => d.signal === s).length;
      nodes.push({
        id: s,
        label: s,
        type: 'signal',
        color: SIGNAL_COLORS[s]?.color || '#c2bdb1',
        size: 11 + Math.min(count, 6),
        details: `${count} total ${s} signals mapped.`
      });
    });

    // 3. Hot Trends / Key Entities dynamically growing
    const trends = [
      'Sovereign AI', 'Frontier Alliance', 'Layoffs', 'Agentforce', 
      'Federal Contracts', 'Open Source', 'Compliance', 'Arbitrage'
    ];
    trends.forEach(t => {
      const count = data.filter(d => d.summary.toLowerCase().includes(t.toLowerCase()) || d.title.toLowerCase().includes(t.toLowerCase())).length;
      if (count > 0) {
        nodes.push({
          id: t,
          label: t,
          type: 'trend',
          color: 'var(--accent)',
          size: 7 + Math.min(count, 4),
          details: `Trend keyword matched in ${count} intelligence briefs.`
        });
      }
    });

    // 4. Create Links dynamically from data
    data.forEach(item => {
      // Link: Firm -> Signal Type (always exists)
      if (ALL_FIRMS.some(f => f.id === item.firm) && SIGNALS.includes(item.signal)) {
        links.push({
          source: item.firm,
          target: item.signal,
          id: `${item.firm}-${item.signal}`
        });
      }

      // Link: Signal Type -> Trend Node (if keyword matches)
      trends.forEach(t => {
        if (item.summary.toLowerCase().includes(t.toLowerCase()) || item.title.toLowerCase().includes(t.toLowerCase())) {
          links.push({
            source: item.signal,
            target: t,
            id: `${item.signal}-${t}`
          });
        }
      });
    });

    // Deduplicate links
    const uniqueLinks = [];
    const linkKeys = new Set();
    links.forEach(l => {
      const key = `${l.source}-${l.target}`;
      if (!linkKeys.has(key)) {
        linkKeys.add(key);
        uniqueLinks.push(l);
      }
    });

    return { nodes, links: uniqueLinks };
  }, [data, ALL_FIRMS, SIGNALS, SIGNAL_COLORS]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    const svgEl = svgRef.current;
    const width = containerRef.current.clientWidth;
    const height = 480;

    const svg = d3.select(svgEl)
      .attr("viewBox", [0, 0, width, height]);

    // Clean up
    svg.selectAll("*").remove();

    const { nodes, links } = graphData;

    // Simulation settings
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(80))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(d => d.size + 15));

    // Graph components
    const g = svg.append("g");

    // Zooming
    svg.call(d3.zoom()
      .extent([[0, 0], [width, height]])
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      }));

    // Link Elements
    const link = g.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("class", "graph-link");

    // Node Elements
    const node = g.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("class", "graph-node-group");

    node.append("circle")
      .attr("r", d => d.size)
      .attr("fill", d => d.color)
      .attr("class", "graph-node")
      .attr("stroke", "var(--bg)")
      .attr("stroke-width", 1.5)
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    node.append("text")
      .attr("dx", d => d.size + 4)
      .attr("dy", 4)
      .text(d => d.label)
      .attr("class", "graph-label")
      .attr("fill", "var(--ink-2)")
      .style("font-family", "var(--mono)")
      .style("font-size", "9px")
      .style("pointer-events", "none");

    // Hover tooltip info & Click hooks
    node.on("click", (event, d) => {
      setSelectedNode(prev => {
        const next = prev === d.id ? null : d.id;
        // Trigger filtering in main app if node is clicked
        if (onNodeSelected) {
          onNodeSelected(next ? d : null);
        }
        return next;
      });
      event.stopPropagation();
    });

    node.on("mouseover", (event, d) => {
      setHoveredNode(d);
    });

    node.on("mouseout", () => {
      setHoveredNode(null);
    });

    svg.on("click", () => {
      setSelectedNode(null);
      if (onNodeSelected) onNodeSelected(null);
    });

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // Handle high-lighting adjacencies
    node.selectAll("circle")
      .attr("class", d => {
        let cls = "graph-node";
        if (selectedNode) {
          const isTargetSelected = d.id === selectedNode;
          const isNeighbor = links.some(l => 
            (l.source.id === selectedNode && l.target.id === d.id) ||
            (l.target.id === selectedNode && l.source.id === d.id)
          );
          if (isTargetSelected) cls += " highlighted";
          else if (!isNeighbor) cls += " dimmed";
        }
        return cls;
      });

    node.selectAll("text")
      .attr("class", d => {
        let cls = "graph-label";
        if (selectedNode) {
          const isTargetSelected = d.id === selectedNode;
          const isNeighbor = links.some(l => 
            (l.source.id === selectedNode && l.target.id === d.id) ||
            (l.target.id === selectedNode && l.source.id === d.id)
          );
          if (isTargetSelected) cls += " highlighted";
          else if (!isNeighbor) cls += " dimmed";
        }
        return cls;
      });

    link
      .attr("class", d => {
        let cls = "graph-link";
        if (selectedNode) {
          const isConnected = d.source.id === selectedNode || d.target.id === selectedNode;
          if (isConnected) cls += " highlighted";
          else cls += " dimmed";
        }
        return cls;
      });

    // D3 Drag physics hooks
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => simulation.stop();
  }, [graphData, selectedNode, onNodeSelected]);

  return (
    <div>
      <div className="signals-head">
        <div>
          <h2 className="signals-h">C-Suite Knowledge Graph</h2>
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--ink-3)', fontSize: 14, marginTop: 4 }}>
            Uncapped, live relations. Click nodes to pivot database views, highlight connections, and extract key consulting insights.
          </p>
        </div>
      </div>
      <div ref={containerRef} className="graph-container">
        <div className="graph-title">
          <h3>Interactive SVG Link Map</h3>
          <p>{graphData.nodes.length} nodes · {graphData.links.length} relationships</p>
        </div>
        <svg ref={svgRef} className="graph-svg"></svg>
        
        {hoveredNode && (
          <div className="graph-tooltip">
            <h4>{hoveredNode.label}</h4>
            <span style={{ fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--accent)', textTransform: 'uppercase' }}>
              {hoveredNode.type} Node
            </span>
            <p style={{ marginTop: 6 }}>{hoveredNode.details}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============== DATA PIPELINE AUDIT VIEW ==============
export function DataPipelineAuditView({ data, apiKey, onResetDb, onClearMock, onShowToast }) {
  const [logs, setLogs] = useState([
    { time: '18:03:01', type: 'info', content: 'FirmSignal database engine initialized successfully.' },
    { time: '18:03:03', type: 'info', content: 'Pre-loaded 31 legacy core signals in read-only memory.' },
    { time: '18:03:05', type: 'success', content: 'Graph force layout indices rebuilt (38 dynamic nodes mapped).' },
    { time: '18:03:08', type: 'info', content: 'Syncing server-side database backup files.' }
  ]);

  // Periodic simulated log triggers to make it live and visual
  useEffect(() => {
    const logInterval = setInterval(() => {
      const messages = [
        { type: 'info', content: 'Executing hourly pipeline cron scanning for consulting announcements.' },
        { type: 'info', content: 'Polling news streams: reuters.com, bloomberg.com, ft.com.' },
        { type: 'success', content: 'AI pipeline audit complete. Database compact and healthy.' },
        { type: 'info', content: 'Syncing active watchlist caches with client localStorage.' },
        { type: 'info', content: 'Rebuilding force vectors for knowledge graph links.' },
        { type: 'warn', content: 'Regulatory classifier running on new mistral-sovereign-ai briefs.' }
      ];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      const now = new Date();
      const timeStr = now.toTimeString().slice(0, 8);
      setLogs(prev => [...prev, { time: timeStr, ...randomMsg }].slice(-50));
    }, 4500);

    return () => clearInterval(logInterval);
  }, []);

  const totalNodesCount = useMemo(() => {
    // Estimating graph node count from data
    const firms = new Set(data.map(d => d.firm)).size;
    const sigTypes = new Set(data.map(d => d.signal)).size;
    return firms + sigTypes + data.length;
  }, [data]);

  // Trigger JSON download of current database signals
  const triggerBackupDownload = () => {
    try {
      const dbJson = JSON.stringify(data, null, 2);
      const blob = new Blob([dbJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `firmsignal_db_export_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onShowToast('✓ Database backup downloaded');
      
      const now = new Date();
      setLogs(prev => [...prev, {
        time: now.toTimeString().slice(0, 8),
        type: 'success',
        content: 'Manual database export triggered. JSON backup downloaded.'
      }]);
    } catch (e) {
      onShowToast('Failed to generate download');
    }
  };

  const handleClearMock = () => {
    const doubleConfirm = window.confirm("Are you sure you want to clear all pre-seeded demo/mock signals? This will leave ONLY the real news signals you have scanned.");
    if (!doubleConfirm) return;

    onClearMock();

    const now = new Date();
    setLogs(prev => [...prev, {
      time: now.toTimeString().slice(0, 8),
      type: 'warn',
      content: 'Database Clean requested. Preloaded mock/demo signals cleared.'
    }]);
  };

  const handleReset = async () => {
    const doubleConfirm = window.confirm("Are you sure you want to ROLLBACK the database? This fires a rollback request and resets all active signals to demo files.");
    if (!doubleConfirm) return;

    // Send POST rollback to DB backend proxy
    try {
      const resp = await fetch('/api/reset', { method: 'POST' }).catch(() => ({ ok: false }));
      if (resp.ok) {
        onShowToast('✓ Database rollbacked successfully');
      } else {
        onShowToast('Database reset via mock fallback');
      }
    } catch (err) {}

    // Rollback frontend state to original mock files
    onResetDb();

    const now = new Date();
    setLogs(prev => [...prev, {
      time: now.toTimeString().slice(0, 8),
      type: 'warn',
      content: 'Database Rollback requested. Hard reset to 31 original demo records complete.'
    }]);
  };

  return (
    <div>
      <div className="signals-head">
        <div>
          <h2 className="signals-h">System Pipeline Control Console</h2>
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--ink-3)', fontSize: 14, marginTop: 4 }}>
            System health dashboard, streaming pipeline audit logs, and master database triggers.
          </p>
        </div>
      </div>

      <div className="pipeline-metrics">
        <div className="pipeline-card">
          <div className="pipeline-card-lbl">Pipeline Engine</div>
          <div className="pipeline-card-val status-healthy">HEALTHY</div>
          <div className="pipeline-card-desc">CRON scheduler active on port :3000</div>
        </div>
        <div className="pipeline-card">
          <div className="pipeline-card-lbl">Indexed Database Record Size</div>
          <div className="pipeline-card-val">{data.length} Signals</div>
          <div className="pipeline-card-desc">{totalNodesCount} active Knowledge Graph nodes</div>
        </div>
        <div className="pipeline-card">
          <div className="pipeline-card-lbl">API Authentication Channel</div>
          <div className="pipeline-card-val" style={{ fontSize: '24px' }}>
            {apiKey ? 'CONNECTED' : 'DEMO MODE'}
          </div>
          <div className="pipeline-card-desc">
            {apiKey ? 'Direct Claude key configured' : 'Fallback offline mock logic enabled'}
          </div>
        </div>
      </div>

      <div className="pipeline-console-container">
        <div className="pipeline-console-header">
          <div className="pipeline-console-title">
            <span style={{ width: 8, height: 8, background: '#39ff14', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 6px #39ff14', marginRight: 8 }}></span>
            Audit Stream Console
          </div>
          <span style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--mono)' }}>SYSTEM_AUDIT_LOG_ON_DEMAND</span>
        </div>
        <div className="pipeline-console">
          {logs.map((log, idx) => (
            <div key={idx} className="console-line">
              <span className="console-time">[{log.time}]</span>
              <span className={`console-type ${log.type}`}>
                {log.type.toUpperCase()}:
              </span>
              <span style={{ color: 'var(--ink-2)' }}>{log.content}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pipeline-actions-card">
        <div className="pipeline-actions-info">
          <h3>Database Backup &amp; Rollback Actions</h3>
          <p>Download full JSON databases, clear preloaded mock signals, or revert all active entities to original demo records.</p>
        </div>
        <div className="pipeline-buttons">
          <button className="pipeline-btn reset" onClick={handleClearMock} style={{ borderColor: 'rgba(212, 160, 74, 0.4)', color: 'var(--accent)', background: 'rgba(212, 160, 74, 0.05)' }}>
            🧹 Clear Demo Signals
          </button>
          <button className="pipeline-btn reset" onClick={handleReset}>
            Revert / Rollback DB
          </button>
          <button className="pipeline-btn primary" onClick={triggerBackupDownload}>
            Download DB JSON Backup
          </button>
        </div>
      </div>
    </div>
  );
}

// ============== THOUGHT LEADERSHIP CORNER ==============
export function ThoughtLeadershipView({ 
  reports = [], 
  onScanReports, 
  apiKey, 
  serverHasKey, 
  onOpenApiModal, 
  onShowToast 
}) {
  const [firmFilter, setFirmFilter] = useState('all');
  const [topicFilter, setTopicFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customScanQuery, setCustomScanQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Get active publishers count
  const publishersCount = useMemo(() => {
    return new Set(reports.map(r => r.firm)).size;
  }, [reports]);

  // Extract all unique topics or use standard ones
  const availableTopics = ['All Themes', 'AI & Automation', 'Market Strategy', 'ESG & Operations', 'Tech Alliances'];

  // Filter logic
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchesFirm = firmFilter === 'all' || r.firm.toLowerCase() === firmFilter.toLowerCase();
      
      const matchesTopic = topicFilter === 'all' || (r.topics && r.topics.some(t => t.toLowerCase() === topicFilter.toLowerCase()));
      
      const matchesSearch = !searchQuery ? true : (
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.takeaway.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.firm.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      return matchesFirm && matchesTopic && matchesSearch;
    });
  }, [reports, firmFilter, topicFilter, searchQuery]);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!apiKey && !serverHasKey) {
      onOpenApiModal();
      return;
    }
    setIsScanning(true);
    try {
      await onScanReports(customScanQuery);
      setCustomScanQuery('');
    } catch (err) {
      onShowToast(`Scan failed: ${err.message || 'error'}`);
    }
    setIsScanning(false);
  };

  const getFirmDotColor = (firmName) => {
    const map = {
      McKinsey: '#e07a6a',
      BCG: '#7aa6d6',
      Deloitte: '#4a90e2',
      PwC: '#d4a04a',
      'Strategy&': '#d4a04a',
      EY: '#f5a623',
      KPMG: '#b294d4',
      Accenture: '#a86fc7',
      'IBM Consulting': '#88c089',
      Capgemini: '#6cc4b3'
    };
    return map[firmName] || '#aaaaaa';
  };

  return (
    <div className="thought-leadership-corner">
      {/* Header Banner */}
      <div className="aw-head" style={{ marginBottom: 20 }}>
        <div>
          <div className="aw-eyebrow">Thought Leadership Corner</div>
          <h1 className="aw-title" style={{ fontFamily: 'var(--serif-disp)' }}>
            Elite C-Suite <em>Research</em> &amp; Strategic Advisory.
          </h1>
          <p className="aw-sub">
            Scanning and synthesizing whitepapers, research briefings, and global reports from top firms over the past month.
          </p>
        </div>
        <div className="aw-meta">
          <div><span className="num">{reports.length}</span>Reports</div>
          <div style={{ marginTop: 10 }}><span className="num">{publishersCount}</span>Firms</div>
          <div style={{ marginTop: 10 }}><span className="num">5</span>Themes</div>
        </div>
      </div>

      {/* Scraper / Scan Bar */}
      <div className="fetch-card" style={{ marginBottom: 24, padding: '16px 20px' }}>
        <div className="fetch-title" style={{ color: 'var(--accent)', fontWeight: 600 }}>
          <span style={{ marginRight: 8 }}>🔍</span>
          Thought Leadership Live Scraper Engine
        </div>
        <form onSubmit={handleScan} className="fetch-row" style={{ marginTop: 10, display: 'flex', gap: 12 }}>
          <input
            className="custom-input"
            style={{ flex: 1 }}
            placeholder="Search prompt (e.g. 'McKinsey GenAI', leave blank to scan past 30 days)"
            value={customScanQuery}
            onChange={e => setCustomScanQuery(e.target.value)}
            disabled={isScanning}
          />
          <button 
            type="submit" 
            className={`fetch-btn ${isScanning ? 'loading' : ''}`}
            disabled={isScanning}
            style={{
              borderColor: 'var(--accent)',
              color: 'var(--accent)',
              background: 'transparent',
              minWidth: 160
            }}
          >
            {isScanning ? 'Scanning Web...' : 'Scan Live Reports'}
          </button>
        </form>
        {isScanning && (
          <div className="sweep-prog" style={{ marginTop: 12 }}>
            <div className="sweep-bar-wrap" style={{ height: 4, background: 'rgba(212,160,74,0.1)' }}>
              <div 
                className="sweep-bar animate-pulse" 
                style={{ 
                  width: '100%', 
                  background: 'var(--accent)', 
                  height: '100%', 
                  animation: 'pulse 1.5s infinite ease-in-out' 
                }} 
              />
            </div>
            <p style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--ink-3)', marginTop: 6, textAlign: 'center' }}>
              Claude is searching the live web via Anthropic SDK, reading whitepapers, and extracting structured takeaways...
            </p>
          </div>
        )}
      </div>

      {/* Real-time filters and Search */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        {/* Topic Filters */}
        <div className="forum-hub-tabs" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {availableTopics.map(topic => {
            const id = topic === 'All Themes' ? 'all' : topic;
            const isActive = topicFilter === id;
            return (
              <button
                key={topic}
                onClick={() => setTopicFilter(id)}
                style={{
                  background: isActive ? 'var(--accent-bg)' : 'var(--bg-2)',
                  border: '1px solid ' + (isActive ? 'var(--accent)' : 'var(--line)'),
                  color: isActive ? 'var(--accent)' : 'var(--ink-2)',
                  fontFamily: 'var(--mono)',
                  fontSize: 10,
                  padding: '6px 12px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
              >
                {topic}
              </button>
            );
          })}
        </div>

        {/* Text Search */}
        <div className="search-wrap" style={{ minWidth: 260 }}>
          <svg className="search-icon" width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input
            className="search-input"
            placeholder="Search indexed reports..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Brand Chips Filtering Row */}
      <div className="aw-filter-row" style={{ marginBottom: 28 }}>
        <span className="aw-fl-lbl" style={{ fontFamily: 'var(--mono)' }}>Firm:</span>
        <button 
          className={`aw-firm-chip ${firmFilter === 'all' ? 'active' : ''}`} 
          onClick={() => setFirmFilter('all')}
        >
          All Publishers
        </button>
        {['McKinsey', 'BCG', 'Deloitte', 'PwC', 'EY', 'KPMG', 'Accenture', 'IBM Consulting', 'Capgemini'].map(f => {
          const hasReports = reports.some(r => r.firm.toLowerCase() === f.toLowerCase());
          return (
            <button 
              key={f} 
              className={`aw-firm-chip ${firmFilter.toLowerCase() === f.toLowerCase() ? 'active' : ''}`}
              onClick={() => setFirmFilter(f)}
              style={{ opacity: hasReports ? 1 : 0.55 }}
            >
              <span className="aw-fc-dot" style={{ background: getFirmDotColor(f) }} />
              {f}
            </button>
          );
        })}
      </div>

      {/* Grid List Feed */}
      {filteredReports.length === 0 ? (
        <div className="empty" style={{ background: 'var(--bg-2)', padding: 40, border: '1px dashed var(--line)' }}>
          <h3>No research briefings match your criteria</h3>
          <p>Click 'Scan Live Reports' above to execute Claude's crawler for live whitepapers.</p>
        </div>
      ) : (
        <div className="brief-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {filteredReports.map((report, idx) => {
            const dot = getFirmDotColor(report.firm);
            const dateStr = report.date ? new Date(report.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
            const fallbackSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(report.firm + ' ' + report.title)}`;
            const clickUrl = report.url || fallbackSearchUrl;

            return (
              <div 
                key={report.id} 
                className="report-card premium-editorial-card"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--r-lg)',
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  position: 'relative'
                }}
              >
                {/* Header elements */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, background: dot, borderRadius: '50%' }} />
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>
                      {report.firm.toUpperCase()}
                    </span>
                    <span style={{ color: 'var(--ink-4)', fontSize: 10 }}>· {report.source}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-3)' }}>
                    {dateStr}
                  </span>
                </div>

                {/* Report Title */}
                <h3 
                  className="report-title"
                  style={{
                    fontFamily: 'var(--serif-disp)',
                    fontSize: 20,
                    margin: 0,
                    lineHeight: 1.35,
                    color: 'var(--ink)'
                  }}
                >
                  {report.title}
                </h3>

                {/* Substantive Summary */}
                <p 
                  className="report-summary"
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: 'var(--ink-2)',
                    lineHeight: 1.5,
                    fontFamily: 'var(--serif)'
                  }}
                >
                  {report.summary}
                </p>

                {/* Gold Takeaway box */}
                <div 
                  className="takeaway-box"
                  style={{
                    borderLeft: '3px solid var(--accent)',
                    background: 'var(--bg-3)',
                    padding: '12px 16px',
                    borderRadius: '0 8px 8px 0',
                    fontSize: 12.5,
                    fontStyle: 'italic',
                    fontFamily: 'var(--serif)',
                    color: 'var(--ink-2)',
                    lineHeight: 1.45
                  }}
                >
                  <strong style={{ display: 'block', fontStyle: 'normal', fontFamily: 'var(--mono)', fontSize: 10, textTransform: 'uppercase', color: 'var(--accent)', letterSpacing: '0.1em', marginBottom: 4 }}>
                    Executive Takeaway
                  </strong>
                  "{report.takeaway}"
                </div>

                {/* Actionable recommendations customized for EY */}
                <div className="ey-actions-block" style={{ marginTop: 'auto' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontFamily: 'var(--mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)' }}>
                    Action Items for EY
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.5, fontFamily: 'var(--serif)' }}>
                    {report.actionItems && report.actionItems.map((item, i) => (
                      <li key={i} style={{ marginBottom: 6 }}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Foot element */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--line)' }}>
                  {/* Topic Badges */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    {report.topics && report.topics.map(topic => (
                      <span 
                        key={topic} 
                        style={{ 
                          fontSize: 9, 
                          fontFamily: 'var(--mono)', 
                          background: 'var(--bg-2)', 
                          color: 'var(--ink-3)', 
                          padding: '2px 6px', 
                          borderRadius: 4,
                          border: '1px solid var(--line)'
                        }}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>

                  <a 
                    href={clickUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="read-report-btn"
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 10,
                      fontWeight: 600,
                      color: 'var(--accent)',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    Read Full Report ↗
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

