// Generate a unique user ID for session management
export const generateUserId = () => {
    // Check if user ID already exists in localStorage
    let userId = localStorage.getItem('voicebuddy_user_id');

    if (!userId) {
        // Generate a new user ID using timestamp and random string
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('voicebuddy_user_id', userId);
    }

    return userId;
};

// Check if user has completed initial interest selection
export const hasCompletedInterestSelection = () => {
    return localStorage.getItem('voicebuddy_interests_selected') === 'true';
};

// Mark interest selection as completed
export const markInterestSelectionCompleted = () => {
    localStorage.setItem('voicebuddy_interests_selected', 'true');
};

// Get stored interests from localStorage (for offline access)
export const getStoredInterests = () => {
    const stored = localStorage.getItem('voicebuddy_user_interests');
    return stored ? JSON.parse(stored) : [];
};

// Store interests in localStorage (for offline access)
export const storeInterests = (interests) => {
    localStorage.setItem('voicebuddy_user_interests', JSON.stringify(interests));
};

// Clear all user data (for testing/reset)
export const clearUserData = () => {
    localStorage.removeItem('voicebuddy_user_id');
    localStorage.removeItem('voicebuddy_interests_selected');
    localStorage.removeItem('voicebuddy_user_interests');
}; 