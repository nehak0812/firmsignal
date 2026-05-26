// FirmSignal — Views (Brief, Signals, Heatmap, Compare, Watchlist)
const { useState, useMemo, useEffect } = React;

// ============== TICKER ==============
function Ticker({ items }) {
  // Duplicate items for seamless scroll
  const doubled = [...items, ...items];
  return (
    <div className="ticker">
      <div className="ticker-tag">Live</div>
      <div className="ticker-track">
        {doubled.map((it, i) => {
          const cls = it.importance >= 5 ? 'crit' : it.importance >= 4 ? '' : 'pos';
          const dateStr = new Date(it.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
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
function Sparkline({ values, color = 'var(--accent)' }) {
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
      <polyline className="spark-path" points={points} stroke={color} />
    </svg>
  );
}

// ============== PULSE STRIP ==============
function PulseStrip({ data }) {
  const totalSignals = data.length;
  const critCount = data.filter(d => d.importance >= 4).length;
  const aiCount = data.filter(d => d.signal === 'AI Pivot').length;
  const earningsCount = data.filter(d => d.signal === 'Earnings').length;
  const regCount = data.filter(d => d.signal === 'Regulatory').length;

  // Mock sparklines (representing 7-day trend)
  const cells = [
    { lbl: 'Signals · 7d', val: totalSignals, delta: '+12%', dir: 'up', spark: [4, 6, 5, 8, 7, 10, 12], color: 'var(--accent)' },
    { lbl: 'High-impact', val: critCount, delta: '+3', dir: 'up', spark: [1, 2, 1, 3, 4, 3, 5], color: 'var(--crit)' },
    { lbl: 'AI moves', val: aiCount, delta: '+6', dir: 'up', spark: [2, 3, 3, 5, 4, 6, 7], color: 'var(--accent)' },
    { lbl: 'Earnings', val: earningsCount, delta: 'flat', dir: 'flat', spark: [2, 2, 3, 2, 2, 3, 3], color: 'var(--pos)' },
    { lbl: 'Regulatory', val: regCount, delta: '+1', dir: 'up', spark: [0, 0, 1, 0, 1, 0, 2], color: 'var(--crit)' },
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
function ImportanceBar({ value }) {
  return (
    <div className="imp-bar" title={`Importance ${value}/5`}>
      {[1, 2, 3, 4, 5].map(n => (
        <i key={n} className={n <= value ? (value >= 5 ? 'crit' : 'on') : ''} />
      ))}
    </div>
  );
}

// ============== FIRM PILL ==============
function FirmPill({ firm }) {
  const f = window.ALL_FIRMS.find(x => x.id === firm) || { dot: '#888', type: 'consulting' };
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
function SignalCard({ item, isSaved, onToggleSave, index }) {
  const sc = window.SIGNAL_COLORS[item.signal] || { bg: 'var(--bg-4)', color: 'var(--ink-2)' };
  const dateStr = item.date ? new Date(item.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  const hasUrl = item.url && item.url.startsWith('http');
  const impCls = `imp-${item.importance || 2}`;
  let domain = '';
  if (hasUrl) { try { domain = new URL(item.url).hostname.replace('www.', ''); } catch (e) {} }

  const inner = (
    <>
      <div className="card-meta-row">
        <FirmPill firm={item.firm} />
        <span className="signal-tag" style={{ background: sc.bg, color: sc.color }}>{item.signal}</span>
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
          {hasUrl ? (
            <a href={item.url} target="_blank" rel="noopener" onClick={e => e.stopPropagation()}>
              {domain || item.source}
            </a>
          ) : (
            <span style={{ color: 'var(--ink-4)' }}>{item.source || 'demo'}</span>
          )}
          <button className={`save-btn ${isSaved ? 'on' : ''}`} onClick={e => { e.preventDefault(); e.stopPropagation(); onToggleSave(item.id); }} title={isSaved ? 'Unsave' : 'Save'}>
            {isSaved ? '★' : '☆'}
          </button>
        </div>
      </div>
    </>
  );

  if (hasUrl) {
    return <a href={item.url} target="_blank" rel="noopener" className={`card ${impCls}`} style={{ animationDelay: `${index * 0.03}s` }}>{inner}</a>;
  }
  return <div className={`card ${impCls}`} style={{ animationDelay: `${index * 0.03}s` }}>{inner}</div>;
}

// ============== BRIEF VIEW ==============
function BriefView({ data, savedIds, onToggleSave }) {
  const today = new Date();
  const dateLong = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const brief = window.getBrief(data);
  if (!brief.lead) return <div className="empty"><h3>No signals available</h3><p>Fetch live intelligence to populate the brief.</p></div>;

  const renderLead = (item) => {
    if (!item) return null;
    const dateStr = new Date(item.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    return (
      <div className="lead-story" onClick={() => item.url && window.open(item.url, '_blank')}>
        <div className="lead-tag">Lead story · {item.signal}</div>
        <div className="lead-headline">{item.title}</div>
        {item.takeaway && <div className="lead-takeaway">{item.takeaway}</div>}
        <div className="lead-body">{item.summary}</div>
        <div className="lead-meta">
          <FirmPill firm={item.firm} />
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
    return (
      <div key={item.id} className="secondary-card" onClick={() => item.url && window.open(item.url, '_blank')}>
        <div className="sec-top">
          <FirmPill firm={item.firm} />
          <span className="signal-tag" style={{ background: window.SIGNAL_COLORS[item.signal]?.bg, color: window.SIGNAL_COLORS[item.signal]?.color }}>{item.signal}</span>
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
function SignalsView({ data, savedIds, onToggleSave, search, setSearch, sort, setSort, density }) {
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
            <SignalCard key={item.id} item={item} index={i} isSaved={savedIds.has(item.id)} onToggleSave={onToggleSave} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============== HEATMAP VIEW ==============
function HeatmapView({ data, onCellClick }) {
  const firms = window.ALL_FIRMS;
  const signals = window.SIGNALS;
  const matrix = window.buildHeatmap(data, firms, signals);
  const max = Math.max(...matrix.flatMap(row => Object.values(row.cells)), 1);
  const level = (v) => v === 0 ? 0 : Math.min(4, Math.ceil((v / max) * 4));

  const cols = `220px repeat(${signals.length}, 1fr)`;

  return (
    <div>
      <div className="signals-head">
        <div>
          <h2 className="signals-h">Signal heatmap <span className="count">{data.length} signals · {firms.length} firms</span></h2>
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--ink-3)', fontSize: 14, marginTop: 4 }}>
            Where the activity is concentrated. Click any cell to filter.
          </p>
        </div>
      </div>
      <div className="heatmap-wrap">
        <div className="heatmap" style={{ gridTemplateColumns: cols }}>
          <div className="hm-cell" style={{ background: 'var(--bg-2)' }} />
          {signals.map(s => (
            <div key={s} className="hm-cell col-head">{s}</div>
          ))}
          {matrix.map(row => (
            <React.Fragment key={row.firm.id}>
              <div className="hm-cell row-head">
                <span className="sb-dot" style={{ background: row.firm.dot }} />
                {row.firm.id}
                <span style={{ color: 'var(--ink-4)', fontSize: 9, marginLeft: 6, letterSpacing: '0.1em' }}>{row.firm.type === 'tech' ? 'TECH' : 'CONS'}</span>
              </div>
              {signals.map(s => {
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
          <span style={{ marginLeft: 'auto' }}>{data.length} total signals tracked across {firms.length} firms</span>
        </div>
      </div>
    </div>
  );
}

// ============== COMPARE VIEW ==============
function CompareView({ data, onToggleSave, savedIds }) {
  const [firmA, setFirmA] = useState('McKinsey');
  const [firmB, setFirmB] = useState('Accenture');

  const itemsA = data.filter(d => d.firm === firmA).sort((a, b) => (b.importance - a.importance) || b.date.localeCompare(a.date));
  const itemsB = data.filter(d => d.firm === firmB).sort((a, b) => (b.importance - a.importance) || b.date.localeCompare(a.date));

  const stat = (items, signal) => items.filter(i => i.signal === signal).length;
  const avgImp = (items) => items.length ? (items.reduce((s, i) => s + (i.importance || 0), 0) / items.length).toFixed(1) : '–';

  const renderCol = (firmId, setFirm, items) => (
    <div className="compare-col">
      <select className="compare-firm-select" value={firmId} onChange={e => setFirm(e.target.value)}>
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
            <div key={item.id} className={`compare-item ${impCls}`}>
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
function WatchlistView({ data, savedIds, onToggleSave }) {
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
            <SignalCard key={item.id} item={item} index={i} isSaved={true} onToggleSave={onToggleSave} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============== AI WATCH VIEW ==============
function AiWatchView({ data, savedIds, onToggleSave }) {
  const [firmFilter, setFirmFilter] = useState('all');
  const aiFirms = window.AI_FIRST_FIRMS;
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
          <div className="aw-eyebrow">{dateLong} · AI Watch</div>
          <h1 className="aw-title">What the <em>AI labs</em> did this week, and what it means for consulting.</h1>
          <p className="aw-sub">Frontier-lab moves with a Context Corner on each: the threat to your firm, what rivals will do, and the concrete action this quarter.</p>
        </div>
        <div className="aw-meta">
          <div><span className="num">{total}</span>AI signals</div>
          <div style={{ marginTop: 10 }}><span className="num">{highImp}</span>high impact</div>
          <div style={{ marginTop: 10 }}><span className="num">{firmsCovered}</span>/{aiFirms.length} labs</div>
        </div>
      </div>

      <div className="aw-filter-row">
        <span className="aw-fl-lbl">Lab:</span>
        <button className={`aw-firm-chip ${firmFilter === 'all' ? 'active' : ''}`} onClick={() => setFirmFilter('all')}>All AI labs</button>
        {aiFirms.map(f => (
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
          {aiSignals.map(item => <AiSignalBlock key={item.id} item={item} isSaved={savedIds.has(item.id)} onToggleSave={onToggleSave} />)}
        </div>
      )}
    </div>
  );
}

function AiSignalBlock({ item, isSaved, onToggleSave }) {
  const sc = window.SIGNAL_COLORS[item.signal] || { bg: 'var(--bg-4)', color: 'var(--ink-2)' };
  const dateStr = new Date(item.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const hasUrl = item.url && item.url.startsWith('http');
  const impCls = `imp-${item.importance || 3}`;
  let domain = '';
  if (hasUrl) { try { domain = new URL(item.url).hostname.replace('www.', ''); } catch (e) {} }
  const cc = item.contextCorner;

  return (
    <article className={`aw-signal ${impCls}`}>
      <div className="aw-sig-body">
        <div className="aw-sig-top">
          <div className="aw-sig-firm">
            <FirmPill firm={item.firm} />
            <ImportanceBar value={item.importance || 3} />
          </div>
          <span className="aw-sig-tag" style={{ background: sc.bg, color: sc.color }}>{item.signal}</span>
        </div>
        <div className="aw-sig-headline">{item.title}</div>
        {item.takeaway && <div className="aw-sig-take">{item.takeaway}</div>}
        <div className="aw-sig-body-text">{item.summary}</div>
        <div className="aw-sig-meta">
          <span>{dateStr}</span>
          {hasUrl ? <a href={item.url} target="_blank" rel="noopener">↗ {domain || item.source}</a> : <span>{item.source}</span>}
          <button className={`save-btn ${isSaved ? 'on' : ''}`} onClick={() => onToggleSave(item.id)} style={{ marginLeft: 'auto', fontSize: 14 }} title={isSaved ? 'Unsave' : 'Save'}>
            {isSaved ? '★ Saved' : '☆ Save'}
          </button>
        </div>
      </div>
      <div className="context-corner">
        <div className="cc-title">Context Corner · impact on consulting firms <span className="cc-rule" /></div>
        {cc ? (
          <div className="cc-grid">
            <div className="cc-block threat">
              <h4>Threat / opportunity</h4>
              <p>{cc.threat}</p>
            </div>
            <div className="cc-block competitors">
              <h4>What rivals will do</h4>
              <p>{cc.competitors}</p>
            </div>
            <div className="cc-block action">
              <h4>Action this quarter</h4>
              <p>{cc.action}</p>
            </div>
          </div>
        ) : (
          <div className="cc-empty">No consulting-impact analysis yet for this signal. Fetch live to enrich.</div>
        )}
      </div>
    </article>
  );
}

Object.assign(window, {
  Ticker, PulseStrip, ImportanceBar, FirmPill, SignalCard,
  BriefView, SignalsView, HeatmapView, CompareView, WatchlistView,
  AiWatchView, AiSignalBlock,
});
