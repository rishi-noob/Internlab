const express = require('express');
const { getAllResources, createResource, deleteResource } = require('../controllers/resourceController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require auth
router.use(authenticate);

// Any authenticated user can view resources
router.get('/', getAllResources);

// Admin-only: create and delete resources
router.post('/', authorize('ADMIN'), createResource);
router.delete('/:id', authorize('ADMIN'), deleteResource);

module.exports = router;
