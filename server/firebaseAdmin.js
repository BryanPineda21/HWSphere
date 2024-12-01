require('dotenv').config(); // Load environment variables from .env file
const admin = require("firebase-admin");
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


module.exports = admin; // Export the Firebase Admin module for use in server.js





