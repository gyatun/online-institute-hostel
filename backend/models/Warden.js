const mongoose = require('mongoose');

const wardenSchema = new mongoose.Schema({
    // Links this Warden profile to their login and staff record
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: [true, 'Warden must be linked to a User account'],
        unique: true
    },
    // Direct link to the hostel they manage (as per the Hostel model, but replicated here)
    managing_hostel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hostel', 
        required: [true, 'Warden must be assigned a hostel'],
    },
    qualification: {
        type: String,
    },
    duty_shift: {
        type: String,
        enum: ['Day', 'Night', 'General'],
        default: 'General'
    }
}, {
    timestamps: true 
});

const Warden = mongoose.model('Warden', wardenSchema);

module.exports = Warden;