const express = require('express');
const router = express.Router();
const chargesController = require('../controllers/chargesController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.get('/', chargesController.getAll);
router.get('/:id', chargesController.getById);

// Admin management
router.post('/', roleMiddleware('admin'), chargesController.create);
router.put('/:id', roleMiddleware('admin'), chargesController.update);
router.delete('/:id', roleMiddleware('admin'), chargesController.delete);

module.exports = router;
