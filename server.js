import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const DB_DIR = path.join(__dirname, 'db');
const DB_FILE = path.join(DB_DIR, 'db.json');
const LOG_FILE = path.join(DB_DIR, 'pipeline.log');

// Setup pipeline logger
async function logActivity(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage.trim());
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    await fs.appendFile(LOG_FILE, logMessage, 'utf8');
  } catch (err) {
    console.error('Failed to write to pipeline log:', err);
  }
}

// Default Demo Data
const DEFAULT_DEMO_SIGNALS = [
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
  }
];

// Helper to read database
async function readDb() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    // If database doesn't exist, create it with defaults
    await logActivity('Database file missing or corrupted. Rebuilding with default demo signals.');
    const initialDb = {
      signals: DEFAULT_DEMO_SIGNALS,
      chatLogs: [],
      readArticles: {},
      graphCoordinates: {}
    };
    await writeDb(initialDb);
    return initialDb;
  }
}

// Helper to write database
async function writeDb(data) {
  await fs.mkdir(DB_DIR, { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// RAG matching function
function getRelevantRAGContext(query, signals) {
  if (!query) return [];
  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  if (terms.length === 0) return signals.slice(0, 5); // Fallback to first 5
  
  const scored = signals.map(s => {
    let score = 0;
    const textToSearch = `${s.firm} ${s.title} ${s.summary} ${s.takeaway} ${s.signal} ${s.type}`.toLowerCase();
    terms.forEach(term => {
      if (textToSearch.includes(term)) {
        score += 1;
        // Boost if direct matches to firm or signal type
        if (s.firm.toLowerCase().includes(term)) score += 2;
        if (s.signal.toLowerCase().includes(term)) score += 2;
      }
    });
    return { signal: s, score };
  });

  return scored
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score || b.signal.importance - a.signal.importance || b.signal.date.localeCompare(a.signal.date))
    .map(x => x.signal)
    .slice(0, 8); // top 8 relevant signals
}

// Fallback smart generator for Multi-Agent response (Offline Mode)
function generateFallbackResponse(agent, query, contextSignals) {
  const firmNames = [...new Set(contextSignals.map(s => s.firm))];
  const titles = contextSignals.map(s => s.title);
  
  let responseText = "";
  if (agent === 'advisor') {
    responseText = `### Executive Advisor Strategy Briefing

Regarding your query: "${query}", here is my strategic analysis based on our latest market intelligence:

**1. Competitive Takeaway**
${contextSignals.length > 0 ? `The defining trend here is led by **${firmNames.join(', ')}**. Particularly, "${titles[0]}". This indicates a rapid shift where strategic positioning must move from simple pilot projects to full-scale enterprise scaling.` : "We are seeing consulting firms rapidly repositioning their offerings toward sovereign AI and proprietary workflow integration."}

**2. "So-What" Business Impact**
- **Margin Compaction:** Proprietary SaaS platforms are compressing traditional delivery models.
- **Sovereign Mandates:** On-premises and localized AI deployments (like EY's NVIDIA Factory play) are becoming the primary defensive moat.
- **Alliance Splits:** The frontier alliance splits (e.g. OpenAI's select partners vs. others) create visible gaps in vendor-neutral advisory.

**3. Actionable Recommendations for this Quarter**
- **Audit Portfolio:** Review your top client engagements and identify dependencies on closed vs. open-source models.
- **Secure Anthropic/Claude Alignment:** Build direct governance practice loops before client-side direct-selling squeezes advisor margins.
- **Pilot Model Arbitrage:** Begin shifting commoditized inference workloads to open weights (like DeepSeek V4) to preserve advisory margin.`;
  } else if (agent === 'researcher') {
    responseText = `### Researcher Fact Synthesis & Timeline Analysis

Based on our document store, I have compiled the factual timeline and details regarding your query:

**Active Signals Synthesized:**
${contextSignals.length > 0 ? contextSignals.map((s, idx) => `${idx + 1}. **${s.date}** - [${s.firm}] *${s.title}* (${s.source}, Importance: ${s.importance}/5)\n   - *Takeaway:* ${s.takeaway}`).join('\n') : "No direct matches found in our current signals. Fallback: General AI pivoting and earnings indicators."}

**Key Comparative Findings:**
- **Market Leadership:** Deloitte is leading consulting in absolute scale crossing the $70.5B mark, with tech consulting acting as its primary growth engine.
- **Layoffs vs. Growth:** McKinsey's cut of 1,400 back-office roles represents the first direct admission of internal AI efficiency gains.
- **Alliance Allignments:** OpenAI's Frontier Alliance includes BCG, McKinsey, Accenture, and Capgemini, leaving Deloitte and EY to seek alternative sovereign or multi-model architectures.`;
  } else { // analyst
    responseText = `### Market Analyst Competitive Assessment

Analyzing the competitive dynamics and financial indicators regarding your query:

**1. Market Structure Shifts**
- **The Sovereign Wedge:** EY's deployment of Dell/NVIDIA AI Factory is a highly calculated sovereign-AI play. By avoiding public hyperscalers, they capture highly regulated banking and defense sectors.
- **Inference Price Arbitrage:** Google Vertex price cuts and the entry of open-weights like DeepSeek V4 at 10% of closed-model costs are creating massive price pressures for implementation pipelines.
- **Productization Threat:** ServiceNow's Now Assist crossing 1,000 enterprise customers is a leading indicator of SaaS vendors capturing AI workflow revenues directly, bypassing heavy advisory setups.

**2. Risk & Defensive Moats**
- **Audit Risks:** High-risk audit certifications (such as EY's early EU AI Act compliance) are the new high-margin moats.
- **Alliance Risks:** Relying on single-model platforms exposes firms to direct sales disintermediation (as OpenAI hires enterprise sales teams).`;
  }
  return responseText;
}

// Anthropic messages schema definition
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
- type: "consulting" | "tech" | "ai-first"
- contextCorner (REQUIRED when type is "ai-first"): object with threat, competitors, and action.

Return up to 5 distinct items. Quality over quantity.`;

const app = express();

app.use(cors());
app.use(express.json());

// Serving static files from ./dist
app.use(express.static(path.join(__dirname, 'dist')));

// GET /api/status
app.get('/api/status', (req, res) => {
  return res.json({
    success: true,
    hasApiKey: !!process.env.ANTHROPIC_API_KEY
  });
});

// GET /api/signals
app.get('/api/signals', async (req, res) => {
  await logActivity('GET /api/signals hit.');
  try {
    const db = await readDb();
    return res.json({ success: true, signals: db.signals });
  } catch (err) {
    await logActivity(`Error in GET /api/signals: ${err.message}`);
    return res.status(500).json({ error: err.message || 'Failed to fetch signals.' });
  }
});

// 1. POST /api/intel
// Ingestion proxy that reads/writes signals from/to the JSON database and coordinates Claude-extracted digests.
app.post('/api/intel', async (req, res) => {
  const { query, apiKey, signals } = req.body;
  
  await logActivity(`POST /api/intel hit. Query: ${query ? `"${query}"` : 'none'} | Custom Signals: ${signals ? signals.length : 'none'}`);

  try {
    const db = await readDb();

    // Case A: Directly saving raw signals provided in body
    if (signals && Array.isArray(signals)) {
      const existingTitles = new Set(db.signals.map(s => s.title.toLowerCase().slice(0, 45)));
      const addedSignals = [];

      for (const item of signals) {
        if (!item.title) continue;
        const normalizedTitle = item.title.toLowerCase().slice(0, 45);
        if (!existingTitles.has(normalizedTitle)) {
          const newSignal = {
            id: item.id || `sig_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            firm: item.firm || 'Unknown',
            type: item.type || 'consulting',
            signal: item.signal || 'AI Pivot',
            importance: item.importance || 3,
            title: item.title,
            takeaway: item.takeaway || '',
            summary: item.summary || '',
            date: item.date || new Date().toISOString().slice(0, 10),
            source: item.source || 'Manual Ingestion',
            url: item.url || '',
            ...(item.contextCorner ? { contextCorner: item.contextCorner } : {})
          };
          db.signals.unshift(newSignal);
          addedSignals.push(newSignal);
        }
      }

      if (addedSignals.length > 0) {
        await writeDb(db);
        await logActivity(`Directly ingested ${addedSignals.length} new signals successfully.`);
      }
      return res.json({ success: true, count: addedSignals.length, added: addedSignals, addedSignals: addedSignals });
    }

    // Case B: Proxy scanning with Claude Web Search API
    const apiKeyToUse = apiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKeyToUse) {
      await logActivity('SCAN FAILURE: Anthropic API Key not provided or configured.');
      return res.status(400).json({ error: 'Anthropic API key is required to scan live news.' });
    }

    await logActivity(`Initiating Claude proxy web search for: "${query}"`);
    
    // Call Anthropic Messages API
    const today = new Date().toISOString().slice(0, 10);
    const searchPrompt = query || `consulting and tech firm news this week ${today}`;
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKeyToUse,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2400,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: `Search for news about: ${searchPrompt}\n\nReturn only a JSON array of results.` }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      await logActivity(`Claude API scan failed: ${response.status} ${response.statusText} - ${errorText}`);
      throw new Error(`Anthropic API returned: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.content.filter(b => b.type === 'text').map(b => b.text).join('');
    const clean = text.replace(/```json|```/g, '').trim();
    const match = clean.match(/\[[\s\S]*\]/);
    
    if (!match) {
      await logActivity('Claude scan completed, but no signals array was found in response.');
      return res.json({ success: true, count: 0, added: [] });
    }

    const parsed = JSON.parse(match[0]);
    const existingTitles = new Set(db.signals.map(s => s.title.toLowerCase().slice(0, 45)));
    const addedSignals = [];

    for (const item of parsed) {
      if (!item.title) continue;
      const normalizedTitle = item.title.toLowerCase().slice(0, 45);
      if (!existingTitles.has(normalizedTitle)) {
        const newSignal = {
          ...item,
          id: item.id || `claude_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          importance: item.importance || 3
        };
        db.signals.unshift(newSignal);
        addedSignals.push(newSignal);
      }
    }

    if (addedSignals.length > 0) {
      await writeDb(db);
      await logActivity(`Claude scan added ${addedSignals.length} new signals from query "${query}".`);
    } else {
      await logActivity(`Claude scan completed. 0 new signals added (all matched existing).`);
    }

    return res.json({ success: true, count: addedSignals.length, added: addedSignals, addedSignals: addedSignals });

  } catch (err) {
    await logActivity(`Error in /api/intel: ${err.message}`);
    return res.status(500).json({ error: err.message || 'Internal proxy scanning failed.' });
  }
});

