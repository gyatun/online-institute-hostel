const mongoose = require('mongoose');
const colors = require('colors'); 
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs'); 
colors.enable(); // Ensures console colors work

// --- Load Configuration and Models ---
const connectDB = require('./config/db'); 
// Require all 12 models
const User = require('./models/User'); 
const Student = require('./models/Student'); 
const Hostel = require('./models/Hostel'); 
const Room = require('./models/Room'); 
require('./models/Fees');
require('./models/Complaints');
require('./models/RoomMaintenance');
require('./models/Visitors');
require('./models/Notice');
require('./models/Attendance');
require('./models/HostelStaff');
require('./models/Warden');


dotenv.config(); 
connectDB();    

// --- Define Initial Credentials ---
const TEST_PASSWORDS = {
    ADMIN: 'admin123',
    WARDEN: 'warden123',
    STAFF: 'staff123',
    STUDENT: 'student123',
};

// --- Seeding Function ---
const importData = async () => {
    try {
        console.log('--- STARTING DATABASE SEEDING ---'.cyan.bold);
        console.log('Clearing old data from all collections...');

        // 1. Clear all data
        await User.deleteMany();
        await Student.deleteMany();
        await Hostel.deleteMany();
        await Room.deleteMany();
        await mongoose.connection.collection('fees').deleteMany({});
        await mongoose.connection.collection('complaints').deleteMany({});
        await mongoose.connection.collection('roommaintenances').deleteMany({});
        await mongoose.connection.collection('visitors').deleteMany({});
        await mongoose.connection.collection('notices').deleteMany({});
        try { await mongoose.connection.collection('attendances').drop(); } catch(e) { /* ignore */ }
        await mongoose.connection.collection('hostelstaffs').deleteMany({});
        await mongoose.connection.collection('wardens').deleteMany({});

        
        // ==========================================================
        // 2. CRITICAL HASHING FIX: Insert Staff/Admin using .create()
        // ==========================================================
        console.log('Inserting initial Admin, Warden, and Staff Users (with hashing)...');
        
        const seedUsers = [
            { 
                username: 'superadmin', 
                name: 'Super Admin User', 
                role: 'admin', 
                email: 'admin@hostel.com', 
                password: TEST_PASSWORDS.ADMIN 
            },
            { 
                username: 'wardenA', 
                name: 'Chief Warden Block A', 
                role: 'warden', 
                email: 'warden@hostel.com', 
                password: TEST_PASSWORDS.WARDEN 
            },
            { 
                username: 'staffsec', 
                name: 'Security Staff', 
                role: 'staff', 
                email: 'staff@hostel.com', 
                password: TEST_PASSWORDS.STAFF 
            }
        ];

        let createdUsers = [];
        // Use a loop with .create() to trigger the pre-save hook in User.js
        for (const user of seedUsers) {
            const newUser = await User.create(user); 
            createdUsers.push(newUser);
        }
        
        const wardenUser = createdUsers.find(u => u.role === 'warden');
        // ==========================================================
        // END OF HASHING FIX
        // ==========================================================


        console.log('Inserting Hostels and Rooms...');
        // 3. Insert Hostels 
        const createdHostels = await Hostel.insertMany([
            // CRITICAL WARDEN FIX: Use 'wardens' (plural array)
            { 
                name: 'Boys Block A', 
                total_capacity: 100, 
                gender_type: 'Male', 
                wardens: [wardenUser._id] // <-- FIXED
            },
            { 
                name: 'Girls Block B', 
                total_capacity: 80, 
                gender_type: 'Female', 
                wardens: [] // <-- FIXED
            }
        ]);
        
        const boysHostelId = createdHostels.find(h => h.name === 'Boys Block A')._id;
        const girlsHostelId = createdHostels.find(h => h.name === 'Girls Block B')._id;

        // 4. Insert Rooms
        const roomData = [
            { room_number: 'A-101', hostel: boysHostelId, capacity: 2, rent_per_bed: 4500, status: 'Available' },
            { room_number: 'A-102', hostel: boysHostelId, capacity: 3, rent_per_bed: 4000, status: 'Available' },
            { room_number: 'B-201', hostel: girlsHostelId, capacity: 2, rent_per_bed: 5000, status: 'Available' },
            { room_number: 'B-202', hostel: girlsHostelId, capacity: 3, rent_per_bed: 4800, status: 'Available' },
        ];
        await Room.insertMany(roomData);

        
        console.log('Inserting initial Student...');
        // 5. Insert Test Student
        await Student.create({
            roll_number: 'NITSK2024001',
            name: 'Test Student Alpha',
            email: 'alpha@student.com', 
            course: 'Computer Science',
            contact: '8800000001',
            password: TEST_PASSWORDS.STUDENT, 
            is_resident: false,
        });


        console.log('Database Seeding SUCCESSFUL! 🎉'.green.bold);
        console.log('\n--- LOGIN CREDENTIALS ---'.yellow.bold);
        console.log(`ADMIN: Username: superadmin | Password: ${TEST_PASSWORDS.ADMIN}`);
        console.log(`WARDEN: Username: wardenA | Password: ${TEST_PASSWORDS.WARDEN}`);
        console.log(`STAFF: Username: staffsec | Password: ${TEST_PASSWORDS.STAFF}`);
        console.log(`STUDENT: Roll No: NITSK2024001 | Password: ${TEST_PASSWORDS.STUDENT}`);
        console.log('--------------------------');
        process.exit();

    } catch (error) {
        console.error(`\nError during data import: ${error.message}`.red.bold);
        console.error('Make sure MongoDB is running and your model files are correct.');
        process.exit(1);
    }
};

// Execute the function
importData();