// models/CartItem.js

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust the path to your database connection

class CartItem extends Model {}

CartItem.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cart_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'carts', // Name of the Cart model
      key: 'id', // Primary key in the Cart model
    },
    onDelete: 'CASCADE', // Optionally cascade delete
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products', // Name of the Product model
      key: 'id', // Primary key in the Product model
    },
    onDelete: 'CASCADE', // Optionally cascade delete
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  }
}, {
  sequelize, // Passing the `sequelize` instance (database connection)
  modelName: 'CartItem', // Name of this model
  tableName: 'cart_items', // Optional: define the table name explicitly
  timestamps: false, // Disable timestamps (createdAt, updatedAt) if not needed
});

module.exports = CartItem;
