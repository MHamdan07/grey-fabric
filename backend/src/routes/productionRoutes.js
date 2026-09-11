const express = require('express');
const router = express.Router();
const productionController = require('../controllers/productionController');
const authMiddleware = require('../middleware/authMiddleware');

// Public or staff calculation endpoints
router.post('/yarn-to-fabric', productionController.calculateYarnToFabric);
router.post('/fabric-to-yarn', productionController.calculateFabricToYarn);
router.get('/summary', productionController.getSummary);

// Production plans management
router.get('/plans', authMiddleware, productionController.getPlans);
router.post('/plans', authMiddleware, productionController.createPlan);
router.get('/plans/:id', authMiddleware, productionController.getPlanById);
router.delete('/plans/:id', authMiddleware, productionController.deletePlan);

module.exports = router;
