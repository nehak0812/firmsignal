// FirmSignal — data layer
// Firms, signals, demo data, and API integration

const CONSULTING_FIRMS = [
  { id: 'Deloitte',       dot: '#4a90e2', type: 'consulting' },
  { id: 'PwC',            dot: '#d4a04a', type: 'consulting' },
  { id: 'EY',             dot: '#f5a623', type: 'consulting' },
  { id: 'KPMG',           dot: '#b294d4', type: 'consulting' },
  { id: 'McKinsey',       dot: '#e07a6a', type: 'consulting' },
  { id: 'BCG',            dot: '#7aa6d6', type: 'consulting' },
  { id: 'Bain',           dot: '#e0a06b', type: 'consulting' },
  { id: 'Accenture',      dot: '#a86fc7', type: 'consulting' },
  { id: 'IBM Consulting', dot: '#88c089' , type: 'consulting' },
  { id: 'Capgemini',      dot: '#6cc4b3', type: 'consulting' },
];

const TECH_FIRMS = [
  { id: 'Microsoft',  dot: '#00a4ef', type: 'tech' },
  { id: 'SAP',        dot: '#0070f2', type: 'tech' },
  { id: 'ServiceNow', dot: '#62d84e', type: 'tech' },
  { id: 'Google',     dot: '#ea4335', type: 'tech' },
  { id: 'AuditBoard', dot: '#5c6bc0', type: 'tech' },
  { id: 'Salesforce', dot: '#00a1e0', type: 'tech' },
  { id: 'AWS',        dot: '#ff9900', type: 'tech' },
  { id: 'Workday',    dot: '#f68b1f', type: 'tech' },
  { id: 'Palantir',   dot: '#7b68ee', type: 'tech' },
];

const AI_FIRST_FIRMS = [
  { id: 'OpenAI',       dot: '#10a37f', type: 'ai-first' },
  { id: 'Anthropic',    dot: '#c77b58', type: 'ai-first' },
  { id: 'Perplexity',   dot: '#20808d', type: 'ai-first' },
  { id: 'Mistral AI',   dot: '#fa520f', type: 'ai-first' },
  { id: 'Cohere',       dot: '#d2785a', type: 'ai-first' },
  { id: 'xAI',          dot: '#aaaaaa', type: 'ai-first' },
  { id: 'Hugging Face', dot: '#ffd21e', type: 'ai-first' },
  { id: 'DeepSeek',     dot: '#4d6bfe', type: 'ai-first' },
];

const ALL_FIRMS = [...CONSULTING_FIRMS, ...TECH_FIRMS, ...AI_FIRST_FIRMS];

// Curated 8 C-suite-relevant signal types
const SIGNALS = [
  'M&A',
  'AI Pivot',
  'Earnings',
  'Leadership',
  'Restructure',
  'Major Contract',
  'Regulatory',
  'Partnership',
];

const SIGNAL_COLORS = {
  'M&A':            { bg: 'var(--info-bg)',   color: 'var(--info)'   },
  'AI Pivot':       { bg: 'var(--accent-bg)', color: 'var(--accent)' },
  'Earnings':       { bg: 'var(--pos-bg)',    color: 'var(--pos)'    },
  'Leadership':     { bg: 'var(--purple-bg)', color: 'var(--purple)' },
  'Restructure':    { bg: 'var(--crit-bg)',   color: 'var(--crit)'   },
  'Major Contract': { bg: 'var(--teal-bg)',   color: 'var(--teal)'   },
  'Regulatory':     { bg: 'var(--crit-bg)',   color: 'var(--crit)'   },
  'Partnership':    { bg: 'var(--info-bg)',   color: 'var(--info)'   },
};

