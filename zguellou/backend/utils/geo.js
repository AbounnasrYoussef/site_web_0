const https = require('https');

async function getLocationFromIP(ip, locale) {
  const messages = {
    en: {
      local: 'Localhost / Internal Network',
      unknownCity: 'Unknown City',
      unknownCountry: 'Unknown Country',
      unknownLocation: 'Unknown Location',
      apiError: 'Geolocation API error',
    },
    fr: {
      local: 'Hôte local / Réseau interne',
      unknownCity: 'Ville inconnue',
      unknownCountry: 'Pays inconnu',
      unknownLocation: 'Emplacement inconnu',
      apiError: 'Erreur de l’API de géolocalisation',
    },
    ar: {
      local: 'المضيف المحلي / الشبكة الداخلية',
      unknownCity: 'مدينة غير معروفة',
      unknownCountry: 'بلد غير معروف',
      unknownLocation: 'موقع غير معروف',
      apiError: 'خطأ في واجهة برمجة تحديد الموقع',
    },
  };

  const t = messages[locale];

  if ( !ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') ) {
    return t.local;
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
      throw new Error(response.reason || t.apiError);
    }

    const city = response.city || t.unknownCity;
    const country = response.country_name || t.unknownCountry;

    return `${city}, ${country}`;
  } catch (error) {
    return t.unknownLocation;
  }
}


module.exports = { getLocationFromIP };