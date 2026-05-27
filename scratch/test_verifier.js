import fs from 'fs';
import path from 'path';

// Load functions from server.js
// Since server.js is a ES module (type: module), we can import it or read it and eval it.
// Let's just copy the relevant parts of verifyArticle and parseSignalLocally here for direct analysis!

const firmsList = JSON.parse(fs.readFileSync('db/db.json', 'utf8')).firms;

async function fetchGoogleNewsRSS(query) {
  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    if (!response.ok) return [];
    const xml = await response.text();
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const content = match[1];
      const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = content.match(/<link>([\s\S]*?)<\/link>/);
      const dateMatch = content.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const sourceMatch = content.match(/<source[^>]*>([\s\S]*?)<\/source>/);
      
      if (titleMatch && linkMatch) {
        let title = titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim();
        const link = linkMatch[1].trim();
        const pubDate = dateMatch ? new Date(dateMatch[1]).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
        let source = sourceMatch ? sourceMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim() : 'News';
        if (title.endsWith(` - ${source}`)) {
          title = title.substring(0, title.length - (source.length + 3)).trim();
        }
        items.push({ title, link, date: pubDate, source });
      }
    }
    return items;
  } catch (err) {
    return [];
  }
}

function parseSignalLocally(article, firmsList) {
  const title = article.title;
  const source = article.source;
  const date = article.date;
  const url = article.link;
  
  let matchedFirm = null;
  const lowerTitle = title.toLowerCase();
  for (const firm of firmsList) {
    if (lowerTitle.includes(firm.id.toLowerCase())) {
      matchedFirm = firm;
      break;
    }
  }
  if (!matchedFirm) {
    for (const firm of firmsList) {
      if (url.toLowerCase().includes(firm.id.toLowerCase())) {
        matchedFirm = firm;
        break;
      }
    }
  }
  
  if (!matchedFirm) {
    return null;
  }
  const finalFirm = matchedFirm;
  
  return {
    id: `sig_rss_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    firm: finalFirm.id,
    type: finalFirm.type || 'consulting',
    signal: 'AI Pivot',
    importance: 3,
    title,
    takeaway: 'Strategic pivot',
    summary: 'Local summary',
    date,
    source,
    url
  };
}

async function verifyArticle(article, firmsList) {
  const title = article.title || '';
  const urlStr = article.link || article.url || '';
  const dateStr = article.date || '';
  
  if (!title || title.length < 12) {
    return { verified: false, reason: 'Title is too short or empty (scraping noise).' };
  }
  
  const noisePattern = /(404|403|page not found|forbidden|cookie consent|subscribe to read|paywall|sign in|access denied|error)/i;
  if (noisePattern.test(title)) {
    return { verified: false, reason: 'Title matches error/paywall signature.' };
  }
  
  if (!dateStr) {
    return { verified: false, reason: 'Publication date is missing.' };
  }
  try {
    const pubDate = new Date(dateStr + 'T00:00:00');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const articleDate = new Date(pubDate.getFullYear(), pubDate.getMonth(), pubDate.getDate());
    
    const diffTime = today - articleDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { verified: false, reason: `Article date is in the future (${dateStr}).` };
    }
    if (diffDays > 7) {
      return { verified: false, reason: `Article is older than 7 days (${diffDays} days old).` };
    }
  } catch (err) {
    return { verified: false, reason: `Invalid date format (${dateStr}).` };
  }
  
  let matchedFirm = null;
  const lowerTitle = title.toLowerCase();
  for (const firm of firmsList) {
    if (lowerTitle.includes(firm.id.toLowerCase())) {
      matchedFirm = firm;
      break;
    }
  }
  if (!matchedFirm && urlStr) {
    const lowerUrl = urlStr.toLowerCase();
    for (const firm of firmsList) {
      if (lowerUrl.includes(firm.id.toLowerCase())) {
        matchedFirm = firm;
        break;
      }
    }
  }
  if (!matchedFirm) {
    return { verified: false, reason: 'No tracked competitor firm matched.' };
  }
  
  if (!urlStr || (!urlStr.startsWith('http://') && !urlStr.startsWith('https://'))) {
    return { verified: false, reason: 'URL protocol is missing or invalid.' };
  }
  
  try {
    const parsedUrl = new URL(urlStr);
    if (!parsedUrl.hostname || !parsedUrl.hostname.includes('.')) {
      return { verified: false, reason: 'URL has an invalid hostname.' };
    }
    
    if (!urlStr.startsWith('https://')) {
      return { verified: false, reason: 'URL does not utilize a secure HTTPS channel.' };
    }
    
    // Link Checking: Make a fast HEAD request to check reachability
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const headResponse = await fetch(urlStr, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': '*/*'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (headResponse.status === 404 || headResponse.status === 410) {
        return { verified: false, reason: `Publisher page returned ${headResponse.status} (Not Found).` };
      }
    } catch (fetchErr) {
      // Timeout/refusal ignored
    }
    
  } catch (urlErr) {
    return { verified: false, reason: `URL parsing failed: ${urlErr.message}` };
  }
  
  return { verified: true, matchedFirm: matchedFirm.id };
}

async function test() {
  const query = 'OpenAI strategic news this week 2026-05-27 site:reuters.com OR site:ft.com OR site:bloomberg.com';
  console.log(`Fetching RSS for: ${query}`);
  const articles = await fetchGoogleNewsRSS(query);
  console.log(`Found ${articles.length} articles.`);
  
  for (const art of articles) {
    const parsed = parseSignalLocally(art, firmsList);
    if (!parsed) {
      console.log(`[-] Parsed null for: "${art.title}" (failed initial local match)`);
      continue;
    }
    const ver = await verifyArticle(parsed, firmsList);
    console.log(`[${ver.verified ? '✓' : '✗'}] "${art.title}" -> Verified: ${ver.verified}. Reason: ${ver.reason || 'OK'}. Matched Firm: ${ver.matchedFirm || 'None'}`);
  }
}

test();
