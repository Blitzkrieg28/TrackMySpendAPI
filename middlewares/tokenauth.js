const jwt = require('jsonwebtoken');
const JWT_SECRET = 'secret'; // Replace with your actual secret key

const tokenVerificationMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization; // Fetch the Authorization header

    // Check if the header is missing
    if (!authHeader) {
        return res.status(401).send({ message: "Authorization header missing!" });
    }


    try {
        const decoded = jwt.verify(authHeader, JWT_SECRET); // Verify the token
        req.user = decoded; // Attach decoded payload to the request object
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        return res.status(401).send({ message: "Invalid or expired token!" });
    }
};

module.exports = tokenVerificationMiddleware;
