// client/assets/js/admin.js (FINAL AND COMPLETE CODE)

// CRITICAL: Define the base URL for your running server (Port 4000)
const API_BASE_URL = 'http://localhost:4006/api/v1'; 

document.addEventListener('DOMContentLoaded', () => {
    // 1. Check for Authentication and Get User Data
    const token = localStorage.getItem('token'); // Get token ONCE
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName');
    
    // Elements to update
    const userNameDisplay = document.getElementById('userNameDisplay');
    const userRoleDisplay = document.getElementById('userRoleDisplay');
    const sidebarNav = document.getElementById('sidebarNav');
    const mainContent = document.getElementById('mainContent');
    const logoutBtn = document.getElementById('logoutBtn');

    // --- SECURITY CHECK AND REDIRECT ---
    if (!token || !userRole || userRole === 'student') {
        alert('Access denied. Please log in as Admin, Warden, or Staff.');
        window.location.href = 'login.html';
        return;
    }
    
    // --- 2. INITIAL SETUP: Inject User Data and Apply RBAC ---
    userNameDisplay.textContent = `Welcome, ${userName || 'Admin'}`;
    userRoleDisplay.textContent = userRole.toUpperCase();
    
    applyRBAC(userRole, sidebarNav);

    // --- 3. EVENT LISTENERS ---
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    if (sidebarNav) {
        sidebarNav.querySelectorAll('a[data-module]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                // Pass the token to the module loader
                loadModule(e.currentTarget.dataset.module, mainContent, userRole, token);
            });
        });
    }

    // Load the default dashboard view on page load
    loadModule('dashboard', mainContent, userRole, token);
});


// ==========================================================
// A. RBAC & NAVIGATION
// ==========================================================

/**
 * Hides unauthorized menu items based on user role.
 */
function applyRBAC(role, container) {
    const allItems = container.querySelectorAll('li[data-access], div[data-access]');
    allItems.forEach(item => {
        const requiredRoles = item.dataset.access.split(' ');
        if (!requiredRoles.includes(role)) {
            item.style.display = 'none';
        } else {
            item.style.display = 'block';
        }
    });
}

/**
 * Main navigation router. Loads content into the <main> tag.
 */
function loadModule(moduleName, contentArea, role, token) {
    document.querySelectorAll('#sidebarNav a').forEach(a => a.classList.remove('active'));
    const activeLink = document.querySelector(`#sidebarNav a[data-module="${moduleName}"]`);
    if (activeLink) activeLink.classList.add('active');

    contentArea.innerHTML = `<div class="loading">Loading ${moduleName.replace('-', ' ')}...</div>`;

    // Pass 'token' to all sub-functions
    switch (moduleName) {
        case 'dashboard':
            loadDashboardContent(contentArea, role, token);
            break;
        case 'hostel-room':
            loadHostelRoomContent(contentArea, role, token);
            break;
        case 'student-mgmt':
            loadStudentMgmtContent(contentArea, role, token);
            break;
        case 'complaints':
            loadComplaintsModule(contentArea, role, token);
            break;
        
        // --- THIS IS THE CORRECTED 'FEES' CASE ---
        case 'fees':
            loadFeesModule(contentArea, role, token);
            break;
        // ------------------------------------------

        case 'notice':
            loadNoticeModule(contentArea, role, token); // <--- This now "links" to your new code
            break;
        case 'visitors':
            loadVisitorModule(contentArea, role, token);
            break;
        case 'staff-mgmt':
            loadStaffModule(contentArea, role, token);
            break;
        case 'attendance':
            loadAttendanceModule(contentArea, role, token);
            break;
        default:
            contentArea.innerHTML = '<h2>Module Not Found</h2>';
    }
}

/**
 * Handles user logout.
 */
function handleLogout() {
    localStorage.clear(); // Clears all items
    window.location.href = 'login.html';
}


// ==========================================================
// B. DASHBOARD MODULE (Default View)
// ==========================================================

async function loadDashboardContent(contentArea, role, token) {
    // TODO: Fetch real metrics from API
    const metrics = { totalRooms: 150, occupiedRooms: 120, openComplaints: 15, pendingDues: 35, vacancy: 30 };
    contentArea.innerHTML = `
        <div class="welcome-card">
            <h2>Dashboard Overview (${role.toUpperCase()})</h2>
            <p>Quick summary of hostel status and key tasks.</p>
            <div id="statsSummary">
                <div class="stat-box"><h4>Total Rooms</h4><span class="value">${metrics.totalRooms}</span></div>
                <div class="stat-box"><h4>Vacant Beds</h4><span class="value" style="color: var(--success-color);">${metrics.vacancy}</span></div>
                <div class="stat-box"><h4>Open Complaints</h4><span class="value" style="color: var(--danger-color);">${metrics.openComplaints}</span></div>
                <div class="stat-box" data-access="admin"><h4>Pending Fees</h4><span class="value" style="color: var(--danger-color);">${metrics.pendingDues}</span></div>
            </div>
        </div>`;
    applyRBAC(role, contentArea.querySelector('#statsSummary'));
}


// ==========================================================
// C. HOSTEL & ROOM MANAGEMENT MODULE
// ==========================================================

function loadHostelRoomContent(contentArea, role, token) {
    contentArea.innerHTML = `
        <section class="portal-section">
            <h2><i class="fas fa-building"></i> Hostel & Room Management</h2>
            <p>Review, create, and manage all accommodation assets.</p>
            <div class="module-controls">
                ${role === 'admin' ? '<button id="showHostelFormBtn" class="action-btn primary-btn"><i class="fas fa-plus"></i> Add New Hostel</button>' : ''}
                <button id="showRoomFormBtn" class="action-btn success-btn"><i class="fas fa-plus"></i> Add New Room</button>
            </div>

            <div id="hostelFormArea" class="form-card" style="display: none;">
                <h3>Create New Hostel Block</h3>
                <form id="createHostelForm" class="data-form">
                    <div class="form-group"><label>Hostel Name:</label><input type="text" id="hostelName" placeholder="e.g., Boys Block C" required></div>
                    <div class="form-group"><label>Total Estimated Capacity:</label><input type="number" id="totalCapacity" placeholder="e.g., 100" required></div>
                    <div class="form-group"><label>Gender Type:</label>
                        <select id="genderType" required>
                            <option value="" disabled selected>Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                    <button type="submit" class="btn-submit">Submit Hostel</button>
                </form>
            </div>

            <div id="roomFormArea" class="form-card" style="display: none;">
                 <h3>Create New Room</h3>
                 <form id="createRoomForm" class="data-form">
                    <div class="form-group"><label>Select Hostel:</label><select id="hostelSelect" required><option value="">-- Loading Hostels... --</option></select></div>
                    <div class="form-group"><label>Room Number:</label><input type="text" id="roomNumber" placeholder="e.g., A-103" required></div>
                    <div class="form-group"><label>Capacity (Beds):</label><input type="number" id="roomCapacity" placeholder="e.g., 2 or 3" required></div>
                    <div class="form-group"><label>Rent per Bed (₹):</label><input type="number" id="roomRent" placeholder="e.g., 4500" required></div>
                    <button type="submit" class="btn-submit">Submit Room</button>
                 </form>
                 <div id="roomFormMessage" class="message-area"></div>
            </div>

            <div class="data-view-container">
                <h3>Current Hostel Overview</h3>
                <table id="hostelListTable" class="data-table">
                    <thead>
                        <tr>
                            <th>Hostel Name</th>
                            <th>Warden</th>
                            <th>Type</th>
                            <th>Total Capacity</th>
                            <th>Occupancy</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="hostelTableBody"></tbody>
                </table>
            </div>
            
            <div class="data-view-container" style="margin-top:20px;">
                <h3>Room Inventory Status</h3>
                <table id="roomListTable" class="data-table">
                    <thead>
                        <tr>
                            <th>Room No.</th>
                            <th>Hostel</th>
                            <th>Capacity</th>
                            <th>Occupied</th>
                            <th>Status</th>
                            <th>Rent/Bed</th>
                        </tr>
                    </thead>
                    <tbody id="roomTableBody"></tbody>
                </table>
            </div>
        </section>
    `;
    
    setupHostelRoomHandlers(contentArea, token);
    fetchHostels(contentArea, token); 
    fetchRooms(contentArea, token);
}

