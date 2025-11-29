// const express = require('express');
// const router = express.Router();
// // Import the middleware to secure all complaint routes
// const { protect, restrictTo } = require('../middleware/authMiddleware');
// // Import the controller (we will create this next)
// const complaintController = require('../controllers/complaintController'); 

// // === STUDENT SELF-SERVICE (Submission) ===
// // POST /api/v1/complaints
// // Student submits a new complaint/maintenance request
// router.post('/', 
//     protect, 
//     restrictTo('student'), 
//     complaintController.submitComplaint
// );

// // GET /api/v1/complaints/me
// // Student views all their own submitted complaints
// router.get('/me', 
//     protect, 
//     restrictTo('student'), 
//     complaintController.getStudentComplaints
// );

// // === ADMIN/WARDEN/STAFF MANAGEMENT ===

// // GET /api/v1/complaints (Dashboard Overview)
// // Get all complaints for the administrative dashboard
// router.get('/', 
//     protect, 
//     restrictTo('admin', 'warden'), 
//     complaintController.getAllComplaints
// );

// // GET /api/v1/complaints/maintenance (Filtered list for staff)
// // Get only maintenance requests
// router.get('/maintenance', 
//     protect, 
//     restrictTo('admin', 'warden', 'staff'), 
//     complaintController.getMaintenanceRequests
// );

// // PUT /api/v1/complaints/:id/status (Updating status or assigning staff)
// // Access: Warden can assign, Staff/Warden can update status
// router.put('/:id/status', 
//     protect, 
//     restrictTo('admin', 'warden', 'staff'), 
//     complaintController.updateComplaintStatus
// );

// module.exports = router;

const express = require('express');
const router = express.Router();
// Import the middleware to secure all complaint routes
const { protect, restrictTo } = require('../middleware/authMiddleware');
// Import the controller (Path uses ../ to find the controllers folder)
const complaintController = require('../controllers/complaintController'); 

// === STUDENT SELF-SERVICE (Submission) ===
// POST /api/v1/complaints
router.post('/', 
    protect, 
    restrictTo('student'), 
    complaintController.submitComplaint
);

// GET /api/v1/complaints/me
// Student views all their own submitted complaints
router.get('/me', 
    protect, 
    restrictTo('student'), 
    complaintController.getStudentComplaints
);

// === ADMIN/WARDEN/STAFF MANAGEMENT ===

// GET /api/v1/complaints (Dashboard Overview)
router.get('/', 
    protect, 
    restrictTo('admin', 'warden', 'staff'), 
    complaintController.getAllComplaints
);

// GET /api/v1/complaints/maintenance (Filtered list for staff)
router.get('/maintenance', 
    protect, 
    restrictTo('admin', 'warden', 'staff'), 
    complaintController.getMaintenanceRequests
);

// PUT /api/v1/complaints/:id/status (Updating status or assigning staff)
router.put('/:id/status', 
    protect, 
    restrictTo('admin', 'warden', 'staff'), 
    complaintController.updateComplaintStatus
);

module.exports = router;