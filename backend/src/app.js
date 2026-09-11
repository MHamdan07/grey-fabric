const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const errorHandler = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const costingRoutes = require('./routes/costingRoutes');
const productionRoutes = require('./routes/productionRoutes');
const yarnRoutes = require('./routes/yarnRoutes');
const fabricRoutes = require('./routes/fabricRoutes');
const chargesRoutes = require('./routes/chargesRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');
const exportRoutes = require('./routes/exportRoutes');

const app = express();

// Middlewares
app.use(cors({
    origin: '*', // Allow frontend dev server and production origin
    credentials: true,
    exposedHeaders: ['Content-Disposition']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Healthcheck
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Grey Fabric Costing API', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/costings', costingRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/yarns', yarnRoutes);
app.use('/api/fabrics', fabricRoutes);
app.use('/api/charges', chargesRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exports', exportRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` });
});

// Global Error Handler
app.use(errorHandler);

// Start server if executed directly
if (require.main === module) {
    const PORT = env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`=========================================`);
        console.log(` Grey Fabric Costing API Server Running`);
        console.log(` Port: ${PORT}`);
        console.log(` Environment: ${env.NODE_ENV}`);
        console.log(` Calculation Engine: Online`);
        console.log(`=========================================`);
    });
}

module.exports = app;