// 2. POST /api/chat
// Handles Executive Advisor, Researcher, and Analyst multi-agent chat requests. Injects RAG context.
app.post('/api/chat', async (req, res) => {
  const { message, agent, history = [], apiKey } = req.body;

  if (!message || !agent) {
    return res.status(400).json({ error: 'message and agent are required parameters.' });
  }

  await logActivity(`POST /api/chat hit. Agent: ${agent} | Message: "${message.substring(0, 60)}..."`);

  try {
    const db = await readDb();
    
    // Perform keyword RAG matching against signals in database
    const contextSignals = getRelevantRAGContext(message, db.signals);
    
    // Format RAG context block
    let ragContextString = "No relevant signals found in database.";
    if (contextSignals.length > 0) {
      ragContextString = contextSignals.map(s => {
        return `[Firm: ${s.firm} | Signal: ${s.signal} | Type: ${s.type} | Date: ${s.date} | Source: ${s.source} | Importance: ${s.importance}/5]
Title: ${s.title}
Takeaway: ${s.takeaway || 'N/A'}
Summary: ${s.summary}
${s.contextCorner ? `Context Corner:\n  Threat: ${s.contextCorner.threat}\n  Competitors: ${s.contextCorner.competitors}\n  Action: ${s.contextCorner.action}` : ''}`;
      }).join('\n\n');
    }

    // Set Personas
    let systemPrompt = "";
    if (agent === 'advisor') {
      systemPrompt = `You are the Lead Executive Advisor for FirmSignal. Your role is to provide strategic, high-level guidance to C-suite leaders. 
Synthesize the provided business intelligence into actionable advice, focusing heavily on competitive advantages, "so-what" business impact, and concrete quarterly moves. 
Speak with precision, authority, and deep strategic insight. Avoid generic statements. Use professional markdown formatting in your response.

RAG INTEL CONTEXT FROM LOCAL DATABASE:
=======================================
${ragContextString}
=======================================

Using the context above, address the user's query with executive focus. Include concrete "action points" and strategic justifications.`;
    } else if (agent === 'researcher') {
      systemPrompt = `You are the Head of Research for FirmSignal. Your role is to perform thorough factual synthesis, timelines, and comparisons. 
Utilize the provided context to present highly structured, evidence-backed answers with exact dates, names, figures, and sources.
Ensure absolute data fidelity and clear structured breakdowns. Avoid making up details; only use facts present in the context. Use markdown tables, timelines, or lists.

RAG INTEL CONTEXT FROM LOCAL DATABASE:
=======================================
${ragContextString}
=======================================

Using the context above, synthesize a deep fact-based response addressing the user's query.`;
    } else { // analyst
      systemPrompt = `You are the Senior Competitive Analyst for FirmSignal. Your role is to dissect competitive positioning, financial indicators, market share shifts, and risk profiles. 
Turn the raw intel into analytical models, identifying risk factors, defensive moats, and emerging market splits between consulting firms, tech partners, and AI labs.
Provide a highly analytical, objective, and risk-oriented critique. Use professional markdown.

RAG INTEL CONTEXT FROM LOCAL DATABASE:
=======================================
${ragContextString}
=======================================

Using the context above, perform a competitive analysis addressing the user's query.`;
    }

    // Invoke Anthropic or fallback if no key is provided
    let responseText = "";
    const apiKeyToUse = apiKey || process.env.ANTHROPIC_API_KEY;

    if (apiKeyToUse) {
      await logActivity(`Calling Anthropic API for agent: ${agent}`);
      
      // Construct Anthropic messages payload
      const messagesPayload = [];
      // Incorporate chat history if present
      for (const h of history) {
        if (h.role && h.content) {
          messagesPayload.push({ role: h.role, content: h.content });
        }
      }
      messagesPayload.push({ role: 'user', content: message });

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKeyToUse,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1500,
          system: systemPrompt,
          messages: messagesPayload
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        await logActivity(`Anthropic Chat API failed: ${response.status} - ${errorText}. Falling back to Smart In-Memory Persona response.`);
        responseText = generateFallbackResponse(agent, message, contextSignals);
      } else {
        const data = await response.json();
        responseText = data.content.filter(b => b.type === 'text').map(b => b.text).join('');
      }
    } else {
      await logActivity(`No API key configured for Chat. Utilizing local smart mock generator for agent: ${agent}`);
      responseText = generateFallbackResponse(agent, message, contextSignals);
    }

    // Persist chat log interaction in database
    const chatLogEntry = {
      id: `chat_${Date.now()}`,
      timestamp: new Date().toISOString(),
      agent,
      userMessage: message,
      agentResponse: responseText,
      signalsMatched: contextSignals.map(s => s.id)
    };
    db.chatLogs.push(chatLogEntry);
    await writeDb(db);

    await logActivity(`Chat interaction persisted. ID: ${chatLogEntry.id}`);

    return res.json({
      success: true,
      agent,
      response: responseText,
      reply: responseText,
      contextMatched: contextSignals.map(s => ({ id: s.id, firm: s.firm, title: s.title }))
    });

  } catch (err) {
    await logActivity(`Error in /api/chat: ${err.message}`);
    return res.status(500).json({ error: err.message || 'Internal chat agent execution failed.' });
  }
});

