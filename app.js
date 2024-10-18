const express = require('express');
const app = express();
const userRoutes = require('./routes/user');  // User routes
const adminRoutes = require('./routes/admin');  // Admin routes
const promoRoutes = require('./routes/promoCode');  // Promo code routes
const cartRoutes = require('./routes/cart');
const productRoutes = require('./routes/Product');
const { sequelize } = require('./models'); // Sequelize instance
const paypalRoutes = require('./routes/paypalRoutes')
const emailRoutes = require('./routes/email')
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const cors = require('cors');

// Enable CORS
app.use(cors());
app.use(express.static("client"));
// Load environment variables from .env
dotenv.config();

// Middleware
app.use(express.json());
app.use(morgan('dev')); // HTTP request logger
app.use(helmet()); // Secure HTTP headers




// Use the user, admin, and promo routes
app.use('/', userRoutes);
app.use('/', adminRoutes);
app.use('/', promoRoutes); // Promo code routes
app.use('/', cartRoutes)
app.use('/', productRoutes)
app.use('/', paypalRoutes);
app.use('/', emailRoutes);



// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Start the server after ensuring database connection
const PORT = process.env.PORT || 8000;

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
    console.error('Detailed error:', error.original || error.message || error);
  }
};

startServer();