function setupHostelRoomHandlers(contentArea, token) {
    const showHostelBtn = contentArea.querySelector('#showHostelFormBtn');
    const hostelFormArea = contentArea.querySelector('#hostelFormArea');
    const showRoomBtn = contentArea.querySelector('#showRoomFormBtn');
    const roomFormArea = contentArea.querySelector('#roomFormArea');
    const createHostelForm = contentArea.querySelector('#createHostelForm');
    const createRoomForm = contentArea.querySelector('#createRoomForm');
    
    if (showHostelBtn) {
        showHostelBtn.addEventListener('click', () => {
            hostelFormArea.style.display = hostelFormArea.style.display === 'block' ? 'none' : 'block';
            roomFormArea.style.display = 'none';
        });
    }
    
    if (showRoomBtn) {
        showRoomBtn.addEventListener('click', () => {
            roomFormArea.style.display = roomFormArea.style.display === 'block' ? 'none' : 'block';
            hostelFormArea.style.display = 'none';
            fetchHostels(contentArea, token, true); // true = populate dropdown
        });
    }

    if (createHostelForm) {
        createHostelForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                name: document.getElementById('hostelName').value,
                total_capacity: parseInt(document.getElementById('totalCapacity').value),
                gender_type: document.getElementById('genderType').value,
            };
            
            try {
                const response = await fetch(`${API_BASE_URL}/rooms/hostel`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
                    body: JSON.stringify(payload)
                });
                const data = await response.json();
                if (response.ok) {
                    alert('Hostel created successfully!');
                    loadModule('hostel-room', document.getElementById('mainContent'), localStorage.getItem('userRole'), token);
                } else {
                    alert(`Error: ${data.message}`);
                }
            } catch (error) { alert('Network error creating hostel.'); }
        });
    }

    if (createRoomForm) {
        createRoomForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const roomFormMessage = contentArea.querySelector('#roomFormMessage');
            roomFormMessage.textContent = 'Submitting...';
            
            const payload = {
                hostel: document.getElementById('hostelSelect').value,
                room_number: document.getElementById('roomNumber').value,
                capacity: parseInt(document.getElementById('roomCapacity').value),
                rent_per_bed: parseInt(document.getElementById('roomRent').value),
            };

            try {
                const response = await fetch(`${API_BASE_URL}/rooms/room`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
                    body: JSON.stringify(payload)
                });
                const data = await response.json();
                if (response.ok) {
                    roomFormMessage.textContent = 'Room created successfully!';
                    roomFormMessage.style.color = 'var(--success-color)';
                    createRoomForm.reset();
                    fetchRooms(contentArea, token); // Refresh the room list
                } else {
                    roomFormMessage.textContent = `Error: ${data.message}`;
                    roomFormMessage.style.color = 'var(--danger-color)';
                }
            } catch (error) { roomFormMessage.textContent = 'Network error creating room.'; }
        });
    }
}

