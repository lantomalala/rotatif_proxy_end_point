const express = require('express');
const fs = require('fs');
const path = require('path');
const { get_proxy } = require('./service/refresh_proxy');
const cron = require('node-cron');

const app = express();
const PORT = 3030;

// 🔒 Middleware de blocage IP et domaine
const bannedIps = ['172.82.67.102'];
const bannedDomain = 'www.gunbroker.com';

app.use((req, res, next) => {
  const rawIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
  const ip = rawIp.replace('::ffff:', '');

  // Vérifie l'IP
  if (bannedIps.includes(ip)) {
    console.log(`⛔ IP bannie tentée : ${ip}`);
    return res.status(403).send('Access denied: Your IP is blocked.');
  }

  // Vérifie si le domaine banni est mentionné
  const data = JSON.stringify(req.body) + JSON.stringify(req.headers) + JSON.stringify(req.query) + req.originalUrl;
  if (data.includes(bannedDomain)) {
    console.log(`⛔ Domaine banni détecté dans la requête : ${bannedDomain}`);
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
    console.error(`Erreur de lecture du fichier ${filePath} :`, err.message);
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

// 🟢 Endpoints
app.get('/proxy', (req, res) => {
  const proxies = proxyLists['all'];
  const proxy = getRandomProxy(proxies);
  if (!proxy) return res.status(500).json({ error: 'Aucun proxy disponible' });
  res.json({ proxy });
});

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

app.get('/refresh', (req, res) => {
  const countries = ['-', 'de', 'fr', 'gb', 'it', 'sg', 'us'];
  countries.forEach(code => get_proxy(code));
  res.json({ message: '✅ Rafraîchissement lancé pour tous les pays' });
});

// 🕐 CRON - Rafraîchir les proxys tous les 20 du mois à 00h00
cron.schedule('0 0 20 * *', () => {
  const countries = ['-', 'de', 'fr', 'gb', 'it', 'sg', 'us'];
  console.log('🕐 CRON: Rafraîchissement automatique des proxys (20 du mois)');
  countries.forEach(code => get_proxy(code));
});

// 🚀 Lancement du serveur
app.listen(PORT, () => {
  console.log(`🚀 API Proxy Rotatif dispo sur http://localhost:${PORT}/proxy`);
});
