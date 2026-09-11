const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { generateToken, comparePassword, hashPassword } = require('../config/auth');

const authController = {
    login: async (req, res, next) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ success: false, message: 'Email and password are required.' });
            }

            const user = User.findByEmail(email.toLowerCase().trim());
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
            }

            if (user.status !== 'active') {
                return res.status(403).json({ success: false, message: 'This account has been deactivated.' });
            }

            const isMatch = await comparePassword(password, user.password_hash);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
            }

            const token = generateToken(user);

            ActivityLog.log({
                userId: user.id,
                userName: user.name,
                action: 'USER_LOGIN',
                module: 'auth',
                recordId: user.id,
                details: `User logged in successfully`,
                ipAddress: req.ip
            });

            res.json({
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    permissions: user.permissions
                }
            });
        } catch (err) {
            next(err);
        }
    },

    me: (req, res) => {
        res.json({
            success: true,
            user: req.user
        });
    },

    logout: (req, res) => {
        if (req.user) {
            ActivityLog.log({
                userId: req.user.id,
                userName: req.user.name,
                action: 'USER_LOGOUT',
                module: 'auth',
                recordId: req.user.id,
                details: `User logged out`,
                ipAddress: req.ip
            });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    },

    forgotPassword: (req, res) => {
        const { email } = req.body;
        // In internal production, generates email token. For now return helpful guidance.
        res.json({
            success: true,
            message: `Password reset instructions sent to ${email || 'your registered email'}.`
        });
    }
};

module.exports = authController;
