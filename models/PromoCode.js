const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Replace with your actual sequelize instance

const PromoCode = sequelize.define('PromoCode', {
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true, // Ensure promo code is unique
    validate: {
      notEmpty: true,
    },
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false, // Endorser name is required
    validate: {
      notEmpty: true,
    },
  },
  discount: {
    type: DataTypes.FLOAT,
    allowNull: false, // Discount is required
    defaultValue: 10, // Default percentage is 10%
    validate: {
      min: 0,
      max: 100, // Assuming discount is a percentage
    },
  },
  expirationDate: {
    type: DataTypes.DATE,
    allowNull: true, // Optional field
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true, // Promo code is active by default
  },
}, {
  tableName: 'promo_codes',
  timestamps: true, // Adds createdAt and updatedAt fields
});

module.exports = PromoCode;
