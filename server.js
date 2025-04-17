const express = require('express');
const app = express();
const PORT = 3030;

// Liste des proxies
const proxies = [
  "38.153.152.244:9594:doodscsw:1j6h9o9j4r51",
  "86.38.234.176:6630:doodscsw:1j6h9o9j4r51",
  "173.211.0.148:6641:doodscsw:1j6h9o9j4r51",
  "161.123.152.115:6360:doodscsw:1j6h9o9j4r51",
  "216.10.27.159:6837:doodscsw:1j6h9o9j4r51",
  "154.36.110.199:6853:doodscsw:1j6h9o9j4r51",
  "45.151.162.198:6600:doodscsw:1j6h9o9j4r51",
  "185.199.229.156:7492:doodscsw:1j6h9o9j4r51",
  "185.199.228.220:7300:doodscsw:1j6h9o9j4r51",
  "185.199.231.45:8382:doodscsw:1j6h9o9j4r51"
];

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
