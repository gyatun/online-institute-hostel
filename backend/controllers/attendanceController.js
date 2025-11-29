const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

const checkOutStudent = async (req, res) => {
    const { studentId, leave_type, expected_in_time } = req.body;
    const approved_by = req.user._id;

    try {
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        // Validation: Ensure we have the time string
        if (!expected_in_time) {
             return res.status(400).json({ message: 'Expected return time is missing.' });
        }

        // Create record - Mongoose will automatically cast the ISO string to a Date
        const newLog = await Attendance.create({
            student: studentId,
            approved_by,
            leave_type,
            expected_in_time: expected_in_time, 
            status: 'Out'
        });

        res.status(201).json({ success: true, message: 'Student checked out.', data: newLog });
    } catch (error) {
        console.error("Check-Out Error Details:", error); // <-- CHECK TERMINAL FOR THIS IF IT FAILS
        res.status(400).json({ message: error.message });
    }
};

const checkInStudent = async (req, res) => {
    try {
        const log = await Attendance.findById(req.params.id);
        if (!log) {
            return res.status(404).json({ message: 'Log entry not found.' });
        }
        if (log.status === 'Returned') {
            return res.status(400).json({ message: 'Student already checked in.' });
        }

        log.actual_in_time = new Date();
        log.status = 'Returned';
        await log.save();
        
        res.status(200).json({ success: true, message: 'Student checked in.', data: log });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getAttendanceLog = async (req, res) => {
    try {
        const logs = await Attendance.find({})
            .populate('student', 'name roll_number')
            .populate('approved_by', 'name role')
            .sort({ out_time: -1 });
        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching log.' });
    }
};

const getStudentAttendance = async (req, res) => {
    try {
        const logs = await Attendance.find({ student: req.user._id })
            .populate('approved_by', 'name')
            .sort({ out_time: -1 });
        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching log.' });
    }
};

module.exports = {
    checkOutStudent,
    checkInStudent,
    getAttendanceLog,
    getStudentAttendance
};