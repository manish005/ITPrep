import { AIInsight, ResearchReport, ForexNewsArticle } from "./types";

const OPENROUTER_API = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "inclusionai/ling-3.0-flash-fin-free";

interface OpenRouterMessage {
  role: "system" | "user";
  content: string;
}

export async function analyzeNewsForPair(pair: string, articles: ForexNewsArticle[]): Promise<AIInsight> {
  const systemPrompt = `You are a forex market analyst specializing in the pairs: XAUUSD, BTCUSD, EURUSD, GBPJPY, GBPUSD, USDJPY. Analyze the provided news articles and produce structured insights. Respond in JSON format with fields: summary, impactScore (1-5), keyDrivers (array of strings), tradingImplications.`;

  const articlesText = articles.map((a, i) => `[Article ${i + 1}: ${a.title}]\nSource: ${a.source}\nContent: ${a.content}\n`).join("\n");
  const userPrompt = `Analyze news impact on ${pair}.\n\nArticles:\n${articlesText}\n\nProvide structured JSON analysis.`;

  const response = await fetch(OPENROUTER_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Forex Research Dashboard",
    },
    body: JSON.stringify({ model: MODEL, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }], max_tokens: 2000, temperature: 0.7 }),
  });

  if (!response.ok) throw new Error(`OpenRouter API error: ${response.status}`);
  const data = await response.json();
  return parseAIResponse(data.choices[0].message.content, pair);
}

function parseAIResponse(content: string, pair: string): AIInsight {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    const parsed = JSON.parse(jsonMatch[0]);
    return { pair, summary: parsed.summary || "No summary", impactScore: parsed.impactScore || 3, keyDrivers: parsed.keyDrivers || [], tradingImplications: parsed.tradingImplications || "No implications", analyzedAt: new Date().toISOString() };
  } catch {
    return { pair, summary: content.substring(0, 500), impactScore: 3, keyDrivers: [], tradingImplications: "Could not parse", analyzedAt: new Date().toISOString() };
  }
}

export async function generateResearchReport(pair: string, articles: ForexNewsArticle[], insight: AIInsight): Promise<ResearchReport> {
  const systemPrompt = `You are a senior forex research analyst. Generate a comprehensive research report in JSON format with fields: overview, keyEvents (array), marketImpact, outlook.`;
  const userPrompt = `Generate a research report for ${pair}.\n\nExisting AI Insight:\n${JSON.stringify(insight, null, 2)}\n\nNews Articles:\n${articles.map((a, i) => `[${i + 1}] ${a.title}\n${a.content}`).join("\n")}`;

  const response = await fetch(OPENROUTER_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, "HTTP-Referer": "http://localhost:3000", "X-Title": "Forex Research Dashboard" },
    body: JSON.stringify({ model: MODEL, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }], max_tokens: 4000, temperature: 0.5 }),
  });

  if (!response.ok) throw new Error(`OpenRouter report failed: ${response.status}`);
  const data = await response.json();
  return parseReportResponse(data.choices[0].message.content, pair);
}

function parseReportResponse(content: string, pair: string): ResearchReport {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    const parsed = JSON.parse(jsonMatch[0]);
    return { pair, overview: parsed.overview || "No overview", keyEvents: parsed.keyEvents || [], marketImpact: parsed.marketImpact || "No impact", outlook: parsed.outlook || "No outlook", generatedAt: new Date().toISOString() };
  } catch {
    return { pair, overview: content.substring(0, 500), keyEvents: [], marketImpact: "Could not parse", outlook: "Could not parse", generatedAt: new Date().toISOString() };
  }
}