async function fetchHostels(contentArea, token, populateDropdown = false) {
    const tableBody = contentArea.querySelector('#hostelListTable tbody');
    const selectHostel = contentArea.querySelector('#hostelSelect');
    
    try {
        const response = await fetch(`${API_BASE_URL}/rooms/hostel`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok && data.success) {
            // Case 1: Populate Dropdown (for "Add Room" form)
            if (populateDropdown && selectHostel) {
                selectHostel.innerHTML = '<option value="">-- Select Hostel --</option>';
                data.data.forEach(hostel => {
                    selectHostel.innerHTML += `<option value="${hostel._id}">${hostel.name}</option>`;
                });
            } 
            // Case 2: Populate Main Table (for Dashboard view)
            else if (tableBody) {
                tableBody.innerHTML = '';
                if (data.data.length === 0) {
                     tableBody.innerHTML = '<tr><td colspan="6">No hostels found. Add one to begin.</td></tr>';
                     return;
                }
                data.data.forEach(hostel => {
                    // Handle multiple wardens safely
                    const wardenNames = hostel.wardens && hostel.wardens.length > 0 
                        ? hostel.wardens.map(w => w.name).join(', ') 
                        : '<span style="color:#aaa;">Unassigned</span>';

                    tableBody.innerHTML += `
                        <tr>
                            <td><strong>${hostel.name}</strong></td>
                            <td>${wardenNames}</td>
                            <td>${hostel.gender_type}</td>
                            <td>${hostel.total_capacity}</td>
                            <td>${hostel.current_occupancy}</td>
                            <td><button class="action-btn small-btn primary-btn">Manage</button></td>
                        </tr>`;
                });
            }
        }
    } catch (error) { 
        console.error('Fetch Hostels Error:', error); 
    }
}
async function fetchRooms(contentArea, token) {
    const tableBody = contentArea.querySelector('#roomTableBody');
    if (!tableBody) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/rooms/status`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok && data.success) {
            tableBody.innerHTML = ''; 
            if (data.data.length === 0) {
                 tableBody.innerHTML = '<tr><td colspan="6">No rooms found. Add a hostel first, then add rooms.</td></tr>';
                 return;
            }
            data.data.forEach(room => {
                const statusColor = room.status === 'Available' ? 'var(--success-color)' : (room.status === 'Fully Occupied' ? 'var(--danger-color)' : '#E67E22');
                tableBody.innerHTML += `
                    <tr>
                        <td><strong>${room.room_number}</strong></td>
                        <td>${room.hostel.name}</td>
                        <td>${room.capacity}</td>
                        <td>${room.current_occupancy}</td>
                        <td style="color: ${statusColor}; font-weight: 600;">${room.status}</td>
                        <td>₹${room.rent_per_bed.toLocaleString()}</td>
                    </tr>`;
            });
        }
    } catch (error) { console.error('Fetch Rooms Error:', error); }
}


// ==========================================================
// D. STUDENT ALLOTMENT MODULE
// ==========================================================

function loadStudentMgmtContent(contentArea, role, token) {
    contentArea.innerHTML = `
        <section class="portal-section">
            <h2><i class="fas fa-user-graduate"></i> Student Profiles & Allotment</h2>
            
            <div class="data-view-container">
                <h3>Allot Room to Student</h3>
                <div class="allotment-controls">
                    <div class="form-group">
                        <label for="unallottedStudentSelect">1. Select Student (Unallotted)</label>
                        <select id="unallottedStudentSelect" required><option value="">-- Loading Students... --</option></select>
                    </div>
                    <div class="form-group">
                        <label for="availableRoomSelect">2. Select Room (With Vacancy)</label>
                        <select id="availableRoomSelect" required><option value="">-- Loading Rooms... --</option></select>
                    </div>
                    <button id="allotRoomBtn" class="btn-submit"><i class="fas fa-check-circle"></i> Allot Room</button>
                </div>
                <div id="allotmentMessage" class="message-area" style="margin-top: 15px;"></div>
            </div>

            <div class="data-view-container" style="margin-top: 25px;">
                <h3>Full Student Directory</h3>
                <table id="fullStudentListTable" class="data-table">
                    <thead>
                        <tr>
                            <th>Roll No.</th>
                            <th>Name</th>
                            <th>Hostel</th>
                            <th>Room No.</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="studentTableBody"></tbody>
                </table>
            </div>
        </section>
    `;

    setupAllotmentHandlers(contentArea, token);
    fetchFullStudentList(contentArea, token);
}

async function setupAllotmentHandlers(contentArea, token) {
    await fetchUnallottedStudents(contentArea, token);
    await fetchAvailableRooms(contentArea, token);

    const allotRoomBtn = contentArea.querySelector('#allotRoomBtn');
    const allotmentMessage = contentArea.querySelector('#allotmentMessage');
    
    if (allotRoomBtn) {
        allotRoomBtn.addEventListener('click', async () => {
            const studentId = contentArea.querySelector('#unallottedStudentSelect').value;
            const roomId = contentArea.querySelector('#availableRoomSelect').value;
            
            if (!studentId || !roomId) {
                allotmentMessage.textContent = 'Error: Please select both a student and a room.';
                allotmentMessage.style.color = 'var(--danger-color)';
                return;
            }
            if (!confirm('Confirm: Assign this student to this room?')) return;

            allotmentMessage.textContent = 'Processing...';
            allotmentMessage.style.color = 'gray';

            try {
                const response = await fetch(`${API_BASE_URL}/students/allot`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
                    body: JSON.stringify({ studentId, roomId })
                });
                const data = await response.json();
                if (response.ok) {
                    allotmentMessage.textContent = `Success! ${data.message}`;
                    allotmentMessage.style.color = 'var(--success-color)';
                    loadModule('student-mgmt', document.getElementById('mainContent'), localStorage.getItem('userRole'), token);
                } else {
                    allotmentMessage.textContent = `Allotment failed: ${data.message}`;
                    allotmentMessage.style.color = 'var(--danger-color)';
                }
            } catch (error) { 
                allotmentMessage.textContent = 'Network error during allotment.';
                allotmentMessage.style.color = 'var(--danger-color)';
            }
        });
    }
}

async function fetchUnallottedStudents(contentArea, token) {
    const selectElement = contentArea.querySelector('#unallottedStudentSelect');
    try {
        const response = await fetch(`${API_BASE_URL}/students/unallotted`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
            selectElement.innerHTML = '<option value="">-- Select Student --</option>';
            data.data.forEach(student => {
                selectElement.innerHTML += `<option value="${student._id}">${student.name} (Roll: ${student.roll_number})</option>`;
            });
            if (data.data.length === 0) {
                 selectElement.innerHTML = '<option value="">-- No Students Awaiting Allotment --</option>';
            }
        }
    } catch (error) { console.error('Fetch Unallotted Students Error:', error); }
}

async function fetchAvailableRooms(contentArea, token) {
    const selectElement = contentArea.querySelector('#availableRoomSelect');
    try {
        const response = await fetch(`${API_BASE_URL}/rooms/status`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
            selectElement.innerHTML = '<option value="">-- Select Available Room --</option>';
            const availableRooms = data.data.filter(room => room.current_occupancy < room.capacity);
            availableRooms.forEach(room => {
                const available = room.capacity - room.current_occupancy;
                selectElement.innerHTML += `<option value="${room._id}">${room.hostel.name} - ${room.room_number} (${available} beds free)</option>`;
            });
            if (availableRooms.length === 0) {
                 selectElement.innerHTML = '<option value="">-- NO VACANT ROOMS --</option>';
            }
        }
    } catch (error) { console.error('Fetch Available Rooms Error:', error); }
}

async function fetchFullStudentList(contentArea, token) {
    const tableBody = contentArea.querySelector('#studentTableBody');
    if (!tableBody) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/students`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok) {
            tableBody.innerHTML = ''; 
            data.data.forEach(student => {
                const hostelName = student.current_room ? student.current_room.hostel.name : 'N/A';
                const roomNum = student.current_room ? student.current_room.room_number : 'N/A';
                const status = student.is_resident ? 'Allotted' : 'Pending';
                
                const row = tableBody.insertRow();
                row.innerHTML = `
                    <td>${student.roll_number}</td>
                    <td>${student.name}</td>
                    <td>${hostelName}</td>
                    <td>${roomNum}</td>
                    <td><span class="status-tag status-${status.toLowerCase()}">${status}</span></td>
                    <td><button class="action-btn small-btn primary-btn">View</button></td>
                `;
            });
            if (data.data.length === 0) {
                 tableBody.innerHTML = '<tr><td colspan="6">No students found.</td></tr>';
            }
        } else {
            tableBody.innerHTML = `<tr><td colspan="6" style="color:red;">Error: ${data.message}</td></tr>`;
        }
    } catch (error) {
        console.error('Fetch Student List Error:', error);
        tableBody.innerHTML = '<tr><td colspan="6" style="color:red;">Network error.</td></tr>';
    }
}


// ==========================================================
// E. COMPLAINT MANAGEMENT MODULE
// ==========================================================

function loadComplaintsModule(contentArea, role, token) {
    contentArea.innerHTML = `
        <section class="portal-section">
            <h2><i class="fas fa-headset"></i> Complaint & Maintenance Dashboard</h2>
            <p>Review, assign, and resolve all student-submitted requests.</p>
            <div id="complaintDashboardList" class="data-view-container" style="margin-top: 20px;">
                <table class="data-table">
                    <thead><tr><th>Status</th><th>Student</th><th>Title / Type</th><th>Submitted On</th><th>Action</th></tr></thead>
                    <tbody id="complaintTableBody"></tbody>
                </table>
            </div>
        </section>
    `;
    fetchAllComplaints(contentArea, token);
}

async function fetchAllComplaints(contentArea, token) {
    const tableBody = contentArea.querySelector('#complaintTableBody');
    tableBody.innerHTML = '<tr><td colspan="5">Loading all complaints...</td></tr>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/complaints`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok && data.success) {
            tableBody.innerHTML = '';
             if (data.data.length === 0) {
                 tableBody.innerHTML = '<tr><td colspan="5">No complaints found.</td></tr>';
                 return;
            }
            data.data.forEach(complaint => {
                tableBody.innerHTML += `
                    <tr>
                        <td><span class="status-tag status-${complaint.status.toLowerCase().replace(' ', '-')}">${complaint.status}</span></td>
                        <td><strong>${complaint.student.name}</strong><br><small>${complaint.student.roll_number}</small></td>
                        <td><strong>${complaint.title}</strong><br><small>${complaint.type}</small></td>
                        <td>${new Date(complaint.createdAt).toLocaleDateString()}</td>
                        <td>
                            <select class="action-dropdown" data-id="${complaint._id}">
                                <option value="" disabled ${complaint.status === 'New' ? 'selected' : ''}>Change Status</option>
                                <option value="In Review" ${complaint.status === 'In Review' ? 'selected' : ''}>In Review</option>
                                <option value="Assigned" ${complaint.status === 'Assigned' ? 'selected' : ''}>Assigned</option>
                                <option value="Resolved" ${complaint.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                                <option value="Closed" ${complaint.status === 'Closed' ? 'selected' : ''}>Closed</option>
                            </select>
                        </td>
                    </tr>
                `;
            });
            setupComplaintHandlers(contentArea, token);
        } else {
            tableBody.innerHTML = `<tr><td colspan="5" style="color:red;">Error: ${data.message}</td></tr>`;
        }
    } catch (error) {
        console.error('Fetch All Complaints Error:', error);
        tableBody.innerHTML = `<tr><td colspan="5" style="color:red;">Network Error.</td></tr>`;
    }
}

