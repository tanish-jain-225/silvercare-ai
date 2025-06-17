// 0428d00fd6aa41ca9f25b366f402881b
import React, { useState, useEffect, useRef } from "react";
import { BlogCard } from "../components/BlogCard";
import { fetchNewsArticles, fetchNewsByCategory } from "../utils/apiService";
import { motion } from "framer-motion";

export function BlogSection() {
  const [articles, setArticles] = useState([]); // Initially empty
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
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

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const articles = await fetchNewsByCategory(selectedCategory); // Fetch by selected category

      const filteredArticles = articles.filter(
        (article) => article.urlToImage && article.description // Ensure both image and description are present
      );
      const sortedArticles = filteredArticles.sort(
        (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
      ); // Sort articles by recent to oldest

      // Set featured articles (first 3)
      setFeaturedArticles(sortedArticles.slice(0, 3));
      setArticles(sortedArticles);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching articles:", error);
      setError("Failed to load news articles. Please try again later.");
      setLoading(false);
    }
  };

  const handleCategoryChange = async (category) => {
    setSelectedCategory(category);
    if (category) {
      try {
        setLoading(true);
        const articles = await fetchNewsByCategory(category);

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
        setArticles(fallbackArticles); // Use fallback articles on error
      } finally {
        setLoading(false);
      }
    } else {
      setArticles([]);
      setFeaturedArticles([]);
    }
  };

  const handleRefresh = () => {
    if (selectedCategory) {
      fetchArticles();
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    // In a real app, you would send this to your backend
    console.log("Subscribing email:", email);
    setIsSubscribed(true);
    setEmail("");
    // Reset subscription status after 3 seconds
    setTimeout(() => setIsSubscribed(false), 3000);
  };

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
    <div className="min-h-screen mb-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section with Featured Posts */}
      {featuredArticles.length > 0 && (
        <section className="relative h-[500px] overflow-hidden">
          {featuredArticles.map((article, index) => (
            <motion.div
              key={article.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${index === currentFeaturedIndex ? "opacity-100" : "opacity-0"
                }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: index === currentFeaturedIndex ? 1 : 0 }}
              transition={{ duration: 1 }}
            >
              <div className="relative w-full h-full">
                <img
                  src={article.urlToImage}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
                  <div className="container mx-auto px-4 py-12">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <span className="inline-block px-3 py-1 bg-blue-500 text-white text-sm rounded-full mb-4">
                        {selectedCategory || "Featured"}
                      </span>
                      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 max-w-3xl">
                        {article.title}
                      </h2>
                      <p className="text-gray-200 text-lg mb-6 max-w-2xl line-clamp-2">
                        {article.description}
                      </p>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-300"
                      >
                        Read Full Story
                      </a>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Featured Post Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {featuredArticles.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentFeaturedIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentFeaturedIndex
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/80"
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Header with Category Filter */}
        <motion.div
          className="relative py-10 mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-30"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Title Section */}
              <div className="text-center lg:text-left">
                <motion.h1
                  className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  Latest News
                </motion.h1>
                <motion.p
                  className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Stay informed with the most recent updates and stories from around the world
                </motion.p>
              </div>

              {/* Category Filter Section */}
              <motion.div
                className="flex flex-col sm:flex-row items-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {/* Category Pills */}
                <div className="flex flex-wrap justify-center gap-2 mb-4 sm:mb-0">
                  {["Business", "Entertainment", "Health", "Science", "Sports", "Technology"].map((category) => (
                    <motion.button
                      key={category}
                      onClick={() => handleCategoryChange(category.toLowerCase() === "all" ? "" : category.toLowerCase())}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${selectedCategory === (category.toLowerCase() === "all" ? "" : category.toLowerCase())
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                        }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {category}
                    </motion.button>
                  ))}
                </div>

                {/* Refresh Button */}
                <motion.button
                  onClick={handleRefresh}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-md shadow-blue-500/20 transition-all duration-200"
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh</span>
                </motion.button>
              </motion.div>
            </div>

            {/* Divider with decorative element */}
            <div className="relative mt-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  Latest Articles
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Articles Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
          </div>
        ) : articles.length === 0 && !selectedCategory ? (
          <motion.div
            className="text-center text-gray-500 pb-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <p className="text-xl">No News To Fetch</p>
            <p className="text-sm mt-2">Select a category to see the latest news</p>
          </motion.div>
        ) : articles.length === 0 ? (
          <motion.div
            className="text-center text-gray-500 pb-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xl">No News to Show</p>
            <p className="text-sm mt-2">Try selecting a different category</p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
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