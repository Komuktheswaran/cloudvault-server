const admin = require('firebase-admin');

try {
    // Attempt to load service account from a local file if available
    // Ideally this file should be excluded from git
    const serviceAccount = require('../serviceAccountKey.json'); 
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin initialized with serviceAccountKey.json");
} catch (e) {
    console.warn("Firebase Admin: serviceAccountKey.json not found. Trying default credentials (GOOGLE_APPLICATION_CREDENTIALS) or mock mode.");
    if (admin.apps.length === 0) {
        admin.initializeApp();
    }
}

module.exports = admin;
