const sequelize = require('../config/database');
const User = require('./Users');
const Admin = require('./Admin');
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const Product = require('./Product');
const Transaction = require('./Transaction');

// Define Associations

// User <-> Cart
User.hasMany(Cart, { foreignKey: 'user_id', as: 'carts' });
Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Cart <-> CartItem
Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'items' });
CartItem.belongsTo(Cart, { foreignKey: 'cart_id', as: 'cart' });

// Product <-> CartItem
Product.hasMany(CartItem, { foreignKey: 'product_id', as: 'cartItems' });
CartItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Export all models and sequelize instance
module.exports = {
  sequelize,
  User,
  Admin,
  Cart,
  CartItem,
  Product,
  Transaction,
};
