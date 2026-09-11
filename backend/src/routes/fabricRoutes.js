const express = require('express');
const router = express.Router();
const fabricController = require('../controllers/fabricController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.get('/', fabricController.getAll);
router.get('/:id', fabricController.getById);

// Admin management
router.post('/', roleMiddleware('admin'), fabricController.create);
router.put('/:id', roleMiddleware('admin'), fabricController.update);
router.delete('/:id', roleMiddleware('admin'), fabricController.delete);

module.exports = router;
