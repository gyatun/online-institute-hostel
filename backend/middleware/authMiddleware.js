const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const Student = require('../models/Student'); 

// 1. Function to protect routes (checks if a token is present and valid)
const protect = async (req, res, next) => {
    let token;

    // Check if the authorization header exists and starts with 'Bearer'
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header (Format: Bearer <token>)
            token = req.headers.authorization.split(' ')[1];

            // Verify token using the secret key from .env
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Fetch the user data based on the token payload
            // We search both User and Student models based on the role in the token
            if (decoded.role === 'student') {
                req.user = await Student.findById(decoded.id).select('-password');
                req.user.role = 'student'; // Explicitly set role for consistency
            } else {
                // Admin, Warden, Staff
                req.user = await User.findById(decoded.id).select('-password');
            }

            if (!req.user) {
                return res.status(401).json({ message: 'User not found.' });
            }
            
            // Proceed to the next middleware or controller function
            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Not authorized, token failed.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token.' });
    }
};


// 2. Function to restrict access based on user role
const restrictTo = (...roles) => {
    return (req, res, next) => {
        // req.user is set by the 'protect' middleware
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `User role (${req.user.role}) is not authorized to access this route.`
            });
        }
        // If the role is allowed, proceed
        next();
    };
};

module.exports = { protect, restrictTo };