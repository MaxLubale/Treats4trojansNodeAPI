const express = require('express');
const router = express.Router();
const PromoCode = require('../models/PromoCode'); // Replace with your model path

// Add a new promo code
router.post('/api/promo-codes', async (req, res) => {
  try {
    const { code, name, discount, expirationDate, isActive } = req.body;
    const newPromoCode = await PromoCode.create({ code, name, discount, expirationDate, isActive });
    res.status(201).json(newPromoCode);
  } catch (error) {
    console.error('Error adding promo code:', error);
    res.status(500).json({ message: 'Failed to add promo code', error });
  }
});

// Fetch all promo codes
router.get('/api/promo-codes', async (req, res) => {
  try {
    const promoCodes = await PromoCode.findAll();
    res.status(200).json(promoCodes);
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    res.status(500).json({ message: 'Failed to fetch promo codes', error });
  }
});

// Fetch a single promo code by ID
router.get('/api/promo-codes/:id', async (req, res) => {
  try {
    const promoCode = await PromoCode.findByPk(req.params.id);
    if (!promoCode) {
      return res.status(404).json({ message: 'Promo code not found' });
    }
    res.status(200).json(promoCode);
  } catch (error) {
    console.error('Error fetching promo code:', error);
    res.status(500).json({ message: 'Failed to fetch promo code', error });
  }
});

// Update a promo code
router.put('/api/promo-codes/:id', async (req, res) => {
  try {
    const { code, name, discount, expirationDate, isActive } = req.body;
    const promoCode = await PromoCode.findByPk(req.params.id);

    if (!promoCode) {
      return res.status(404).json({ message: 'Promo code not found' });
    }

    await promoCode.update({ code, name, discount, expirationDate, isActive });
    res.status(200).json(promoCode);
  } catch (error) {
    console.error('Error updating promo code:', error);
    res.status(500).json({ message: 'Failed to update promo code', error });
  }
});

// Delete a promo code
router.delete('/api/promo-codes/:id', async (req, res) => {
  try {
    const promoCode = await PromoCode.findByPk(req.params.id);
    if (!promoCode) {
      return res.status(404).json({ message: 'Promo code not found' });
    }

    await promoCode.destroy();
    res.status(200).json({ message: 'Promo code deleted successfully' });
  } catch (error) {
    console.error('Error deleting promo code:', error);
    res.status(500).json({ message: 'Failed to delete promo code', error });
  }
});

module.exports = router;
