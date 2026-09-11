const express = require('express');
const router = express.Router();
const costingController = require('../controllers/costingController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validateCostingInput } = require('../middleware/validationMiddleware');

// Public or staff calculation endpoint
router.post('/calculate', validateCostingInput, costingController.calculate);

// Authenticated routes
router.use(authMiddleware);

router.get('/kpis', costingController.getKpis);
router.get('/trend', costingController.getTrend);
router.get('/', costingController.getAll);
router.get('/:id', costingController.getById);
router.post('/', validateCostingInput, costingController.create);
router.put('/:id', validateCostingInput, costingController.update);
router.post('/:id/duplicate', costingController.duplicate);

// Delete costing - Admin only
router.delete('/:id', roleMiddleware('admin'), costingController.delete);

module.exports = router;
