// backend/routes/attendanceRoutes.js (UPGRADED ROUTES)
const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const attendanceController = require('../controllers/attendanceController'); 

// POST /api/v1/attendance/checkout - Staff/Warden checks a student OUT
router.post('/checkout', 
    protect, 
    restrictTo('admin', 'warden', 'staff'), 
    attendanceController.checkOutStudent
);

// PUT /api/v1/attendance/checkin/:id - Staff/Warden checks a student IN (updates the log)
router.put('/checkin/:id', 
    protect, 
    restrictTo('admin', 'warden', 'staff'), 
    attendanceController.checkInStudent
);

// GET /api/v1/attendance/log - Admin/Warden views all leave logs
router.get('/log', 
    protect, 
    restrictTo('admin', 'warden', 'staff'), 
    attendanceController.getAttendanceLog
);

// GET /api/v1/attendance/me - Student views their personal leave history
router.get('/me', 
    protect, 
    restrictTo('student'), 
    attendanceController.getStudentAttendance
);

module.exports = router;