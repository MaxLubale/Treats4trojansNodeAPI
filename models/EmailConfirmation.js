const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class EmailConfirmation extends Model {}

EmailConfirmation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    transaction_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    payer_email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    customer_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    shipping_address: {
      type: DataTypes.JSONB, // Store the shipping address as JSON
      allowNull: false,
    },
    cart: {
      type: DataTypes.JSONB, // Store the cart as JSON
      allowNull: false,
    },
    promo_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    color_selections: {
      type: DataTypes.JSONB, // Store the color selections as JSON
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'EmailConfirmation',
    tableName: 'email_confirmations',
    timestamps: false,
  }
);

module.exports = EmailConfirmation;
