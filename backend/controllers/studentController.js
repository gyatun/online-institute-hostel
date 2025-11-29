const Student = require('../models/Student');
const Room = require('../models/Room');
const mongoose = require('mongoose');

// ==========================================================
// ADMIN/WARDEN MANAGEMENT FUNCTIONS
// ==========================================================

// POST /api/v1/students/allot
const allotRoom = async (req, res) => {
    const { studentId, roomId } = req.body;

    // Basic Validation
    if (!studentId || !roomId) {
        return res.status(400).json({ message: 'Student ID and Room ID are required for allotment.' });
    }

    try {
        const student = await Student.findById(studentId);
        const room = await Room.findById(roomId);

        // 1. Pre-Allotment Checks
        if (!student) return res.status(404).json({ message: 'Student not found.' });
        if (!room) return res.status(404).json({ message: 'Room not found.' });
        if (room.current_occupancy >= room.capacity) {
            return res.status(400).json({ message: 'Room is already fully occupied.' });
        }
        if (student.current_room) {
            return res.status(400).json({ message: 'Student is already allotted a room.' });
        }

        // 2. Perform Allotment (Transactional Updates)
        
        // Update the Student record
        student.current_room = roomId;
        student.is_resident = true;
        await student.save();

        // Update the Room occupancy
        room.current_occupancy += 1;
        room.status = room.current_occupancy < room.capacity ? 'Partially Occupied' : 'Fully Occupied';
        await room.save();
        
        // Populate the room details before sending response
        const allottedStudent = await Student.findById(studentId).populate('current_room', 'room_number hostel');

        res.status(200).json({ 
            success: true, 
            message: `Room ${room.room_number} successfully allotted to ${student.name}.`,
            data: allottedStudent
        });

    } catch (error) {
        console.error("Room Allotment Error:", error.message);
        res.status(500).json({ message: 'Server error during room allotment.' });
    }
};

// GET /api/v1/students/unallotted
const getUnallottedStudents = async (req, res) => {
    try {
        // Find students where current_room is null or undefined
        const students = await Student.find({ current_room: { $exists: false } }); 
        
        res.status(200).json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching unallotted students.' });
    }
};

// GET /api/v1/students
const getAllStudents = async (req, res) => {
    try {
        // Find all students and populate their room and hostel details
        const students = await Student.find({})
            .populate({
                path: 'current_room',
                select: 'room_number capacity hostel',
                populate: { path: 'hostel', select: 'name' }
            }); 
        
        res.status(200).json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching student list.' });
    }
};

// PUT /api/v1/students/:id
const updateStudentProfile = async (req, res) => {
    const { id } = req.params;
    const updateFields = req.body; 

    try {
        const student = await Student.findByIdAndUpdate(id, updateFields, {
            new: true, 
            runValidators: true 
        });

        if (!student) {
            return res.status(404).json({ message: `Student not found with id: ${id}` });
        }

        res.status(200).json({ success: true, message: "Student profile updated successfully.", data: student });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


// ==========================================================
// STUDENT SELF-SERVICE FUNCTION
// ==========================================================

// GET /api/v1/students/me
const getStudentProfile = async (req, res) => {
    // req.user is set by the protect middleware and is the logged-in Student object
    const studentId = req.user._id;

    try {
        const student = await Student.findById(studentId)
            .select('-password') // Never send the password hash
            .populate({
                path: 'current_room',
                select: 'room_number capacity hostel',
                populate: { path: 'hostel', select: 'name' }
            });
        
        if (!student) {
            return res.status(404).json({ message: 'Student profile not found.' });
        }

        res.status(200).json({ success: true, data: student });
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching profile.' });
    }
};

module.exports = {
    allotRoom,
    getUnallottedStudents,
    getAllStudents,
    updateStudentProfile,
    getStudentProfile,
};