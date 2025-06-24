// middleware/auth.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret';

function tokenVerificationMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing!' });
  }

  // Expect header of form "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Malformed Authorization header!' });
  }
  const token = parts[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // Make sure payload contains the user’s ID under a known key:
    // e.g. when you signed the token you did jwt.sign({ id: user._id }, …)
    req.user = { _id: payload.id };  
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token!' });
  }
}

module.exports = tokenVerificationMiddleware;
