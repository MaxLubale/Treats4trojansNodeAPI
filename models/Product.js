const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Product extends Model {}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true, // Auto-incremented ID
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false, // Product name is required
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false, // Category is required
    },
    image: {
      type: DataTypes.STRING(200), // Stores the path of the image (not the actual image)
      allowNull: false, // Image is required
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false, // Price is required
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false, // Quantity defaults to 0 if not provided
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: false, // No timestamps for this model
  }
);

module.exports = Product;
