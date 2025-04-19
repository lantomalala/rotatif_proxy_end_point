const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3030;

// Lire le fichier listProxy.txt
const proxyFilePath = path.join(__dirname, 'proxy', 'listProxy.txt');
let proxies = [];

try {
  const data = fs.readFileSync(proxyFilePath, 'utf-8');
  proxies = data
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
} catch (err) {
  console.error('Erreur de lecture du fichier des proxies :', err.message);
}

// Fonction pour récupérer un proxy aléatoire
function getRandomProxy() {
  const index = Math.floor(Math.random() * proxies.length);
  return proxies[index];
}

// Route principale qui retourne un proxy
app.get('/proxy', (req, res) => {
  const proxy = getRandomProxy();
  res.json({ proxy });
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`🚀 API Proxy Rotatif dispo sur http://localhost:${PORT}/proxy`);
});
