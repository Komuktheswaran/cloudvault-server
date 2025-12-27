const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db');

const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const syncUser = async (req, res) => {
  try {
    const { uid, email, name, picture, phone_number } = req.user;
    
    console.log(`Syncing user: uid=${uid}, email=${email}`);

    // Generate a placeholder email if missing, as schema likely requires it
    const finalEmail = email || (phone_number ? `${phone_number}@phone.com` : `${uid}@firebase.com`);
    
    // Use upsert to handle race conditions and ensure idempotency
    // We match on firebaseUid if it exists (unique), OR we need to handle the case where 
    // we match by email but firebaseUid is not yet set.
    // However, Prisma upsert requires a unique where clause. 
    // Since we have two potential unique keys (firebaseUid and email), we'll do:
    // 1. Try to find by firebaseUid first (most reliable for logged in user)
    // 2. If not found, try to find by email
    // 3. If found by email, update it. If not, create new.
    
    // Actually, simpler approach given the error: 
    // The previous error was "Unique constraint failed on firebaseUid".
    // This means the user WITH THIS UID exists.
    // So we can just use upsert on firebaseUid.
    
    user = await prisma.user.upsert({
        where: { firebaseUid: uid },
        update: {
            avatarUrl: picture,
            // Only update email if it's currently a placeholder or empty? 
            // For now, let's keep email consistent with auth provider if provided
            ...(email ? { email } : {}) 
        },
        create: {
            firebaseUid: uid,
            email: finalEmail,
            name: name || (phone_number ? `User ${phone_number}` : 'New User'),
            avatarUrl: picture
        }
    });

    res.json({ user });
  } catch (error) {
    console.error("Sync User Failed:", error);
    res.status(500).json({ error: 'User sync failed', details: error.message });
  }
};

module.exports = {
  syncUser
};