// Demo signals — each with importance (1-5), takeaway, headline, summary
const DEMO_SIGNALS = [
  {
    id: 'd1', firm: 'McKinsey', type: 'consulting', signal: 'Restructure', importance: 5,
    title: 'McKinsey cuts 1,400 back-office roles as AI absorbs internal work',
    takeaway: 'The first MBB firm to publicly tie a major layoff to its own AI deployment — others will follow.',
    summary: 'McKinsey is eliminating support and operations positions as internal AI automation reduces demand for non-client-facing roles. Affected functions span finance, HR, and knowledge management — the firm\'s largest restructuring in a decade.',
    date: '2026-05-26', source: 'Reuters', url: '',
  },
  {
    id: 'd2', firm: 'OpenAI', type: 'ai-first', signal: 'Partnership', importance: 5,
    title: 'OpenAI Frontier Alliance locks in BCG, McKinsey, Accenture, Capgemini',
    takeaway: 'OpenAI just bought distribution. Big 4 firms not on this list are now visibly absent from the AI agent stack.',
    summary: 'OpenAI launched Frontier, an enterprise AI agent platform, with BCG, McKinsey, Accenture, and Capgemini as named implementation partners. The platform targets Salesforce, Workday, and ServiceNow workflows — directly threatening incumbent SaaS revenue.',
    date: '2026-05-25', source: 'Bloomberg', url: '',
    contextCorner: {
      threat: 'For any firm outside the four named, OpenAI is now a tier-removed partner. Deloitte, PwC, EY, KPMG can still build Azure OpenAI practices but lose direct roadmap visibility on the agent stack.',
      competitors: 'BCG and McKinsey will race for the first lighthouse — expect one named CPG or bank client in 90 days. Bain has equity exposure via OpenAI Deployment Co, so will counter on co-investment language rather than alliance status.',
      action: 'If you are not on Frontier, secure your Anthropic Claude for Enterprise position within 60 days. Sovereign AI plays (the EY/NVIDIA Factory route) are the credible Plan B for regulated clients.',
    },
  },
  {
    id: 'd3', firm: 'Deloitte', type: 'consulting', signal: 'Earnings', importance: 4,
    title: 'Deloitte crosses $70.5B — first professional services firm past the mark',
    takeaway: 'Tech consulting drove the growth. Audit and tax are now <50% of the business for the first time.',
    summary: 'Deloitte reported $70.5B in global FY2025 revenue. Technology consulting and AI advisory drove 4.9% year-on-year growth, underpinned by the firm\'s Trustworthy AI governance framework.',
    date: '2026-05-24', source: 'Financial Times', url: '',
  },
  {
    id: 'd4', firm: 'PwC', type: 'consulting', signal: 'AI Pivot', importance: 4,
    title: 'PwC ChatPwC reaches all 200,000 employees globally',
    takeaway: 'Largest internal GenAI rollout in Big 4. PwC is simultaneously cutting 1,500 US roles — the model is now visible.',
    summary: 'PwC has completed its ChatPwC deployment to approximately 200,000 professionals, the most extensive internal GenAI rollout among Big 4. The firm is pivoting headcount toward AI advisory services.',
    date: '2026-05-23', source: 'WSJ', url: '',
  },
  {
    id: 'd5', firm: 'IBM Consulting', type: 'consulting', signal: 'Major Contract', importance: 5,
    title: 'IBM wins $800M federal AI modernisation contract over Accenture, Deloitte',
    takeaway: 'IBM\'s federal practice is now the one to beat. Watch for Accenture Federal\'s response within 60 days.',
    summary: 'IBM Consulting beat Accenture and Deloitte for a multi-year federal contract to modernise AI infrastructure across three US government agencies — the largest single award in IBM\'s 2026 pipeline.',
    date: '2026-05-22', source: 'Reuters', url: '',
  },
  {
    id: 'd6', firm: 'Microsoft', type: 'tech', signal: 'AI Pivot', importance: 4,
    title: 'Copilot Studio adds autonomous multi-agent orchestration',
    takeaway: 'Microsoft is now ahead of Salesforce Agentforce on agent chaining. ServiceNow has a 6-month moat at best.',
    summary: 'Microsoft announced multi-agent orchestration in Copilot Studio, allowing enterprises to chain AI agents across Microsoft 365, Azure, and third-party systems without code.',
    date: '2026-05-21', source: 'Bloomberg', url: '',
  },
  {
    id: 'd7', firm: 'Accenture', type: 'consulting', signal: 'Earnings', importance: 4,
    title: 'Accenture AI bookings cross $3B in H1 — now 30% of contract value',
    takeaway: 'AI is no longer a practice line. It is now Accenture\'s defining product, and the firm is hiring 12,000 to match.',
    summary: 'Accenture reports AI-related bookings crossing $3B in H1 2026, now 30% of total contract value up from 18% a year ago. Hiring 12,000 AI specialists globally.',
    date: '2026-05-20', source: 'Financial Times', url: '',
  },
  {
    id: 'd8', firm: 'EY', type: 'consulting', signal: 'AI Pivot', importance: 3,
    title: 'EY deploys on-premises NVIDIA AI Factory for regulated industries',
    takeaway: 'The sovereign-AI play. EY is betting regulators won\'t let banks and defence clients touch hyperscaler clouds.',
    summary: 'EY becomes the only Big 4 firm to deploy on-premises NVIDIA-powered Dell AI Factory infrastructure, targeting sovereign AI mandates in financial services, defence, and healthcare.',
    date: '2026-05-19', source: 'Reuters', url: '',
  },
  {
    id: 'd9', firm: 'Palantir', type: 'tech', signal: 'Major Contract', importance: 4,
    title: 'Palantir AIP wins three additional US defence contracts worth $450M',
    takeaway: 'Palantir\'s federal moat is widening. Booz Allen and IBM are losing visible ground in DoD AI deployments.',
    summary: 'Palantir announced three new US Department of Defense contracts for its AI Platform (AIP) totalling approximately $450M, reinforcing dominance in federal AI deployments.',
    date: '2026-05-18', source: 'WSJ', url: '',
  },
  {
    id: 'd10', firm: 'BCG', type: 'consulting', signal: 'Earnings', importance: 3,
    title: 'BCG forecasts AI to hit 40% of revenue by year-end',
    takeaway: 'BCG\'s 10-20-70 framework is becoming the industry-standard pricing language for AI engagements.',
    summary: 'BCG CEO confirmed AI-related engagements already represent ~20% of 2024 revenue, on track to reach 40% of the firm\'s $12B revenue base by year-end.',
    date: '2026-05-17', source: 'Bloomberg', url: '',
  },
  {
    id: 'd11', firm: 'SAP', type: 'tech', signal: 'AI Pivot', importance: 3,
    title: 'SAP Joule AI agents go GA across S/4HANA and SuccessFactors',
    takeaway: 'Joule going GA pulls forward $1.2B of pipeline for Accenture and Capgemini — the SAP implementation duopoly.',
    summary: 'SAP formally released Joule AI agents into general availability across its core ERP and HR platforms, enabling autonomous process execution in finance, procurement, and HR.',
    date: '2026-05-16', source: 'Reuters', url: '',
  },
  {
    id: 'd12', firm: 'Anthropic', type: 'ai-first', signal: 'Partnership', importance: 4,
    title: 'Claude for Enterprise adds audit trails for regulated industries',
    takeaway: 'Anthropic is now the credible alternative for banks and pharma. Microsoft\'s Azure OpenAI lock-in is weakening.',
    summary: 'Anthropic released an expanded Claude for Enterprise tier featuring audit trails, policy guardrails, and admin controls designed for regulated industries.',
    date: '2026-05-15', source: 'Financial Times', url: '',
    contextCorner: {
      threat: 'Anthropic is now a real procurement option for the Tier-1 banks and pharma clients that previously could only buy OpenAI through Azure. Big 4 audit and risk practices need a Claude position by H2.',
      competitors: 'Deloitte and PwC will likely formalise Claude alliances within the quarter. EY/KPMG move slower — Bain and BCG already have Claude exposure through Anthropic deals.',
      action: 'Build a Claude practice POC with one regulated client this quarter. Hire 2-3 prompt/eval engineers — the talent gap is narrower here than for OpenAI.',
    },
  },
  {
    id: 'd13', firm: 'KPMG', type: 'consulting', signal: 'Leadership', importance: 3,
    title: 'KPMG names new Global Head of AI, poached from Microsoft',
    takeaway: 'External hire signals KPMG is buying credibility it can\'t build internally — Big 4 leadership talent war is on.',
    summary: 'KPMG appointed a former Microsoft AI VP as Global Head of AI, a newly created role. The hire is the firm\'s most senior external recruit in five years.',
    date: '2026-05-14', source: 'WSJ', url: '',
  },
  {
    id: 'd14', firm: 'Workday', type: 'tech', signal: 'M&A', importance: 3,
    title: 'Workday acquires HiredScore for AI talent intelligence',
    takeaway: 'Workday is buying its way ahead of SAP SuccessFactors in skills-based hiring — and ahead of new SEC AI rules.',
    summary: 'Workday completed its acquisition of HiredScore, an AI-powered talent orchestration platform, integrating predictive hiring and skills intelligence directly into Workday HCM.',
    date: '2026-05-13', source: 'Reuters', url: '',
  },
  {
    id: 'd15', firm: 'Google', type: 'tech', signal: 'AI Pivot', importance: 3,
    title: 'Gemini 2.0 Ultra goes GA via Vertex AI with 30% price cut',
    takeaway: 'The price war is real. Long-context enterprise inference is now a commodity — margins move to integration.',
    summary: 'Google announced general availability of Gemini 2.0 Ultra via Google Cloud Vertex AI, alongside a 30% price reduction on long-context inference. Capgemini and Deloitte named anchor partners.',
    date: '2026-05-12', source: 'Bloomberg', url: '',
  },
  {
    id: 'd16', firm: 'EY', type: 'consulting', signal: 'Regulatory', importance: 4,
    title: 'EU AI Act enforcement hits Big 4 audit AI tools — EY first to comply',
    takeaway: 'Compliance becomes the first real moat in audit AI. Firms slow to certify lose EU mandates by Q3.',
    summary: 'The EU\'s AI Act high-risk classification took effect for AI-assisted audit tools. EY is first Big 4 firm to receive full conformity assessment; competitors estimate 60-90 days behind.',
    date: '2026-05-11', source: 'Financial Times', url: '',
  },
  {
    id: 'd17', firm: 'Salesforce', type: 'tech', signal: 'AI Pivot', importance: 3,
    title: 'Agentforce 3.0 expands into finance and compliance workflows',
    takeaway: 'Salesforce is now competing directly with ServiceNow in ERP-adjacent automation. Watch CRM-vs-ITSM consolidation.',
    summary: 'Salesforce released Agentforce 3.0 with pre-built AI agent templates for financial services compliance, account reconciliation, and regulatory reporting. PwC and Deloitte named implementation partners.',
    date: '2026-05-10', source: 'WSJ', url: '',
  },
  {
    id: 'd18', firm: 'Bain', type: 'consulting', signal: 'Partnership', importance: 3,
    title: 'Bain joins TPG, Brookfield in OpenAI Deployment Company investment',
    takeaway: 'Bain just bought equity in its biggest channel partner. MBB peers don\'t have the same alignment with OpenAI.',
    summary: 'Bain & Company joined a consortium including TPG, Advent, and Brookfield to invest in OpenAI\'s new Deployment Company, cementing its position as OpenAI\'s exclusive MBB implementation partner.',
    date: '2026-05-09', source: 'Bloomberg', url: '',
  },
  {
    id: 'd19', firm: 'AWS', type: 'tech', signal: 'AI Pivot', importance: 2,
    title: 'AWS Bedrock Agents adds intelligent multi-model routing',
    takeaway: 'AWS is hedging — Claude, Titan, Llama all routable. Customers no longer need to pick a model up-front.',
    summary: 'AWS announced intelligent model routing in Amazon Bedrock Agents, automatically selecting the optimal foundation model per task to reduce cost and latency.',
    date: '2026-05-08', source: 'Reuters', url: '',
  },
  {
    id: 'd20', firm: 'Capgemini', type: 'consulting', signal: 'Partnership', importance: 3,
    title: 'Capgemini named OpenAI Frontier Alliance partner',
    takeaway: 'Capgemini just leapfrogged into the elite OpenAI tier alongside MBB. SAP and Google partnerships now stack up.',
    summary: 'Capgemini was named alongside Accenture, BCG, and McKinsey as an OpenAI Frontier Alliance partner, taking responsibility for data architecture, cloud infrastructure, and enterprise connectivity.',
    date: '2026-05-07', source: 'Financial Times', url: '',
  },
  {
    id: 'd21', firm: 'AuditBoard', type: 'tech', signal: 'AI Pivot', importance: 2,
    title: 'AuditBoard launches AI-native risk and controls assistant',
    takeaway: 'A direct shot at Big 4 audit margins. Deloitte and PwC integrating it is defensive, not strategic.',
    summary: 'AuditBoard released its AI controls assistant in GA, enabling audit teams to auto-generate test procedures, synthesise evidence, and draft findings using natural language.',
    date: '2026-05-06', source: 'WSJ', url: '',
  },
  {
    id: 'd22', firm: 'Deloitte', type: 'consulting', signal: 'Leadership', importance: 3,
    title: 'Deloitte UK CEO announces planned exit; succession race begins',
    takeaway: 'Three internal contenders, one external. The pick will signal whether Deloitte UK doubles down on consulting or audit.',
    summary: 'Deloitte UK\'s CEO confirmed plans to step down at the end of FY2026 after a six-year tenure. Internal succession process underway with at least three partners shortlisted.',
    date: '2026-05-05', source: 'Financial Times', url: '',
  },
  {
    id: 'd23', firm: 'Anthropic', type: 'ai-first', signal: 'Regulatory', importance: 3,
    title: 'Anthropic backs California AI safety bill; OpenAI publicly opposes',
    takeaway: 'First real public split between frontier labs. Enterprise buyers in regulated industries are watching closely.',
    summary: 'Anthropic publicly endorsed a California AI safety bill requiring frontier model providers to publish safety evaluations. OpenAI issued a statement opposing the bill\'s scope.',
    date: '2026-05-04', source: 'Bloomberg', url: '',
    contextCorner: {
      threat: 'CCOs and CROs at regulated clients will start asking which model their consulting firm uses. Public lab positioning is becoming part of the procurement diligence.',
      competitors: 'Expect EY and Deloitte to publish AI governance whitepapers within 60 days that lean on Anthropic\'s safety stance. Accenture/Microsoft alignment makes a similar stance harder.',
      action: 'Refresh AI vendor diligence templates for your top-10 regulated accounts. Surface model-provider safety posture as a discussion item in next quarterly steering reviews.',
    },
  },
  {
    id: 'd24', firm: 'ServiceNow', type: 'tech', signal: 'Earnings', importance: 3,
    title: 'ServiceNow Now Assist crosses 1,000 enterprise customers',
    takeaway: 'AI workflow product tripled YoY. ServiceNow is the only SaaS vendor showing this rate of AI monetisation.',
    summary: 'ServiceNow reported Now Assist, its AI workflow product, has crossed 1,000 enterprise customers — three times the figure from a year ago, accompanied by expanded Azure OpenAI integration.',
    date: '2026-05-03', source: 'Reuters', url: '',
  },
  // ===== AI-First org signals =====
  {
    id: 'a1', firm: 'Perplexity', type: 'ai-first', signal: 'Major Contract', importance: 4,
    title: 'Perplexity Enterprise wins JP Morgan, Goldman as anchor customers',
    takeaway: 'Search-replacement AI lands inside two top investment banks — a category Big 4 cannot easily build for.',
    summary: 'Perplexity announced JP Morgan and Goldman Sachs as anchor customers of Perplexity Enterprise, its sourced AI search tier. The product replaces internal Bloomberg-adjacent research workflows for ~40,000 seats combined.',
    date: '2026-05-24', source: 'Bloomberg', url: '',
    contextCorner: {
      threat: 'Consulting research practices (PwC, Deloitte, McKinsey Knowledge) overlap with what Perplexity now does inside the client. Expect margin pressure on knowledge-management retainers.',
      competitors: 'Watch BCG Vantage and Bain Knowledge for a defensive product announcement. Accenture will likely propose a Perplexity reseller motion to retain account control.',
      action: 'Audit your knowledge-management deliverables this quarter. Reposition them as synthesis + judgement, not retrieval. Pilot Perplexity Enterprise on one internal team.',
    },
  },
  {
    id: 'a2', firm: 'Mistral AI', type: 'ai-first', signal: 'Partnership', importance: 4,
    title: 'Mistral signs EU sovereign AI deal with Capgemini and Atos',
    takeaway: 'The EU-only AI stack is becoming real. Non-European Big 4 partners are quietly losing ground on sovereign mandates.',
    summary: 'Mistral AI announced a strategic partnership with Capgemini and Atos to deliver sovereign EU AI deployments for public sector and defence clients, fully hosted on European infrastructure.',
    date: '2026-05-22', source: 'Reuters', url: '',
    contextCorner: {
      threat: 'EU public sector and defence work increasingly requires sovereign AI stack. US-headquartered firms (Deloitte, McKinsey, Accenture) need an explicit Mistral or EU-cloud answer for every EU bid.',
      competitors: 'Capgemini just took a structural lead in EU public sector. Expect Sopra Steria and BearingPoint to follow within 60 days. Big 4 EU practices will respond with EY-style on-prem deployments.',
      action: 'For every EU public sector or regulated bid in pipeline, add a Mistral/sovereign AI option to the architecture deck. Begin discussions with Mistral on framework agreements.',
    },
  },
  {
    id: 'a3', firm: 'xAI', type: 'ai-first', signal: 'AI Pivot', importance: 3,
    title: 'xAI Grok-3 Enterprise GA with native X/Twitter and Tesla data hooks',
    takeaway: 'A weird wedge: real-time social + automotive data nobody else offers. Niche but defensible in marketing and auto sectors.',
    summary: 'xAI released Grok-3 Enterprise, featuring native ingest from X (Twitter) firehose and Tesla operational data. Pricing undercuts OpenAI by ~25% for comparable token volumes.',
    date: '2026-05-21', source: 'WSJ', url: '',
    contextCorner: {
      threat: 'Marketing, brand-safety and automotive consulting practices may face a client question: "Have you evaluated Grok?" within the next 6 months. Saying no will look uninformed.',
      competitors: 'Most consulting firms will stay quiet publicly but evaluate privately. Bain (consumer/auto strength) is most likely to formalise a Grok pilot first.',
      action: 'Run an internal evaluation in your auto and consumer practices. Have a defensible POV on Grok by end of quarter — clients will ask, and "we haven\'t looked" is a wrong answer.',
    },
  },
  {
    id: 'a4', firm: 'Cohere', type: 'ai-first', signal: 'Major Contract', importance: 4,
    title: 'Cohere wins Royal Bank of Canada full-stack AI deployment',
    takeaway: 'Canadian banking goes Cohere. Sovereign and Tier-1 bank deployments are now a three-horse race: Cohere, Anthropic, Mistral.',
    summary: 'Cohere announced RBC as anchor customer for its end-to-end private AI deployment, replacing parts of the bank\'s OpenAI footprint. The deal covers Command-R, Embed, and Rerank models in RBC\'s own VPC.',
    date: '2026-05-19', source: 'Globe & Mail', url: '',
    contextCorner: {
      threat: 'Tier-1 bank IT spend on AI is no longer defaulting to Azure OpenAI. Banking and capital markets practices need a Cohere/Anthropic/Mistral matrix view, not a single Microsoft talk track.',
      competitors: 'Deloitte Canada and KPMG Canada will scramble to formalise Cohere alliances. McKinsey/BCG will quietly add Cohere to their model-agnostic platforms.',
      action: 'Map current bank-sector AI engagements: how many are single-model? Pitch a model-portfolio rationalisation engagement to your top 3 banking accounts within 60 days.',
    },
  },
  {
    id: 'a5', firm: 'DeepSeek', type: 'ai-first', signal: 'AI Pivot', importance: 5,
    title: 'DeepSeek V4 open-source release matches GPT-class reasoning at 10% cost',
    takeaway: 'The cost ceiling for frontier AI just collapsed again. Margin assumptions in every AI consulting proposal need to be redone.',
    summary: 'DeepSeek released V4 weights under permissive open-source licence, matching frontier closed-model performance on reasoning benchmarks at roughly 10% of inference cost. CIOs are already asking about it.',
    date: '2026-05-18', source: 'The Information', url: '',
    contextCorner: {
      threat: 'CIOs will ask "why are we paying OpenAI/Anthropic prices when DeepSeek is free?" — by next budget cycle, in every account. Implementation-fee leverage built on closed-model premiums is at risk.',
      competitors: 'McKinsey and BCG will write cost-rationalisation POVs within 30 days. Accenture and Capgemini will need to update their pricing approach for AI build engagements.',
      action: 'Refresh AI TCO models with DeepSeek-class assumptions across all live proposals. Build a "model arbitrage" advisory offer — there is real fee revenue in helping clients move workloads.',
    },
  },
  {
    id: 'a6', firm: 'Hugging Face', type: 'ai-first', signal: 'Partnership', importance: 3,
    title: 'Hugging Face Enterprise Hub adds SOC 2 Type II + EU AI Act compliance',
    takeaway: 'Open-source AI is now enterprise-procurable. The build vs buy debate just got harder for proprietary platforms.',
    summary: 'Hugging Face Enterprise Hub achieved SOC 2 Type II certification and published EU AI Act conformity documentation, removing the last major procurement blocker for regulated industries.',
    date: '2026-05-16', source: 'Reuters', url: '',
    contextCorner: {
      threat: 'Open-model build engagements are now feasible for regulated clients. Big 4 "safe choice" Azure OpenAI talk track is less defensible than 12 months ago.',
      competitors: 'IBM Consulting (open-source heritage) and Capgemini (Hugging Face partnership) are best positioned. Pure-play Microsoft alliance firms have the weakest answer.',
      action: 'Train at least 200 practitioners on Hugging Face open-model deployment patterns this year. Build one reference architecture for a regulated client — use it in next 3 RFPs.',
    },
  },
  {
    id: 'a7', firm: 'OpenAI', type: 'ai-first', signal: 'Leadership', importance: 4,
    title: 'OpenAI hires former Accenture Global Cloud lead as Chief Enterprise Officer',
    takeaway: 'OpenAI is professionalising its enterprise GTM. The era of buying through Microsoft is fading — direct OpenAI sales are coming.',
    summary: 'OpenAI named a former Accenture Global Cloud Practice Lead as Chief Enterprise Officer, reporting directly to the CEO. The role is new and signals direct enterprise selling motion.',
    date: '2026-05-15', source: 'Bloomberg', url: '',
    contextCorner: {
      threat: 'OpenAI selling direct compresses the implementation-services margin pool. Microsoft Azure OpenAI resale economics may be repriced within 12 months.',
      competitors: 'Accenture will lose specific named accounts to OpenAI Direct. Other firms will see selective disintermediation in the largest AI deals.',
      action: 'Review your top-20 AI accounts: which were sourced via Microsoft? Begin direct OpenAI commercial conversations on the top 5 before OpenAI Direct lands the conversation first.',
    },
  },
];