function setupComplaintHandlers(contentArea, token) {
    contentArea.querySelectorAll('.action-dropdown').forEach(dropdown => {
        dropdown.addEventListener('change', async (e) => {
            const newStatus = e.target.value;
            const complaintId = e.target.dataset.id;

            if (!newStatus) return;

            try {
                const response = await fetch(`${API_BASE_URL}/complaints/${complaintId}/status`, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
                    body: JSON.stringify({ status: newStatus })
                });
                const data = await response.json();
                if (response.ok) {
                    alert('Status updated successfully!');
                    fetchAllComplaints(contentArea, token); // Refresh the table
                } else {
                    alert(`Update failed: ${data.message}`);
                }
            } catch (error) { alert('Network error during status update.'); }
        });
    });
}

// ==========================================================
// F. FEES & BILLING MODULE (ADMIN)
// ==========================================================

function loadFeesModule(contentArea, role, token) {
    contentArea.innerHTML = `
        <section class="portal-section">
            <h2><i class="fas fa-file-invoice-dollar"></i> Fees & Billing Management</h2>
            <p>Generate new invoices for students and track all outstanding payments.</p>

            <div class="form-card" id="invoiceFormArea">
                <h3>Generate New Invoice</h3>
                <form id="createInvoiceForm" class="data-form">
                    <div class="form-group">
                        <label for="studentSelect">Select Student:</label>
                        <select id="studentSelect" required>
                            <option value="">-- Loading Students... --</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="feeType">Fee Type:</label>
                        <select id="feeType" required>
                            <option value="Hostel Rent">Hostel Rent</option>
                            <option value="Mess Charges">Mess Charges</option>
                            <option value="Security Deposit">Security Deposit</option>
                            <option value="Fine">Fine</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="billingPeriod">Billing Period:</label>
                        <input type="text" id="billingPeriod" placeholder="e.g., 'Nov 2025' or 'Semester 1'" required>
                    </div>
                    <div class="form-group">
                        <label for="amountDue">Amount Due (₹):</label>
                        <input type="number" id="amountDue" placeholder="e.g., 4500" required>
                    </div>
                    <div class="form-group">
                        <label for="dueDate">Due Date:</label>
                        <input type="date" id="dueDate" required>
                    </div>
                    
                    <button type="submit" class="btn-submit">Generate Invoice</button>
                </form>
                <div id="invoiceMessage" class="message-area" style="margin-top: 15px;"></div>
            </div>

            <div class="data-view-container" style="margin-top: 25px;">
                <h3><i class="fas fa-exclamation-circle"></i> Outstanding Dues</h3>
                <table id="pendingDuesTable" class="data-table">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Roll No.</th>
                            <th>Fee Type</th>
                            <th>Amount Due</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="duesTableBody">
                        </tbody>
                </table>
            </div>
        </section>
    `;

    // Attach event handlers and fetch data
    setupFeeActionHandlers(contentArea, token); // Renamed handler
    fetchPendingDues(contentArea, token);
}

/**
 * Attaches event listeners to Create Invoice, Mark Paid, and Delete buttons.
 */
async function setupFeeActionHandlers(contentArea, token) {
    // Populate the student dropdown for the invoice form
    await fetchAllStudentsForFees(contentArea, token);

    const createInvoiceForm = contentArea.querySelector('#createInvoiceForm');
    const invoiceMessage = contentArea.querySelector('#invoiceMessage');
    
    // --- 1. Handle Create Invoice ---
    if (createInvoiceForm) {
        createInvoiceForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            invoiceMessage.textContent = 'Processing...';
            invoiceMessage.style.color = 'gray';

            const payload = {
                studentId: document.getElementById('studentSelect').value,
                fee_type: document.getElementById('feeType').value,
                billing_period: document.getElementById('billingPeriod').value,
                amount_due: parseInt(document.getElementById('amountDue').value),
                due_date: document.getElementById('dueDate').value,
            };

            if (!payload.studentId) {
                invoiceMessage.textContent = 'Error: Please select a student.';
                invoiceMessage.style.color = 'var(--danger-color)';
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/fees/invoice`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
                    body: JSON.stringify(payload)
                });
                const data = await response.json();

                if (response.ok) {
                    invoiceMessage.textContent = 'Success! Invoice generated.';
                    invoiceMessage.style.color = 'var(--success-color)';
                    createInvoiceForm.reset();
                    fetchPendingDues(contentArea, token); // Refresh the table
                } else {
                    invoiceMessage.textContent = `Error: ${data.message || 'Check server.'}`;
                    invoiceMessage.style.color = 'var(--danger-color)';
                }
            } catch (error) {
                invoiceMessage.textContent = 'Network error during invoice creation.';
            }
        });
    }
    
    // --- 2. Handle "Mark as Paid" and "Delete" buttons (Event Delegation) ---
    const duesTable = contentArea.querySelector('#pendingDuesTable');
    if (duesTable) {
        duesTable.addEventListener('click', async (e) => {
            const target = e.target;
            const feeId = target.dataset.id;
            
            if (!feeId) return; // Clicked somewhere else

            // --- Handle Mark Paid ---
            if (target.classList.contains('mark-paid')) {
                if (!confirm('Mark this invoice as fully paid?')) return;
                
                try {
                    const response = await fetch(`${API_BASE_URL}/fees/${feeId}/payment`, {
                        method: 'PUT',
                        headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
                        body: JSON.stringify({ 
                            amount_paid: 9999999, // Dummy large number to signal full payment
                            payment_date: new Date().toISOString()
                        }) 
                    });
                    const data = await response.json();
                    if (response.ok) {
                        alert('Payment recorded!');
                        fetchPendingDues(contentArea, token); // Refresh
                    } else {
                        alert(`Failed: ${data.message}`);
                    }
                } catch (error) {
                    alert('Network error while marking as paid.');
                }
            }
            
            // --- Handle Delete ---
            if (target.classList.contains('delete-invoice')) {
                if (!confirm('ARE YOU SURE you want to delete this invoice? This cannot be undone.')) return;

                try {
                    const response = await fetch(`${API_BASE_URL}/fees/${feeId}`, {
                        method: 'DELETE',
                        headers: {'Authorization': `Bearer ${token}`}
                    });
                    const data = await response.json();
                    if (response.ok) {
                        alert('Invoice deleted!');
                        fetchPendingDues(contentArea, token); // Refresh
                    } else {
                        alert(`Failed to delete: ${data.message}`);
                    }
                } catch (error) {
                    alert('Network error while deleting invoice.');
                }
            }
        });
    }
}

/**
 * Fetches all students to populate the "Select Student" dropdown.
 */
async function fetchAllStudentsForFees(contentArea, token) {
    const selectElement = contentArea.querySelector('#studentSelect');
    if (!selectElement) return;

    try {
        const response = await fetch(`${API_BASE_URL}/students`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok && data.success) {
            selectElement.innerHTML = '<option value="">-- Select a Student --</option>';
            data.data.forEach(student => {
                selectElement.innerHTML += `<option value="${student._id}">${student.name} (Roll: ${student.roll_number})</option>`;
            });
        } else {
             selectElement.innerHTML = '<option value="">-- Error loading students --</option>';
        }
    } catch (error) {
        console.error('Fetch All Students Error:', error);
    }
}

/**
 * Fetches all pending/overdue fees (GET /api/v1/fees/dues)
 */
async function fetchPendingDues(contentArea, token) {
    const tableBody = contentArea.querySelector('#duesTableBody');
    tableBody.innerHTML = '<tr><td colspan="7">Loading pending dues...</td></tr>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/fees/dues`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok && data.success) {
            tableBody.innerHTML = ''; 
            if (data.data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="7">No outstanding dues found.</td></tr>';
                return;
            }
            
            data.data.forEach(fee => {
                const row = tableBody.insertRow();
                row.innerHTML = `
                    <td><strong>${fee.student.name}</strong></td>
                    <td>${fee.student.roll_number}</td>
                    <td>${fee.fee_type}</td>
                    <td>₹${fee.amount_due}</td>
                    <td>${new Date(fee.due_date).toLocaleDateString()}</td>
                    <td><span class="status-tag status-${fee.status.toLowerCase()}">${fee.status}</span></td>
                    <td>
                        <button class="action-btn small-btn success-btn mark-paid" data-id="${fee._id}">Mark Paid</button>
                        <button class="action-btn small-btn danger-btn delete-invoice" data-id="${fee._id}">Delete</button>
                    </td>
                `;
            });
            // Note: Handlers are now attached in setupFeeActionHandlers using event delegation

        } else {
            tableBody.innerHTML = `<tr><td colspan="7" style="color:red;">Error: ${data.message}</td></tr>`;
        }
    } catch (error) {
        console.error('Fetch Dues Error:', error);
    }
}

