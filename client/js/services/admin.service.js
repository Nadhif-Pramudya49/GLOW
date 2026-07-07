const AdminService = {
  async getPendingBusinesses() {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/admin/businesses?status=PENDING`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch businesses');
      return data.businesses;
    } catch (error) {
      console.error('AdminService getPendingBusinesses error:', error);
      throw error;
    }
  },

  async updateBusinessStatus(id, status) {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/admin/businesses/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthService.getToken()}`
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update business status');
      return data;
    } catch (error) {
      console.error('AdminService updateBusinessStatus error:', error);
      throw error;
    }
  },

  async getStats() {
    const res = await fetch(`${CONFIG.API_BASE_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${AuthService.getToken()}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch stats');
    return data.stats;
  },

  async getUsers(query = '') {
    const url = `${CONFIG.API_BASE_URL}/admin/users` + (query ? `?q=${encodeURIComponent(query)}` : '');
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${AuthService.getToken()}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
    return data.users;
  },

  async getUserDetails(id) {
    const res = await fetch(`${CONFIG.API_BASE_URL}/admin/users/${id}/details`, {
      headers: { 'Authorization': `Bearer ${AuthService.getToken()}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch user details');
    return data;
  },

  async updateUserRole(id, role) {
    const res = await fetch(`${CONFIG.API_BASE_URL}/admin/users/${id}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AuthService.getToken()}`
      },
      body: JSON.stringify({ role })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update role');
    return data;
  },

  async deleteUser(id) {
    const res = await fetch(`${CONFIG.API_BASE_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${AuthService.getToken()}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete user');
    return data;
  },

  async getAllLocations() {
    const res = await fetch(`${CONFIG.API_BASE_URL}/admin/locations`, {
      headers: { 'Authorization': `Bearer ${AuthService.getToken()}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch locations');
    return data.locations;
  },

  async toggleLocationPublish(id) {
    const res = await fetch(`${CONFIG.API_BASE_URL}/admin/locations/${id}/publish`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${AuthService.getToken()}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to toggle location');
    return data.location;
  },

  async deleteLocation(id) {
    const res = await fetch(`${CONFIG.API_BASE_URL}/admin/locations/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${AuthService.getToken()}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete location');
    return data;
  }
};
