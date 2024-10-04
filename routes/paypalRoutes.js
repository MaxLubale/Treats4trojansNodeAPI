const express = require('express');
const fetch = require('node-fetch');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();
const base = 'https://api-m.paypal.com';

// Function to generate PayPal access token
async function generateAccessToken() {
  const BASE64_ENCODED_CLIENT_ID_AND_SECRET = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${BASE64_ENCODED_CLIENT_ID_AND_SECRET}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'client_credentials' }),
  });

  const json = await response.json();
  return json.access_token;
}

// Function to handle response
async function handleResponse(response) {
  try {
    const jsonResponse = await response.json();
    return {
      jsonResponse,
      httpStatusCode: response.status,
    };
  } catch (err) {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }
}

// Calculate total price based on cart data
const calculateTotal = (cart) => {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
};

// Create order function
const createOrder = async (cart) => {
  const accessToken = await generateAccessToken();
  const url = `${base}/v2/checkout/orders`;

  // Calculate total price based on cart data
  const totalValue = calculateTotal(cart);

  const payload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: 'USD',
          value: totalValue, // Use calculated total value
        },
      },
    ],
  };

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};

// Route to create an order
router.post('/api/orders', async (req, res) => {
  try {
    const { cart } = req.body; // Cart data from the frontend
    const { jsonResponse, httpStatusCode } = await createOrder(cart);
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error('Failed to create order:', error);
    res.status(500).json({ error: 'Failed to create order.' });
  }
});

// Capture order function
const captureOrder = async (orderID) => {
  const accessToken = await generateAccessToken();
  const url = `${base}/v2/checkout/orders/${orderID}/capture`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    method: 'POST',
  });

  return handleResponse(response);
};

// Route to capture the order
router.post('/api/orders/:orderID/capture', async (req, res) => {
  try {
    const { orderID } = req.params;
    const { jsonResponse, httpStatusCode } = await captureOrder(orderID);

    // Check if httpStatusCode is not 200
    if (httpStatusCode !== 200) {
      console.error('Capture order failed:', jsonResponse);
    }

    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error('Failed to capture order:', error);
    res.status(500).json({ error: 'Failed to capture order.' });
  }
});

module.exports = router;