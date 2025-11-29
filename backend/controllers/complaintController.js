// backend/controllers/complaintController.js (FINAL WORKING VERSION)

const Complaints = require('../models/Complaints');
const RoomMaintenance = require('../models/RoomMaintenance');
const Student = require('../models/Student');

// ==========================================================
// 1. STUDENT SUBMITS A COMPLAINT
// ==========================================================
const submitComplaint = async (req, res) => {
    const studentId = req.user._id; // From JWT
    const { title, description, type } = req.body; 

    try {
        // 1. Find the student and their room/hostel details
        const student = await Student.findById(studentId).populate({
            path: 'current_room',
            select: 'hostel'
        });

        if (!student) {
            return res.status(404).json({ message: "Student profile not found." });
        }

        // 2. Determine the hostel ID (it's ok if it's null)
        const hostelId = student.current_room ? student.current_room.hostel : null;

        // 3. Create the complaint
        const complaint = await Complaints.create({
            student: studentId,
            hostel: hostelId, // Uses the dynamically found ID (or null)
            title,
            description,
            type,
            status: 'New' // Default status
        });

        // 4. If it's a Maintenance Request, create a linked log
        if (type === 'Maintenance Request' && student.current_room) {
             await RoomMaintenance.create({
                room: student.current_room._id,
                complaint: complaint._id, // Link back to the main complaint
                issue: title, 
                status: 'Pending Assignment'
            });
        }

        res.status(201).json({ 
            success: true, 
            message: 'Complaint submitted successfully.', 
            data: complaint 
        });
    } catch (error) {
        console.error("Complaint Submission Error:", error.message);
        res.status(500).json({ message: 'Server error during complaint submission.' });
    }
};

// ==========================================================
// 2. STUDENT VIEWS THEIR COMPLAINT HISTORY
// ==========================================================
const getStudentComplaints = async (req, res) => {
    try {
        // CRITICAL FIX: Find all complaints submitted by the logged-in student
        const complaints = await Complaints.find({ student: req.user._id })
            .populate('hostel', 'name')
            .select('-__v')
            .sort({ createdAt: -1 }); // Show newest first

        // Send the real data back
        res.status(200).json({ success: true, count: complaints.length, data: complaints });
    } catch (error) {
        console.error("Get Student Complaints Error:", error.message);
        res.status(500).json({ message: 'Server error fetching student complaints.' });
    }
};

// ==========================================================
// 3. ADMIN/WARDEN VIEWS ALL COMPLAINTS
// ==========================================================
const getAllComplaints = async (req, res) => {
    try {
        // CRITICAL FIX: Find all complaints
        const complaints = await Complaints.find({})
            .populate('student', 'name roll_number')
            .populate('hostel', 'name')
            .sort({ status: 1, createdAt: -1 }); // Prioritize 'New' status

        res.status(200).json({ success: true, count: complaints.length, data: complaints });
    } catch (error) {
        console.error("Get All Complaints Error:", error.message);
        res.status(500).json({ message: 'Server error fetching complaints list.' });
    }
};

// ==========================================================
// 4. ADMIN/WARDEN/STAFF VIEWS MAINTENANCE LOGS
// ==========================================================
const getMaintenanceRequests = async (req, res) => {
    try {
        // CRITICAL FIX: Find all maintenance logs
        const maintenanceLogs = await RoomMaintenance.find({})
            .populate({
                path: 'room',
                select: 'room_number hostel',
                populate: { path: 'hostel', select: 'name' }
            })
            .populate('assigned_staff', 'name'); 

        res.status(200).json({ success: true, count: maintenanceLogs.length, data: maintenanceLogs });
    } catch (error) {
        console.error("Get Maintenance Error:", error.message);
        res.status(500).json({ message: 'Server error fetching maintenance logs.' });
    }
};

// ==========================================================
// 5. ADMIN/WARDEN/STAFF UPDATES A COMPLAINT
// ==========================================================
const updateComplaintStatus = async (req, res) => {
    const { status, assigned_to_id, resolution_details } = req.body;
    const { id } = req.params; // Complaint ID

    try {
        const complaint = await Complaints.findById(id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found.' });
        }
        
        // Update fields
        if (status) complaint.status = status;
        if (assigned_to_id) complaint.assigned_to = assigned_to_id; 
        if (resolution_details) complaint.resolution_details = resolution_details;

        await complaint.save();

        res.status(200).json({ success: true, message: 'Complaint updated.', data: complaint });

    } catch (error) {
        console.error("Update Complaint Error:", error.message);
        res.status(400).json({ message: error.message });
    }
};


// ==========================================================
// 6. EXPORTS (Ensures router can find all functions)
// ==========================================================
module.exports = {
    submitComplaint,
    getStudentComplaints,
    getAllComplaints,
    getMaintenanceRequests,
    updateComplaintStatus,
};