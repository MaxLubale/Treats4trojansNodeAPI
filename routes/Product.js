const express = require('express');
const Product = require('../models/product');  // Import Product model

// Create a router
const router = express.Router();

// 1. Add a new product (CREATE)
router.post('/', async (req, res) => {
    try {
        const { name, category, image, price, quantity } = req.body;
        const newProduct = await Product.create({ name, category, image, price, quantity });
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: 'Error adding product', error });
    }
});

// 2. Fetch all products (READ)
router.get('/', async (req, res) => {
    try {
        const products = await Product.findAll();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error });
    }
});

// 3. Fetch a product by ID (READ)
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error });
    }
});

// 4. Update a product (UPDATE)
router.put('/:id', async (req, res) => {
    try {
        const { name, category, image, price, quantity } = req.body;
        const product = await Product.findByPk(req.params.id);

        if (product) {
            product.name = name;
            product.category = category;
            product.image = image;
            product.price = price;
            product.quantity = quantity;
            await product.save();
            res.status(200).json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error });
    }
});

// 5. Delete a product (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (product) {
            await product.destroy();
            res.status(200).json({ message: 'Product deleted successfully' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error });
    }
});

module.exports = router;
