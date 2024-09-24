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

    const user = await User.findOne({
      where: { email },
      include: [{ model: Cart, as: 'Carts' }]  // Specify the alias for Carts
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const cart = user.Carts[0];  // Assuming user has one cart

    if (!cart) {
      return res.status(200).json([]);  // Return empty array if no cart
    }

    const cartItems = await CartItem.findAll({
      where: { cart_id: cart.id },
      include: [{ model: Product, as: 'product' }]  // Use the correct alias for Product
    });

    if (cartItems.length === 0) {
      return res.status(200).json([]);  // Return empty array if no items
    }

    const result = cartItems.map(item => ({
      product_id: item.product.id,  // Accessing product using the correct alias
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.image

    }));

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error retrieving cart items:', error);  // Log the error for debugging
    return res.status(500).json({ message: 'Error retrieving cart items' });
  }
});



// Route to add items to cart
router.post('/api/cart', authenticateJWT, async (req, res) => {
  const { product_id, quantity } = req.body;
  const currentUser = req.user;

  try {
    const user = await User.findOne({
      where: { email: currentUser.email },
      include: [{ model: Cart, as: 'Carts' }],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const product = await Product.findByPk(Number(product_id));
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart_id = user.Carts.length > 0 ? user.Carts[0].id : null;

    if (!cart_id) {
      const newCart = await Cart.create({ user_id: user.id });
      cart_id = newCart.id;
    }

    // Check if the product is already in the cart
    const existingCartItem = await CartItem.findOne({
      where: { cart_id, product_id },
    });

    if (existingCartItem) {
      return res.status(400).json({ message: 'Item already in cart' });
    }

    // Add new item to the cart
    const newCartItem = {
      cart_id,
      product_id,
      quantity: quantity || 1,
    };

    await CartItem.create(newCartItem);

    return res.status(201).json({ message: 'Item added to cart successfully!' });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return res.status(500).json({ message: 'Failed to add item to cart' });
  }
});




// Route to update cart item quantity
router.post('/api/cart/update', authenticateJWT, async (req, res) => {
  const { product_id, quantity } = req.body;

  // Validate input
  if (!product_id || quantity == null || quantity < 1) {
    return res.status(400).json({ message: 'Invalid product ID or quantity' });
  }

  try {
    const currentUser = req.user;
    const user = await User.findOne({
      where: { email: currentUser.email },
      include: { model: Cart, as: 'Carts' }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const cart = user.Carts[0];
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found for this user' });
    }

    const cartItem = await CartItem.findOne({
      where: { cart_id: cart.id, product_id },
      include: { model: Product, as: 'product' }
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Update quantity
    cartItem.quantity = quantity;
    await cartItem.save();

    return res.status(200).json({ message: 'Cart item updated successfully!', cartItem });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return res.status(500).json({ message: 'Error updating cart item' });
  }
});


// Route to remove a cart item
router.delete('/api/cart/remove', authenticateJWT, async (req, res) => {
  const { product_id } = req.body;

  // Validate input
  if (!product_id) {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  try {
    const currentUser = req.user;
    const user = await User.findOne({
      where: { email: currentUser.email },
      include: { model: Cart, as: 'Carts' }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const cart = user.Carts[0];
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found for this user' });
    }

    const cartItem = await CartItem.findOne({
      where: { cart_id: cart.id, product_id },
      include: { model: Product, as: 'product' }
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    await cartItem.destroy();
    return res.status(200).json({ message: 'Cart item removed successfully!' });
  } catch (error) {
    console.error('Error removing cart item:', error);
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