// ==========================================================
// G. NOTICE BOARD MODULE (ADMIN) - (CRUD Version)
// ==========================================================

/**
 * Loads the HTML structure for the Notice Board module.
 */
function loadNoticeModule(contentArea, role, token) {
    contentArea.innerHTML = `
        <section class="portal-section">
            <h2><i class="fas fa-bullhorn"></i> Notice Board Management</h2>
            <p>Create, edit, and delete announcements for students.</p>

            <div class="form-card" id="noticeFormArea">
                <h3 id="noticeFormTitle">Create New Notice</h3>
                <form id="createNoticeForm" class="data-form">
                    <input type="hidden" id="noticeEditId" value="">
                
                    <div class="form-group">
                        <label for="noticeTitle">Title:</label>
                        <input type="text" id="noticeTitle" placeholder="e.g., 'Mess Menu Update' or 'Maintenance Shutdown'" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="noticeHostel">Target Hostel (Optional):</label>
                        <select id="noticeHostel">
                            <option value="">-- All Hostels (Global) --</option>
                            </select>
                    </div>

                    <div class="form-group full-width">
                        <label for="noticeContent">Content:</label>
                        <textarea id="noticeContent" rows="6" placeholder="Write the full details of the announcement here..." required></textarea>
                    </div>
                    
                    <button type="submit" class="btn-submit" id="noticeSubmitBtn">Publish Notice</button>
                    <button type="button" class="action-btn" id="cancelEditBtn" style="display: none; background: #777; margin-left: 10px;">Cancel Edit</button>
                </form>
                <div id="noticeMessage" class="message-area" style="margin-top: 15px;"></div>
            </div>

            <div class="data-view-container" style="margin-top: 25px;">
                <h3>Published Notices</h3>
                <table id="noticeHistoryTable" class="data-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Target</th>
                            <th>Posted By</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="noticeTableBody">
                        </tbody>
                </table>
            </div>
        </section>
    `;

    // Attach event handlers and fetch data
    setupNoticeHandlers(contentArea, token);
    fetchAdminNotices(contentArea, token); // Fetch the list of notices
}

/**
 * Attaches event listeners for Create, Edit, and Delete.
 */
