const admin = require('../firebaseAdmin');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied, token missing' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Firebase Token Verification Error:", error.message);
    return res.status(403).json({ error: 'Invalid token', details: error.message });
  }
};

module.exports = authenticateToken;
