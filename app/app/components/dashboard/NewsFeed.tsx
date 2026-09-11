import { ForexNewsArticle } from "@/lib/types";

interface NewsFeedProps {
  articles: ForexNewsArticle[];
}

export function NewsFeed({ articles }: NewsFeedProps) {
  if (articles.length === 0) {
    return <div className="text-gray-400 text-sm">No news articles found for this pair.</div>;
  }

  return (
    <div className="space-y-3">
      {articles.map((article) => (
        <div key={article.id} className="border rounded-lg p-4 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{article.source}</span>
            <span className="text-xs text-gray-400">{new Date(article.publishedAt).toLocaleString()}</span>
          </div>
          <h3 className="font-semibold text-sm mb-1">{article.title}</h3>
          <p className="text-xs text-gray-600 line-clamp-3">{article.content}</p>
          <div className="mt-2">
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Relevance: {article.relevanceScore}/5</span>
          </div>
        </div>
      ))}
    </div>
  );
}