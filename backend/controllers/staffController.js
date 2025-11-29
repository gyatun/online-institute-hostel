const User = require('../models/User'); // We are managing the User model
const HostelStaff = require('../models/HostelStaff'); // Also create the linked staff profile
const Warden = require('../models/Warden'); // And the linked warden profile
const Hostel = require('../models/Hostel'); // <-- CRITICAL: We need this to update the hostel

// POST /api/v1/staff
exports.createStaff = async (req, res) => {
    const { username, name, email, password, role, assigned_hostel } = req.body;

    try {
        // 1. Validation
        if (role === 'warden' && !assigned_hostel) {
            return res.status(400).json({ message: 'Error: Wardens must be assigned to a hostel.' });
        }
        const userExists = await User.findOne({ $or: [{ username }, { email }] });
        if (userExists) {
            return res.status(400).json({ message: 'Username or Email already exists.' });
        }

        // 2. Create the main login User
        const newUser = await User.create({
            username,
            name,
            email,
            password,
            role,
            assigned_hostel: assigned_hostel || null
        });

        // 3. Create the specific profile (HostelStaff or Warden)
        if (role === 'warden') {
            await Warden.create({
                user: newUser._id,
                managing_hostel: assigned_hostel
            });
            
            // --- THIS IS THE FIX ---
            // 4. Add this new warden to the Hostel's 'wardens' array
            await Hostel.findByIdAndUpdate(
                assigned_hostel,
                { $push: { wardens: newUser._id } } // Atomically push the new user's ID
            );
            // --- END OF FIX ---

        } else {
            // Staff role
            await HostelStaff.create({
                user: newUser._id,
                employee_id: `S-${Math.floor(1000 + Math.random() * 9000)}`,
                job_title: 'staff',
                assigned_hostel: assigned_hostel || null
            });
        }

        res.status(201).json({ success: true, data: newUser });

    } catch (error) {
        console.error("Create Staff Error:", error); 
        res.status(500).json({ message: error.message || 'Server error.' });
    }
};

// GET /api/v1/staff
exports.getAllStaff = async (req, res) => {
    try {
        const staff = await User.find({ role: { $in: ['admin', 'warden', 'staff'] } })
            .populate('assigned_hostel', 'name')
            .select('-password')
            .sort({ createdAt: -1 });
            
        res.status(200).json({ success: true, count: staff.length, data: staff });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching staff list.' });
    }
};

// PUT /api/v1/staff/:id
exports.updateStaff = async (req, res) => {
    // (This logic is complex - we'll focus on create/delete first)
    res.status(501).json({ message: 'Update not implemented yet.' });
};

// DELETE /api/v1/staff/:id
exports.deleteStaff = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Staff user not found.' });
        }
        
        // Delete the linked profile first
        if(user.role === 'warden') {
            await Warden.deleteOne({ user: user._id });
            
            // --- THIS IS THE FIX ---
            // 4. Remove this warden from the Hostel's 'wardens' array
            if (user.assigned_hostel) {
                await Hostel.findByIdAndUpdate(
                    user.assigned_hostel,
                    { $pull: { wardens: user._id } } // Atomically pull the user's ID
                );
            }
            // --- END OF FIX ---

        } else if (user.role === 'staff') {
            await HostelStaff.deleteOne({ user: user._id });
        }
        
        await user.deleteOne();
        
        res.status(200).json({ success: true, message: 'Staff account completely deleted.' });
    } catch (error) {
        console.error("Delete Staff Error:", error);
        res.status(500).json({ message: 'Server error deleting staff.' });
    }
};

// GET /api/v1/staff/:id
exports.getStaffById = async (req, res) => {
     try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(44).json({ message: 'Staff user not found.' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
};