const mongoose = require('mongoose');

const roomMaintenanceSchema = new mongoose.Schema({
    // Relationship: The specific room requiring maintenance
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room', // Links to the Room model
        required: [true, 'Room ID is required for maintenance record'],
    },
    // Relationship: The originating complaint (optional link back to Complaints)
    complaint: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Complaints',
        required: false, 
    },
    issue: {
        type: String,
        required: [true, 'Maintenance issue details are required'],
        enum: ['Plumbing', 'Electrical', 'Carpentry', 'Pest Control', 'Structural'],
    },
    cost: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['Pending Assignment', 'In Progress', 'Awaiting Parts', 'Completed'],
        default: 'Pending Assignment',
    },
    // Relationship: The staff member who performed or oversaw the repair
    assigned_staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Links to the User model (role 'staff' or 'warden')
        required: false,
    },
    completion_date: {
        type: Date,
        required: false,
    }
}, {
    timestamps: true 
});

const RoomMaintenance = mongoose.model('RoomMaintenance', roomMaintenanceSchema);

module.exports = RoomMaintenance;