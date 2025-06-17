// 0428d00fd6aa41ca9f25b366f402881b
import React, { useState, useEffect } from "react";
import { BlogCard } from "../components/BlogCard";
import { fetchNewsArticles, fetchNewsByCategory } from "../utils/apiService";

export function BlogSection() {
  const [articles, setArticles] = useState([]); // Initially empty
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");

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
    }
  };

  const handleRefresh = () => {
    if (selectedCategory) {
      fetchArticles();
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 mb-36">
      <div className="flex items-center justify-between py-2">
        <h1 className="text-2xl font-bold">Latest News</h1>
        <div className="flex items-center space-x-4">
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Select Category</option>
            <option value="business">Business</option>
            <option value="entertainment">Entertainment</option>
            <option value="general">General</option>
            <option value="health">Health</option>
            <option value="science">Science</option>
            <option value="sports">Sports</option>
            <option value="technology">Technology</option>
          </select>
          <button
            onClick={handleRefresh}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Refresh
          </button>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        </div>
      ) : articles.length === 0 && !selectedCategory ? (
        <div className="text-center text-gray-500">No News To Fetch</div>
      ) : articles.length === 0 ? (
        <div className="text-center text-gray-500">No News to Show</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <BlogCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}