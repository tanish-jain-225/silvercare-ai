// 0428d00fd6aa41ca9f25b366f402881b
import React, { useState, useEffect, useRef } from "react";
import { BlogCard } from "../components/BlogCard";
import { fetchNewsByText } from "../utils/apiService";
import { motion } from "framer-motion";

export function BlogSection() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const featuredIntervalRef = useRef(null);

  const fallbackArticles = [
    {
      id: 1,
      title: "Fallback Article 1",
      description: "This is a dummy description for fallback article 1.",
      url: "#",
      urlToImage: "/logo.png",
      publishedAt: new Date().toISOString(),
    },
    {
      id: 2,
      title: "Fallback Article 2",
      description: "This is a dummy description for fallback article 2.",
      url: "#",
      urlToImage: "/logo.png",
      publishedAt: new Date().toISOString(),
    },
  ];

  // Only text search, no category logic
  const fetchArticles = async (text) => {
    try {
      setLoading(true);
      setError(null);
      const articles = await fetchNewsByText(text || "latest news");
      const filteredArticles = articles.filter(
        (article) => article.urlToImage && article.description
      );
      const sortedArticles = filteredArticles.sort(
        (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
      );
      setFeaturedArticles(sortedArticles.slice(0, 3));
      setArticles(sortedArticles.length > 0 ? sortedArticles : fallbackArticles);
    } catch (error) {
      console.error("Error fetching articles:", error);
      setError("Failed to load news articles. Please try again later.");
      setArticles(fallbackArticles);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchArticles(searchText);
  };

  useEffect(() => {
    fetchArticles(""); // Initial load with latest news
  }, []);

  // Auto-rotate featured articles
  useEffect(() => {
    if (featuredArticles.length > 1) {
      featuredIntervalRef.current = setInterval(() => {
        setCurrentFeaturedIndex((prev) =>
          prev === featuredArticles.length - 1 ? 0 : prev + 1
        );
      }, 5000);
    }

    return () => {
      if (featuredIntervalRef.current) {
        clearInterval(featuredIntervalRef.current);
      }
    };
  }, [featuredArticles]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen w-full mb-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Search Bar */}
      <div className="w-full p-4 flex flex-col items-center bg-gray-50 dark:bg-gray-900/80 shadow-sm">
        <form onSubmit={handleSearch} className="flex w-full gap-2 flex-col sm:flex-row items-center">
          <input
            type="text"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="Search news articles..."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:bg-gray-800 dark:text-white text-lg shadow-sm"
          />
          <button
            type="submit"
            className="w-full sm:w-auto mt-2 sm:mt-0 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-colors text-lg shadow-md"
            disabled={loading}
          >
            Search
          </button>
        </form>
        {error && <div className="text-red-500 mt-2 text-base">{error}</div>}
      </div>

      {/* Hero Section with Featured Posts */}
      {featuredArticles.length > 0 && (
        <section className="relative w-full h-[200px] xs:h-[240px] sm:h-[300px] md:h-[350px] lg:h-[420px] overflow-hidden shadow-xl mx-0 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          {featuredArticles.map((article, index) => (
            <motion.div
              key={article.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${index === currentFeaturedIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: index === currentFeaturedIndex ? 1 : 0 }}
              transition={{ duration: 1 }}
            >
              <div className="relative w-full h-full flex flex-col justify-end">
                <img
                  src={article.urlToImage}
                  alt="Featured Article"
                  className="w-full h-full object-cover object-center absolute inset-0 brightness-95 dark:brightness-75"
                  style={{ zIndex: 0 }}
                />
                <div className="relative z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 xs:p-4 sm:p-8 md:p-12 flex flex-col gap-2 sm:gap-4 max-w-full">
                  <h2 className="text-base xs:text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 max-w-full sm:max-w-2xl md:max-w-3xl line-clamp-2 drop-shadow-xl">
                    {article.title}
                  </h2>
                  <p className="text-gray-200 text-xs xs:text-sm sm:text-base md:text-lg mb-4 max-w-full sm:max-w-xl md:max-w-2xl line-clamp-3">
                    {article.description}
                  </p>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-fit bg-white/90 text-gray-900 px-3 py-2 sm:px-6 sm:py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors duration-300 text-xs sm:text-base shadow"
                  >
                    Read Full Story
                  </a>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Featured Post Indicators */}
          <div className="absolute bottom-2 sm:bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
            {featuredArticles.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentFeaturedIndex(index)}
                className={`w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 border border-white ${index === currentFeaturedIndex
                  ? "bg-white scale-125 shadow"
                  : "bg-white/50 hover:bg-white/80"
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* Main Content */}
      <div className="w-full max-w-8xl mx-auto p-4 flex-1">
        {/* Divider with decorative element */}
        <div className="relative mt-6 mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-base">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Latest Articles
            </span>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center text-gray-500 pb-20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xl">No News to Show</p>
            <p className="text-sm mt-2">Try searching for something else</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {articles.map((article, index) => (
              <motion.div key={article.id} variants={itemVariants}>
                <BlogCard article={article} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}