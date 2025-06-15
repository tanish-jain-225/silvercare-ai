import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useVoice } from '../hooks/useVoice';
import { InterestSelectionModal } from '../components/InterestSelectionModal';
import { BlogCard } from '../components/BlogCard';
import {
  generateUserId,
  hasCompletedInterestSelection,
  markInterestSelectionCompleted,
  getStoredInterests,
  storeInterests
} from '../utils/userUtils';
import { interestsAPI, newsAPI } from '../utils/apiService';

export function BlogSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { speak } = useVoice();

  // State management
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInterests, setUserInterests] = useState([]);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // User ID management
  const [userId] = useState(() => generateUserId());

  useEffect(() => {
    initializeBlog();
  }, []);

  const initializeBlog = async () => {
    try {
      setLoading(true);

      // Check if this is the first visit
      const firstVisit = !hasCompletedInterestSelection();
      setIsFirstVisit(firstVisit);

      if (firstVisit) {
        // Show interest selection modal for first-time users
        setShowInterestModal(true);
        setLoading(false);
        return;
      }

      // Load user interests and fetch news
      await loadUserInterestsAndNews();

    } catch (error) {
      console.error('Error initializing blog:', error);
      setError('Failed to load personalized news. Please try again.');
      setLoading(false);
    }
  };

  const loadUserInterestsAndNews = async () => {
    try {
      // Try to get interests from API
      const interestsResponse = await interestsAPI.getUserInterests(userId);

      if (interestsResponse.success && interestsResponse.interests.length > 0) {
        setUserInterests(interestsResponse.interests);
        storeInterests(interestsResponse.interests);
        await fetchNewsByInterests(interestsResponse.interests);
      } else {
        // Fallback to stored interests or default
        const storedInterests = getStoredInterests();
        if (storedInterests.length > 0) {
          setUserInterests(storedInterests);
          await fetchNewsByInterests(storedInterests);
        } else {
          // Default to technology if no interests found
          const defaultInterests = ['technology'];
          setUserInterests(defaultInterests);
          await fetchNewsByInterests(defaultInterests);
        }
      }
    } catch (error) {
      console.error('Error loading user interests:', error);
      // Fallback to default interests
      const defaultInterests = ['technology'];
      setUserInterests(defaultInterests);
      await fetchNewsByInterests(defaultInterests);
    }
  };

  const fetchNewsByInterests = async (interests) => {
    try {
      setLoading(true);
      setError(null);

      const newsArticles = await newsAPI.fetchNewsWithFallback(interests);
      setArticles(newsArticles);

    } catch (error) {
      console.error('Error fetching news:', error);
      setError('Failed to fetch news articles. Please try again.');

      // Provide fallback articles
      setArticles(getFallbackArticles());
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInterests = async (selectedInterests) => {
    try {
      // Save to API
      if (isFirstVisit) {
        await interestsAPI.createUserInterests(userId, selectedInterests);
      } else {
        await interestsAPI.updateUserInterests(userId, selectedInterests);
      }

      // Update local state
      setUserInterests(selectedInterests);
      storeInterests(selectedInterests);

      // Mark as completed for first-time users
      if (isFirstVisit) {
        markInterestSelectionCompleted();
        setIsFirstVisit(false);
      }

      // Fetch new articles based on updated interests
      await fetchNewsByInterests(selectedInterests);

    } catch (error) {
      console.error('Error saving interests:', error);
      throw error;
    }
  };

  const handleRefreshNews = async () => {
    setRefreshing(true);
    try {
      await fetchNewsByInterests(userInterests);
    } catch (error) {
      console.error('Error refreshing news:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getFallbackArticles = () => {
    return [
      {
        source: { id: null, name: "TechCrunch" },
        author: "John Smith",
        title: "Latest Advances in AI Technology for 2025",
        description: "Exploring the cutting-edge developments in artificial intelligence that are shaping our future in unexpected ways.",
        url: "https://techcrunch.com/example",
        urlToImage: "https://via.placeholder.com/800x400?text=AI+Technology",
        publishedAt: "2025-06-15T08:40:00Z",
        content: "AI continues to evolve at an unprecedented pace...",
        category: "technology"
      },
      {
        source: { id: null, name: "The Verge" },
        author: "Sarah Johnson",
        title: "New Quantum Computing Breakthrough Promises Faster Processing",
        description: "Scientists have achieved a major milestone in quantum computing that could revolutionize data processing.",
        url: "https://theverge.com/example",
        urlToImage: "https://via.placeholder.com/800x400?text=Quantum+Computing",
        publishedAt: "2025-06-14T15:30:00Z",
        content: "Quantum computing reaches new heights with...",
        category: "technology"
      },
      {
        source: { id: null, name: "Wired" },
        author: "Michael Brown",
        title: "The Future of Augmented Reality Wearables",
        description: "How AR glasses are becoming mainstream and changing how we interact with the digital world.",
        url: "https://wired.com/example",
        urlToImage: "https://via.placeholder.com/800x400?text=AR+Wearables",
        publishedAt: "2025-06-13T12:15:00Z",
        content: "Augmented reality is no longer science fiction...",
        category: "technology"
      }
    ];
  };

  const getInterestDisplayNames = () => {
    const displayNames = {
      business: 'Business',
      entertainment: 'Entertainment',
      general: 'General',
      health: 'Health',
      science: 'Science',
      sports: 'Sports',
      technology: 'Technology'
    };

    return userInterests.map(interest => displayNames[interest] || interest).join(', ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800">Personalized News Feed</h1>

          {/* Settings Button */}
          <button
            onClick={() => setShowInterestModal(true)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit Interests"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Interest Display */}
      {userInterests.length > 0 && (
        <div className="bg-white shadow-sm p-4 border-b border-gray-200">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Your Interests:</p>
                <p className="font-medium text-gray-900">{getInterestDisplayNames()}</p>
              </div>

              <Button
                onClick={handleRefreshNews}
                disabled={refreshing}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                {refreshing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Refreshing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Refresh News</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* News Articles Grid */}
      <div className="container mx-auto px-4 py-8 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading your personalized news...</p>
          </div>
        ) : error ? (
          <div className="text-center p-8 bg-red-50 rounded-xl border border-red-200">
            <div className="text-red-600 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Oops! Something went wrong</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button
              onClick={handleRefreshNews}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Try Again
            </Button>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center p-8 bg-yellow-50 rounded-xl border border-yellow-200">
            <div className="text-yellow-600 text-4xl mb-4">📰</div>
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">No articles found</h3>
            <p className="text-yellow-600 mb-4">Try updating your interests or refreshing the page.</p>
            <Button
              onClick={() => setShowInterestModal(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
            >
              Update Interests
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Your Personalized News Feed
              </h2>
              <p className="text-gray-600">
                {articles.length} articles based on your interests
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {articles.map((article, index) => (
                <BlogCard key={index} article={article} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white py-4 text-center text-sm text-gray-600 border-t border-gray-200">
        <p>Powered by <a href="https://newsapi.org/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">NewsAPI.org</a></p>
      </div>

      {/* Interest Selection Modal */}
      <InterestSelectionModal
        isOpen={showInterestModal}
        onClose={() => setShowInterestModal(false)}
        onSave={handleSaveInterests}
        initialInterests={userInterests}
        title={isFirstVisit ? "Welcome! Select Your Interests" : "Edit Your Interests"}
        description={isFirstVisit
          ? "Choose the topics you're interested in to personalize your news feed."
          : "Update your interests to see different news articles."
        }
      />
    </div>
  );
}
