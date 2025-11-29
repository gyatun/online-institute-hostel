const mongoose = require('mongoose');

const feesSchema = new mongoose.Schema({
    // Relationship: The student who is responsible for this payment
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student', // Links to the Student model
        required: [true, 'Student reference is required'],
    },
    // The specific type of fee
    fee_type: {
        type: String,
        enum: ['Hostel Rent', 'Mess Charges', 'Security Deposit', 'Fine', 'Other'],
        required: [true, 'Fee type is required'],
    },
    billing_period: {
        type: String,
        required: [true, 'Billing period (e.g., Oct 2025 or Semester 1) is required'],
    },
    amount_due: {
        type: Number,
        required: [true, 'Amount due is required'],
        min: [0, 'Amount due cannot be negative'],
    },
    amount_paid: {
        type: Number,
        default: 0,
    },
    // Status reflects the current state of the bill
    status: {
        type: String,
        enum: ['Pending', 'Paid', 'Overdue', 'Cancelled'],
        default: 'Pending',
    },
    due_date: {
        type: Date,
        required: [true, 'Due date is required'],
    },
    payment_date: {
        type: Date,
        required: false,
    },
    // Reference to the warden/admin who generated the invoice
    generated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Links to the User model (role 'admin' or 'warden')
        required: false,
    }
}, {
    timestamps: true // Tracks when the bill was created/updated
});

const Fees = mongoose.model('Fees', feesSchema);

module.exports = Fees;