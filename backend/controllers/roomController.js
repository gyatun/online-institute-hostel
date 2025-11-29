const Hostel = require('../models/Hostel');
const Room = require('../models/Room');
const mongoose = require('mongoose');

// ==========================================================
// HOSTEL MANAGEMENT FUNCTIONS
// ==========================================================

// POST /api/v1/rooms/hostel
const createHostel = async (req, res) => {
    // Support both 'wardens' (array) or 'warden' (single ID) from frontend
    let { name, location, total_capacity, gender_type, wardens, warden } = req.body;

    try {
        // If frontend sent a single 'warden' ID, wrap it in an array
        if (!wardens && warden) {
            wardens = [warden];
        }

        const hostel = await Hostel.create({
            name,
            location,
            total_capacity,
            gender_type,
            wardens: wardens || [], // Stores as an array of ObjectIds
        });

        res.status(201).json({ 
            success: true, 
            data: hostel 
        });
    } catch (error) {
        // Handle validation or duplicate key errors
        res.status(400).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// GET /api/v1/rooms/hostel
const getAllHostels = async (req, res) => {
    try {
        // UPDATED: Populate 'wardens' (plural) instead of 'warden'
        const hostels = await Hostel.find({}).populate('wardens', 'name username'); 
        
        res.status(200).json({
            success: true,
            count: hostels.length,
            data: hostels
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Server Error fetching hostels' 
        });
    }
};


// ==========================================================
// ROOM MANAGEMENT FUNCTIONS
// ==========================================================

// POST /api/v1/rooms/room
const createRoom = async (req, res) => {
    const { room_number, hostel, capacity, rent_per_bed } = req.body;

    try {
        // 1. Create the new room record
        const room = await Room.create({
            room_number,
            hostel,
            capacity,
            rent_per_bed,
            current_occupancy: 0,
            status: 'Available', 
        });

        // 2. IMPORTANT: Update the parent Hostel's total capacity (optional, but good practice)
        await Hostel.findByIdAndUpdate(hostel, { $inc: { total_capacity: capacity } });

        res.status(201).json({ 
            success: true, 
            data: room 
        });
    } catch (error) {
        // Check for compound unique index error (room_number already exists in this hostel)
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Room number already exists in this hostel block.' });
        }
        res.status(400).json({ success: false, message: error.message });
    }
};

// GET /api/v1/rooms/status
const getRoomStatus = async (req, res) => {
    try {
        // Find all rooms and populate the hostel name
        const rooms = await Room.find({}).populate('hostel', 'name'); 

        res.status(200).json({
            success: true,
            count: rooms.length,
            data: rooms
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error fetching room status' });
    }
};

// PUT /api/v1/rooms/:id
const updateRoom = async (req, res) => {
    const { id } = req.params;
    const updateFields = req.body; // e.g., { status: 'Under Maintenance', rent_per_bed: 5000 }

    try {
        const room = await Room.findByIdAndUpdate(id, updateFields, {
            new: true, // Return the updated document
            runValidators: true // Run Mongoose validation checks
        }).populate('hostel', 'name');

        if (!room) {
            return res.status(404).json({ success: false, message: `Room not found with id: ${id}` });
        }

        res.status(200).json({ success: true, data: room });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


// GET /api/v1/rooms/:id
const getRoomDetails = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id).populate('hostel', 'name');

        if (!room) {
            return res.status(404).json({ success: false, message: `Room not found with id: ${req.params.id}` });
        }

        res.status(200).json({ success: true, data: room });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


module.exports = {
    createHostel,
    getAllHostels,
    createRoom,
    getRoomStatus,
    updateRoom,
    getRoomDetails
};