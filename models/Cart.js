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
      type: DataTypes.INTEGER,  // Assuming User's id is an integer
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
    timestamps: false,  // Set to true if you want createdAt/updatedAt fields
  }
);


module.exports = Cart;