// Compute ticker items (most recent 12, sorted by importance + date)
function getTickerItems(items) {
  return [...items]
    .sort((a, b) => (b.importance - a.importance) || b.date.localeCompare(a.date))
    .slice(0, 14);
}

// Curate today's brief: 1 lead (highest importance, most recent) + 3 secondary
function getBrief(items) {
  const sorted = [...items].sort((a, b) => (b.importance - a.importance) || b.date.localeCompare(a.date));
  return { lead: sorted[0], secondary: sorted.slice(1, 4) };
}

// Build heatmap matrix: firms × signals → count
function buildHeatmap(items, firms, signals) {
  const matrix = firms.map(f => {
    const row = { firm: f, cells: {} };
    signals.forEach(s => { row.cells[s] = 0; });
    return row;
  });
  items.forEach(it => {
    const row = matrix.find(r => r.firm.id === it.firm);
    if (row && row.cells[it.signal] !== undefined) row.cells[it.signal] += 1;
  });
  return matrix;
}

// API integration — preserves prior behavior
const SYSTEM_PROMPT = `You are an intelligence analyst extracting executive-grade signals from consulting and tech firm news for C-suite leaders. Use web search to find real, recent news from the past 7 days.

CRITICAL:
- Only news from the past 7 days. Real URLs only — never fabricate.
- Return ONLY a valid JSON array — no markdown, no preamble.

Each item must include:
- id: unique string
- firm: exact firm name
- title: concise headline under 90 chars
- takeaway: ONE sentence on why this matters competitively — written for a CEO who needs the "so what" in five seconds. Be opinionated.
- summary: 2-3 sentences on the substance
- signal: one of [M&A, AI Pivot, Earnings, Leadership, Restructure, Major Contract, Regulatory, Partnership]
- importance: integer 1-5 where 5 = market-moving, 3 = noteworthy, 1 = minor
- date: YYYY-MM-DD
- source: publication name
- url: full https:// URL
- type: "consulting" | "tech" | "ai-first" (AI-native labs like OpenAI, Anthropic, Perplexity, Mistral, Cohere, xAI, Hugging Face, DeepSeek)
- contextCorner (REQUIRED when type is "ai-first"): object with three short fields, each 1-2 sentences, written for a consulting-firm executive:
    - threat: how this changes the threat/opportunity for a Big 4 or MBB firm
    - competitors: what rival consulting firms will do in response
    - action: a concrete move this quarter

Return up to 5 distinct items. Quality over quantity.`;

async function callClaude(query, apiKey) {
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2400,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Search for news about: ${query}\n\nReturn only a JSON array of results.` }],
    }),
  });
  if (!resp.ok) { const err = await resp.json(); throw new Error(err.error?.message || resp.statusText); }
  const data = await resp.json();
  const text = data.content.filter(b => b.type === 'text').map(b => b.text).join('');
  const clean = text.replace(/```json|```/g, '').trim();
  const match = clean.match(/\[[\s\S]*\]/);
  if (!match) return [];
  try { return JSON.parse(match[0]); } catch (e) { return []; }
}

Object.assign(window, {
  CONSULTING_FIRMS, TECH_FIRMS, AI_FIRST_FIRMS, ALL_FIRMS, SIGNALS, SIGNAL_COLORS,
  DEMO_SIGNALS, getTickerItems, getBrief, buildHeatmap, callClaude,
});
