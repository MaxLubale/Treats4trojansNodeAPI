const { Sequelize } = require('sequelize');
require('dotenv').config(); // Ensure this is at the top

const sequelize = new Sequelize(process.env.DATABASE_URI, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false, // Disable logging; set to console.log for debugging
  dialectOptions: {
    ssl: {
      require: true, // Depending on Render's requirements
      rejectUnauthorized: false, // May be needed for self-signed certificates
    },
  },
});

module.exports = sequelize;
