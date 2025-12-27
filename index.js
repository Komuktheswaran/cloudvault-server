const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const fileRoutes = require('./src/routes/fileRoutes');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');

app.use('/api/files', fileRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.get('/', (req, res) => {
  res.send('Universal Drive API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
