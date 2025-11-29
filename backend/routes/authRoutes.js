const express = require('express');
const router = express.Router();
// IMPORTANT: This imports the functions from your authController.js file
const authController = require('../controllers/authController'); 

// === Student Registration ===
// URL: POST /api/v1/auth/student/register
// Action: Creates a new Student record
router.post('/student/register', authController.studentRegister);

// === Student Login ===
// URL: POST /api/v1/auth/student/login
// Action: Authenticates student and returns JWT
router.post('/student/login', authController.studentLogin);

// === Staff/Admin/Warden Login ===
// URL: POST /api/v1/auth/staff/login
// Action: Authenticates staff/admin user and returns JWT
router.post('/staff/login', authController.staffLogin);

module.exports = router;