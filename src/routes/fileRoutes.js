const express = require('express');
const multer = require('multer');
const fileController = require('../controllers/fileController');
const prisma = require('../db');

const router = express.Router();

// Configuration for Multer (Memory Storage to pass buffer to S3)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken); // Protect all file routes

router.post('/upload', upload.single('file'), fileController.uploadFile);
router.get('/list', fileController.listFiles);
router.get('/share/:fileName', fileController.getFileUrl);

// Verify shared access ID
router.get('/shared/verify/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Check if a user with this GoogleID or ID exists (simple verification for now)
        const user = await prisma.user.findFirst({
            where: { 
                OR: [
                    { id: parseInt(id) || undefined }, // Handle numeric ID if using Int
                    { googleId: id }
                ]
            }
        });

        if (user) {
            // Check if they have an S3 config
            const config = await prisma.userConfig.findUnique({ where: { userId: user.id } });
            if (config) {
                 return res.json({ valid: true, ownerId: user.id });
            }
        }
        
        return res.json({ valid: false });
    } catch (error) {
        console.error("Verify error:", error);
        res.status(500).json({ error: "Verification failed" });
    }
});

module.exports = router;
