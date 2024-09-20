const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Extract token from Authorization header

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify JWT with secret key
    req.user = decoded;
    next(); // Pass to the next middleware/route handler
  } catch (ex) {
    return res.status(400).json({ message: 'Invalid token' });
  }
};

module.exports = { authenticateJWT };