// 3. GET /api/kg
// Dynamically compiles and serves relationships between firms, signal types, key entities, and articles for the Knowledge Graph.
app.get('/api/kg', async (req, res) => {
  await logActivity('GET /api/kg hit. Compiling dynamic Knowledge Graph.');

  try {
    const db = await readDb();
    const nodes = [];
    const links = [];
    const addedNodeIds = new Set();

    // Static firm definitions mapping for coloring
    const firmMap = new Map();
    db.signals.forEach(s => {
      firmMap.set(s.firm, { type: s.type });
    });

    // 1. Core firms nodes
    for (const [firmId, details] of firmMap.entries()) {
      const nodeId = `firm_${firmId}`;
      nodes.push({
        id: nodeId,
        label: firmId,
        group: 'firm',
        type: details.type,
        color: details.type === 'tech' ? '#0070f2' : details.type === 'ai-first' ? '#10a37f' : '#f5a623'
      });
      addedNodeIds.add(nodeId);
    }

    // 2. Signal Types nodes
    const signalTypes = [...new Set(db.signals.map(s => s.signal))];
    signalTypes.forEach(st => {
      const nodeId = `type_${st}`;
      nodes.push({
        id: nodeId,
        label: st,
        group: 'signalType',
        color: '#b294d4'
      });
      addedNodeIds.add(nodeId);
    });

    // 3. Entity keywords for dynamic semantic tagging
    const targetKeywords = ['NVIDIA', 'Azure', 'OpenAI', 'Microsoft', 'Salesforce', 'Agentforce', 'Joule', 'Claude', 'Gemini', 'Copilot', 'Frontier Alliance', 'TPG', 'RBC', 'DeepSeek', 'Sovereign AI'];

    // 4. Compile signals into nodes and links
    db.signals.forEach((s) => {
      const artNodeId = `art_${s.id}`;
      
      // Add Article Node
      nodes.push({
        id: artNodeId,
        label: s.title.length > 55 ? `${s.title.substring(0, 52)}...` : s.title,
        group: 'article',
        importance: s.importance,
        date: s.date,
        takeaway: s.takeaway,
        color: s.importance >= 5 ? '#e07a6a' : s.importance >= 4 ? '#e0a06b' : '#aaaaaa'
      });
      addedNodeIds.add(artNodeId);

      // Links: Article -> Firm
      const firmNodeId = `firm_${s.firm}`;
      if (addedNodeIds.has(firmNodeId)) {
        links.push({
          source: artNodeId,
          target: firmNodeId,
          relation: 'ABOUT_FIRM',
          value: s.importance
        });
      }

      // Links: Article -> Signal Type
      const typeNodeId = `type_${s.signal}`;
      if (addedNodeIds.has(typeNodeId)) {
        links.push({
          source: artNodeId,
          target: typeNodeId,
          relation: 'HAS_SIGNAL',
          value: 2
        });
      }

      // 5. Dynamic Key Entity Extraction
      const fullText = `${s.title} ${s.summary} ${s.takeaway}`.toLowerCase();
      targetKeywords.forEach(kw => {
        if (fullText.includes(kw.toLowerCase())) {
          const entNodeId = `ent_${kw}`;
          if (!addedNodeIds.has(entNodeId)) {
            nodes.push({
              id: entNodeId,
              label: kw,
              group: 'entity',
              color: '#6cc4b3'
            });
            addedNodeIds.add(entNodeId);
          }
          // Link Article -> Entity
          links.push({
            source: artNodeId,
            target: entNodeId,
            relation: 'MENTIONS',
            value: 3
          });
        }
      });
    });

    await logActivity(`Compiled Knowledge Graph containing ${nodes.length} nodes and ${links.length} relationships.`);
    return res.json({ nodes, links });

  } catch (err) {
    await logActivity(`Error in /api/kg: ${err.message}`);
    return res.status(500).json({ error: err.message || 'Failed to compile Knowledge Graph.' });
  }
});

