const express = require('express');
const router = express.Router();
const yarnController = require('../controllers/yarnController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.get('/', yarnController.getAll);
router.get('/:id', yarnController.getById);

// Admin management
router.post('/', roleMiddleware('admin'), yarnController.create);
router.put('/:id', roleMiddleware('admin'), yarnController.update);
router.delete('/:id', roleMiddleware('admin'), yarnController.delete);

module.exports = router;
