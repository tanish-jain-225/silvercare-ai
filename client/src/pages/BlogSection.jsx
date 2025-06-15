import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useVoice } from '../hooks/useVoice';

export function BlogSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { speak } = useVoice();
  
  // State for fetched news articles
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('Technology'); // Default search topic
  useEffect(() => {
    // Only fetch on initial load or explicit search, not on every searchQuery change
    fetchNews(searchQuery);
  }, []); // Remove searchQuery dependency to prevent auto-refresh

  const fetchNews = (query) => {
    setLoading(true);
    setError(null);
    
    // Get date for 30 days ago to ensure we get results
    const date = new Date();
    date.setDate(date.getDate() - 30);
    const fromDate = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    // NewsAPI URL with your API key - using top-headlines for better results
    const url = `https://newsapi.org/v2/top-headlines?country=us&category=technology&apiKey=26c468af4a634a9cb60cc69f457a1f41`;
    
    console.log("Fetching news from:", url);
    
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("NewsAPI response:", data);
        if (data.status === 'ok') {
          if (data.articles && data.articles.length > 0) {
            setArticles(data.articles);
          } else {
            // Fallback to everything endpoint if no headlines
            return fetch(`https://newsapi.org/v2/everything?q=${query}&from=${fromDate}&sortBy=popularity&apiKey=26c468af4a634a9cb60cc69f457a1f41`)
              .then(response => response.json());
          }
        } else {
          throw new Error(data.message || 'Failed to fetch news');
        }
      })
      .then(data => {
        // Handle the fallback data if it exists
        if (data && data.status === 'ok') {
          setArticles(data.articles);
        }
      })
      .catch(err => {
        console.error('Error fetching news:', err);
        setError(err.message);
        
        // Provide sample data as fallback when API fails
        setArticles([
          {
            source: { id: null, name: "TechCrunch" },
            author: "John Smith",
            title: "Latest Advances in AI Technology for 2025",
            description: "Exploring the cutting-edge developments in artificial intelligence that are shaping our future in unexpected ways.",
            url: "https://techcrunch.com/example",
            urlToImage: "https://via.placeholder.com/800x400?text=AI+Technology",
            publishedAt: "2025-06-15T08:40:00Z",
            content: "AI continues to evolve at an unprecedented pace..."
          },
          {
            source: { id: null, name: "The Verge" },
            author: "Sarah Johnson",
            title: "New Quantum Computing Breakthrough Promises Faster Processing",
            description: "Scientists have achieved a major milestone in quantum computing that could revolutionize data processing.",
            url: "https://theverge.com/example",
            urlToImage: "https://via.placeholder.com/800x400?text=Quantum+Computing",
            publishedAt: "2025-06-14T15:30:00Z",
            content: "Quantum computing reaches new heights with..."
          },
          {
            source: { id: null, name: "Wired" },
            author: "Michael Brown",
            title: "The Future of Augmented Reality Wearables",
            description: "How AR glasses are becoming mainstream and changing how we interact with the digital world.",
            url: "https://wired.com/example",
            urlToImage: "https://via.placeholder.com/800x400?text=AR+Wearables",
            publishedAt: "2025-06-13T12:15:00Z",
            content: "Augmented reality is no longer science fiction..."
          }
        ]);
      })
      .finally(() => setLoading(false));
  };
  // Handle search topic change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchNews(searchQuery);
  };
  
  // Handle category selection
  const handleCategoryClick = (category) => {
    setSearchQuery(category);
    fetchNews(category);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <h1 className="text-2xl font-bold text-center text-gray-800">News Explorer</h1>
      </div>      {/* Search Bar */}
      <div className="bg-white shadow-sm p-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search news topics..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button 
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
            Search
          </Button>
        </form>
        
        {/* Category Quick Select */}
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {['Technology', 'Business', 'Health', 'Science', 'Sports', 'Entertainment'].map(category => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`px-3 py-1 rounded-full text-sm ${
                searchQuery === category 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* News Articles Grid */}
      <div className="container mx-auto px-4 py-8 flex-1">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Latest {searchQuery} News
        </h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center p-4 bg-red-100 text-red-700 rounded-md">
            <p>{error}</p>
            <p className="text-sm mt-2">Note: NewsAPI may not work in production environments due to CORS restrictions. You might need a backend proxy.</p>
          </div>
        ) : articles.length === 0 ? (
          <p className="text-center text-gray-500">No articles found. Try a different search term.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <Card key={index} className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col">
                {article.urlToImage ? (
                  <img
                    src={article.urlToImage}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                    onError={e => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                    No Image Available
                  </div>
                )}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
                  <div className="text-sm text-gray-500 mb-2">
                    {article.source.name} • {new Date(article.publishedAt).toLocaleDateString()}
                  </div>
                  <p className="text-gray-600 text-sm mb-4 flex-1">
                    {article.description ? `${article.description.slice(0, 120)}...` : 'No description available.'}
                  </p>
                  <Button
                    onClick={() => window.open(article.url, '_blank', 'noopener,noreferrer')}
                    className="mt-auto bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Read More
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer with API attribution */}
      <div className="bg-white py-4 text-center text-sm text-gray-600">
        <p>Powered by <a href="https://newsapi.org/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">NewsAPI.org</a></p>
      </div>
    </div>
  );
}
