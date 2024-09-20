const express = require('express');
const router = express.Router();
const { Cart, CartItem, Product, User } = require('../models');  // Assuming models are defined with Sequelize
const { authenticateJWT } = require('../middleware/auth');  // JWT authentication middleware

// Route to fetch cart items
router.get('/api/cart', authenticateJWT, async (req, res) => {
  try {
    const currentUser = req.user;  // JWT payload contains user information
    const email = currentUser.email;

    if (!email) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await User.findOne({ where: { email }, include: Cart });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const cart = user.Carts[0];  // Assuming user has one cart
    if (!cart) {
      return res.status(200).json([]);  // Return empty array if no cart
    }

    const cartItems = await CartItem.findAll({ where: { cart_id: cart.id }, include: Product });
    if (cartItems.length === 0) {
      return res.status(200).json([]);  // Return empty array if no items
    }

    const result = cartItems.map(item => ({
      product_id: item.Product.id,
      name: item.Product.name,
      price: item.Product.price,
      quantity: item.quantity
    }));

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving cart items' });
  }
});

// Route to update cart item quantity
router.post('/api/cart/update', authenticateJWT, async (req, res) => {
  const { product_id, quantity } = req.body;

  try {
    const currentUser = req.user;
    const user = await User.findOne({ where: { email: currentUser.email }, include: Cart });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const cartItem = await CartItem.findOne({ where: { cart_id: user.Carts[0].id, product_id } });
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    return res.status(200).json({ message: 'Cart item updated successfully!' });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating cart item' });
  }
});

// Route to remove a cart item
router.delete('/api/cart/remove', authenticateJWT, async (req, res) => {
  const { product_id } = req.body;

  try {
    const currentUser = req.user;
    const user = await User.findOne({ where: { email: currentUser.email }, include: Cart });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const cartItem = await CartItem.findOne({ where: { cart_id: user.Carts[0].id, product_id } });
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    await cartItem.destroy();
    return res.status(200).json({ message: 'Cart item removed successfully!' });
  } catch (error) {
    return res.status(500).json({ message: 'Error removing cart item' });
  }
});

// Helper function to calculate the total amount for a user's cart
const getUserCart = async (user_id) => {
  try {
    const user = await User.findOne({ where: { id: user_id }, include: Cart });
    if (!user) {
      return { message: 'User not found', status: 404 };
    }

    const cart = await Cart.findOne({ where: { user_id: user.id }, include: CartItem });
    if (!cart) {
      return { message: 'Cart not found', status: 404 };
    }

    const cartItems = await CartItem.findAll({ where: { cart_id: cart.id }, include: Product });
    if (cartItems.length === 0) {
      return { message: 'No items in the cart', status: 404 };
    }

    let totalAmount = 0.0;
    for (const item of cartItems) {
      const product = await Product.findByPk(item.product_id);
      if (product) {
        totalAmount += product.price * item.quantity;
      } else {
        return { message: `Product with ID ${item.product_id} not found`, status: 404 };
      }
    }

    return { totalAmount, status: 200 };
  } catch (error) {
    return { message: 'Error retrieving cart items', status: 500 };
  }
};

module.exports = router;
