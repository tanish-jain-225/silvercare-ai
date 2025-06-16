import { route_endpoint } from "./helper";

// Add a delay function to throttle requests
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// User Interests API
export const interestsAPI = {
    // Get user interests
    async getUserInterests(userId) {
        try {
            const response = await fetch(`${route_endpoint}/api/interests/${userId}`);
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
            const response = await fetch(`${route_endpoint}/api/interests`, {
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
            const response = await fetch(`${route_endpoint}/api/interests/${userId}`, {
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
            const response = await fetch(`${route_endpoint}/api/interests/${userId}`, {
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
        const API_KEY = 'c7ebd7e038a8439386633b648d116c1e';
        const url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${API_KEY}`;

        // Ensure headers for protocol upgrade are included
        const headers = {
            'User-Agent': 'VoiceBuddy/1.0',
            'Upgrade': 'h2c', // HTTP/2 Cleartext
        };

        try {
            const response = await fetch(url, { headers });

            if (response.status === 426) {
                console.error(`Protocol upgrade required for category: ${category}`);
                return this.getFallbackArticles(); // Use fallback articles
            }

            if (response.status === 429) {
                console.warn(`Rate limit exceeded for category: ${category}`);
                await delay(1000); // Wait for 1 second before retrying
                return this.fetchNewsByCategory(category); // Retry the request
            }

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
            return results.flat();
        } catch (error) {
            console.error("Error fetching news by categories:", error);
            return [];
        }
    },

    // Fetch news with fallback to everything endpoint
    async fetchNewsWithFallback(categories) {
        try {
            const articles = await this.fetchNewsByCategories(categories);

            if (articles.length < 6) {
                console.warn("Falling back to local data due to insufficient articles.");
                return this.getFallbackArticles();
            }

            return articles;
        } catch (error) {
            console.error("Error in fetchNewsWithFallback:", error);
            return this.getFallbackArticles();
        }
    },

    // Add a method to provide fallback articles
    getFallbackArticles() {
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
    }
};