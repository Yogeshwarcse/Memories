const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, authorization denied' });
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'your_temporary_jwt_secret_key';
    const decoded = jwt.verify(token, JWT_SECRET);
    
    req.user = decoded; // The payload (e.g., { id: user._id })
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

module.exports = auth;
