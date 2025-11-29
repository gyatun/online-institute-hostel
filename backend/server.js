// backend/server.js (FINAL AND COMPLETE CODE)

// 1. Load Environment Variables and Dependencies
require('dotenv').config(); 
const express = require('express');

const cors =require('cors');

// --- DATABASE AND ROUTES IMPORTS ---
// All necessary files for the complete system:
const connectDB = require('./config/db'); 
const authRoutes = require('./routes/authRoutes');      // Authentication (Login/Register)
const roomRoutes = require('./routes/roomRoutes');      // Room and Hostel Management
const studentRoutes = require('./routes/studentRoutes'); // Student Profile & Allotment
const complaintRoutes = require('./routes/complaintRoutes'); // Complaints and Maintenance
const feesRoutes = require('./routes/feesRoutes');      // Fees and Billing
const miscRoutes = require('./routes/miscRoutes');      // Notice and Visitor Management
const attendanceRoutes = require('./routes/attendanceRoutes'); // Attendance Tracking
const staffRoutes = require('./routes/staffRoutes');
// --- Initial Setup ---
// 2. Database Connection 
connectDB(); 

const app = express();
// use cors
app.use(cors({
    origin:'*',
    withCredentials: true
}))

// 3. Middleware for Request Handling
// Allows the server to accept JSON data from frontend fetch requests
app.use(express.json()); 

// Allows the server to accept standard URL-encoded form data
app.use(express.urlencoded({ extended: false }));

// 4. Define API Routes (Wiring up all modules)

// Base URL: /api/v1/auth
app.use('/api/v1/auth', authRoutes);

// Base URL: /api/v1/rooms
app.use('/api/v1/rooms', roomRoutes); 

// Base URL: /api/v1/students
app.use('/api/v1/students', studentRoutes); 

// Base URL: /api/v1/complaints
app.use('/api/v1/complaints', complaintRoutes); 

// Base URL: /api/v1/fees
app.use('/api/v1/fees', feesRoutes);

// Base URL: /api/v1/misc (Notice and Visitors)
app.use('/api/v1/misc', miscRoutes); 

// Base URL: /api/v1/attendance
app.use('/api/v1/attendance', attendanceRoutes); 

app.use('/api/v1/staff', staffRoutes);
// Optional: Basic health check route
app.get('/', (req, res) => {
    res.send('Hostel Management API is running and fully operational.');
});


// 5. Define Port and Start Server
const PORT = process.env.PORT || 5000;

app.listen(
    PORT,
    console.log(`Server running on port ${PORT}`) 
);