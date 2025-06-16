import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useVoice } from "../hooks/useVoice";
import { InterestSelectionModal } from "../components/InterestSelectionModal";
import { BlogCard, defaultBlogs } from "../components/BlogCard";

// Define CSS for the fade-in animation
const fadeInAnimation = document.createElement("style");
fadeInAnimation.innerHTML = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fadeIn 0.5s ease-out;
  }`;
  
document.head.appendChild(fadeInAnimation);
import {
  generateUserId,
  hasCompletedInterestSelection,
  markInterestSelectionCompleted,
  getStoredInterests,
  storeInterests,
} from "../utils/userUtils";

import { interestsAPI, newsAPI } from "../utils/apiService";

export function BlogSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { speak } = useVoice();
  // State management
  const [articles, setArticles] = useState(defaultBlogs); // Use default blogs as initial articles
  const [displayedArticles, setDisplayedArticles] = useState(defaultBlogs); // Display default blogs initially
  const [loading, setLoading] = useState(false); // Set loading to false since blogs are hardcoded
  const [error, setError] = useState(null);
  const [userInterests, setUserInterests] = useState([]);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null); // State for selected blog

  // User ID management
  const [userId] = useState(() => generateUserId());

  useEffect(() => {
    // Always display default blogs initially
    setDisplayedArticles(defaultBlogs);
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
      console.error("Error initializing blog:", error);
      setError("Failed to load personalized news. Please try again.");
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
          const defaultInterests = ["technology"];
          setUserInterests(defaultInterests);
          await fetchNewsByInterests(defaultInterests);
        }
      }
    } catch (error) {
      console.error("Error loading user interests:", error);
      // Fallback to default interests
      const defaultInterests = ["technology"];
      setUserInterests(defaultInterests);
      await fetchNewsByInterests(defaultInterests);
    }
  };
  const fetchNewsByInterests = async (interests) => {
    try {
      setLoading(true);
      setError(null);
      setAllImagesLoaded(false);
      setImagesLoaded(0);

      // Shuffle interests for randomness
      const shuffledInterests = interests.sort(() => Math.random() - 0.5);

      // Fetch articles for shuffled interests
      const allNewsArticles = await newsAPI.fetchNewsWithFallback(shuffledInterests);

      // Add index for animation delay and shuffle articles
      const articlesWithIndex = allNewsArticles
        .filter((article) => article.urlToImage) // Only keep articles with images
        .map((article, index) => ({ ...article, animationIndex: index }));

      // Randomize articles
      const shuffledArticles = articlesWithIndex.sort(() => Math.random() - 0.5);

      // Store and display fetched articles
      setArticles(shuffledArticles);
      setDisplayedArticles(shuffledArticles);

      // Set a minimum loading time (3 seconds)
      setTimeout(() => {
        preloadArticleImages(shuffledArticles);
      }, 3000);
    } catch (error) {
      console.error("Error fetching news:", error);
      setError("Failed to fetch news articles. Displaying default blogs.");

      // Fallback to default blogs
      setArticles(defaultBlogs);
      setDisplayedArticles(defaultBlogs);

      setTimeout(() => {
        setLoading(false);
      }, 3000);
    }
  };

  // Preload images to avoid broken layouts
  const preloadArticleImages = (articles) => {
    // Limit to 18 articles max
    const limitedArticles = articles.slice(0, 18);
    const totalImagesToLoad = limitedArticles.length;

    if (totalImagesToLoad === 0) {
      setLoading(false);
      setAllImagesLoaded(true);
      return;
    }

    let loadedCount = 0;

    limitedArticles.forEach((article) => {
      if (!article.urlToImage) {
        loadedCount++;
        setImagesLoaded(loadedCount);
        if (loadedCount >= totalImagesToLoad) {
          finishLoading(limitedArticles);
        }
        return;
      }

      const img = new Image();
      img.onload = () => {
        loadedCount++;
        setImagesLoaded(loadedCount);
        if (loadedCount >= totalImagesToLoad) {
          finishLoading(limitedArticles);
        }
      };
      img.onerror = () => {
        // Replace with placeholder for failed images
        article.urlToImage = "https://via.placeholder.com/800x400?text=News";
        loadedCount++;
        setImagesLoaded(loadedCount);
        if (loadedCount >= totalImagesToLoad) {
          finishLoading(limitedArticles);
        }
      };
      img.src = article.urlToImage;
    });
  };

  const finishLoading = (articles) => {
    // Show articles with a slight delay to ensure smooth transition
    setTimeout(() => {
      setDisplayedArticles(articles);
      setLoading(false);
      setAllImagesLoaded(true);
    }, 500);
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
      console.error("Error saving interests:", error);
      throw error;
    }
  };

  // Ensure proper error handling and fallback mechanisms
  const handleRefreshNews = async () => {
    try {
      setRefreshing(true);
      await fetchNewsByInterests(userInterests);
    } catch (error) {
      console.error("Error refreshing news:", error);
      setError("Failed to refresh news articles. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  const getFallbackArticles = () => {
    return [
      {
        title: "Fallback Article",
        description: "This is a fallback article.",
        url: "#",
        urlToImage: "/public/voice-search.png",
        source: { name: "Fallback Source" },
        publishedAt: new Date().toISOString(),
        category: "general",
      },
    ];
  };

  const getInterestDisplayNames = () => {
    const displayNames = {
      business: "Business",
      entertainment: "Entertainment",
      general: "General",
      health: "Health",
      science: "Science",
      sports: "Sports",
      technology: "Technology",
    };

    return userInterests
      .map((interest) => displayNames[interest] || interest)
      .join(", ");
  };

  const handleShowPopup = (blog) => {
    setSelectedBlog(blog);
  };

  const handleClosePopup = () => {
    setSelectedBlog(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100/30 dark:from-dark-100 dark:to-dark-200 flex flex-col mb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-100/80 via-primary-200/80 to-accent-yellow/30 dark:from-dark-100/80 dark:via-dark-200/80 dark:to-accent-yellow/20 backdrop-blur-sm border-b border-primary-200/30 dark:border-dark-600/30 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-primary-300 dark:text-primary-200">
            Personalized News Feed
          </h1>

          {/* Settings Button */}
          <button
            onClick={() => setShowInterestModal(true)}
            className="p-2 text-primary-200 hover:text-primary-300 hover:bg-primary-100/20 dark:text-primary-100 dark:hover:text-primary-50 dark:hover:bg-dark-600/20 rounded-lg transition-colors"
            title="Edit Interests"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Interest Display */}
      {userInterests.length > 0 && (
        <div className="bg-white/90 dark:bg-dark-50/90 shadow-sm p-4 border-b border-primary-100/20 dark:border-dark-600/20">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-200 dark:text-primary-100">
                  Your Interests:
                </p>
                <p className="font-medium text-primary-300 dark:text-primary-50">
                  {getInterestDisplayNames()}
                </p>
              </div>

              <Button
                onClick={handleRefreshNews}
                disabled={refreshing}
                className="bg-primary-200 hover:bg-primary-300 dark:bg-primary-100 dark:hover:bg-primary-200 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                {refreshing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Refreshing...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
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
        {displayedArticles.length === 0 ? (
          <div className="text-center p-8 bg-yellow-50/50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200/50 dark:border-yellow-800/30">
            <div className="text-yellow-500 dark:text-yellow-400 text-4xl mb-4">
              📰
            </div>
            <h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-300 mb-2">
              No articles found
            </h3>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-primary-300 dark:text-primary-200 mb-2">
                Your Personalized News Feed
              </h2>
              <p className="text-primary-200 dark:text-primary-100">
                {displayedArticles.length} articles based on your interests
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedArticles.map((article, index) => (
                <div
                  key={article.id}
                  className="opacity-0 animate-fade-in"
                  style={{
                    animationDelay: `${(index % 18) * 150}ms`,
                    animationFillMode: "forwards",
                  }}
                >
                  <BlogCard article={article} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Interest Selection Modal */}
      <InterestSelectionModal
        isOpen={showInterestModal}
        onClose={() => setShowInterestModal(false)}
        onSave={handleSaveInterests}
        initialInterests={userInterests}
        title={
          isFirstVisit
            ? "Welcome! Select Your Interests"
            : "Edit Your Interests"
        }
        description={
          isFirstVisit
            ? "Choose the topics you're interested in to personalize your news feed."
            : "Update your interests to see different news articles."
        }
      />

      {/* Popup for Blog Details */}
      {selectedBlog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 dark:bg-dark-50/95 rounded-lg shadow-xl p-6 max-w-3xl w-full relative overflow-y-auto max-h-screen border border-primary-100/20 dark:border-dark-600/20">
            <button
              onClick={handleClosePopup}
              className="absolute top-2 right-2 text-primary-200 hover:text-primary-300 dark:text-primary-100 dark:hover:text-primary-50 transition-colors"
            >
              ✖
            </button>
            <h2 className="text-2xl font-bold mb-4 text-primary-300 dark:text-primary-200">
              {selectedBlog.title}
            </h2>
            <img
              src={selectedBlog.urlToImage || "/public/voice-search.png"}
              alt={selectedBlog.title}
              className="w-full h-auto mb-4 rounded-lg shadow-md"
            />
            <p className="text-primary-200 dark:text-primary-100 mb-4">
              {selectedBlog.description}
            </p>
            <a
              href={selectedBlog.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-300 hover:text-primary-400 dark:text-primary-200 dark:hover:text-primary-100 hover:underline transition-colors"
            >
              Read Full Article
            </a>
            <div className="text-sm text-primary-100 dark:text-primary-50 mt-4">
              Published on:{" "}
              {new Date(selectedBlog.publishedAt).toLocaleDateString()}
            </div>
            <button
              onClick={() => {
                const utterance = new SpeechSynthesisUtterance(
                  selectedBlog.title
                );
                window.speechSynthesis.speak(utterance);
              }}
              className="mt-4 bg-primary-200 hover:bg-primary-300 dark:bg-primary-100 dark:hover:bg-primary-200 text-white px-3 py-1 rounded-full
               transition-all duration-200 transform hover:scale-105 hover:shadow-md
               flex items-center justify-center text-sm"
              title="Speak Headline"
            >
              🔊 Speak
            </button>
          </div>
        </div>
      )}
    </div>
  );
}