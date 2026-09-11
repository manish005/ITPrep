import { ForexNewsArticle } from "./types";

const FIRECRAWL_API = "https://api.firecrawl.dev/v1";

export async function fetchNewsFromSources(): Promise<ForexNewsArticle[]> {
  const sources = [
    { name: "Forex Factory", url: "https://www.forexfactory.com/calendar/" },
    { name: "DailyFX", url: "https://www.dailyfx.com/news" },
    { name: "Investing.com Forex", url: "https://www.investing.com/forex-news" },
  ];

  const results = await Promise.allSettled(
    sources.map((src) => scrapeSource(src.name, src.url))
  );

  const articles: ForexNewsArticle[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      articles.push(...result.value);
    }
  }
  return articles;
}

async function scrapeSource(name: string, url: string): Promise<ForexNewsArticle[]> {
  const response = await fetch(`${FIRECRAWL_API}/scrape`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
    },
    body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
  });

  if (!response.ok) {
    throw new Error(`Firecrawl scrape failed for ${name}: ${response.status}`);
  }

  const data = await response.json();
  return parseArticles(data.markdown || "", name);
}

function parseArticles(markdown: string, source: string): ForexNewsArticle[] {
  const articles: ForexNewsArticle[] = [];
  let currentArticle: Partial<ForexNewsArticle> | null = null;
  const lines = markdown.split("\n");

  for (const line of lines) {
    if (line.startsWith("#") || line.startsWith("##")) {
      if (currentArticle && currentArticle.title && currentArticle.publishedAt) {
        currentArticle.source = source;
        currentArticle.relevanceScore = calculateRelevance(currentArticle as ForexNewsArticle);
        if (currentArticle.relevantPairs && currentArticle.relevantPairs.length > 0) {
          articles.push(currentArticle as ForexNewsArticle);
        }
      }
      currentArticle = { title: line.replace(/^#+\s*/, ""), content: "" };
    } else if (currentArticle) {
      currentArticle.content += line + "\n";
      if (line.match(/\d{4}-\d{2}-\d{2}/)) {
        currentArticle.publishedAt = line.match(/\d{4}-\d{2}-\d{2}/)?.[0] || new Date().toISOString();
      }
    }
  }

  if (currentArticle && currentArticle.title && currentArticle.publishedAt) {
    currentArticle.source = source;
    currentArticle.relevanceScore = calculateRelevance(currentArticle as ForexNewsArticle);
    if (currentArticle.relevantPairs && currentArticle.relevantPairs.length > 0) {
      articles.push(currentArticle as ForexNewsArticle);
    }
  }

  return articles;
}

function calculateRelevance(article: ForexNewsArticle): number {
  const content = (article.title + " " + article.content).toUpperCase();
  let score = 0;
  const pairNames = ["XAUUSD", "BTCUSD", "EURUSD", "GBPJPY", "GBPUSD", "USDJPY"];
  pairNames.forEach((pair) => {
    if (content.includes(pair)) {
      score += 2;
      if (article.relevantPairs) article.relevantPairs.push(pair);
    }
  });
  return Math.min(score, 5);
}