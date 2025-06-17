import React from "react";

export function BlogCard({ article }) {
  const { title, description, url, urlToImage, publishedAt } = article;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden h-full flex flex-col border border-gray-300">
      {/* Image Container */}
      <div className="relative overflow-hidden h-48">
        {urlToImage ? (
          <img
            src={urlToImage}
            alt="Article Image"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="h-16" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {title}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {description || "No description available."}
        </p>
        <div className="text-sm text-gray-500 mb-3">
          {formatDate(publishedAt)}
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto bg-blue-500 hover:bg-blue-600 text-white text-center py-2 rounded-md transition-colors duration-200"
        >
          Read More
        </a>
      </div>
    </div>
  );
}
