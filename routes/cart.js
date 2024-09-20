const express = require('express');
const Cart = require('../models/cart');
const CartItem = require('../models/cartItem');
const Product = require('../models/product');

const router = express.Router();

// 1. Fetch all products in the cart (READ)
router.get('/:userId', async (req, res) => {
    try {
        const cart = await Cart.findOne({
            where: { userId: req.params.userId },
            include: {
                model: Product,
                through: { attributes: ['quantity'] }  // Include quantity from CartItem
            }
        });

        if (cart) {
            res.status(200).json(cart);
        } else {
            res.status(404).json({ message: 'Cart not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cart', error });
    }
});

// 2. Add or update a product in the cart (CREATE/UPDATE)
router.post('/:userId', async (req, res) => {
    const { productId, quantity } = req.body;
    try {
        // Find or create the cart for the user
        let cart = await Cart.findOne({ where: { userId: req.params.userId } });
        if (!cart) {
            cart = await Cart.create({ userId: req.params.userId });
        }

        // Check if the product is already in the cart
        let cartItem = await CartItem.findOne({ where: { cartId: cart.id, productId } });

        if (cartItem) {
            // If product is already in the cart, update the quantity
            cartItem.quantity += quantity;
            await cartItem.save();
        } else {
            // If product is not in the cart, add it
            await CartItem.create({ cartId: cart.id, productId, quantity });
        }

        res.status(200).json({ message: 'Product added/updated in cart' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating cart', error });
    }
});

// 3. Remove a product from the cart (DELETE)
router.delete('/:userId/product/:productId', async (req, res) => {
    try {
        const cart = await Cart.findOne({ where: { userId: req.params.userId } });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const cartItem = await CartItem.findOne({ where: { cartId: cart.id, productId: req.params.productId } });
        if (cartItem) {
            await cartItem.destroy();
            res.status(200).json({ message: 'Product removed from cart' });
        } else {
            res.status(404).json({ message: 'Product not found in cart' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error removing product from cart', error });
    }
});

module.exports = router;
