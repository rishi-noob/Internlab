const express = require('express');
const { getAllAnnouncements, createAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require auth
router.use(authenticate);

// Any authenticated user can view announcements
router.get('/', getAllAnnouncements);

// Admin-only: create and delete announcements
router.post('/', authorize('ADMIN'), createAnnouncement);
router.delete('/:id', authorize('ADMIN'), deleteAnnouncement);

module.exports = router;
