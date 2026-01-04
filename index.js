const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*', // Allow all origins (for debugging)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express.json());

const fileRoutes = require('./src/routes/fileRoutes');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const healthRoutes = require('./src/routes/healthRoutes');

app.use('/api/files', fileRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/health', healthRoutes);

app.get('/', (req, res) => {
  res.send('Universal Drive API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
