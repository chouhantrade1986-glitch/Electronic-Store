const http = require('http');

function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function run() {
  console.log('--- Checking Backend API Endpoints ---');
  const urls = [
    'http://localhost:4000/api/health',
    'http://localhost:4000/health',
    'http://localhost:4000/api/products?limit=5',
    'http://localhost:4000/api/products/product_faadad46-7286-8744-5d9a-1263da26d23c',
    'http://localhost:4000/api/categories',
    'http://localhost:4000/api/admin/overview',
    'http://localhost:4000/api/orders'
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      let preview = res.data.substring(0, 100);
      try {
        const json = JSON.parse(res.data);
        if (Array.isArray(json)) preview = `Array of ${json.length} items`;
        else if (json.products) preview = `Object with ${json.products.length} products`;
        else if (json.id) preview = `Product id=${json.id}, price=${json.price}, title=${json.title}`;
        else preview = JSON.stringify(json).substring(0, 100);
      } catch (e) {}
      console.log(`[${res.status}] ${url} -> ${preview}`);
    } catch (e) {
      console.log(`[ERROR] ${url} -> ${e.message}`);
    }
  }
}

run();
