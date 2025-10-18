const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');

// Initialiser Firebase avec la clé privée
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore(); // Firestore instance
const app = express();
app.use(bodyParser.json());

/**
 * ➕ Ajouter un utilisateur
 */
app.post('/users', async (req, res) => {
  try {
    const data = req.body; // { name: "Justin", age: 24 }
    const ref = await db.collection('users').add(data);
    res.json({ id: ref.id, message: 'Utilisateur ajouté ✅' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📖 Récupérer tous les utilisateurs
 */
app.get('/users', async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ✏️ Modifier un utilisateur
 */
app.put('/users/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await db.collection('users').doc(id).update(req.body);
    res.json({ message: 'Utilisateur mis à jour ✅' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ❌ Supprimer un utilisateur
 */
app.delete('/users/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await db.collection('users').doc(id).delete();
    res.json({ message: 'Utilisateur supprimé 🗑️' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('🚀 Serveur sur http://localhost:3000'));
