const mongoose = require('mongoose');

const complaintsSchema = new mongoose.Schema({
    // Relationship: The student who submitted the complaint
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student', // Links to the Student model
        required: true,
    },
    // Relationship: The hostel this complaint pertains to
    hostel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hostel',
        required: false,
    },
    title: {
        type: String,
        required: [true, 'Complaint title is required'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Complaint description is required'],
    },
    // The type helps the Warden quickly filter and assign the issue
    type: {
        type: String,
        enum: ['General Issue', 'Food/Mess', 'Administrative', 'Noise', 'Maintenance Request'],
        default: 'General Issue',
    },
    status: {
        type: String,
        enum: ['New', 'In Review', 'Assigned', 'Resolved', 'Closed'],
        default: 'New',
    },
    // Relationship: The staff or warden assigned to resolve the issue
    assigned_to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Links to the User model (role 'warden' or 'staff')
        required: false, // Not required until assigned
    },
    resolution_details: {
        type: String,
        required: false,
    },
}, {
    timestamps: true // Tracks submission and resolution dates
});

const Complaints = mongoose.model('Complaints', complaintsSchema);

module.exports = Complaints;