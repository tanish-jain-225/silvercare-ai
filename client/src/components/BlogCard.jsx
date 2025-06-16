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
          // Handle broken image URLs gracefully
          <img
            src={urlToImage || "/public/voice-search.png"} // Use fallback image if URL is missing
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

// Fallback blogs data with open-source image links
export const defaultBlogs = [
  {
    id: 1,
    title: "The Future of AI: Trends to Watch",
    description:
      "Explore the latest trends in artificial intelligence and what the future holds.",
    url: "https://example.com/ai-trends",
    urlToImage:
      "https://images.unsplash.com/photo-1674027444485-cec3da58eef4?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZnV0dXJlJTIwQUl8ZW58MHx8MHx8fDA%3D", // AI theme
    source: { name: "Tech Daily" },
    publishedAt: new Date().toISOString(),
    category: "technology",
  },
  {
    id: 2,
    title: "Top 10 Programming Languages in 2023",
    description:
      "A comprehensive guide to the most popular programming languages this year.",
    url: "https://example.com/programming-languages",
    urlToImage:
      "https://images.unsplash.com/photo-1518770660439-4636190af475", // Code screen
    source: { name: "Code World" },
    publishedAt: new Date().toISOString(),
    category: "technology",
  },
  {
    id: 3,
    title: "How to Stay Productive While Working Remotely",
    description:
      "Tips and tricks to maintain productivity in a remote work environment.",
    url: "https://example.com/remote-work",
    urlToImage:
      "https://images.pexels.com/photos/4050320/pexels-photo-4050320.jpeg", // Remote work
    source: { name: "Work Life" },
    publishedAt: new Date().toISOString(),
    category: "business",
  },
  {
    id: 4,
    title: "The Importance of Mental Health Awareness",
    description:
      "Understanding and prioritizing mental health in today's fast-paced world.",
    url: "https://example.com/mental-health",
    urlToImage:
      "https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg", // Mental health
    source: { name: "Health Matters" },
    publishedAt: new Date().toISOString(),
    category: "health",
  },
  {
    id: 5,
    title: "Top Travel Destinations for 2025",
    description:
      "Discover the most breathtaking travel destinations to visit this year.",
    url: "https://example.com/travel-destinations",
    urlToImage:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e", // Beach/travel
    source: { name: "Wanderlust" },
    publishedAt: new Date().toISOString(),
    category: "travel",
  },
  {
    id: 6,
    title: "The Rise of Electric Vehicles",
    description:
      "How electric vehicles are shaping the future of transportation.",
    url: "https://example.com/electric-vehicles",
    urlToImage:
      "https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZXYlMjBjYXJ8ZW58MHx8MHx8fDA%3D", // EV car
    source: { name: "Auto Trends" },
    publishedAt: new Date().toISOString(),
    category: "science",
  },
  {
    id: 7,
    title: "Healthy Eating: Tips for a Balanced Diet",
    description:
      "Simple and effective tips to maintain a healthy and balanced diet.",
    url: "https://example.com/healthy-eating",
    urlToImage:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd", // Healthy food
    source: { name: "Nutrition Today" },
    publishedAt: new Date().toISOString(),
    category: "health",
  },
  {
    id: 8,
    title: "The Evolution of Space Exploration",
    description:
      "A look at humanity's journey into space and what lies ahead.",
    url: "https://example.com/space-exploration",
    urlToImage:
      "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c3BhY2UlMjBleHBsb3JhdGlvbnxlbnwwfHwwfHx8MA%3D%3D", // Space
    source: { name: "Cosmos Weekly" },
    publishedAt: new Date().toISOString(),
    category: "science",
  },
];
