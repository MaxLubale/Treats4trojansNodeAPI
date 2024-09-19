const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./Users');

class Cart extends Model {}

Cart.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true, // Assuming auto-increment
      allowNull: false,
    },
    user_id: {
      type: DataTypes.STRING(6),
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Cart',
    tableName: 'carts',
    timestamps: false,
  }
);

module.exports = Cart;
