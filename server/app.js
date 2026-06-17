const express = require('express');
const cors = require('cors');
const locationRoutes = require('./routes/location.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'GLOW Discovery API is running' });
});

app.use('/api/locations', locationRoutes);

module.exports = app;
