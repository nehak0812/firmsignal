# FirmSignal

Executive intelligence platform tracking large global consulting and tech firms — built for C-suite readers. Live news fetching via the Anthropic API, plus a static demo-data fallback so the app is usable without a key.

---

## Files

| File | What it does |
|---|---|
| `FirmSignal.html` | Entry point. Holds all CSS, defines the design system (warm-ink dark + amber accent), loads React + Babel + the four JSX modules. |
| `firmsignal-data.jsx` | Data layer. Firm lists (Consulting / Tech / AI-first), signal taxonomy, color tokens, ~30 demo signals (with Context Corner data for AI items), and the `callClaude` web-search integration. |
| `firmsignal-views.jsx` | View components: `Ticker`, `BriefView`, `SignalsView`, `HeatmapView`, `CompareView`, `WatchlistView`, `AiWatchView`, plus the `SignalCard` / `AiSignalBlock` / `ImportanceBar` / `FirmPill` primitives. |
| `firmsignal-app.jsx` | Top-level `App`. State management, routing between views, sidebar, fetch panel, API-key modal, toast, and the `FSTweaks` panel. |
| `tweaks-panel.jsx` | Helper library for the in-design Tweaks control panel (theme / density / ticker visibility). |

All four JSX modules are loaded via `<script type="text/babel" src="...">` and write their exports to `window` for cross-file sharing.

---

## Run locally

This is a pure-frontend app — no build step.

```bash
# any static server will do
python3 -m http.server 8000
# or
npx serve .
```

Then open `http://localhost:8000/FirmSignal.html`.

Opening `FirmSignal.html` directly via `file://` will fail because the JSX modules are loaded via `<script src>`, which browsers block under file URLs for CORS reasons. Always serve through HTTP.

---

## Architecture at a glance

```
┌─────────────────────────────────────────────────────────────┐
│  FirmSignal.html  (CSS + design tokens + script loaders)    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  firmsignal-data.jsx                                 │   │
│  │   • CONSULTING_FIRMS, TECH_FIRMS, AI_FIRST_FIRMS     │   │
│  │   • SIGNALS, SIGNAL_COLORS                           │   │
│  │   • DEMO_SIGNALS (with Context Corner data)          │   │
│  │   • callClaude(query, apiKey) → Anthropic API + web  │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  firmsignal-views.jsx                                │   │
│  │   • Ticker (scrolling breaking signals)              │   │
│  │   • BriefView (lead story + secondaries + pulse)     │   │
│  │   • AiWatchView (AI-first signals + Context Corner)  │   │
│  │   • SignalsView, HeatmapView, CompareView, Watchlist │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  firmsignal-app.jsx                                  │   │
│  │   • App, Sidebar, FetchPanel, ApiModal, FSTweaks     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Key concepts

**Signal types (8):** `M&A`, `AI Pivot`, `Earnings`, `Leadership`, `Restructure`, `Major Contract`, `Regulatory`, `Partnership`.

**Importance score (1–5):** every signal carries an `importance` integer. Cards get a colored left rail and sort by importance by default.

**"So what?" takeaway:** every signal has a one-sentence italic gold takeaway. Written for a CEO who needs the read in five seconds.

**Context Corner:** AI-first signals carry a `contextCorner` object with three short fields — `threat`, `competitors`, `action` — answering the consulting-firm-leader question "what does this mean for us this quarter?"

**Firm types (3):** `consulting` (Big 4 + MBB + Accenture + IBM + Capgemini), `tech` (Microsoft, SAP, ServiceNow, Google, AWS, Salesforce, Workday, Palantir, AuditBoard), `ai-first` (OpenAI, Anthropic, Perplexity, Mistral AI, Cohere, xAI, Hugging Face, DeepSeek).

---

## Live news fetching

The fetch panel calls Anthropic's Messages API directly from the browser using the `anthropic-dangerous-direct-browser-access` header. The API key is stored in `localStorage` only. Each call uses the `web_search_20250305` tool and a structured system prompt that forces the model to return a JSON array of signals matching the schema (incl. `contextCorner` for AI-first items).

**Sweep modes:** consulting / tech / AI-first / everything — sequential per-firm fetches with a 700ms delay between requests.

**To swap to a backend:** replace the `callClaude` function in `firmsignal-data.jsx` with a `fetch('/api/intel', ...)` to your own server. The shape of the returned items must match the demo data structure.

---

## Storage

| Key | Purpose |
|---|---|
| `localStorage.fs_apikey` | Anthropic API key (set via the modal). |
| `localStorage.fs_saved` | Array of signal IDs the user starred. |
| `localStorage.fs_visited` | Marker to show the API-key modal only on first visit. |

---

## Theming

Three themes ship out of the box, swappable from the Tweaks panel:
- **Warm dark** (default) — warm ink + amber accent
- **Ivory light** — bone editorial
- **Terminal** — cool dark + green, mono everywhere

Themes are applied via `body[data-theme="..."]` and override the `--bg`, `--ink`, `--accent`, etc. CSS custom properties.
