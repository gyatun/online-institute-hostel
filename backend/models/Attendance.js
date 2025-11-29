const mongoose = require('mongoose');

const attendanceLogSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: [true, 'Student is required'],
    },
    approved_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: [true, 'Approved by is required'],
    },
    leave_type: {
        type: String,
        enum: ['Local Leave (Market)', 'Out-of-Station (Home)', 'Day Pass'],
        required: [true, 'Leave type is required'],
    },
    out_time: {
        type: Date,
        default: Date.now,
    },
    expected_in_time: {
        type: Date, // <-- Must be type Date
        required: [true, 'Expected in time is required'],
    },
    actual_in_time: {
        type: Date,
        default: null, 
    },
    status: {
        type: String,
        enum: ['Out', 'Returned'],
        default: 'Out',
    }
}, {
    timestamps: true 
});

const Attendance = mongoose.model('Attendance', attendanceLogSchema);
module.exports = Attendance;