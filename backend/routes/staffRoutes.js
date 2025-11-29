const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
// We will create this controller next
const staffController = require('../controllers/staffController');

// All routes in this file are for Admins only
router.use(protect, restrictTo('admin'));

// GET /api/v1/staff - Get all staff members
router.route('/')
    .get(staffController.getAllStaff)
    .post(staffController.createStaff); // POST /api/v1/staff - Create new staff

// GET /api/v1/staff/:id - Get single staff member (for editing)
// PUT /api/v1/staff/:id - Update staff member
// DELETE /api/v1/staff/:id - Delete staff member
router.route('/:id')
    .get(staffController.getStaffById)
    .put(staffController.updateStaff)
    .delete(staffController.deleteStaff);

module.exports = router;