async function setupNoticeHandlers(contentArea, token) {
    // Populate the hostel dropdown
    await fetchHostelsForNotice(contentArea, token);

    const createNoticeForm = contentArea.querySelector('#createNoticeForm');
    const noticeMessage = contentArea.querySelector('#noticeMessage');
    const noticeFormTitle = contentArea.querySelector('#noticeFormTitle');
    const noticeSubmitBtn = contentArea.querySelector('#noticeSubmitBtn');
    const cancelEditBtn = contentArea.querySelector('#cancelEditBtn');
    const noticeEditId = contentArea.querySelector('#noticeEditId');
    const noticeTableBody = contentArea.querySelector('#noticeTableBody');

    // --- 1. Handle Create/Update Form Submission ---
    if (createNoticeForm) {
        createNoticeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            noticeMessage.textContent = 'Processing...';
            noticeMessage.style.color = 'gray';

            const payload = {
                title: document.getElementById('noticeTitle').value,
                content: document.getElementById('noticeContent').value,
                target_hostel: document.getElementById('noticeHostel').value || null,
            };

            const editId = noticeEditId.value;
            const isEditing = !!editId;
            
            const method = isEditing ? 'PUT' : 'POST';
            const url = isEditing ? `${API_BASE_URL}/misc/notice/${editId}` : `${API_BASE_URL}/misc/notice`;

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
                    body: JSON.stringify(payload)
                });
                const data = await response.json();

                if (response.ok) {
                    noticeMessage.textContent = `Success! Notice has been ${isEditing ? 'updated' : 'published'}.`;
                    noticeMessage.style.color = 'var(--success-color)';
                    resetNoticeForm();
                    fetchAdminNotices(contentArea, token); // Refresh the table
                } else {
                    noticeMessage.textContent = `Error: ${data.message || 'Check server.'}`;
                    noticeMessage.style.color = 'var(--danger-color)';
                }
            } catch (error) {
                noticeMessage.textContent = `Network error during notice ${isEditing ? 'update' : 'creation'}.`;
            }
        });
    }

    // --- 2. Handle Clicks on Edit/Delete Buttons (Event Delegation) ---
    noticeTableBody.addEventListener('click', async (e) => {
        const target = e.target.closest('button'); // Get the button that was clicked
        if (!target) return; // Exit if the click wasn't on a button

        const noticeId = target.dataset.id;
        
        // --- Handle DELETE ---
        if (target.classList.contains('delete-notice-btn')) {
            if (!confirm('Are you sure you want to delete this notice?')) return;

            try {
                const response = await fetch(`${API_BASE_URL}/misc/notice/${noticeId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    alert('Notice deleted successfully.');
                    fetchAdminNotices(contentArea, token); // Refresh the table
                } else {
                    alert(`Error: ${data.message}`);
                }
            } catch (error) {
                alert('Network error while deleting notice.');
            }
        }

        // --- Handle EDIT (Populate form) ---
        if (target.classList.contains('edit-notice-btn')) {
            // Fetch the notice details to populate the form
            const noticeRow = target.closest('tr');
            const title = noticeRow.dataset.title; // Get data from dataset
            const content = noticeRow.dataset.content;
            const targetHostelId = noticeRow.dataset.hostelid;
            
            noticeFormTitle.textContent = "Edit Notice";
            noticeSubmitBtn.textContent = "Update Notice";
            cancelEditBtn.style.display = "inline-block";
            noticeEditId.value = noticeId;
            
            document.getElementById('noticeTitle').value = title;
            document.getElementById('noticeContent').value = content;
            document.getElementById('noticeHostel').value = targetHostelId || "";
            
            // Scroll to the form
            noticeFormArea.scrollIntoView({ behavior: 'smooth' });
        }
    });

    // --- 3. Handle Cancel Edit Button ---
    cancelEditBtn.addEventListener('click', resetNoticeForm);
    
    function resetNoticeForm() {
        noticeFormTitle.textContent = "Create New Notice";
        noticeSubmitBtn.textContent = "Publish Notice";
        cancelEditBtn.style.display = "none";
        noticeEditId.value = "";
        createNoticeForm.reset();
        noticeMessage.textContent = "";
    }
}

/**
 * Fetches all notices for the admin table
 */
async function fetchAdminNotices(contentArea, token) {
    const tableBody = contentArea.querySelector('#noticeTableBody');
    tableBody.innerHTML = '<tr><td colspan="5">Loading notices...</td></tr>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/misc/notice`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (response.ok && data.success) {
            tableBody.innerHTML = '';
            if (data.data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5">No notices published yet.</td></tr>';
                return;
            }
            data.data.forEach(notice => {
                const row = tableBody.insertRow();
                // Store full data in dataset attributes for easy editing
                row.dataset.title = notice.title;
                row.dataset.content = notice.content;
                row.dataset.hostelid = notice.target_hostel ? notice.target_hostel._id : "";
                
                row.innerHTML = `
                    <td><strong>${notice.title}</strong></td>
                    <td>${notice.target_hostel ? notice.target_hostel.name : 'All Hostels'}</td>
                    <td>${notice.posted_by.name}</td>
                    <td>${new Date(notice.published_date).toLocaleDateString()}</td>
                    <td>
                        <button class="action-btn small-btn primary-btn edit-notice-btn" data-id="${notice._id}">Edit</button>
                        <button class="action-btn small-btn danger-btn delete-notice-btn" data-id="${notice._id}">Delete</button>
                    </td>
                `;
            });
        } else {
            tableBody.innerHTML = `<tr><td colspan="5" style="color:red;">Error: ${data.message}</td></tr>`;
        }
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="5" style="color:red;">Network Error.</td></tr>`;
    }
}

/**
 * Fetches all hostels to populate the "Target Hostel" dropdown. (Reused function)
 */
async function fetchHostelsForNotice(contentArea, token) {
    const selectElement = contentArea.querySelector('#noticeHostel');
    if (!selectElement) return;

    try {
        // We re-use the rooms/hostel endpoint as it's efficient
        const response = await fetch(`${API_BASE_URL}/rooms/hostel`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok && data.success) {
            data.data.forEach(hostel => {
                selectElement.innerHTML += `<option value="${hostel._id}">${hostel.name}</option>`;
            });
        }
    } catch (error) {
        console.error('Fetch Hostels for Notice Error:', error);
    }
}

// ==========================================================
// H. VISITOR MANAGEMENT MODULE (STAFF/WARDEN/ADMIN)
// ==========================================================

/**
 * Loads the HTML structure for the Visitor Log module.
 */
function loadVisitorModule(contentArea, role, token) {
    contentArea.innerHTML = `
        <section class="portal-section">
            <h2><i class="fas fa-user-check"></i> Visitor Management</h2>
            
            <div class="form-card" data-access="admin warden staff">
                <h3>Check In New Visitor</h3>
                <form id="checkInForm" class="data-form">
                    <div class="form-group">
                        <label for="visitorStudentSelect">Select Student to Visit:</label>
                        <select id="visitorStudentSelect" required>
                            <option value="">-- Loading Students... --</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="visitorName">Visitor's Full Name:</label>
                        <input type="text" id="visitorName" placeholder="Enter visitor's name" required>
                    </div>
                    <div class="form-group">
                        <label for="visitorPurpose">Purpose of Visit:</label>
                        <input type="text" id="visitorPurpose" placeholder="e.g., Parent, Friend" required>
                    </div>
                    <button type="submit" class="btn-submit">Check In Visitor</button>
                </form>
                <div id="visitorMessage" class="message-area" style="margin-top: 15px;"></div>
            </div>

            <div class="data-view-container" data-access="admin warden" style="margin-top: 25px;">
                <h3><i class="fas fa-history"></i> Visitor History Log</h3>
                <table id="visitorLogTable" class="data-table">
                    <thead>
                        <tr>
                            <th>Student Host</th>
                            <th>Visitor Name</th>
                            <th>Purpose</th>
                            <th>Checked In By</th>
                            <th>Entry Time</th>
                            <th>Exit Time</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="visitorLogBody">
                        </tbody>
                </table>
            </div>
        </section>
    `;

    // Apply RBAC to the new sections (this hides the table for 'staff')
    applyRBAC(role, contentArea);
    
    // Attach event handlers and fetch data
    setupVisitorHandlers(contentArea, token, role);
    if (role === 'admin' || role === 'warden') {
    fetchVisitorLog(contentArea, token);
}
}

/**
 * Attaches event listeners for the Check-In form and populates student list.
 */
async function setupVisitorHandlers(contentArea, token, role) {
    // Populate the student dropdown
    // This line is CORRECT:
    await fetchAllStudentsForVisitorDropdown(contentArea, token); 

    const checkInForm = contentArea.querySelector('#checkInForm');
    const visitorMessage = contentArea.querySelector('#visitorMessage');
    
    // 1. Handle Visitor Check-In
    if (checkInForm) {
        checkInForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            visitorMessage.textContent = 'Processing check-in...';
            visitorMessage.style.color = 'gray';

            const payload = {
                studentId: document.getElementById('visitorStudentSelect').value,
                visitor_name: document.getElementById('visitorName').value,
                purpose: document.getElementById('visitorPurpose').value,
            };

            if (!payload.studentId) {
                visitorMessage.textContent = 'Error: Please select a student.';
                visitorMessage.style.color = 'var(--danger-color)';
                return;
            }

            try {
                // API Call: POST /api/v1/misc/visitor/checkin
                const response = await fetch(`${API_BASE_URL}/misc/visitor/checkin`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (response.ok) {
                    visitorMessage.textContent = 'Success! Visitor checked in.';
                    visitorMessage.style.color = 'var(--success-color)';
                    checkInForm.reset();
                    // Refresh the log table if the user is a Warden/Admin
                    if (role === 'admin' || role === 'warden') {
                        fetchVisitorLog(contentArea, token);
                    }
                } else {
                    visitorMessage.textContent = `Error: ${data.message || 'Check server.'}`;
                    visitorMessage.style.color = 'var(--danger-color)';
                }
            } catch (error) {
                visitorMessage.textContent = 'Network error during check-in.';
            }
        });
    }

    // 2. Handle Visitor Check-Out (only for tables visible to Admin/Warden)
    const logTable = contentArea.querySelector('#visitorLogTable');
    if (logTable) {
        logTable.addEventListener('click', async (e) => {
            const target = e.target;
            // Check if the clicked element is a checkout button
            if (target.classList.contains('checkout-btn')) {
                const logId = target.dataset.id;
                if (!confirm('Confirm check-out for this visitor?')) return;

                try {
                    // API Call: PUT /api/vV1/misc/visitor/:id/checkout
                    const response = await fetch(`${API_BASE_URL}/misc/visitor/${logId}/checkout`, {
                        method: 'PUT',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await response.json();
                    if (response.ok) {
                        alert('Visitor checked out.');
                        fetchVisitorLog(contentArea, token); // Refresh table
                    } else {
                        alert(`Error: ${data.message}`);
                    }
                } catch (error) {
                    alert('Network error during check-out.');
                }
            }
        });
    }
}

/**
 * Fetches all students (with Roll No.) to populate the visitor dropdown.
 */
async function fetchAllStudentsForVisitorDropdown(contentArea, token) {
    const selectElement = contentArea.querySelector('#visitorStudentSelect');
    if (!selectElement) return;

    try {
        // We re-use the GET /api/v1/students endpoint
        const response = await fetch(`${API_BASE_URL}/students`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok && data.success) {
            selectElement.innerHTML = '<option value="">-- Select a Student --</option>';
            data.data.forEach(student => {
                // FIX: Add the Roll Number to the text
                selectElement.innerHTML += `<option value="${student._id}">${student.name} (Roll: ${student.roll_number})</option>`;
            });
        } else {
             selectElement.innerHTML = '<option value="">-- Error loading students --</option>';
        }
    } catch (error) {
        console.error('Fetch All Students Error:', error);
        selectElement.innerHTML = '<option value="">-- Network Error --</option>';
    }
}


/**
 * Fetches the full visitor log (for Admins/Wardens)
 */
async function fetchVisitorLog(contentArea, token) {
    const tableBody = contentArea.querySelector('#visitorLogBody');
    if (!tableBody) return; // Should only exist for Admin/Warden
    
    tableBody.innerHTML = '<tr><td colspan="7">Loading visitor history...</td></tr>';
    
    try {
        // API Call: GET /api/v1/misc/visitor/log
        const response = await fetch(`${API_BASE_URL}/misc/visitor/log`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok && data.success) {
            tableBody.innerHTML = ''; 
            if (data.data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="7">No visitor records found.</td></tr>';
                return;
            }
            
            data.data.forEach(log => {
                // Format Entry time
                const entry = new Date(log.entry_time).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
                
                let exit = 'N/A';
                let actionBtn = `<button class="action-btn small-btn danger-btn checkout-btn" data-id="${log._id}">Check-Out</Cbutton>`;

                // Format Exit time if it exists
                if (log.exit_time) {
                    exit = new Date(log.exit_time).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
                    actionBtn = `<span class="status-tag status-resolved">Checked Out</span>`;
                }

                const row = tableBody.insertRow();
                row.innerHTML = `
                    <td><strong>${log.student.name}</strong><br><small>${log.student.roll_number}</small></td>
                    <td>${log.visitor_name}</td>
                    <td>${log.purpose}</td>
                    <td>${log.checked_by.name}</td>
                    <td>${entry}</td>
                    <td>${exit}</td>
                    <td>${actionBtn}</td>
                `;
            });

        } else {
            tableBody.innerHTML = `<tr><td colspan="7" style="color:red;">Error: ${data.message}</td></tr>`;
        }
    } catch (error) {
        console.error('Fetch Visitor Log Error:', error);
        tableBody.innerHTML = `<tr><td colspan="7" style="color:red;">Network Error.</td></tr>`;
    }
}
// ==========================================================
// I. STUDENT LEAVE / ATTENDANCE MODULE
// ==========================================================

function loadAttendanceModule(contentArea, role, token) {
    contentArea.innerHTML = `
        <section class="portal-section">
            <h2><i class="fas fa-walking"></i> Student Leave & Gate Log</h2>
            
            <div class="form-card" data-access="admin warden staff">
                <h3>Log Student Check-Out</h3>
                <form id="checkOutForm" class="data-form">
                    <div class="form-group">
                        <label for="studentSelect">Select Student:</label>
                        <select id="studentSelect" required>
                            <option value="">-- Loading Students... --</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="leaveType">Leave Type:</label>
                        <select id="leaveType" required>
                            <option value="Local Leave (Market)">Local Leave (Market)</option>
                            <option value="Day Pass">Day Pass</option>
                            <option value="Out-of-Station (Home)">Out-of-Station (Home)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="expectedInDate">Expected Return Date:</label>
                        <input type="date" id="expectedInDate" required>
                    </div>
                    <div class="form-group">
                        <label for="expectedInTime">Expected Return Time:</label>
                        <input type="time" id="expectedInTime" required>
                    </div>
                    <button type="submit" class="btn-submit danger-btn">Check-Out Student</button>
                </form>
                <div id="checkOutMessage" class="message-area" style="margin-top: 15px;"></div>
            </div>

            <div class="data-view-container" data-access="admin warden staff" style="margin-top: 25px;">
                <h3><i class="fas fa-door-open"></i> Students Currently Out</h3>
                <table id="currentlyOutTable" class="data-table">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Leave Type</th>
                            <th>Checked Out By</th>
                            <th>Out Time</th>
                            <th>Expected In</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="currentlyOutBody">
                        </tbody>
                </table>
            </div>
        </section>
    `;

    applyRBAC(role, contentArea);
    setupAttendanceHandlers(contentArea, token, role);
}

async function setupAttendanceHandlers(contentArea, token, role) {
    // Reuse the student fetcher from Fees module as requested
    await fetchAllStudentsForFees(contentArea, token); 

    const checkOutForm = contentArea.querySelector('#checkOutForm');
    const checkOutMessage = contentArea.querySelector('#checkOutMessage');
    
    if (checkOutForm) {
        checkOutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const studentId = document.getElementById('studentSelect').value;
            const leaveType = document.getElementById('leaveType').value;
            const dateStr = document.getElementById('expectedInDate').value;
            const timeStr = document.getElementById('expectedInTime').value;

            // 1. Strict Frontend Validation
            if (!studentId) {
                checkOutMessage.textContent = 'Error: Please select a student.';
                checkOutMessage.style.color = 'var(--danger-color)';
                return;
            }
            if (!dateStr || !timeStr) {
                checkOutMessage.textContent = 'Error: Both Date and Time are required.';
                checkOutMessage.style.color = 'var(--danger-color)';
                return;
            }

            // 2. Combine into standard ISO format (YYYY-MM-DDTHH:MM)
            const combinedDateTime = `${dateStr}T${timeStr}`;
            
            checkOutMessage.textContent = 'Processing...';
            checkOutMessage.style.color = 'gray';

            try {
                const response = await fetch(`${API_BASE_URL}/attendance/checkout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ 
                        studentId, 
                        leave_type: leaveType, 
                        expected_in_time: combinedDateTime 
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    checkOutMessage.textContent = 'Success! Student checked out.';
                    checkOutMessage.style.color = 'var(--success-color)';
                    checkOutForm.reset();
                    // IMPORTANT: Re-populate dropdown after reset wipes it
                    await fetchAllStudentsForFees(contentArea, token);
                    // Refresh log table if visible
                    if (role === 'admin' || role === 'warden' || role === 'staff') {
                        fetchAttendanceLog(contentArea, token);
                    }
                } else {
                    checkOutMessage.textContent = `Error: ${data.message}`;
                    checkOutMessage.style.color = 'var(--danger-color)';
                }
            } catch (error) {
                checkOutMessage.textContent = 'Network error during check-out.';
                checkOutMessage.style.color = 'var(--danger-color)';
            }
        });
    }
    // 2. Handle Student Check-In
    const outTable = contentArea.querySelector('#currentlyOutTable');
    if (outTable) {
        // Fetch the log data for the table
        fetchAttendanceLog(contentArea, token);

        outTable.addEventListener('click', async (e) => {
            const target = e.target;
            if (target.classList.contains('checkin-btn')) {
                const logId = target.dataset.id;
                if (!confirm('Confirm student has returned?')) return;

                try {
                    const response = await fetch(`${API_BASE_URL}/attendance/checkin/${logId}`, {
                        method: 'PUT',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await response.json();
                    if (response.ok) {
                        alert('Student checked in.');
                        fetchAttendanceLog(contentArea, token); // Refresh table
                    } else {
                        alert(`Error: ${data.message}`);
                    }
                } catch (error) {
                    alert('Network error during check-in.');
                }
            }
        });
    }
}

async function fetchAttendanceLog(contentArea, token) {
    const tableBody = contentArea.querySelector('#currentlyOutBody');
    if (!tableBody) return; 
    
    tableBody.innerHTML = '<tr><td colspan="6">Loading log...</td></tr>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/attendance/log`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok && data.success) {
            tableBody.innerHTML = ''; 
            
            const studentsOut = data.data.filter(log => log.status === 'Out');
            
            if (studentsOut.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6">No students are currently checked out.</td></tr>';
                return;
            }
            
            studentsOut.forEach(log => {
                const out = new Date(log.out_time).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
                const expected = new Date(log.expected_in_time).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
                
                const row = tableBody.insertRow();
                row.innerHTML = `
                    <td><strong>${log.student.name}</strong><br><small>${log.student.roll_number}</small></td>
                    <td>${log.leave_type}</td>
                    <td>${log.approved_by.name}</td>
                    <td>${out}</td>
                    <td style="color:var(--danger-color); font-weight:600;">${expected}</td>
                    <td>
                        <button class="action-btn small-btn success-btn checkin-btn" data-id="${log._id}">Check-In</button>
                    </td>
                `;
            });
        } else {
            tableBody.innerHTML = `<tr><td colspan="6" style="color:red;">Error: ${data.message}</td></tr>`;
        }
    } catch (error) {
        console.error('Fetch Attendance Log Error:', error);
        tableBody.innerHTML = `<tr><td colspan="6" style="color:red;">Network Error.</td></tr>`;
    }
}

