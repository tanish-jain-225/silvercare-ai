import React from "react";
import { Button } from "./ui/Button";
import { Navigate } from "react-router-dom";

const CATEGORY_COLORS = {
  business: "bg-blue-100 text-blue-800",
  entertainment: "bg-purple-100 text-purple-800",
  general: "bg-gray-100 text-gray-800",
  health: "bg-green-100 text-green-800",
  science: "bg-indigo-100 text-indigo-800",
  sports: "bg-orange-100 text-orange-800",
  technology: "bg-cyan-100 text-cyan-800",
};

const CATEGORY_ICONS = {
  business: "💼",
  entertainment: "🎬",
  general: "📰",
  health: "🏥",
  science: "🔬",
  sports: "⚽",
  technology: "💻",
};

export function BlogCard({ article, className = "", onReadMore }) {
  const {
    title,
    description,
    url,
    urlToImage,
    source,
    publishedAt,
    category = "general",
  } = article;

  // Ensure the onReadMore callback triggers the popup
  const popUpCard = () => {
    const articleDetails = {
      title,
      description,
      url,
      urlToImage,
      source,
      publishedAt,
      category,
    };

    if (onReadMore) {
      onReadMore(articleDetails);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      className={`
      bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 
      overflow-hidden h-full flex flex-col group hover:scale-105
      border border-gray-100 hover:border-gray-200
      ${className}
    `}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden h-48">
        {urlToImage ? (
          <img
            src={urlToImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/public/voice-search.png"; // Local fallback image
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-gray-400 text-4xl">📰</div>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`
            inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
            ${CATEGORY_COLORS[category] || CATEGORY_COLORS.general}
          `}
          >
            <span className="mr-1">
              {CATEGORY_ICONS[category] || CATEGORY_ICONS.general}
            </span>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </span>
        </div>

        {/* Source Badge */}
        {source?.name && (
          <div className="absolute top-3 right-3">
            <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs font-medium">
              {source.name}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>

        {/* Meta Information */}
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {formatDate(publishedAt)}
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-3">
          {description || "No description available for this article."}
        </p>

        {/* Read More Button */}
        <Button
          onClick={() => {
            popUpCard();
          }}
          className="mt-auto bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg
                     transition-all duration-200 transform hover:scale-105 hover:shadow-md
                     flex items-center justify-center space-x-2"
        >
          <span>View Insights</span>
        </Button>
      </div>
    </div>
  );
}
