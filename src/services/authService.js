import { APP_CONFIG } from "../constants/appConfig";

/**
 * Authentication Service
 * Handles API calls to the implementing backend.
 */
export const authService = {
  
  /**
   * Register a new user
   * @param {Object} userData - { email, password }
   * @returns {Promise<Object>} API Response
   */
  async register(userData) {
    const API_URL = "http://localhost:3001/api/auth/register";
    return this._request(API_URL, userData);
  },

  /**
   * Login a user
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} API Response
   */
  async login(credentials) {
    const API_URL = "http://localhost:3001/api/auth/login";
    return this._request(API_URL, credentials);
  },

  /**
   * Helper for API requests
   */
  async _request(url, body) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || "Request failed");
        error.details = data.errors || [];
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Auth Service Error:", error);
      throw error;
    }
  }
};
