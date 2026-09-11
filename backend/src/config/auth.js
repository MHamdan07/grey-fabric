const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const env = require('./env');

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name
        },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
    );
};

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

const comparePassword = async (candidatePassword, hashedPassword) => {
    return bcrypt.compare(candidatePassword, hashedPassword);
};

module.exports = {
    generateToken,
    hashPassword,
    comparePassword
};
