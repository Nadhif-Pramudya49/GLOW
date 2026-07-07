const UserService = {
  async getProfile() {
    return await ApiService.get('/auth/me');
  },
  async updateProfile(data) {
    return await ApiService.put('/auth/profile', data);
  }
};
