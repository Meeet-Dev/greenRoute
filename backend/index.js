const express = require('express');
const cors = require('cors');
const emissionFactors = require('./emissionFactors.json');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('GreenRoute Backend');
});

app.get('/calculate-co2', (req, res) => {
  const { vehicleType, fuelType, distance, loadWeight } = req.query;

  // Validate inputs
  if (!emissionFactors[vehicleType] || !emissionFactors[vehicleType][fuelType]) {
    return res.status(400).json({ error: 'Invalid vehicleType or fuelType' });
  }
  if (isNaN(distance) || distance <= 0 || isNaN(loadWeight) || loadWeight < 0) {
    return res.status(400).json({ error: 'Invalid distance or loadWeight' });
  }

  // Calculate CO2
  const factors = emissionFactors[vehicleType][fuelType];
  const loadFactor = loadWeight > 1000 ? 1.2 : 1.0;
  const totalCO2 = {
    TTW: (distance * factors.TTW * loadFactor).toFixed(2),
    WTT: (distance * factors.WTT * loadFactor).toFixed(2),
    WtW: (distance * factors.WtW * loadFactor).toFixed(2),
  };

  // City-wise breakdown (assume 3 cities)
  const cities = ['Berlin', 'Munich', 'Hamburg'];
  const cityDistance = distance / 3;
  const cityCO2 = cities.map(city => ({
    city,
    co2: (cityDistance * factors.WtW * loadFactor).toFixed(2),
  }));

  res.json({
    totalCO2,
    cityCO2,
    unit: 'kg',
  });
});

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});