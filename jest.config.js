// jest.config.js
module.exports = {
  // Jalankan hanya file di folder tests/unit/
  testMatch: ['**/tests/unit/**/*.test.js'],

  // Lingkungan Node.js (bukan browser)
  testEnvironment: 'node',

  // Tampilkan detail tiap test
  verbose: true,

  // Bersihkan mock setelah tiap test
  clearMocks: true,

  // Kumpulkan laporan coverage
  collectCoverage: false, // aktifkan dengan --coverage flag

  // Folder yang dikecualikan
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
};
