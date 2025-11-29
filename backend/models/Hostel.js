const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Hostel name is required (e.g., Boys Block A)'],
        unique: true,
        trim: true,
    },
    location: {
        type: String,
        required: true,
        default: 'NIT Sikkim Campus',
    },
    total_capacity: {
        type: Number,
        required: true,
        min: [1, 'Capacity must be at least 1'],
    },
    current_occupancy: {
        type: Number,
        default: 0,
    },
    // Relationship: One Hostel is managed by one Warden
    wardens: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // Useful for tracking gender segregation
    gender_type: {
        type: String,
        enum: ['Male', 'Female', 'Mixed'],
        required: true,
    }
}, {
    timestamps: true // Tracks when the hostel record was created/updated
});

const Hostel = mongoose.model('Hostel', hostelSchema);

module.exports = Hostel;