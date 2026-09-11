const https = require('https');

async function getLocationFromIP(ip) {
  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return 'Localhost / Internal Network';
  }

  try {
    const url = `https://ipapi.co/${ip}/json/`;
    const response = await new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });

    if (response.error) {
      throw new Error(response.reason || 'Geolocation API error');
    }

    const city = response.city || 'Unknown City';
    const country = response.country_name || 'Unknown Country';
    return `${city}, ${country}`;
  } catch (error) {
    return 'Unknown Location';
  }
}

module.exports = { getLocationFromIP };