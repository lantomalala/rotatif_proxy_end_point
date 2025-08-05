const express = require('express');
const fs = require('fs');
const path = require('path');
const { get_proxy } = require('./service/refresh_proxy');
const cron = require('node-cron');

const app = express();
const PORT = 3030;

// ✅ Liste des IPs autorisées
const allowedIps = [
  '44.226.145.213',
  '54.187.200.255',
  '34.213.214.55',
  '35.164.95.156',
  '44.230.95.183',
  '44.229.200.200',
  '154.120.181.147'
];

// ❌ IPs bannies
const bannedIps = ['172.82.67.102'];

// ❌ Domaine interdit
const bannedDomain = 'www.gunbroker.com';

// 🔒 Middleware pour sécuriser les accès
app.use((req, res, next) => {
  const rawIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
  const ip = rawIp.replace('::ffff:', '');

  console.log(`🔍 Tentative d'accès depuis IP : ${ip}`);

  if (!allowedIps.includes(ip)) {
    console.log(`⛔ IP non autorisée : ${ip}`);
    return res.status(403).send('Access denied: Your IP is not allowed.');
  }

  if (bannedIps.includes(ip)) {
    console.log(`⛔ IP bannie : ${ip}`);
    return res.status(403).send('Access denied: Your IP is blocked.');
  }

  const data = JSON.stringify(req.body) + JSON.stringify(req.headers) + JSON.stringify(req.query) + req.originalUrl;
  if (data.includes(bannedDomain)) {
    console.log(`⛔ Domaine interdit détecté : ${bannedDomain}`);
    return res.status(403).send('Access denied: Domain not allowed.');
  }

  next();
});

// 🔽 Fonctions utilitaires
function readProxiesFromFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return data
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  } catch (err) {
    console.error(`Erreur lecture fichier ${filePath} :`, err.message);
    return [];
  }
}

function getRandomProxy(proxyList) {
  if (!proxyList.length) return null;
  const index = Math.floor(Math.random() * proxyList.length);
  return proxyList[index];
}

// 📁 Dossier de proxies
const proxyDir = path.join(__dirname, 'proxy');

const proxyLists = {
  all: readProxiesFromFile(path.join(proxyDir, 'proxies-all.txt')),
  de: readProxiesFromFile(path.join(proxyDir, 'proxies-de.txt')),
  fr: readProxiesFromFile(path.join(proxyDir, 'proxies-fr.txt')),
  gb: readProxiesFromFile(path.join(proxyDir, 'proxies-gb.txt')),
  it: readProxiesFromFile(path.join(proxyDir, 'proxies-it.txt')),
  sg: readProxiesFromFile(path.join(proxyDir, 'proxies-sg.txt')),
  us: readProxiesFromFile(path.join(proxyDir, 'proxies-us.txt')),
};

// 🟢 Endpoint : Proxy random
app.get('/proxy', (req, res) => {
  const proxies = proxyLists['all'];
  const proxy = getRandomProxy(proxies);
  if (!proxy) return res.status(500).json({ error: 'Aucun proxy disponible' });
  res.json({ proxy });
});

// 🟢 Endpoint : Proxy par pays
app.get('/proxy/:country', (req, res) => {
  const country = req.params.country;
  const proxies = proxyLists[country];

  if (!proxies) {
    return res.status(404).json({ error: `Pas de liste de proxy pour "${country}"` });
  }

  const proxy = getRandomProxy(proxies);
  if (!proxy) {
    return res.status(500).json({ error: `Aucun proxy disponible pour "${country}"` });
  }

  res.json({ proxy });
});

// 🔁 Endpoint : Refresh manuel
app.get('/refresh', (req, res) => {
  const countries = ['-', 'de', 'fr', 'gb', 'it', 'sg', 'us'];
  countries.forEach(code => get_proxy(code));
  res.json({ message: '✅ Rafraîchissement lancé pour tous les pays' });
});

// 🕐 CRON - Rafraîchissement automatique (le 20 du mois à minuit)
cron.schedule('0 0 20 * *', () => {
  const countries = ['-', 'de', 'fr', 'gb', 'it', 'sg', 'us'];
  console.log('🕐 CRON: Rafraîchissement automatique des proxys (20 du mois)');
  countries.forEach(code => get_proxy(code));
});

// 🚀 Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 API Proxy Rotatif dispo sur http://localhost:${PORT}/proxy`);
});
