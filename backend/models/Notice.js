const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Notice title is required'],
        trim: true,
        maxlength: [150, 'Title cannot be more than 150 characters']
    },
    content: {
        type: String,
        required: [true, 'Notice content is required'],
    },
    // Relationship: The admin or warden who created and published the notice
    posted_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Links to User model (role 'admin' or 'warden')
        required: [true, 'The user who posted the notice is required'],
    },
    // Allows notices to be targeted to specific hostels (e.g., only Girls Block A)
    target_hostel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hostel',
        required: false, // False means the notice is for ALL hostels/the institute
    },
    is_urgent: {
        type: Boolean,
        default: false,
    },
    published_date: {
        type: Date,
        default: Date.now,
    }
}, {
    timestamps: true 
});

const Notice = mongoose.model('Notice', noticeSchema);

module.exports = Notice;