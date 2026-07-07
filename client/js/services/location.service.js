const LocationService = {
  async getLocationById(id) {
    const rawData = await ApiService.get(`/locations/${id}`);
    
    // Pastikan field di map agar seragam dengan FE jika diperlukan
    return {
      ...rawData,
      price: rawData.packages?.[0]?.pricePerDay || 0, // Ambil harga dari package pertama (dummy map)
      lat: parseFloat(rawData.latitude),
      lng: parseFloat(rawData.longitude),
      desc: rawData.description,
      img: rawData.img ? (rawData.img.startsWith('/uploads') ? CONFIG.API_BASE_URL.replace('/api', '') + rawData.img : rawData.img) : `https://picsum.photos/seed/${rawData.id}/1200/600`
    };
  },
  async getLocations() {
    const rawData = await ApiService.get('/locations');
    
    // Transform API data to match existing DATA structure
    const apiData = {
      penginapan: rawData.filter(i => i.category.toLowerCase().includes('beach') || i.category.toLowerCase().includes('hill') || i.category.toLowerCase().includes('penginapan')),
      workspace: rawData.filter(i => i.category.toLowerCase().includes('cafe') || i.category.toLowerCase().includes('workspace')),
      wisata: rawData.filter(i => i.category.toLowerCase().includes('wisata')),
      kuliner: rawData.filter(i => i.category.toLowerCase().includes('kuliner')),
      budaya: rawData.filter(i => i.category.toLowerCase().includes('budaya'))
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
        } else if (cat === 'budaya') {
          mockSuasana = ['Seni', 'Tradisi', 'Edukasi'];
          mockFac = ['Parkir', 'Guide'];
        } else {
          mockSuasana = ['Lokal', 'Estetik'];
          mockFac = ['Parkir', 'WiFi'];
        }

          let lat = parseFloat(item.latitude || item.lat || 0);
          if (cat !== 'wisata' && lat < -8.14) {
            lat += 0.08;
          }
          let lng = parseFloat(item.longitude || item.lng || 0);
          
          return {
            ...item,
            id: item.id.toString(),
            category: cat, 
            img: item.img ? (item.img.startsWith('/uploads') ? CONFIG.API_BASE_URL.replace('/api', '') + item.img : item.img) : `https://picsum.photos/seed/${item.id}/800/600`,
            price: parseFloat(item.packages?.[0]?.pricePerDay || (cat === 'wisata' ? 0 : 50000 + (idx*10000))),
            unit: 'hari',
            reviews: Math.floor(Math.random() * 50) + 10,
            rating: (3.5 + Math.random() * 1.5).toFixed(1),
            wifi: mockWifi,
            facilities: item.hasPowerOutlet ? [...new Set([...mockFac, 'Colokan'])] : mockFac,
            suasana: mockSuasana,
            lat: lat,
            lng: lng,
            desc: item.description || `Destinasi ${cat} terbaik di Gunung Kidul.`
          };
      });
    });
    
    return apiData;
  }
};
