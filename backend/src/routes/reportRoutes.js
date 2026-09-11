const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.get('/costings', reportController.getCostingsReport);
router.get('/export', reportController.exportCsv);
router.get('/activity-logs', roleMiddleware('admin'), reportController.getActivityLogs);

module.exports = router;
