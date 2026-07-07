const ProductivityService = {
  async getItineraries(bookingId) {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/productivity/itinerary/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch itineraries');
      return data;
    } catch (error) {
      console.error('ProductivityService getItineraries error:', error);
      throw error;
    }
  },

  async addItinerary(bookingId, payload) {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/productivity/itinerary/${bookingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthService.getToken()}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add itinerary');
      return data;
    } catch (error) {
      console.error('ProductivityService addItinerary error:', error);
      throw error;
    }
  },

  async deleteItinerary(id) {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/productivity/itinerary/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete itinerary');
      return data;
    } catch (error) {
      console.error('ProductivityService deleteItinerary error:', error);
      throw error;
    }
  },

  async getMoodLogs(bookingId) {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/productivity/mood/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch mood logs');
      return data;
    } catch (error) {
      console.error('ProductivityService getMoodLogs error:', error);
      throw error;
    }
  },

  async logMood(bookingId, payload) {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/productivity/mood/${bookingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthService.getToken()}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to log mood');
      return data;
    } catch (error) {
      console.error('ProductivityService logMood error:', error);
      throw error;
    }
  }
};

window.ProductivityService = ProductivityService;
