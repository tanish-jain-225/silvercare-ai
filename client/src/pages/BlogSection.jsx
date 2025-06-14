import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card'; // Imported Card
import { useVoice } from '../hooks/useVoice';

export function BlogSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { speak } = useVoice();
  
  // State for fetched blogs
  const [blogs, setBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [blogError, setBlogError] = useState(null);

  useEffect(() => {
    // Fetch real articles tagged 'design' from Dev.to
    fetch('https://dev.to/api/articles?tag=design&per_page=10')
      .then(res => res.json())
      .then(data => setBlogs(data))
      .catch(err => setBlogError(err))
      .finally(() => setLoadingBlogs(false));
  }, []);

  // ...existing useEffect for speak

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        {/* ...existing header code... */}
      </div>

      {/* Blog Grid */}
      <div className="container mx-auto px-4 py-8 flex-1">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Entertainment Design Blogs</h2>
        {loadingBlogs ? (
          <p>Loading blogs...</p>
        ) : blogError ? (
          <p className="text-red-600">Error loading blogs.</p>
        ) : (
          <div className="flex flex-wrap -mx-2">
            {blogs.map(blog => (
              <div key={blog.id} className="w-full sm:w-1/2 lg:w-1/3 px-2 mb-4">
                <Card className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col">
                  <img
                    src={blog.cover_image || `https://via.placeholder.com/400x300?text=Blog+${blog.id}`}
                    alt={blog.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold mb-2">{blog.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 flex-1">
                      {(blog.description || blog.body_markdown || '').slice(0, 100)}...
                    </p>
                    <Button
                      onClick={() => window.open(blog.url, '_blank')}
                      className="mt-auto bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Read More
                    </Button>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
