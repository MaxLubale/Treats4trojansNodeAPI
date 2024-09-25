const express = require('express');
const router = express.Router();
const { Product, CartItem } = require('../models');  // Assuming Product and CartItem models are defined in Sequelize
const jwt = require('jsonwebtoken');  // JWT for authentication
const { authenticateJWT } = require('../middleware/auth');  // JWT authentication middleware
const multer = require('multer');
const path = require('path');
const upload = require('./upload'); 

// Fetch all products
router.get('/api/products', async (req, res) => {
  try {
    const products = await Product.findAll();
    const result = products.map(product => ({
      id: product.id,
      name: product.name,
      category: product.category,
      image: product.image,
      price: product.price,
      quantity: product.quantity,
    }));

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ message: 'Failed to fetch products', error });
  }
});

// Add a new product (Requires JWT authentication)
// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory to save images
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // Unique filename
  },
});

// File filter to accept only certain types of files (like images)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images are allowed'));
  }
};

// Apply the storage and file filter configurations to multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB
});

// Add a new product (Requires JWT authentication)
router.post('/api/products', authenticateJWT, upload.single('image'), async (req, res) => {
  const { name, category, price, quantity } = req.body;

  if (!name || !category || !price || !req.file) {
    return res.status(400).json({ message: 'All fields are required, including the image' });
  }

  try {
    const imagePath = req.file.path; // Access the file path where the image is stored

    const newProduct = await Product.create({
      name,
      category,
      image: imagePath, // Store the file path in the database
      price: parseFloat(price),  // Convert price to float
      quantity: quantity || 0,   // Default to 0 if quantity is not provided
    });

    return res.status(201).json({ message: 'Product added successfully!', product: newProduct });
  } catch (error) {
    console.error('Error adding product:', error);
    return res.status(500).json({ message: 'Failed to add product', error });
  }
});



// Update product details (Requires JWT authentication)
router.put('/api/update_product/:product_id', authenticateJWT, async (req, res) => {
  const { product_id } = req.params;
  const { name, category, price, image, quantity } = req.body;

  try {
    const product = await Product.findByPk(product_id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (name) product.name = name;
    if (category) product.category = category;
    if (price) {
      try {
        product.price = parseFloat(price);  // Convert price to float
      } catch (error) {
        return res.status(400).json({ message: 'Invalid price format' });
      }
    }
    if (image) product.image = image;
    if (quantity) product.quantity = quantity;

    await product.save();
    return res.status(200).json({ message: 'Product details updated successfully!', product });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ message: 'Failed to update product', error });
  }
});

// Delete a product (Requires JWT authentication)
router.delete('/api/delete_product/:product_id', authenticateJWT, async (req, res) => {
  const { product_id } = req.params;

  try {
    const product = await Product.findByPk(product_id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete associated cart items
    const cartItems = await CartItem.findAll({ where: { product_id } });
    for (const item of cartItems) {
      await item.destroy();
    }

    await product.destroy();
    return res.status(200).json({ message: 'Product deleted successfully!' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ message: 'Failed to delete product', error });
  }
});

module.exports = router;
