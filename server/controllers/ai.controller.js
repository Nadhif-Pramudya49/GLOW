const { PrismaClient } = require('@prisma/client');
const { GoogleGenAI } = require('@google/genai');

const prisma = new PrismaClient();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

exports.generatePackage = async (req, res) => {
  console.log('--- AI GENERATE PACKAGE CALLED ---');
  console.log('Body:', req.body);
  try {
    const { companions, vibe, budgetLabel, budgetLimit } = req.body;

    // Fetch all locations to provide context to the AI
    const locations = await prisma.location.findMany({
      include: {
        packages: true
      }
    });

    // We don't want to send too much text to AI, just the essentials
    const catalog = locations.map(loc => ({
      id: loc.id,
      name: loc.name,
      category: loc.category, // e.g. Penginapan, Workspace, Wisata, Kuliner, Budaya
      price: loc.packages.length > 0 ? parseFloat(loc.packages[0].pricePerDay) : 0,
      suasana: loc.suasana || [],
      rating: parseFloat(loc.rating),
      facilities: loc.facilities || []
    }));

    const prompt = `
      Anda adalah seorang Travel Agent profesional di Gunung Kidul.
      Saya butuh bantuan Anda untuk membuat 1 paket perjalanan (Package Builder).
      
      Kriteria Pelanggan:
      - Berlibur dengan: ${companions}
      - Suasana yang dicari: ${vibe}
      - Kategori Budget: ${budgetLabel} (Maksimal Rp ${budgetLimit})

      Tugas Anda:
      Pilih HANYA 1 Penginapan, 1 Workspace (atau Cafe), 1 Transportasi, 1 Wisata, dan 1 Kuliner/Budaya dari data katalog JSON di bawah ini yang paling cocok dengan kriteria pelanggan. Total harga kelima tempat/layanan (dihitung dari field 'price') TIDAK BOLEH melebihi Budget Maksimal.
      
      Output HARUS berupa format JSON murni TANPA ada tag markdown, teks lain, atau backticks (seperti \`\`\`json).
      Format JSON yang diharapkan:
      {
        "penginapanId": <angka_id_penginapan>,
        "workspaceId": <angka_id_workspace>,
        "transportId": "<string_id_transport>",
        "wisataId": <angka_id_wisata>,
        "kulinerId": <angka_id_kuliner>,
        "reason": "Alasan singkat (1 kalimat) kenapa paket ini cocok"
      }
      
      Katalog Tempat:
      ${JSON.stringify(catalog)}

      Katalog Transportasi:
      [
        {"id": "motor", "name": "Sewa Motor", "price": 75000},
        {"id": "mobil", "name": "Sewa Mobil", "price": 350000},
        {"id": "ojek", "name": "Ojek Online", "price": 0},
        {"id": "kereta", "name": "Kereta Api", "price": 150000}
      ]
    `;

    // Initialize the model
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.2, // Low temperature for more deterministic/factual picking
      }
    });

    const aiText = typeof response.text === 'function' ? response.text() : response.text;
    let cleanJson = aiText.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.substring(7);
      if (cleanJson.endsWith('```')) {
        cleanJson = cleanJson.substring(0, cleanJson.length - 3);
      }
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.substring(3);
      if (cleanJson.endsWith('```')) {
        cleanJson = cleanJson.substring(0, cleanJson.length - 3);
      }
    }

    try {
      const packageData = JSON.parse(cleanJson);
      res.json(packageData);
    } catch (parseError) {
      console.error('Error parsing AI JSON:', cleanJson);
      res.status(500).json({ error: 'AI mengembalikan format yang tidak sesuai. Silakan coba lagi.' });
    }

  } catch (error) {
    console.error('AI Generation Error:', error);
    res.status(500).json({ error: 'Gagal membuat paket perjalanan dengan AI.' });
  }
};
