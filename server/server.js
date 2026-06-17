require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT);

server.on('listening', () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});

// Tangani error jika port sudah digunakan
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Gagal menjalankan server: Port ${PORT} sudah digunakan.`);
    console.error(`💡 Tips: Port 3000 sedang digunakan oleh proses lain (kemungkinan 'npx serve').`);
    console.error(`          Silakan hentikan proses tersebut atau gunakan port lain di file .env.`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
});

// Tangani graceful shutdown
process.on('SIGINT', () => {
  server.close(() => {
    console.log('\nServer dihentikan.');
    process.exit(0);
  });
});
