const PackageService = {
  async getSavedPackages() {
    const data = await ApiService.get('/packages/saved');
    return data.map(d => {
      const parsed = typeof d.packageData === 'string' ? JSON.parse(d.packageData) : (d.packageData || {});
      return { ...parsed, _dbId: d.id, name: d.name, saved: new Date(d.createdAt).toLocaleDateString('id-ID', {day:'numeric',month:'short',year:'numeric'}) };
    });
  },
  async savePackage(data) {
    const payload = {
      name: data.name || 'Paket Tanpa Nama',
      packageData: data
    };
    return await ApiService.post('/packages/saved', payload);
  },
  async deleteSavedPackage(id) {
    return await ApiService.delete(`/packages/saved/${id}`);
  }
};