// ==========================================================
// J. STAFF MANAGEMENT MODULE (ADMIN ONLY)
// ==========================================================

function loadStaffModule(contentArea, role, token) {
    contentArea.innerHTML = `
        <section class="portal-section">
            <h2><i class="fas fa-users-cog"></i> Staff Account Management</h2>
            <p>Create, view, and manage accounts for Wardens and Staff.</p>

            <div class="form-card" id="staffFormArea">
                <h3 id="staffFormTitle">Create New Staff Account</h3>
                <form id="createStaffForm" class="data-form">
                    <input type="hidden" id="staffEditId" value="">
                    <div class="form-group">
                        <label for="staffName">Full Name:</label>
                        <input type="text" id="staffName" required>
                    </div>
                    <div class="form-group">
                        <label for="staffUsername">Username (for login):</label>
                        <input type="text" id="staffUsername" required>
                    </div>
                    <div class="form-group">
                        <label for="staffEmail">Email:</label>
                        <input type="email" id="staffEmail" required>
                    </div>
                    <div class="form-group">
                        <label for="staffPassword">Password:</label>
                        <input type="password" id="staffPassword" placeholder="Min 6 characters" required>
                    </div>
                    <div class="form-group">
                        <label for="staffRole">Role:</label>
                        <select id="staffRole" required>
                            <option value="staff">Staff (Maintenance, Security)</option>
                            <option value="warden">Warden</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="staffHostel">Assign to Hostel (Optional):</label>
                        <select id="staffHostelSelect">
                            <option value="">-- No Assignment --</option>
                            </select>
                    </div>
                    <button type="submit" class="btn-submit" id="staffSubmitBtn">Create Account</button>
                </form>
                <div id="staffMessage" class="message-area" style="margin-top: 15px;"></div>
            </div>

            <div class="data-view-container" style="margin-top: 25px;">
                <h3>Current Staff & Wardens</h3>
                <table id="staffListTable" class="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Assigned Hostel</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="staffTableBody">
                        </tbody>
                </table>
            </div>
        </section>
    `;

    setupStaffHandlers(contentArea, token);
    fetchStaffList(contentArea, token);
}

