/**
 * Granular Permission-Based RBAC Middleware
 * Evaluates individual permissions (e.g. COSTING_EXPORT, YARN_EXPORT).
 * Admin role bypasses granular checks.
 * Staff roles require explicit permission in their user permissions array.
 */

const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please sign in.'
            });
        }

        // Admin role has absolute access
        if (req.user.role === 'admin') {
            return next();
        }

        const userPermissions = Array.isArray(req.user.permissions) ? req.user.permissions : [];

        if (userPermissions.includes(permission)) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: `Access denied. You do not have the required permission (${permission}) to perform this action. Please contact an administrator.`
        });
    };
};

const requireAnyPermission = (...permissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please sign in.'
            });
        }

        if (req.user.role === 'admin') {
            return next();
        }

        const userPermissions = Array.isArray(req.user.permissions) ? req.user.permissions : [];
        const hasMatch = permissions.some(p => userPermissions.includes(p));

        if (hasMatch) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: `Access denied. You do not have permission to access this resource. Required one of: [${permissions.join(', ')}].`
        });
    };
};

module.exports = {
    requirePermission,
    requireAnyPermission
};
