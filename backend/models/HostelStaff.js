const mongoose = require('mongoose');

const hostelStaffSchema = new mongoose.Schema({
    // Relationship: Links this staff profile to their login account
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: [true, 'Staff must be linked to a User account for login'],
        unique: true
    },
    employee_id: {
        type: String,
        required: [true, 'Employee ID is required'],
        unique: true,
        trim: true,
    },
    // The specific job title or role (should match the User.role)
    job_title: {
        type: String,
        enum: ['admin', 'warden', 'security', 'maintenance', 'cleaner'], 
        required: true,
    },
    // Relationship: Which hostel the staff is primarily assigned to
    assigned_hostel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hostel', 
        required: false, // Not required for Super Admins
    },
    joining_date: {
        type: Date,
        default: Date.now,
    },
    salary: {
        type: Number,
        required: false, // Optional detail
    }
}, {
    timestamps: true 
});

const HostelStaff = mongoose.model('HostelStaff', hostelStaffSchema);

module.exports = HostelStaff;