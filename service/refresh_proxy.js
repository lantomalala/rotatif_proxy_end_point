const fs = require('fs');
const https = require('https');
const path = require('path');

function get_proxy(country = "-") {
    const finalCountry = (country === "-") ? '-' : country;
    const fileLabel = (country === "-") ? 'all' : country;
    const folderPath = path.join(__dirname, '../proxy');
    const filePath = path.join(folderPath, `proxies-${fileLabel}.txt`);
    const URL = `https://proxy.webshare.io/api/v2/proxy/list/download/dqrnyrsszxclxvzpngdfabbpsioyvdpdypfuumwm/${finalCountry}/any/username/direct/-/`;

    // ✅ Crée le dossier s’il n’existe pas
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
    }

    https.get(URL, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            fs.writeFileSync(filePath, data);
            console.log(`✅ Proxy list saved to ${filePath}`);
        });
    }).on('error', err => {
        console.error('❌ Error downloading proxy list:', err);
    });
}

module.exports = { get_proxy };
