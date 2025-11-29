const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const studentController = require('../controllers/studentController'); 

// === ADMIN/WARDEN MANAGEMENT ROUTES ===
// POST /api/v1/students/allot - Assigns a room to a registered student
// Access: Warden, Admin
router.post('/allot', 
    protect, 
    restrictTo('admin', 'warden'), 
    studentController.allotRoom
);

// GET /api/v1/students/unallotted - Gets list of students waiting for a room
// Access: Warden, Admin
router.get('/unallotted', 
    protect, 
    restrictTo('admin', 'warden'), 
    studentController.getUnallottedStudents
);

// GET /api/v1/students - Get all student profiles (for administration)
// Access: Admin
router.get('/', 
    protect, 
    restrictTo('admin', 'warden', 'staff'),
    studentController.getAllStudents
);

// PUT /api/v1/students/:id - Update student profile details (e.g., course, contact)
// Access: Admin, Warden
router.put('/:id', 
    protect, 
    restrictTo('admin', 'warden'), 
    studentController.updateStudentProfile
);

// === STUDENT SELF-SERVICE ROUTES ===
// GET /api/v1/students/me - Student views their own profile (room details, etc.)
// Access: Student
router.get('/me', 
    protect, 
    restrictTo('student'), 
    studentController.getStudentProfile
);


module.exports = router;