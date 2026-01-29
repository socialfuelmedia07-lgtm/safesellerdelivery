const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Seller = require('../models/Seller');
const DeliveryPartner = require('../models/DeliveryPartner');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// GET model based on role
const getModel = (role) => {
    return role === 'seller' ? Seller : DeliveryPartner;
};

// Check User existence
router.post('/check-user', async (req, res) => {
    try {
        const { identifier, role } = req.body;
        const Model = getModel(role);

        const user = await Model.findOne({
            $or: [{ email: identifier }, { phone: identifier }]
        });

        res.json({ exists: !!user });
    } catch (error) {
        console.error('Check user error:', error);
        res.status(500).json({ message: 'Server error during user check' });
    }
});

// Signup Route
router.post('/signup', async (req, res) => {
    try {
        const { name, email, phone, password, role, location } = req.body;
        const Model = getModel(role);

        // Check if user exists
        const query = [];
        if (email) query.push({ email });
        if (phone) query.push({ phone });

        if (query.length > 0) {
            const existingUser = await Model.findOne({ $or: query });
            if (existingUser) {
                return res.status(400).json({ message: 'Account already exists with this email or phone' });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = new Model({
            name,
            email: email || undefined,
            phone: phone || undefined,
            password: hashedPassword,
            location: role === 'seller' ? location : undefined,
            role
        });

        await user.save();

        // Create token
        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({
            token,
            user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error during signup' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { identifier, password, role } = req.body; // identifier can be email or phone
        const Model = getModel(role);

        // Find user by email or phone
        const user = await Model.findOne({
            $or: [{ email: identifier }, { phone: identifier }]
        });

        if (!user) {
            return res.status(400).json({ message: 'User not found. Please sign up first.' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect password' });
        }

        // Create token
        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

module.exports = router;
