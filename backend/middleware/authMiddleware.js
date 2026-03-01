// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
const protect = async (req, res, next) => {
    let token;

    // 1. FIRST: Check for token in the 'Authorization' header (standard for Bearer tokens)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract the token from the "Bearer <TOKEN>" string
            token = req.headers.authorization.split(' ')[1];
        } catch (error) {
            console.error('Error parsing Authorization header:', error);
            return res.status(401).json({ message: 'Not authorized, token format invalid' });
        }
    }
    // 2. FALLBACK: If no token found in header, check for token in cookies
    //    This is useful if you also rely on HttpOnly cookies for some parts of your auth.
    if (!token && req.cookies.token) {
        token = req.cookies.token;
    }

    // If still no token is found, return unauthorized
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user associated with the token ID
        // .select('-password') ensures the password hash is not attached to req.user
        req.user = await User.findById(decoded.id).select('-password');
        
        // If user is not found (e.g., user deleted after token issued)
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        // Attach the role from the token to req.user (important for authorizeRoles)
        req.user.role = decoded.role; 

        // If everything is successful, proceed to the next middleware or route handler
        next(); 
    } catch (error) {
        console.error(error); // Log the actual error for debugging server-side
        
        // Provide more specific error messages based on JWT errors
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Not authorized, token expired' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Not authorized, token invalid' });
        } else {
            return res.status(401).json({ message: 'Not authorized, token verification failed' });
        }
    }
};

// Grant access to specific roles (no changes needed here, as it relies on req.user being set by protect)
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: `User role ${req.user ? req.user.role : 'unauthenticated'} is not authorized to access this route` });
        }
        next();
    };
};

module.exports = { protect, authorizeRoles };
