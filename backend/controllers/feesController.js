const Fees = require('../models/Fees');
const Student = require('../models/Student');
const mongoose = require('mongoose');

// ==========================================================
// ADMIN MANAGEMENT FUNCTIONS
// ==========================================================

// POST /api/v1/fees/invoice
const generateInvoice = async (req, res) => {
    const { studentId, fee_type, amount_due, due_date, billing_period } = req.body;
    const generatedBy = req.user._id; 

    try {
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }
        
        const newFee = await Fees.create({
            student: studentId,
            fee_type,
            amount_due,
            due_date,
            billing_period,
            generated_by: generatedBy,
            status: 'Pending',
        });

        res.status(201).json({ 
            success: true, 
            message: 'Invoice generated successfully.', 
            data: newFee 
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// PUT /api/v1/fees/:id/payment
const recordPayment = async (req, res) => {
    const { id } = req.params; // Fee ID
    const { amount_paid, payment_date } = req.body; 

    try {
        const feeRecord = await Fees.findById(id);
        if (!feeRecord) {
            return res.status(404).json({ message: 'Fee record not found.' });
        }

        // Logic to mark as fully paid
        // A full payment is signaled by sending a large dummy amount
        let newAmountPaid = (amount_paid > feeRecord.amount_due) ? feeRecord.amount_due : (feeRecord.amount_paid + amount_paid);
        let status = feeRecord.status;
        
        if (newAmountPaid >= feeRecord.amount_due) {
            status = 'Paid';
        }

        const updatedFee = await Fees.findByIdAndUpdate(id, {
            amount_paid: newAmountPaid,
            status: status,
            payment_date: payment_date || new Date(),
        }, { new: true, runValidators: true });

        res.status(200).json({ 
            success: true, 
            message: 'Payment successfully recorded.', 
            data: updatedFee 
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// GET /api/v1/fees/dues
const getPendingDues = async (req, res) => {
    try {
        const dues = await Fees.find({ status: { $in: ['Pending', 'Overdue'] } })
            .populate('student', 'name roll_number contact')
            .sort({ due_date: 1 }); 

        res.status(200).json({ 
            success: true, 
            count: dues.length, 
            data: dues 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching pending dues.' });
    }
};

// --- NEW FUNCTION ---
// DELETE /api/v1/fees/:id
const deleteInvoice = async (req, res) => {
    const { id } = req.params; // Fee ID

    try {
        const feeRecord = await Fees.findById(id);

        if (!feeRecord) {
            return res.status(404).json({ message: 'Fee record not found.' });
        }
        
        if (feeRecord.status === 'Paid') {
            return res.status(400).json({ message: 'Cannot delete an already paid invoice.' });
        }

        await feeRecord.deleteOne();

        res.status(200).json({ 
            success: true, 
            message: 'Invoice successfully deleted.' 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error while deleting invoice.' });
    }
};


// ==========================================================
// STUDENT SELF-SERVICE FUNCTION
// ==========================================================

// GET /api/v1/fees/me
const getStudentFees = async (req, res) => {
    const studentId = req.user._id;

    try {
        const fees = await Fees.find({ student: studentId })
            .sort({ due_date: -1 })
            .select('-generated_by');

        res.status(200).json({ success: true, count: fees.length, data: fees });
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching student fee data.' });
    }
};

// --- UPDATED EXPORTS ---
module.exports = {
    generateInvoice,
    recordPayment,
    getPendingDues,
    getStudentFees,
    deleteInvoice // <-- ADDED
};