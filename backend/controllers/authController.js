const User = require('../models/User'); // Handles Admin, Warden, Staff
const Student = require('../models/Student'); // Handles Students
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT token (used for all successful logins)
const generateToken = (id, role, name) => {
    // JWT_SECRET must be defined in your .env file
    return jwt.sign({ id, role, name }, process.env.JWT_SECRET, {
        expiresIn: '30d', 
    });
};

// ==========================================================
// 1. STUDENT REGISTRATION (Handles POST /api/v1/auth/student/register)
// ==========================================================
const studentRegister = async (req, res) => {
    // Ensure all required fields from register.html are correctly destructured
    const { roll_number, name, email, password, contact, course } = req.body; 

    try {
        // Check for existing user before creation
        const studentExists = await Student.findOne({ $or: [{ roll_number }, { email }] });

        if (studentExists) {
            return res.status(400).json({ message: 'User with this Roll Number or Email already exists.' });
        }

        // Create the new student record (Password hashing happens automatically via Mongoose pre-save hook)
        const student = await Student.create({
            roll_number,
            name,
            email,
            password, 
            contact,
            course,
            // Add other registration fields here as you expand your Student model (e.g., dob, gender, address)
        });

        if (student) {
            res.status(201).json({
                message: 'Registration successful! You can now log in.',
                roll_number: student.roll_number,
            });
        } else {
            res.status(400).json({ message: 'Invalid student data received.' });
        }

    } catch (error) {
        console.error("Student Registration Error:", error.message);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};


// ==========================================================
// 2. STAFF/ADMIN LOGIN (Handles POST /api/v1/auth/staff/login)
// ==========================================================
// Inside backend/controllers/authController.js

const staffLogin = async (req, res) => {
    const { username, password, role } = req.body; 

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'Invalid username.' });
        }
        
        // CRITICAL FIX: Convert both roles to lowercase before comparing
        const storedRole = user.role.toLowerCase();
        const incomingRole = role.toLowerCase();
        
        if (storedRole !== incomingRole) {
            return res.status(401).json({ message: `Access denied. Role mismatch for ${username}.` });
        }

        // 3. Compare password (This logic remains sound)
        if (await bcrypt.compare(password, user.password)) {
            // SUCCESS: Login and token generation
            res.json({
                _id: user._id,
                username: user.username,
                role: user.role, 
                name: user.name || user.username, 
                token: generateToken(user._id, user.role, user.name),
            });
        } else {
            // 4. Failure (Invalid Password)
            res.status(401).json({ message: 'Invalid password.' });
        }
    } catch (error) {
        console.error("Staff Login Error:", error.message);
        res.status(500).json({ message: 'Server error during login.' });
    }
};
// ... (The rest of the file remains the same)
// ... (Make sure to update module.exports with staffLogin)

// ==========================================================
// 3. STUDENT LOGIN (Handles POST /api/v1/auth/student/login)
// ==========================================================
const studentLogin = async (req, res) => {
    // Frontend sends 'username', which we map to 'roll_number' for the Student model
    const { username: roll_number, password } = req.body; 

    try {
        // 1. Find student by roll_number
        const student = await Student.findOne({ roll_number });

        // 2. Compare password
        if (student && (await bcrypt.compare(password, student.password))) {
            // 3. Successful Login: Return token and student data
            res.json({
                _id: student._id,
                name: student.name,
                roll_number: student.roll_number,
                role: 'student', // CRUCIAL for frontend redirection (student_portal.html)
                token: generateToken(student._id, 'student', student.name),
            });
        } else {
            res.status(401).json({ message: 'Invalid roll number or password.' });
        }
    } catch (error) {
        console.error("Student Login Error:", error.message);
        res.status(500).json({ message: 'Server error during login.' });
    }
};

module.exports = {
    staffLogin,
    studentLogin,
    studentRegister,
};