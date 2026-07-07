const http = require('http');

const data = JSON.stringify({"companions":"Solo Traveler","vibe":"Tenang Alam","budgetLabel":"Hemat","budgetLimit":1500000});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/ai/package',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', body));
});

req.on('error', console.error);
req.write(data);
req.end();
