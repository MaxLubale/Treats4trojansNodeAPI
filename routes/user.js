// routes/user.js

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User } = require('../models'); // Adjust the path if necessary
const crypto = require('crypto');

const router = express.Router();

// Middleware to authenticate JWT tokens
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expecting 'Bearer TOKEN'

    if (!token) return res.status(401).json({ message: 'Token missing' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user; // Attach user info to request
        next();
    });
};

// Welcome route
router.get('/', (req, res) => {
    res.send('Hello! Welcome to TREATS4TROJANS');
});

// Register user route
router.post(
    '/api/register',
    [
        body('firstname').notEmpty().withMessage('First name is required'),
        body('lastname').notEmpty().withMessage('Last name is required'),
        body('email').isEmail().withMessage('Invalid email format'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Return first validation error
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const { firstname, lastname, email, password, phone, address } = req.body;

        try {
            // Check if user already exists
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ error: 'User with this email already exists' });
            }

            // Generate a random 6-character alphanumeric user ID
            const userId = crypto.randomBytes(3).toString('hex'); // 6 characters

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create new user
            await User.create({
                id: userId,
                firstname,
                lastname,
                email,
                password: hashedPassword,
                phone: phone || null,
                address: address || null,
            });

            res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
            console.error('Error saving user to database:', error);
            res.status(500).json({ error: 'Error saving user to database' });
        }
    }
);

// Login user route
router.post(
    '/api/login',
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
            // Find user by email
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Compare passwords
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Create JWT token
            const accessToken = jwt.sign(
                { email: user.email, id: user.id },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.status(200).json({ access_token: accessToken });
        } catch (error) {
            console.error('Error during user login:', error);
            res.status(500).json({ error: 'Login failed' });
        }
    }
);

// Logout route
router.post('/api/logout', authenticateToken, (req, res) => {
    // Since JWTs are stateless, implement token blacklisting if needed
    // For simplicity, we'll just send a success message
    res.status(200).json({ message: 'Logout successful!' });
});

// Protected route
router.get('/api/protected', authenticateToken, (req, res) => {
    res.status(200).json({ logged_in_as: req.user });
});

// Update user route
router.put(
    '/api/update_user',
    authenticateToken,
    [
        body('email').optional().isEmail().withMessage('Invalid email format'),
        body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Return first validation error
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const { firstname, lastname, email, phone, address, password } = req.body;

        try {
            // Find user by current email
            const user = await User.findOne({ where: { email: req.user.email } });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // If email is being updated, check if new email already exists
            if (email && email !== user.email) {
                const emailExists = await User.findOne({ where: { email } });
                if (emailExists) {
                    return res.status(400).json({ error: 'Email is already in use by another account' });
                }
            }

            // Update user fields
            if (firstname) user.firstname = firstname;
            if (lastname) user.lastname = lastname;
            if (email) user.email = email;
            if (phone !== undefined) user.phone = phone;
            if (address !== undefined) user.address = address;

            // If password is being updated, hash the new password
            if (password) {
                user.password = await bcrypt.hash(password, 10);
            }

            await user.save();

            res.status(200).json({ message: 'User details updated successfully!' });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ error: 'Failed to update user' });
        }
    }
);

module.exports = router;
