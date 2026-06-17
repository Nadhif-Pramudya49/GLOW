const ApiService = {
  async get(endpoint) {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};
