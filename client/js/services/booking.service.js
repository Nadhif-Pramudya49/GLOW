const BookingService = {
  async getMyBookings() {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/bookings/me`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch bookings');
      return data;
    } catch (error) {
      console.error('BookingService getMyBookings error:', error);
      throw error;
    }
  },

  async createBooking(payload) {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthService.getToken()}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create booking');
      return data;
    } catch (error) {
      console.error('BookingService createBooking error:', error);
      throw error;
    }
  }
};
