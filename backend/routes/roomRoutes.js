const express = require('express');
const router = express.Router();
// Import the middleware for securing routes
const { protect, restrictTo } = require('../middleware/authMiddleware');
// Import the controller (we will create this next)
const roomController = require('../controllers/roomController'); 

// === HOSTEL MANAGEMENT ROUTES ===
// POST /api/v1/rooms/hostel   (Create a new hostel block)
// Only Admins can set up new hostels
router.post('/hostel', 
    protect, 
    restrictTo('admin'), 
    roomController.createHostel
);

// GET /api/v1/rooms/hostel   (Get all hostels for dashboard/dropdowns)
// Admins and Wardens need to see all hostels
router.get('/hostel', 
    protect, 
    restrictTo('admin', 'warden'), 
    roomController.getAllHostels
);

// === ROOM MANAGEMENT ROUTES ===
// POST /api/v1/rooms/room   (Create a new room in a hostel)
// Only Admins or Wardens can add rooms
router.post('/room', 
    protect, 
    restrictTo('admin', 'warden'), 
    roomController.createRoom
);

// GET /api/v1/rooms/status   (Get all rooms and occupancy status)
// Used for the Admin/Warden Dashboard overview
router.get('/status', 
    protect, 
    restrictTo('admin', 'warden', 'staff'), 
    roomController.getRoomStatus
);

// GET /api/v1/rooms/:id   (Get details of a single room)
router.get('/:id', 
    protect, 
    restrictTo('admin', 'warden', 'staff'), 
    roomController.getRoomDetails
);

// PUT /api/v1/rooms/:id   (Update room details, like maintenance status)
router.put('/:id', 
    protect, 
    restrictTo('admin', 'warden'), 
    roomController.updateRoom
);


module.exports = router;