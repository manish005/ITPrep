import useSWR from "swr";
import { ForexNewsArticle } from "@/lib/types";

interface NewsResponse {
  articles: ForexNewsArticle[];
  timestamp: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useNews() {
  const { data, error, isLoading } = useSWR<NewsResponse>("/api/news", fetcher, { refreshInterval: 60000, revalidateOnFocus: false });
  return { articles: data?.articles || [], timestamp: data?.timestamp || null, isLoading, error: error ? error.message : null };
}