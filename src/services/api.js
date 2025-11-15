/**
 * API Service Layer
 * Handles all backend communication with authentication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.token = localStorage.getItem('token');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  // Get authentication token
  getToken() {
    return this.token || localStorage.getItem('token');
  }

  // Clear authentication
  clearAuth() {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Make authenticated request
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Authentication Methods
  async register(name, email, password) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

    console.log('Register response:', response);

    // Backend returns { success, message, data: { user, token } }
    const { user, token } = response.data || {};

    if (token) {
      this.setToken(token);
      localStorage.setItem('user', JSON.stringify(user));
    }

    // Return in expected format
    return { user, token };
  }

  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    console.log('Login response:', response);

    // Backend returns { success, message, data: { user, token } }
    const { user, token } = response.data || {};

    if (token) {
      this.setToken(token);
      localStorage.setItem('user', JSON.stringify(user));
    }

    // Return in expected format
    return { user, token };
  }

  async getMe() {
    return await this.request('/auth/me');
  }

  logout() {
    this.clearAuth();
  }

  // Activity Methods
  async generateActivity(params) {
    return await this.request('/activities/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getActivities(page = 1, limit = 10) {
    return await this.request(`/activities?page=${page}&limit=${limit}`);
  }

  async getActivityById(id) {
    return await this.request(`/activities/${id}`);
  }

  async deleteActivity(id) {
    return await this.request(`/activities/${id}`, {
      method: 'DELETE',
    });
  }

  // Feedback Methods
  async submitFeedback(activityId, feedback) {
    return await this.request('/feedback', {
      method: 'POST',
      body: JSON.stringify({ activityId, ...feedback }),
    });
  }

  // Analytics Methods
  async getAnalyticsSummary() {
    return await this.request('/analytics/summary');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  }

  // Get current user from localStorage
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

// Export singleton instance
export default new ApiService();
