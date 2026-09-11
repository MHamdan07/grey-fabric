const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, env.JWT_SECRET);

        // Fetch current user with permissions from db
        const user = User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ success: false, message: 'User belonging to this token no longer exists.' });
        }

        if (user.status !== 'active') {
            return res.status(403).json({ success: false, message: 'User account is deactivated.' });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
    }
};

module.exports = authMiddleware;
