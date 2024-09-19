// routes/admin.js

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { Admin, User } = require('../models'); // Adjust the path if necessary
const router = express.Router();

// Middleware to authenticate JWT tokens
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expecting 'Bearer TOKEN'

    if (!token) return res.status(401).json({ message: 'Token missing' });

    jwt.verify(token, process.env.JWT_SECRET, (err, admin) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.admin = admin; // Attach admin info to request
        next();
    });
};

// Route to register admin
router.post(
    '/api/register_admin',
    [
        body('username').notEmpty().withMessage('Username is required'),
        body('email').isEmail().withMessage('Invalid email format'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Return first validation error
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const { username, email, password } = req.body;

        try {
            // Check if email is already in use by a User or Admin
            const existingUser = await User.findOne({ where: { email } });
            const existingAdmin = await Admin.findOne({ where: { email } });

            if (existingUser || existingAdmin) {
                return res.status(400).json({ message: 'Email already in use' });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create new admin
            await Admin.create({
                username,
                email,
                password: hashedPassword,
            });

            res.status(201).json({ message: 'Admin registered successfully!' });
        } catch (error) {
            console.error('Error registering admin:', error);
            res.status(500).json({ error: 'Error registering admin' });
        }
    }
);

// Route to login admin
router.post(
    '/api/login_admin',
    [
        body('email').isEmail().withMessage('Invalid email format'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Return first validation error
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const { email, password } = req.body;

        try {
            // Find admin by email
            const admin = await Admin.findOne({ where: { email } });
            if (!admin) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Compare passwords
            const isMatch = await bcrypt.compare(password, admin.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Create JWT token
            const accessToken = jwt.sign(
                { email: admin.email, id: admin.id },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.status(200).json({ access_token: accessToken });
        } catch (error) {
            console.error('Error during admin login:', error);
            res.status(500).json({ error: 'Login failed' });
        }
    }
);

// Route to get admin details
router.get('/api/admin_details', authenticateToken, async (req, res) => {
    try {
        const adminEmail = req.admin.email;
        const admin = await Admin.findOne({ where: { email: adminEmail } });

        if (admin) {
            return res.status(200).json({ username: admin.username, email: admin.email });
        } else {
            return res.status(404).json({ message: 'Admin not found' });
        }
    } catch (error) {
        console.error('Error fetching admin details:', error);
        res.status(500).json({ error: 'Failed to fetch admin details' });
    }
});

module.exports = router;