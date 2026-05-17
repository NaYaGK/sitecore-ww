
const https = require('https');
const fs = require('fs');
const path = require('path');

// Load env vars roughly
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const endpoint = env.PRODUCT_SITECORE_EDGE_URL || 'https://edge.sitecorecloud.io/api/graphql/v1';
const apiKey = env.SITECORE_API_KEY || env.NEXT_PUBLIC_SITECORE_API_KEY;

if (!apiKey) {
    console.error('No API Key found');
    process.exit(1);
}

const sitesToCheck = ['cws', 'workwear', 'healthcare', 'cws-website', 'website'];

console.log('Using Endpoint:', endpoint);
console.log('Using API Key:', apiKey.substring(0, 5) + '...');

async function checkSite(siteName) {
    const query = `
    query {
      layout(site: "${siteName}", routePath: "/", language: "en") {
        item {
          rendered
        }
      }
    }
    `;

    return new Promise((resolve) => {
        const req = https.request(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'sc_apikey': apiKey
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    resolve({ siteName, status: 'HTTP Error ' + res.statusCode });
                    return;
                }
                const json = JSON.parse(data);
                if (json.errors) {
                    resolve({ siteName, status: 'GraphQL Error', errors: json.errors[0].message });
                } else if (json.data && json.data.layout) {
                    resolve({ siteName, status: 'OK' });
                } else {
                    resolve({ siteName, status: 'Missing Layout (Site might exist but path / is empty)' });
                }
            });
        });
        req.write(JSON.stringify({ query }));
        req.end();
        req.on('error', (e) => resolve({ siteName, status: 'Network Error: ' + e.message }));
    });
}

(async () => {
    console.log('Checking sites...');
    for (const site of sitesToCheck) {
        const result = await checkSite(site);
        console.log(`Site "${site}": ${result.status} ${result.errors ? '(' + result.errors + ')' : ''}`);
        if (result.errors && result.errors.includes("does not exist")) {
            // Confirming non-existence
        }
    }
})();
