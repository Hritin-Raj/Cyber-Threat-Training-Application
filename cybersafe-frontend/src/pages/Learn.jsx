import { useState, useEffect } from "react";
import { newsAPI } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { ExternalLink, RefreshCw, Filter, BookOpen, Clock, Globe } from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "All", icon: "📰" },
  { id: "phishing", label: "Phishing", icon: "🎣" },
  { id: "malware", label: "Malware", icon: "🦠" },
  { id: "privacy", label: "Privacy", icon: "👁️" },
  { id: "network", label: "Network", icon: "🌐" },
  { id: "general", label: "General", icon: "📡" },
];

const CATEGORY_COLORS = {
  phishing: "bg-red-400/10 text-red-400 border-red-400/20",
  malware: "bg-orange-400/10 text-orange-400 border-orange-400/20",
  privacy: "bg-green-400/10 text-green-400 border-green-400/20",
  network: "bg-cyan-400/10 text-cyan-400 border-cyan-400/20",
  general: "bg-blue-400/10 text-blue-400 border-blue-400/20",
};

function ArticleCard({ article }) {
  const catColor = CATEGORY_COLORS[article.category] || CATEGORY_COLORS.general;
  const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-5 transition-all duration-200 group hover:shadow-lg hover:shadow-black/20"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${catColor}`}>
            {CATEGORIES.find((c) => c.id === article.category)?.icon} {article.category}
          </span>
          <span className="text-gray-600 text-xs flex items-center gap-1">
            <Globe className="w-3 h-3" /> {article.source}
          </span>
        </div>
        <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors flex-shrink-0 mt-0.5" />
      </div>

      <h3 className="text-white font-semibold text-sm leading-snug mb-2 group-hover:text-cyan-300 transition-colors">
        {article.title}
      </h3>

      {article.summary && (
        <p className="text-gray-400 text-xs leading-relaxed line-clamp-3 mb-3">
          {article.summary}
        </p>
      )}

      <div className="flex items-center gap-1 text-xs text-gray-600">
        <Clock className="w-3 h-3" />
        {timeAgo(article.publishedAt)}
      </div>
    </a>
  );
}

export default function Learn() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");

  const fetchArticles = async (cat = categoryFilter, pg = 1, reset = false) => {
    try {
      const params = { page: pg, limit: 12 };
      if (cat !== "all") params.category = cat;

      const { data } = await newsAPI.getNews(params);
      if (reset || pg === 1) {
        setArticles(data.articles || []);
      } else {
        setArticles((prev) => [...prev, ...(data.articles || [])]);
      }
      setTotalPages(data.pages || 1);
      setError("");
    } catch (err) {
      setError("Failed to load news. Showing cached content.");
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchArticles(categoryFilter, 1, true);
      setLoading(false);
    };
    load();
    setPage(1);
  }, [categoryFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchArticles(categoryFilter, 1, true);
    setPage(1);
    setRefreshing(false);
  };

  const loadMore = async () => {
    const nextPage = page + 1;
    await fetchArticles(categoryFilter, nextPage, false);
    setPage(nextPage);
  };

  if (loading) return <LoadingSpinner message="Loading cybersecurity news..." />;

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white mb-1">
              Threat <span className="text-cyan-400">Intelligence</span> Feed
            </h1>
            <p className="text-gray-400">
              Live cybersecurity news and articles from top researchers worldwide
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white px-4 py-2 rounded-xl transition-colors text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                categoryFilter === cat.id
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-700 hover:text-white"
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl p-4 mb-6 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Featured Article */}
        {articles.length > 0 && (
          <div className="mb-8">
            <div className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-2xl p-8 transition-all duration-200 group">
              <a href={articles[0].url} target="_blank" rel="noopener noreferrer">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs px-3 py-1 rounded-full font-medium">
                    📰 Featured
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[articles[0].category] || CATEGORY_COLORS.general}`}>
                    {articles[0].category}
                  </span>
                </div>
                <h2 className="text-white text-2xl font-bold mb-3 group-hover:text-cyan-300 transition-colors leading-snug">
                  {articles[0].title}
                </h2>
                {articles[0].summary && (
                  <p className="text-gray-400 text-base leading-relaxed mb-4 line-clamp-3">
                    {articles[0].summary}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> {articles[0].source}</span>
                  <span className="text-cyan-400 font-medium flex items-center gap-1">
                    Read article <ExternalLink className="w-4 h-4" />
                  </span>
                </div>
              </a>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.slice(1).map((article, i) => (
            <ArticleCard key={`${article.id}-${i}`} article={article} />
          ))}
        </div>

        {articles.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No articles found for this category</p>
          </div>
        )}

        {/* Load More */}
        {page < totalPages && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              className="bg-gray-900 border border-gray-800 hover:border-gray-600 text-gray-300 hover:text-white font-medium px-8 py-3 rounded-xl transition-colors"
            >
              Load More Articles
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
