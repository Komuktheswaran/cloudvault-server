const admin = require('firebase-admin');

try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        // Load from Environment Variable (Best for Koyeb/Cloud)
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("Firebase Admin initialized from FIREBASE_SERVICE_ACCOUNT env var");
    } else {
        // Attempt to load service account from a local file if available
        // Ideally this file should be excluded from git
        const serviceAccount = require('../serviceAccountKey.json'); 
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("Firebase Admin initialized with serviceAccountKey.json");
    }
} catch (e) {
    console.warn("Firebase Admin warning: " + e.message);
    if (admin.apps.length === 0) {
        console.log("Attempting default credentials...");
        admin.initializeApp();
    }
}

module.exports = admin;
