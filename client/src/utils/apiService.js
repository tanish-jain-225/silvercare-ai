const API_KEY = '92f616ec564142dc9203200369a98934'; // Replace with your actual API key

const API_URL = `https://api.worldnewsapi.com/search-news?api-key=${API_KEY}`;

/**
 * Fetch news articles from the World News API.
 * @param {string} query - The search query for news articles.
 * @param {string} language - The language of the articles (default: 'en').
 * @param {number} limit - The number of articles to fetch (default: 10).
 * @returns {Promise<Object[]>} - A promise that resolves to an array of news articles.
 */
export async function fetchNewsArticles(query = '', limit = 0) {
  try {
    const url = `${API_URL}&categories=${encodeURIComponent(query)}&language=en&number=10`; // Set limit to 10

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch news articles: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Fetched ${data.news.length} articles from the backend.`);

    // Map API response to frontend format
    return data.news.map((article) => ({
      id: article.id,
      title: article.title,
      description: article.summary || article.text,
      url: article.url,
      urlToImage: article.image,
      source: { name: article.source_country },
      publishedAt: article.publish_date,
      category: article.category,
    }));
  } catch (error) {
    console.error('Error fetching news articles:', error);
    throw error;
  }
}

/**
 * Fetch news articles by category from the World News API.
 * @param {string} category - The category to filter news articles by.
 * @returns {Promise<Object[]>} - A promise that resolves to an array of news articles in the specified category.
 */
export async function fetchNewsByCategory(category) {
  try {
    const url = `${API_URL}&categories=${encodeURIComponent(category)}&language=en`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch news articles: ${response.status}`);
    }

    const data = await response.json();

    // Map API response to frontend format
    return data.news.map((article) => ({
      id: article.id,
      title: article.title,
      description: article.summary || article.text,
      url: article.url,
      urlToImage: article.image,
      source: { name: article.source_country },
      publishedAt: article.publish_date,
      category: article.category,
    }));
  } catch (error) {
    console.error('Error fetching news articles by category:', error);
    throw error;
  }
}
