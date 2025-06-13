/**
 * User model
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} name - User's name
 * @property {string} email - User's email
 * @property {number} [age] - User's age (optional)
 * @property {Array<string>} [healthConditions] - List of health conditions (optional)
 * @property {Array<EmergencyContact>} [emergencyContacts] - Emergency contacts (optional)
 */

/**
 * Emergency contact model
 * @typedef {Object} EmergencyContact
 * @property {string} id - Contact ID
 * @property {string} name - Contact name
 * @property {string} phone - Contact phone number
 * @property {string} relationship - Relationship to user
 */

/**
 * Reminder model
 * @typedef {Object} Reminder
 * @property {string} id - Reminder ID
 * @property {string} title - Reminder title
 * @property {string} [description] - Description (optional)
 * @property {string} time - Time for the reminder
 * @property {string} date - Date for the reminder
 * @property {boolean} isActive - Whether reminder is active
 * @property {boolean} [isRecurring] - Whether reminder recurs (optional)
 */

/**
 * Language model
 * @typedef {Object} Language
 * @property {string} code - Language code
 * @property {string} name - Language name
 * @property {string} flag - Flag emoji or image path
 */

/**
 * Chat message model
 * @typedef {Object} ChatMessage
 * @property {string} id - Message ID
 * @property {string} message - Message content
 * @property {boolean} isUser - Whether from user (true) or system (false)
 * @property {Date} timestamp - Message timestamp
 */

/**
 * AppContext model
 * @typedef {Object} AppContextType
 * @property {User|null} user - Current user
 * @property {Function} setUser - Function to update user
 * @property {string} language - Current language
 * @property {Function} setLanguage - Function to update language
 * @property {boolean} isAuthenticated - Authentication status
 * @property {Function} login - Login function
 * @property {Function} logout - Logout function
 * @property {Function} signup - Signup function
 */

export const Models = {
  // This is just a placeholder to document the models
  // The actual implementations will be created as needed
};
