const LocationService = {
  async getLocations() {
    const rawData = await ApiService.get('/locations');
    
    // Transform API data to match existing DATA structure
    const apiData = {
      penginapan: rawData.filter(i => i.category.toLowerCase().includes('beach') || i.category.toLowerCase().includes('hill') || i.category.toLowerCase().includes('penginapan')),
      workspace: rawData.filter(i => i.category.toLowerCase().includes('cafe') || i.category.toLowerCase().includes('workspace')),
      wisata: rawData.filter(i => i.category.toLowerCase().includes('wisata')),
      kuliner: rawData.filter(i => i.category.toLowerCase().includes('kuliner'))
    };
    
    // Map API fields to frontend fields
    Object.keys(apiData).forEach(cat => {
      apiData[cat] = apiData[cat].map(item => ({
        ...item,
        id: item.id.toString(),
        category: cat, 
        img: item.img || `https://picsum.photos/seed/${item.id}/800/600`,
        price: parseFloat(item.packages?.[0]?.pricePerDay || 0),
        unit: 'hari',
        reviews: Math.floor(Math.random() * 50) + 10,
        rating: (3.5 + Math.random() * 1.5).toFixed(1),
        wifi: item.wifiSpeed,
        facilities: item.hasPowerOutlet ? ['Colokan'] : [],
        suasana: [item.category],
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lng),
        desc: item.description
      }));
    });
    
    return apiData;
  }
};
