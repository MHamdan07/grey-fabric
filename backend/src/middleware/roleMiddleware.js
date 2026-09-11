/**
 * Role-based authorization middleware
 * Admin has complete management privileges
 * Staff has operational and calculation privileges
 */
const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Action requires one of: [${allowedRoles.join(', ')}] role.`
            });
        }

        next;
        next();
    };
};

module.exports = roleMiddleware;
