const OwnerService = {
  async getMyLocations() {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/owner/locations`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch locations');
      return data; // { locations, businessStatus }
    } catch (error) {
      console.error('OwnerService getMyLocations error:', error);
      throw error;
    }
  },

  async createLocation(formData) {
    try {
      // formData is a FormData object containing files and fields
      const response = await fetch(`${CONFIG.API_BASE_URL}/owner/locations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
          // Jangan set Content-Type: application/json karena ini multipart/form-data
        },
        body: formData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create location');
      return data;
    } catch (error) {
      console.error('OwnerService createLocation error:', error);
      throw error;
    }
  },

  async getOwnerBookings() {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/owner/bookings`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch bookings');
      return data;
    } catch (error) {
      console.error('OwnerService getOwnerBookings error:', error);
      throw error;
    }
  },

  async getOwnerStats() {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/owner/stats`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch stats');
      return data;
    } catch (error) {
      console.error('OwnerService getOwnerStats error:', error);
      throw error;
    }
  },

  async updateLocation(id, formData) {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/owner/locations/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        },
        body: formData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update location');
      return data;
    } catch (error) {
      console.error('OwnerService updateLocation error:', error);
      throw error;
    }
  },

  async deleteLocation(id) {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/owner/locations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete location');
      return data;
    } catch (error) {
      console.error('OwnerService deleteLocation error:', error);
      throw error;
    }
  },

  async updateBookingStatus(id, status) {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/owner/bookings/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthService.getToken()}`
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update booking status');
      return data;
    } catch (error) {
      console.error('OwnerService updateBookingStatus error:', error);
      throw error;
    }
  },

  async getOwnerReviews() {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/owner/reviews`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch reviews');
      return data;
    } catch (error) {
      console.error('OwnerService getOwnerReviews error:', error);
      throw error;
    }
  }
};

window.OwnerService = OwnerService;
