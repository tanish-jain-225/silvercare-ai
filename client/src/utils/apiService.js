const API_BASE_URL = 'http://localhost:8000';

// User Interests API
export const interestsAPI = {
    // Get user interests
    async getUserInterests(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/interests/${userId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching user interests:', error);
            throw error;
        }
    },

    // Create new user interests
    async createUserInterests(userId, interests) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/interests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, interests }),
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error creating user interests:', error);
            throw error;
        }
    },

    // Update user interests
    async updateUserInterests(userId, interests) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/interests/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ interests }),
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error updating user interests:', error);
            throw error;
        }
    },

    // Delete user interests
    async deleteUserInterests(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/interests/${userId}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error deleting user interests:', error);
            throw error;
        }
    },
};

// News API
export const newsAPI = {
    // Fetch news for a specific category
    async fetchNewsByCategory(category) {
        const API_KEY = '26c468af4a634a9cb60cc69f457a1f41';
        const url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${API_KEY}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 'ok' && data.articles) {
                // Add category to each article
                return data.articles.map(article => ({
                    ...article,
                    category: category
                }));
            } else {
                console.warn(`No articles found for category: ${category}`);
                return [];
            }
        } catch (error) {
            console.error(`Error fetching news for category ${category}:`, error);
            return [];
        }
    },

    // Fetch news for multiple categories
    async fetchNewsByCategories(categories) {
        try {
            const promises = categories.map(category => this.fetchNewsByCategory(category));
            const results = await Promise.all(promises);

            // Flatten and merge all articles
            const allArticles = results.flat();

            // Sort by published date (newest first)
            return allArticles.sort((a, b) =>
                new Date(b.publishedAt) - new Date(a.publishedAt)
            );
        } catch (error) {
            console.error('Error fetching news for multiple categories:', error);
            return [];
        }
    },

    // Fetch news with fallback to everything endpoint
    async fetchNewsWithFallback(categories) {
        try {
            // First try top-headlines for each category
            const articles = await this.fetchNewsByCategories(categories);

            // If we don't have enough articles, try the everything endpoint
            if (articles.length < 6) {
                const API_KEY = '26c468af4a634a9cb60cc69f457a1f41';
                const query = categories.join(' OR ');
                const date = new Date();
                date.setDate(date.getDate() - 30);
                const fromDate = date.toISOString().split('T')[0];

                const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&from=${fromDate}&sortBy=popularity&apiKey=${API_KEY}`;

                const response = await fetch(url);
                const data = await response.json();

                if (data.status === 'ok' && data.articles) {
                    return data.articles.slice(0, 12); // Limit to 12 articles
                }
            }

            return articles;
        } catch (error) {
            console.error('Error fetching news with fallback:', error);
            return [];
        }
    }
}; 