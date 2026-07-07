class ReviewService {
  static async submitReview(payload) {
    try {
      const response = await ApiService.post('/reviews', payload);
      return response;
    } catch (error) {
      console.error('Submit review error:', error);
      throw error;
    }
  }

  static async getReviewsByLocation(locationId) {
    try {
      const response = await ApiService.get(`/reviews/location/${locationId}`);
      return response;
    } catch (error) {
      console.error('Get reviews error:', error);
      return [];
    }
  }
}

window.ReviewService = ReviewService;
