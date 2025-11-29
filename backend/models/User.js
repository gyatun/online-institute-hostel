const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
    },
    role: {
        type: String,
        enum: ['admin', 'warden', 'staff'], 
        required: [true, 'Role is required'],
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
    },
    contact: {
        type: String,
    },
    // --- THIS FIELD WAS MISSING AND CAUSED THE 500 ERROR ---
    assigned_hostel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hostel',
        required: false 
    }
    // -------------------------------------------------------
}, {
    timestamps: true 
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;