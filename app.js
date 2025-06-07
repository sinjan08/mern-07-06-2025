const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const INIT_DATABASE = require('./app/config/database');
const userRoutes = require('./app/routes/user/userRoutes');
const adminRoutes = require('./app/routes/admin/adminRoutes');

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('uploads'));
app.use(cors());

// Import routes
app.use('/api', userRoutes);
app.use('/api/admin', adminRoutes);

// Connect to MongoDB
INIT_DATABASE();
app.listen(process.env.PORT || 5500, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});