// 4. GET /api/articles
// Exposes stored news logs and tracks user-read states for context building.
app.get('/api/articles', async (req, res) => {
  await logActivity('GET /api/articles hit.');

  try {
    const db = await readDb();
    
    // Map articles alongside read status
    const articles = db.signals.map(s => ({
      id: s.id,
      firm: s.firm,
      type: s.type,
      signal: s.signal,
      importance: s.importance,
      title: s.title,
      takeaway: s.takeaway,
      summary: s.summary,
      date: s.date,
      source: s.source,
      url: s.url,
      contextCorner: s.contextCorner || null,
      read: !!db.readArticles[s.id]
    }));

    return res.json(articles);
  } catch (err) {
    await logActivity(`Error in GET /api/articles: ${err.message}`);
    return res.status(500).json({ error: err.message || 'Failed to fetch articles.' });
  }
});

// POST /api/articles/read
// Tracks user-read states for context building.
app.post('/api/articles/read', async (req, res) => {
  const { id, read = true } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Article ID is required.' });
  }

  await logActivity(`POST /api/articles/read hit. ID: ${id} | Read State: ${read}`);

  try {
    const db = await readDb();
    
    if (!db.readArticles) {
      db.readArticles = {};
    }

    db.readArticles[id] = !!read;
    await writeDb(db);

    return res.json({ success: true, id, read: db.readArticles[id] });
  } catch (err) {
    await logActivity(`Error in POST /api/articles/read: ${err.message}`);
    return res.status(500).json({ error: err.message || 'Failed to persist read state.' });
  }
});

