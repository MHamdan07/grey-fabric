const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { hashPassword } = require('../config/auth');

const userController = {
    getAll: (req, res, next) => {
        try {
            const list = User.getAll();
            res.json({ success: true, count: list.length, data: list });
        } catch (err) {
            next(err);
        }
    },

    getPermissionsList: (req, res) => {
        res.json({
            success: true,
            allPermissions: User.ALL_PERMISSIONS,
            defaultStaffPermissions: User.DEFAULT_STAFF_PERMISSIONS
        });
    },

    create: async (req, res, next) => {
        try {
            const { name, email, password, role, status, permissions } = req.body;
            if (!name || !email || !password) {
                return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
            }

            const existing = User.findByEmail(email.toLowerCase().trim());
            if (existing) {
                return res.status(400).json({ success: false, message: 'User with this email already exists.' });
            }

            const password_hash = await hashPassword(password);
            const user = User.create({
                name,
                email: email.toLowerCase().trim(),
                password_hash,
                role: role || 'staff',
                status: status || 'active',
                permissions: permissions || (role === 'admin' ? User.ALL_PERMISSIONS : User.DEFAULT_STAFF_PERMISSIONS)
            });

            ActivityLog.log({
                userId: req.user?.id,
                userName: req.user?.name,
                action: 'CREATE_USER',
                module: 'users',
                recordId: user.id,
                details: `Created user ${user.email} (${user.role})`,
                ipAddress: req.ip
            });

            res.status(201).json({ success: true, message: 'User created successfully', data: user });
        } catch (err) {
            next(err);
        }
    },

    update: (req, res, next) => {
        try {
            const existing = User.findById(req.params.id);
            if (!existing) return res.status(404).json({ success: false, message: 'User not found' });

            const updated = User.update(req.params.id, {
                name: req.body.name,
                role: req.body.role,
                status: req.body.status,
                permissions: req.body.permissions
            });

            ActivityLog.log({
                userId: req.user?.id,
                userName: req.user?.name,
                action: 'UPDATE_USER',
                module: 'users',
                recordId: req.params.id,
                details: `Updated user ${updated.email} role=${updated.role}, status=${updated.status}`,
                ipAddress: req.ip
            });

            res.json({ success: true, message: 'User updated successfully', data: updated });
        } catch (err) {
            next(err);
        }
    },

    delete: (req, res, next) => {
        try {
            if (parseInt(req.params.id, 10) === req.user.id) {
                return res.status(400).json({ success: false, message: 'Cannot delete your own active account.' });
            }

            User.delete(req.params.id);

            ActivityLog.log({
                userId: req.user?.id,
                userName: req.user?.name,
                action: 'DELETE_USER',
                module: 'users',
                recordId: req.params.id,
                details: `Deleted user ID ${req.params.id}`,
                ipAddress: req.ip
            });

            res.json({ success: true, message: 'User removed successfully' });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = userController;
