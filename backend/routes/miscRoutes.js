
const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
// Assuming the controller is correctly named and placed in ../controllers/
const miscController = require('../controllers/miscController'); 

// === NOTICE MANAGEMENT ROUTES (Communication Entity) ===

// POST /api/v1/misc/notice - Warden/Admin creates a new notice
router.post('/notice', 
    protect, 
    restrictTo('admin', 'warden'), 
    miscController.createNotice
);

// GET /api/v1/misc/notice - Get all notices (for Admin/Warden Dashboard)
router.get('/notice', 
    protect, 
    restrictTo('admin', 'warden'), 
    miscController.getAllNotices
);

// GET /api/v1/misc/notice/student - Student views notices
router.get('/notice/student', 
    protect, 
    restrictTo('student'), 
    miscController.getStudentNotices
);

// PUT /api/v1/misc/notice/:id - Admin/Warden edits a notice
router.put('/notice/:id',
    protect,
    restrictTo('admin', 'warden'),
    miscController.updateNotice
);

// DELETE /api/v1/misc/notice/:id - Admin/Warden deletes a notice
router.delete('/notice/:id',
    protect,
    restrictTo('admin', 'warden'),
    miscController.deleteNotice
);

// === VISITOR MANAGEMENT ROUTES (Visitor Entity) ===

// POST /api/v1/misc/visitor/checkin - Staff/Warden logs a new visitor entry
router.post('/visitor/checkin', 
    protect, 
    restrictTo('admin', 'warden', 'staff'), 
    miscController.checkInVisitor
);

// PUT /api/v1/misc/visitor/:id/checkout - Staff/Warden logs a visitor exit
router.put('/visitor/:id/checkout', 
    protect, 
    restrictTo('admin', 'warden', 'staff'), 
    miscController.checkOutVisitor
);

// GET /api/v1/misc/visitor/log - Get all visitor logs (for security review)
router.get('/visitor/log', 
    protect, 
    restrictTo('admin', 'warden'), 
    miscController.getVisitorLog
);
// --- NEW STUDENT ROUTE ---
// GET /api/v1/misc/visitor/me - Student views their own visitor history
router.get('/visitor/me',
    protect,
    restrictTo('student'),
    miscController.getStudentVisitorLog
);

// --- REDUNDANT ROUTE REMOVED ---

module.exports = router;