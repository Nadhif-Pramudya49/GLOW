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
      apiData[cat] = apiData[cat].map((item, idx) => {
        // Generate mock data based on category so filters work
        let mockSuasana = [];
        let mockFac = [];
        let mockWifi = item.wifiSpeed || (cat === 'workspace' ? 50 : cat === 'penginapan' ? 20 : 0);
        
        if (cat === 'penginapan') {
          mockSuasana = ['Tenang', 'Asri', 'Private'];
          mockFac = ['AC', 'WiFi', 'Kolam Renang', 'Parkir'];
        } else if (cat === 'workspace') {
          mockSuasana = ['Produktif', 'Modern', 'Estetik'];
          mockFac = ['Colokan', 'WiFi', 'AC', 'Meeting Room'];
        } else if (cat === 'wisata') {
          mockSuasana = ['Alam', 'Instagramable', 'Asri'];
          mockFac = ['Parkir', 'Toilet', 'Mushola'];
        } else {
          mockSuasana = ['Lokal', 'Estetik'];
          mockFac = ['Parkir', 'WiFi'];
        }

        return {
          ...item,
          id: item.id.toString(),
          category: cat, 
          img: item.img || `https://picsum.photos/seed/${item.id}/800/600`,
          price: parseFloat(item.packages?.[0]?.pricePerDay || (cat === 'wisata' ? 0 : 50000 + (idx*10000))),
          unit: 'hari',
          reviews: Math.floor(Math.random() * 50) + 10,
          rating: (3.5 + Math.random() * 1.5).toFixed(1),
          wifi: mockWifi,
          facilities: item.hasPowerOutlet ? [...new Set([...mockFac, 'Colokan'])] : mockFac,
          suasana: mockSuasana,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lng),
          desc: item.description || `Destinasi ${cat} terbaik di Gunung Kidul.`
        };
      });
    });
    
    return apiData;
  }
};
