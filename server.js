const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3030;

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

// Dossier contenant les fichiers de proxy
const proxyDir = path.join(__dirname, 'proxy');

// Chargement des fichiers de proxies
const proxyLists = {
  all: readProxiesFromFile(path.join(proxyDir, 'listProxy_all.txt')),
  de: readProxiesFromFile(path.join(proxyDir, 'listProxy_de.txt')),
  fr: readProxiesFromFile(path.join(proxyDir, 'listProxy_fr.txt')),
  gb: readProxiesFromFile(path.join(proxyDir, 'listProxy_gb.txt')),
  gratuit: readProxiesFromFile(path.join(proxyDir, 'listProxy_gratuit.txt')),
  it: readProxiesFromFile(path.join(proxyDir, 'listProxy_it.txt')),
  sg: readProxiesFromFile(path.join(proxyDir, 'listProxy_sg.txt')),
  us: readProxiesFromFile(path.join(proxyDir, 'listProxy_us.txt')),
};


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

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`🚀 API Proxy Rotatif dispo sur http://localhost:${PORT}/proxy`);
});
