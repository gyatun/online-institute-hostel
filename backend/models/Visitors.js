const mongoose = require('mongoose');

const visitorsSchema = new mongoose.Schema({
    // Relationship: The student being visited
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student', // Links to the Student model
        required: [true, 'Student ID of the host resident is required'],
    },
    visitor_name: {
        type: String,
        required: [true, 'Visitor name is required'],
        trim: true,
    },
    visitor_contact: {
        type: String,
        required: false, // Optional
    },
    purpose: {
        type: String,
        required: [true, 'Purpose of visit is required'],
    },
    // Tracking entry and exit
    entry_time: {
        type: Date,
        default: Date.now,
    },
    exit_time: {
        type: Date,
        required: false, // Null until the visitor leaves
    },
    // Status reflects the security workflow
    status: {
        type: String,
        enum: ['Checked-In', 'Checked-Out', 'Pending Approval', 'Denied'],
        default: 'Checked-In', // Assumes check-in is done by staff immediately, unless complex approval is needed
    },
    // Relationship: The Staff or Warden who authorized the entry
    checked_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Links to User model (role 'warden' or 'staff')
        required: [true, 'Staff member who checked in the visitor is required'],
    }
}, {
    timestamps: true // Tracks when the log was created/updated
});

const Visitors = mongoose.model('Visitors', visitorsSchema);

module.exports = Visitors;