// 5. POST /api/db/reset
// Database rollbacks to default demo signals.
app.post('/api/db/reset', async (req, res) => {
  await logActivity('POST /api/db/reset hit. Restoring database to factory default demo signals.');

  try {
    const defaultDb = {
      signals: DEFAULT_DEMO_SIGNALS,
      chatLogs: [],
      readArticles: {},
      graphCoordinates: {}
    };

    await writeDb(defaultDb);
    await logActivity('Database successfully rollback to factory defaults.');
    return res.json({ success: true, message: 'Database rolled back to default demo signals.' });
  } catch (err) {
    await logActivity(`Error in /api/db/reset: ${err.message}`);
    return res.status(500).json({ error: err.message || 'Failed to reset database.' });
  }
});

// GET /api/db/export
// Provides pipeline database backup downloads.
app.get('/api/db/export', async (req, res) => {
  await logActivity('GET /api/db/export hit. Exporting database.');

  try {
    const db = await readDb();
    res.setHeader('Content-Disposition', 'attachment; filename="firmsignal_db_export.json"');
    res.setHeader('Content-Type', 'application/json');
    return res.send(JSON.stringify(db, null, 2));
  } catch (err) {
    await logActivity(`Error in /api/db/export: ${err.message}`);
    return res.status(500).json({ error: err.message || 'Failed to export database.' });
  }
});

// Activity logging viewer endpoint (Value-added for C-suite inspection)
app.get('/api/pipeline', async (req, res) => {
  try {
    const logData = await fs.readFile(LOG_FILE, 'utf8');
    const logs = logData.trim().split('\n').filter(Boolean).slice(-100); // last 100 entries
    return res.json({ logs });
  } catch (err) {
    return res.json({ logs: ['No logs registered yet.'] });
  }
});

// Serve frontend default page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'FirmSignal.html'));
});

app.get('/FirmSignal.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'FirmSignal.html'));
});

// Catch-all route to serve the main HTML file
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'dist', 'FirmSignal.html'));
});

app.listen(PORT, async () => {
  await logActivity(`FirmSignal Backend running on port ${PORT}`);
  console.log(`Server accessible at http://localhost:${PORT}`);
});
