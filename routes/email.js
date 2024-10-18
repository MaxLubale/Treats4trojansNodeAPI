const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
const EmailConfirmation = require('../models/EmailConfirmation');
require('dotenv').config(); // To use environment variables

router.post('/api/send-confirmation', async (req, res) => {
  const { transaction, cart, promoCode, customerName, shippingAddress, colorSelections } = req.body;

  // Customer's email from PayPal transaction
  const customerEmail = transaction.payer.email_address;

  // Create a Nodemailer transporter
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.ADMIN_EMAIL, // Admin email from environment variable
      pass: process.env.ADMIN_PASSWORD, // Admin email password from environment variable
    },
  });

  // Construct email content
  const emailContent = `
    <h2>Order Confirmation</h2>
    <p><strong>Customer Name:</strong> ${customerName}</p>
    <p><strong>Shipping Address:</strong> ${shippingAddress?.address_line_1}, ${shippingAddress?.admin_area_2}, ${shippingAddress?.admin_area_1}, ${shippingAddress?.postal_code}, ${shippingAddress?.country_code}</p>
    <p><strong>Transaction ID:</strong> ${transaction.id}</p>
    <p><strong>Status:</strong> ${transaction.status}</p>
    <h3>Cart Details:</h3>
    <ul>
      ${cart.map(item => `<li>${item.quantity} x ${item.name} - $${item.price}</li>`).join('')}
    </ul>
    <p><strong>Promo Code Applied:</strong> ${promoCode ? promoCode : 'None'}</p>
    <h3>Color Selections:</h3>
    <ul>
      ${Object.entries(colorSelections || {}).map(([key, value]) => `<li>${key}: ${value}</li>`).join('')}
    </ul>
  `;

  // Set up email options for admin and customer
  const mailOptions = {
    from: process.env.ADMIN_EMAIL,
    to: `${process.env.ADMIN_EMAIL}, ${customerEmail}`, // Send email to both admin and customer
    subject: `Order Confirmation - ${transaction.id}`,
    html: emailContent,
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);

    console.log('Email sent successfully');

    // Save email confirmation to the database
    await saveEmailConfirmation(transaction, cart, promoCode, customerName, shippingAddress, colorSelections);

    res.status(200).send({ message: 'Confirmation email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send({ message: 'Failed to send confirmation email', error });
  }
});

const saveEmailConfirmation = async (transaction, cart, promoCode, customerName, shippingAddress, colorSelections) => {
  try {
    await EmailConfirmation.create({
      transaction_id: transaction.id,
      payer_email: transaction.payer.email_address,
      customer_name: customerName,
      shipping_address: shippingAddress,
      cart,
      promo_code: promoCode,
      color_selections: colorSelections,
    });
    console.log('Email confirmation saved successfully');
  } catch (error) {
    console.error('Error saving email confirmation:', error);
  }
};

// Route to fetch all email confirmations
router.get('/api/get-all-confirmations', async (req, res) => {
  try {
    // Fetch all email confirmations from the database
    const emailConfirmations = await EmailConfirmation.find();

    if (!emailConfirmations || emailConfirmations.length === 0) {
      return res.status(404).send({ message: 'No confirmations found' });
    }

    // Send the details back to the frontend
    res.status(200).send(emailConfirmations);
  } catch (error) {
    console.error('Error fetching confirmations:', error);
    res.status(500).send({ message: 'Error fetching confirmations', error });
  }
});


module.exports = router;
