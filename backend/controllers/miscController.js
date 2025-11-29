const Notice = require('../models/Notice');
const Visitors = require('../models/Visitors');
const Student = require('../models/Student');
const mongoose = require('mongoose'); // Needed for ObjectId lookup

// ==========================================================
// 1. NOTICE (COMMUNICATION) FUNCTIONS
// ==========================================================

// POST /api/v1/misc/notice
const createNotice = async (req, res) => {
    const { title, content, target_hostel, is_urgent } = req.body;
    const posted_by = req.user._id; 

    try {
        const notice = await Notice.create({
            title,
            content,
            posted_by,
            target_hostel: target_hostel || null, // Allow null for global notice
            is_urgent,
        });

        res.status(201).json({ 
            success: true, 
            message: 'Notice published successfully.', 
            data: notice 
        });
    } catch (error) {
        console.error("Create Notice Error:", error.message);
        res.status(400).json({ message: error.message });
    }
};

// GET /api/v1/misc/notice (Admin/Warden view)
const getAllNotices = async (req, res) => {
    try {
        const notices = await Notice.find({})
            .populate('posted_by', 'name role')
            .populate('target_hostel', 'name')
            .sort({ published_date: -1 }); 

        res.status(200).json({ success: true, count: notices.length, data: notices });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching notices.' });
    }
};

// GET /api/v1/misc/notice/student (Student self-service view)
const getStudentNotices = async (req, res) => {
    try {
        // Find the student's hostel ID
        const student = await Student.findById(req.user._id).populate('current_room', 'hostel');
        const hostelId = student && student.current_room ? student.current_room.hostel : null;

        // Fetch notices that are global (target_hostel: null) OR specific to the student's hostel
        const notices = await Notice.find({
            $or: [
                { target_hostel: { $eq: null } }, 
                { target_hostel: hostelId }      
            ]
        })
        .populate('posted_by', 'name role')
        .sort({ published_date: -1 });

        res.status(200).json({ success: true, count: notices.length, data: notices });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching student notices.' });
    }
};


// ==========================================================
// 2. VISITOR MANAGEMENT FUNCTIONS
// ==========================================================

// POST /api/v1/misc/visitor/checkin
const checkInVisitor = async (req, res) => {
    const { studentId, visitor_name, visitor_contact, purpose } = req.body;
    const checked_by = req.user._id; // Staff/Warden ID from token

    try {
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Host student not found.' });
        }

        const visitorLog = await Visitors.create({
            student: studentId,
            visitor_name,
            visitor_contact,
            purpose,
            checked_by,
            status: 'Checked-In'
        });

        res.status(201).json({ 
            success: true, 
            message: `Visitor ${visitor_name} checked in successfully.`, 
            data: visitorLog 
        });
    } catch (error) {
        console.error("Visitor Check-In Error:", error.message);
        res.status(400).json({ message: error.message });
    }
};

// PUT /api/v1/misc/visitor/:id/checkout
const checkOutVisitor = async (req, res) => {
    const { id } = req.params; // Visitor log ID

    try {
        const visitorLog = await Visitors.findById(id);

        if (!visitorLog) {
            return res.status(404).json({ message: 'Visitor log entry not found.' });
        }
        
        if (visitorLog.exit_time) {
            return res.status(400).json({ message: 'Visitor already checked out.' });
        }

        const updatedLog = await Visitors.findByIdAndUpdate(id, {
            exit_time: new Date(),
            status: 'Checked-Out'
        }, { new: true });

        res.status(200).json({ success: true, message: 'Visitor checked out.', data: updatedLog });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// GET /api/v1/misc/visitor/log
const getVisitorLog = async (req, res) => {
    try {
        const logs = await Visitors.find({})
            .populate('student', 'name roll_number')
            .populate('checked_by', 'name role')
            .sort({ entry_time: -1 });

        res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching visitor log.' });
    }
};
// ... (inside backend/controllers/miscController.js)

// ... (after getStudentNotices function) ...

// --- NEW FUNCTION (FOR EDIT) ---
// PUT /api/v1/misc/notice/:id
const updateNotice = async (req, res) => {
    const { id } = req.params;
    const { title, content, target_hostel, is_urgent } = req.body;

    try {
        const notice = await Notice.findById(id);

        if (!notice) {
            return res.status(404).json({ message: 'Notice not found.' });
        }

        // Check if the user is an admin or the original poster
        if (req.user.role !== 'admin' && notice.posted_by.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'User not authorized to edit this notice.' });
        }

        // Update fields
        notice.title = title || notice.title;
        notice.content = content || notice.content;
        notice.target_hostel = target_hostel; // Allows setting it back to null
        notice.is_urgent = is_urgent !== undefined ? is_urgent : notice.is_urgent;

        const updatedNotice = await notice.save();
        
        res.status(200).json({ 
            success: true, 
            message: 'Notice updated successfully.', 
            data: updatedNotice 
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// --- NEW FUNCTION (FOR DELETE) ---
// DELETE /api/v1/misc/notice/:id
const deleteNotice = async (req, res) => {
    const { id } = req.params;

    try {
        const notice = await Notice.findById(id);

        if (!notice) {
            return res.status(404).json({ message: 'Notice not found.' });
        }

        // Check if the user is an admin or the original poster
        if (req.user.role !== 'admin' && notice.posted_by.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'User not authorized to delete this notice.' });
        }

        await notice.deleteOne();

        res.status(200).json({ 
            success: true, 
            message: 'Notice deleted successfully.' 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error while deleting notice.' });
    }
};

// --- NEW STUDENT FUNCTION ---
// GET /api/v1/misc/visitor/me
const getStudentVisitorLog = async (req, res) => {
    try {
        const logs = await Visitors.find({ student: req.user._id }) // Find logs matching the logged-in student's ID
            .populate('checked_by', 'name role')
            .sort({ entry_time: -1 });

        res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching visitor log.' });
    }
};
// ... (rest of the file, e.g., VISITOR FUNCTIONS) ...
// ==========================================================
// 3. EXPORTS
// ==========================================================
module.exports = {
    createNotice,
    getAllNotices,
    getStudentNotices,
    updateNotice,   
    deleteNotice,
    checkInVisitor,
    checkOutVisitor,
    getVisitorLog,
    getStudentVisitorLog
};