/**
 * Attaches event listeners for Create, Edit, and Delete.
 */
async function setupStaffHandlers(contentArea, token) {
    // Populate the hostel dropdown for the form
    await fetchHostels(contentArea, token, true, '#staffHostelSelect');

    const createStaffForm = contentArea.querySelector('#createStaffForm');
    const staffMessage = contentArea.querySelector('#staffMessage');

    // Handle Create Staff
    if (createStaffForm) {
        createStaffForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            staffMessage.textContent = 'Processing...';

            const payload = {
                name: document.getElementById('staffName').value,
                username: document.getElementById('staffUsername').value,
                email: document.getElementById('staffEmail').value,
                password: document.getElementById('staffPassword').value,
                role: document.getElementById('staffRole').value,
                assigned_hostel: document.getElementById('staffHostelSelect').value || null,
            };

            if (payload.password.length < 6) {
                staffMessage.textContent = 'Password must be at least 6 characters.';
                staffMessage.style.color = 'var(--danger-color)';
                return;
            }

            try {
                // API Call: POST /api/v1/staff
                const response = await fetch(`${API_BASE_URL}/staff`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
                    body: JSON.stringify(payload)
                });
                const data = await response.json();

                if (response.ok) {
                    staffMessage.textContent = 'Success! Staff account created.';
                    staffMessage.style.color = 'var(--success-color)';
                    createStaffForm.reset();
                    fetchStaffList(contentArea, token); // Refresh the table
                } else {
                    staffMessage.textContent = `Error: ${data.message || 'Check server.'}`;
                    staffMessage.style.color = 'var(--danger-color)';
                }
            } catch (error) {
                staffMessage.textContent = 'Network error during account creation.';
            }
        });
    }

    // Handle Delete
    const staffTable = contentArea.querySelector('#staffListTable');
    if (staffTable) {
        staffTable.addEventListener('click', async (e) => {
            const target = e.target;
            if (target.classList.contains('delete-staff-btn')) {
                const staffId = target.dataset.id;
                if (!confirm('ARE YOU SURE you want to delete this staff account?')) return;

                try {
                    // API Call: DELETE /api/v1/staff/:id
                    const response = await fetch(`${API_BASE_URL}/staff/${staffId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await response.json();
                    if (response.ok) {
                        alert('Staff account deleted.');
                        fetchStaffList(contentArea, token); // Refresh table
                    } else {
                        alert(`Error: ${data.message}`);
                    }
                } catch (error) {
                    alert('Network error during deletion.');
                }
            }
        });
    }
}

/**
 * Fetches all staff accounts (GET /api/v1/staff)
 */
async function fetchStaffList(contentArea, token) {
    const tableBody = contentArea.querySelector('#staffTableBody');
    tableBody.innerHTML = '<tr><td colspan="6">Loading staff list...</td></tr>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/staff`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok && data.success) {
            tableBody.innerHTML = ''; 
            if (data.data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6">No staff accounts found.</td></tr>';
                return;
            }
            
            data.data.forEach(user => {
                const row = tableBody.insertRow();
                row.innerHTML = `
                    <td><strong>${user.name}</strong></td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td><span class="status-tag status-${user.role === 'admin' ? 'resolved' : 'in-review'}">${user.role}</span></td>
                    <td>${user.assigned_hostel ? user.assigned_hostel.name : 'N/A'}</td>
                    <td>
                        <button class="action-btn small-btn danger-btn delete-staff-btn" data-id="${user._id}">Delete</button>
                    </td>
                `;
            });
        } else {
            tableBody.innerHTML = `<tr><td colspan="6" style="color:red;">Error: ${data.message}</td></tr>`;
        }
    } catch (error) {
        console.error('Fetch Staff List Error:', error);
        tableBody.innerHTML = `<tr><td colspan="6" style="color:red;">Network Error.</td></tr>`;
    }
}

/**
 * Re-use fetchHostels to populate the staff assignment dropdown.
 * We must update it to accept a custom selector.
 */
async function fetchHostels(contentArea, token, populateDropdown = false, dropdownSelector = '#hostelSelect') {
    const tableBody = contentArea.querySelector('#hostelTableBody');
    const selectHostel = contentArea.querySelector(dropdownSelector); // Use the provided selector
    
    try {
        const response = await fetch(`${API_BASE_URL}/rooms/hostel`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok && data.success) {
            if (populateDropdown && selectHostel) {
                selectHostel.innerHTML = '<option value="">-- Select Hostel --</option>';
                data.data.forEach(hostel => {
                    selectHostel.innerHTML += `<option value="${hostel._id}">${hostel.name}</option>`;
                });
            } else if (tableBody) {
                // Populate the main dashboard table
                tableBody.innerHTML = '';
                if (data.data.length === 0) {
                     tableBody.innerHTML = '<tr><td colspan="6">No hostels found.</td></tr>';
                     return;
                }
                data.data.forEach(hostel => {
                    tableBody.innerHTML += `
                        <tr>
                            <td><strong>${hostel.name}</strong></td>
                            <td>${hostel.warden ? hostel.warden.name : '<span style="color:#aaa;">N/A</span>'}</td>
                            <td>${hostel.gender_type}</td>
                            <td>${hostel.total_capacity}</td>
                            <td>${hostel.current_occupancy}</td>
                            <td><button class="action-btn small-btn primary-btn">Manage</button></td>
                        </tr>`;
                });
            }
        }
    } catch (error) { console.error('Fetch Hostels Error:', error); }
}