const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const authMiddleware = require('../middleware/authMiddleware');
const { requirePermission, requireAnyPermission } = require('../middleware/permissionMiddleware');

// All exports require valid JWT authentication
router.use(authMiddleware);

// Costing exports
router.post('/costings/excel', requirePermission('COSTING_EXPORT'), exportController.exportCostingsExcel);
router.post('/costings/csv', requirePermission('COSTING_EXPORT'), exportController.exportCostingsCsv);

// Production planning export
router.post('/production/excel', requirePermission('PRODUCTION_EXPORT'), exportController.exportProductionExcel);

// Master data exports
router.post('/yarns/excel', requirePermission('YARN_EXPORT'), exportController.exportYarnsExcel);
router.post('/fabrics/excel', requirePermission('FABRIC_EXPORT'), exportController.exportFabricsExcel);
router.post('/charges/excel', requirePermission('CHARGES_EXPORT'), exportController.exportChargesExcel);

// User accounts export (Admin only)
router.post('/users/excel', requirePermission('USER_EXPORT'), exportController.exportUsersExcel);

// Export utilities
router.get('/counts', exportController.getCounts);
router.get('/logs', requireAnyPermission('ACTIVITY_LOG_VIEW', 'REPORT_VIEW'), exportController.getLogs);

module.exports = router;
