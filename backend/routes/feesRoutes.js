const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const feesController = require('../controllers/feesController'); 

// === ADMIN/WARDEN MANAGEMENT ROUTES ===

// POST /api/v1/fees/invoice - Create a new fee invoice
router.post('/invoice', 
    protect, 
    restrictTo('admin'), 
    feesController.generateInvoice
);

// PUT /api/v1/fees/:id/payment - Manually update payment status
router.put('/:id/payment', 
    protect, 
    restrictTo('admin'), 
    feesController.recordPayment
);

// GET /api/v1/fees/dues - Get a list of all pending/overdue fees
router.get('/dues', 
    protect, 
    restrictTo('admin', 'warden'), 
    feesController.getPendingDues
);

// --- NEW ---
// DELETE /api/v1/fees/:id - Admin deletes an invoice
router.delete('/:id',
    protect,
    restrictTo('admin'),
    feesController.deleteInvoice
);


// === STUDENT SELF-SERVICE ROUTES ===

// GET /api/v1/fees/me - Student views their own payment history
router.get('/me', 
    protect, 
    restrictTo('student'), 
    feesController.getStudentFees
);

module.exports = router;