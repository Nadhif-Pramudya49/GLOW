fetch('http://localhost:3001/api/ai/package', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ companions: '2 orang', vibe: 'Santai', budgetLabel: 'Hemat', budgetLimit: 300000 })
}).then(r => r.text()).then(console.log).catch(console.error);
