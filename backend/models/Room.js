const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    room_number: {
        type: String,
        required: [true, 'Room number is required (e.g., A-101)'],
        trim: true,
        // We will add a compound unique index later to ensure (hostel_id + room_number) is unique
    },
    // Relationship: Links this room to its parent hostel
    hostel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hostel', // Reference the Hostel model
        required: true,
    },
    capacity: {
        type: Number,
        required: [true, 'Room capacity is required (e.g., 2, 3, or 4 beds)'],
        min: [1, 'Capacity must be at least 1'],
    },
    current_occupancy: {
        type: Number,
        default: 0,
    },
    // Status reflects availability for quick lookup
    status: {
        type: String,
        enum: ['Available', 'Partially Occupied', 'Fully Occupied', 'Under Maintenance'],
        default: 'Available',
    },
    // Price details for billing
    rent_per_bed: {
        type: Number,
        required: [true, 'Rent per bed is required'],
    }
}, {
    timestamps: true 
});

// Compound Index: Ensures no two rooms in the SAME hostel have the same number.
roomSchema.index({ hostel: 1, room_number: 1 }, { unique: true });


const Room = mongoose.model('Room', roomSchema);

module.exports = Room;