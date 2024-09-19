// app.js

const express = require('express');
const app = express();
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const { sequelize } = require('./models'); // Sequelize instance
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

// Load environment variables from .env
dotenv.config();

// Middleware
app.use(express.json());
app.use(morgan('dev')); // HTTP request logger
app.use(helmet()); // Secure HTTP headers
app.use(cors()); // Enable CORS

// Use the user and admin routes
app.use('/', userRoutes);
app.use('/', adminRoutes);

// Default Route (Optional)
app.get('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Start the server after ensuring database connection
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
      await sequelize.authenticate();
      console.log('Database connected successfully.');

      // Sync models
      await sequelize.sync({ alter: true });

      app.listen(PORT, () => {
          console.log(`Server is running on port ${PORT}.`);
      });
  } catch (error) {
      console.error('Unable to connect to the database:', error);
      // Log more details if needed
      console.error('Detailed error:', error.original || error.message || error);
  }
};


startServer();
