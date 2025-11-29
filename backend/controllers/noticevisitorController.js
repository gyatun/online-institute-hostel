const Notice = require('../models/Notice');
const Visitors = require('../models/Visitors');
const Student = require('../models/Student');

// ==========================================================
// NOTICE (COMMUNICATION) FUNCTIONS
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
            target_hostel,
            is_urgent,
        });

        res.status(201).json({ 
            success: true, 
            message: 'Notice published successfully.', 
            data: notice 
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// GET /api/v1/misc/notice
const getAllNotices = async (req, res) => {
    try {
        // Admins/Wardens see all notices, populated with the sender's name
        const notices = await Notice.find({})
            .populate('posted_by', 'name role')
            .populate('target_hostel', 'name')
            .sort({ published_date: -1 }); 

        res.status(200).json({ success: true, count: notices.length, data: notices });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching notices.' });
    }
};

// GET /api/v1/misc/notice/student
const getStudentNotices = async (req, res) => {
    try {
        // 1. Get the student's current hostel ID
        const student = await Student.findById(req.user._id).select('current_room').populate('current_room', 'hostel');
        const hostelId = student && student.current_room ? student.current_room.hostel : null;

        // 2. Find notices that are: 
        // a) Not targeted (global notice) 
        // b) Targeted to the student's specific hostel ID
        const notices = await Notice.find({
            $or: [
                { target_hostel: { $eq: null } }, // Global notices
                { target_hostel: hostelId }      // Hostel-specific notices
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
// VISITOR FUNCTIONS
// ==========================================================

// POST /api/v1/misc/visitor/checkin
const checkInVisitor = async (req, res) => {
    const { studentId, visitor_name, visitor_contact, purpose } = req.body;
    const checked_by = req.user._id; 

    try {
        // Basic check to ensure student exists
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

        visitorLog.exit_time = new Date();
        visitorLog.status = 'Checked-Out';
        await visitorLog.save();

        res.status(200).json({ success: true, message: 'Visitor checked out.', data: visitorLog });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// GET /api/v1/misc/visitor/log
const getVisitorLog = async (req, res) => {
    try {
        // Get all logs, populated with the host student's name
        const logs = await Visitors.find({})
            .populate('student', 'name roll_number')
            .populate('checked_by', 'name role')
            .sort({ entry_time: -1 });

        res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching visitor log.' });
    }
};

module.exports = {
    createNotice,
    getAllNotices,
    getStudentNotices,
    checkInVisitor,
    checkOutVisitor,
    getVisitorLog,
};