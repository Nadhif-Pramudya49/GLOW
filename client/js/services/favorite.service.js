const FavoriteService = {
  async getFavorites() {
    return await ApiService.get('/favorites');
  },
  async addFavorite(locationId) {
    return await ApiService.post('/favorites', { locationId });
  },
  async removeFavorite(locationId) {
    return await ApiService.delete(`/favorites/${locationId}`);
  }
};
