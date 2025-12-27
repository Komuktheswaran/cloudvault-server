const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    // Perform a simple query to check DB connection
    // We'll just count users or check a raw query
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({ 
      status: 'ok', 
      message: 'Application is running', 
      database: 'connected', 
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Application is running but Database connection failed', 
      database: 'disconnected', 
      error: error.message 
    });
  }
});

module.exports = router;
