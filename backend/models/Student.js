const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
    // --- LOGIN & IDENTITY ---
    roll_number: { // Used as the login username
        type: String,
        required: [true, 'Roll number is required'],
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required for student login'],
        minlength: 6,
    },
    
    // --- RESIDENT DATA ---
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
    },
    contact: {
        type: String,
    },
    course: {
        type: String,
    },

    // --- ACCOMMODATION LINKAGE (CRUCIAL RELATIONSHIPS) ---
    current_room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room', // Links to the Room model
        required: false, // Null if not yet allotted
    },
    is_resident: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true
});

// CRITICAL FIX: Middleware to hash password before saving
studentSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    // Hashing logic using bcryptjs
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const Student = mongoose.model('Student', studentSchema);

// CRITICAL FIX: Ensure the Model is exported correctly
module.exports = Student;