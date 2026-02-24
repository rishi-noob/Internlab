const express = require('express');
const { getAllInterns, getInternById, getAdminStats } = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require auth + admin role
router.use(authenticate, authorize('ADMIN'));

router.get('/interns', getAllInterns);
router.get('/interns/:id', getInternById);
router.get('/stats', getAdminStats);

module.exports = router;
