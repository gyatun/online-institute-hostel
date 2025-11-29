// client/assets/js/student.js (FINAL AND COMPLETE)

// CRITICAL FIX: Defines the base URL for your running server (Port 4000)
const API_BASE_URL = 'http://localhost:4006/api/v1'; 

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial Setup and Security Check
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName');
    
    // Get Elements
    const userNameDisplay = document.getElementById('userNameDisplay');
    const userRollDisplay = document.getElementById('userRollDisplay');
    const sidebarNav = document.getElementById('sidebarNav');
    const mainContent = document.getElementById('mainContent');
    const logoutBtn = document.getElementById('logoutBtn');

    // --- SECURITY CHECK AND REDIRECT ---
    if (!token || userRole !== 'student') {
        alert('Access denied. Please log in as a student.');
        window.location.href = 'login.html';
        return;
    }
    
    // Inject User Data
    userNameDisplay.textContent = `Welcome, ${userName || 'Student'}`;
    userRollDisplay.textContent = `ROLL NO: ${localStorage.getItem('userRollNumber') || 'N/A'}`; 
    
    // --- EVENT LISTENERS ---
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    if (sidebarNav) {
        sidebarNav.querySelectorAll('a[data-module]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                // Pass the token to the module loader
                loadModule(e.currentTarget.dataset.module, mainContent, token);
            });
        });
    }

    // Load the default dashboard view on page load
    loadModule('dashboard', mainContent, token);
});


// ==========================================================
// A. NAVIGATION FUNCTION: Loads content dynamically
// ==========================================================
function loadModule(moduleName, contentArea, token) {
    // Highlight the active link
    document.querySelectorAll('#sidebarNav a').forEach(a => a.classList.remove('active'));
    const activeLink = document.querySelector(`#sidebarNav a[data-module="${moduleName}"]`);
    if (activeLink) activeLink.classList.add('active');

    contentArea.innerHTML = `<div class="loading">Loading ${moduleName.replace('-', ' ')}...</div>`;

    // CRITICAL: This switch now calls the real functions
    switch (moduleName) {
        case 'dashboard':
            loadProfileContent(contentArea, token, false); // false = Dashboard view
            break;
        case 'profile':
            loadProfileContent(contentArea, token, true); // true = Full profile view
            break;
        
        // --- THIS IS THE CORRECTED 'FEES' CASE ---
        case 'fees-dues':
            loadFeesModule(contentArea, token); // Calls the function from Section D
            break;
        // ------------------------------------------

        case 'submit-complaint':
            loadComplaintSubmissionForm(contentArea, token);
            break;
        case 'complaint-history':
            loadComplaintHistoryView(contentArea, token);
            break;
        case 'notices':
            loadNoticesModule(contentArea, token); // Call our new function
            break;
        case 'attendance':
            loadStudentAttendance(contentArea, token);
            // TODO: Implement fetchAttendance(contentArea, token)
            break;
        case 'visitor-history':
            loadStudentVisitorLog(contentArea, token);
            // TODO: Implement loadVisitorRequestForm(contentArea, token)
            break;
        default:
            contentArea.innerHTML = '<h2>Error: Page Not Found</h2>';
    }
}


// ==========================================================
// B. IMPLEMENTED MODULES: Profile & Complaints
// ==========================================================

// --- 1. PROFILE & DASHBOARD LOADER (Uses GET /api/v1/students/me) ---
async function loadProfileContent(contentArea, token, isFullView) {
    if (isFullView) {
        contentArea.innerHTML = `<h2><i class="fas fa-user-circle"></i> My Profile & Accommodation</h2>
                                 <div id="profileDetailsCard" class="profile-card">Loading...</div>`;
    } else {
        contentArea.innerHTML = `<div class="welcome-card">
                                    <h2>Welcome, ${localStorage.getItem('userName')}!</h2>
                                    <p>Your centralized platform for all hostel-related services.</p>
                                    <div id="statsSummary"></div>
                                 </div>`;
    }

    const profileTarget = isFullView ? contentArea.querySelector('#profileDetailsCard') : contentArea.querySelector('#statsSummary');
    
    try {
        const response = await fetch(`${API_BASE_URL}/students/me`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok && data.success) {
            const student = data.data;
            const roomNo = student.current_room ? student.current_room.room_number : 'N/A';
            const hostelName = student.current_room ? student.current_room.hostel.name : 'N/A';
            const roomType = student.current_room ? `${student.current_room.capacity} Seater` : 'Unallotted';
            const statusColor = student.current_room ? 'var(--success-color)' : 'var(--danger-color)';
            
            if (isFullView) {
                // Render the full profile details card
                profileTarget.innerHTML = `
                    <h3>Personal Information</h3>
                    <div class="info-grid">
                        <div><strong>Roll Number:</strong> ${student.roll_number}</div>
                        <div><strong>Full Name:</strong> ${student.name}</div>
                        <div><strong>Email:</strong> ${student.email}</div>
                        <div><strong>Contact:</strong> ${student.contact || 'N/A'}</div>
                        <div><strong>Course/Branch:</strong> ${student.course || 'N/A'}</div>
                    </div>
                    <h3>Accommodation Status</h3>
                    <div class="info-grid">
                        <div><strong>Hostel Block:</strong> ${hostelName}</div>
                        <div><strong>Room Number:</strong> ${roomNo}</div>
                        <div><strong>Room Type:</strong> ${roomType}</div>
                        <div><strong>Residency Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${roomNo !== 'N/A' ? 'RESIDENT' : 'PENDING ALLOTMENT'}</span></div>
                    </div>
                `;
            } else {
                // Render the dashboard quick-stats
                profileTarget.innerHTML = `
                    <div class="stat-box"><h4>Hostel</h4><span class="value">${hostelName}</span></div>
                    <div class="stat-box"><h4>Room No.</h4><span class="value">${roomNo}</span></div>
                    <div class="stat-box"><h4>Fees Status</h4><span class="value" id="quickFeeStatus" style="color: var(--danger-color);">PENDING</span></div>
                    <div class="stat-box"><h4>Open Complaints</h4><span class="value" id="quickComplaintCount">0</span></div>
                `;
            }
        } else {
            profileTarget.innerHTML = `<p style="color: var(--danger-color);">Error loading profile: ${data.message}</p>`;
        }
    } catch (error) {
        console.error('Fetch Profile Error:', error);
        profileTarget.innerHTML = `<p style="color: var(--danger-color);">Network error while fetching profile.</p>`;
    }
}


// --- 2. COMPLAINT SUBMISSION FORM LOADER ---
function loadComplaintSubmissionForm(contentArea, token) {
    contentArea.innerHTML = `
        <section class="portal-section">
            <h2><i class="fas fa-exclamation-triangle"></i> Submit New Request</h2>
            <p>Please report any maintenance issues or general complaints here.</p>
            <form id="complaintForm" class="data-form">
                <div class="form-group">
                    <label for="complaintType">Type of Request:</label>
                    <select id="complaintType" name="type" required>
                        <option value="Maintenance Request">Maintenance (Plumbing, Electrical, Furniture)</option>
                        <option value="General Issue">General Issue (Cleanliness, Noise)</option>
                        <option value="Administrative">Administrative/Documentation</option>
                        <option value="Food/Mess">Food/Mess Feedback</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="complaintTitle">Title (e.g., "Fan not working"):</label>
                    <input type="text" id="complaintTitle" name="title" required>
                </div>
                <div class="form-group">
                    <label for="complaintDescription">Detailed Description:</label>
                    <textarea id="complaintDescription" name="description" rows="4" required></textarea>
                </div>
                <button type="submit" class="btn-submit">Submit Request</button>
            </form>
            <div id="submissionMessage" class="message-area" style="margin-top: 15px;"></div>
        </section>
    `;
    // Attach the event handler to the new form
    setupComplaintSubmissionHandler(contentArea, token);
}

// --- 3. COMPLAINT HISTORY VIEW LOADER ---
function loadComplaintHistoryView(contentArea, token) {
    contentArea.innerHTML = `
        <section class="portal-section">
            <h2><i class="fas fa-history"></i> My Complaint History</h2>
            <div id="complaintList" class="data-view-container">
                <p>Loading history...</p>
            </div>
        </section>
    `;
    // Fetch the data
    fetchComplaintHistory(contentArea, token);
}


// --- 4. COMPLAINT SUBMISSION API HANDLER (Uses POST /api/v1/complaints) ---
function setupComplaintSubmissionHandler(contentArea, token) {
    const complaintForm = contentArea.querySelector('#complaintForm');
    const submissionMessage = contentArea.querySelector('#submissionMessage');
    
    if (complaintForm) {
        complaintForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            submissionMessage.textContent = 'Submitting...';
            submissionMessage.style.color = 'gray';

            const payload = {
                type: document.getElementById('complaintType').value,
                title: document.getElementById('complaintTitle').value,
                description: document.getElementById('complaintDescription').value
            };

            try {
                const response = await fetch(`${API_BASE_URL}/complaints`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (response.ok) {
                    submissionMessage.textContent = `✅ Request submitted successfully! Status: New.`;
                    submissionMessage.style.color = 'var(--success-color)';
                    complaintForm.reset();
                } else {
                    submissionMessage.textContent = `❌ Submission failed: ${data.message || 'Unknown error'}`;
                    submissionMessage.style.color = 'var(--danger-color)';
                }
            } catch (error) {
                submissionMessage.textContent = '❌ Network error: Could not reach the API.';
                submissionMessage.style.color = 'red';
            }
        });
    }
}

// --- 5. COMPLAINT HISTORY API LOADER (Uses GET /api/v1/complaints/me) ---
async function fetchComplaintHistory(contentArea, token) {
    const complaintList = contentArea.querySelector('#complaintList');
    
    try {
        const response = await fetch(`${API_BASE_URL}/complaints/me`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            if (data.data.length === 0) {
                complaintList.innerHTML = '<p>You have not submitted any complaints yet.</p>';
                return;
            }

            const tableHTML = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Submitted On</th>
                            <th>Resolution</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.data.map(c => `
                            <tr>
                                <td>${c.title}</td>
                                <td>${c.type}</td>
                                <td><span class="status-tag status-${c.status.toLowerCase().replace(' ', '-')}">${c.status}</span></td>
                                <td>${new Date(c.createdAt).toLocaleDateString()}</td>
                                <td>${c.resolution_details || 'N/A'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            complaintList.innerHTML = tableHTML;

        } else {
            complaintList.innerHTML = `<p style="color:red;">Failed to load history: ${data.message || 'Check server logs.'}</p>`;
        }
    } catch (error) {
        complaintList.innerHTML = `<p style="color:red;">Network Error: Cannot connect to API.</p>`;
    }
}


// ==========================================================
// D. FEES & DUES MODULE (STUDENT)
// ==========================================================

/**
 * Loads the HTML structure for the student's fee history.
 */
function loadFeesModule(contentArea, token) {
    contentArea.innerHTML = `
        <section class="portal-section">
            <h2><i class="fas fa-wallet"></i> My Fees & Dues</h2>
            <p>Review your payment history and all outstanding charges.</p>

            <div id="feesSummary" class="stats-summary-bar">
                <div class="stat-box">
                    <h4>Total Outstanding</h4>
                    <span class="value" id="totalDueAmount" style="color: var(--danger-color);">₹0.00</span>
                </div>
            </div>

            <div id="feesHistoryList" class="data-view-container" style="margin-top: 20px;">
                <h3>Payment History</h3>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Billing Period</th>
                            <th>Fee Type</th>
                            <th>Amount Due</th>
                            <th>Amount Paid</th>
                            <th>Due Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="feesTableBody">
                        </tbody>
                </table>
            </div>
        </section>
    `;
    
    // Now, fetch the data to populate the table
    fetchStudentFees(contentArea, token);
}

/**
 * Fetches the student's fee history from the API (GET /api/v1/fees/me)
 */
async function fetchStudentFees(contentArea, token) {
    const tableBody = contentArea.querySelector('#feesTableBody');
    const totalDueAmountEl = contentArea.querySelector('#totalDueAmount');
    tableBody.innerHTML = '<tr><td colspan="7">Loading fee history...</td></tr>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/fees/me`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            if (data.data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="7">No fee records found.</td></tr>';
                totalDueAmountEl.textContent = '₹0.00';
                return;
            }

            tableBody.innerHTML = ''; // Clear loading message
            let totalDue = 0;
            
            data.data.forEach(fee => {
                let statusTag = '';
                let actionButton = '<button class="action-btn small-btn" disabled>Paid</button>';
                
                if (fee.status === 'Pending' || fee.status === 'Overdue' || fee.amount_paid < fee.amount_due) {
                    statusTag = `<span class="status-tag status-${fee.status.toLowerCase()}">${fee.status}</span>`;
                    actionButton = `<button class="action-btn small-btn success-btn pay-now" data-id="${fee._id}">Pay Now</button>`;
                    totalDue += (fee.amount_due - fee.amount_paid);
                } else {
                    statusTag = `<span class="status-tag status-resolved">${fee.status}</span>`; // 'Paid'
                }

                const row = tableBody.insertRow();
                row.innerHTML = `
                    <td>${statusTag}</td>
                    <td>${fee.billing_period}</td>
                    <td>${fee.fee_type}</td>
                    <td>₹${fee.amount_due.toLocaleString()}</td>
                    <td>₹${fee.amount_paid.toLocaleString()}</td>
                    <td>${new Date(fee.due_date).toLocaleDateString()}</td>
                    <td>${actionButton}</td>
                `;
            });
            
            // Update the summary bar
            totalDueAmountEl.textContent = `₹${totalDue.toLocaleString()}`;
            if (totalDue === 0) {
                totalDueAmountEl.style.color = 'var(--success-color)';
            }

            // Add event listeners for "Pay Now" buttons (optional, for future feature)
            contentArea.querySelectorAll('.pay-now').forEach(button => {
                button.addEventListener('click', () => {
                    alert('Payment gateway integration is not yet implemented.');
                });
            });

        } else {
            tableBody.innerHTML = `<tr><td colspan="7" style="color:red;">Error: ${data.message}</td></tr>`;
        }
    } catch (error) {
        console.error('Fetch Student Fees Error:', error);
        tableBody.innerHTML = `<tr><td colspan="7" style="color:red;">Network Error. Cannot reach API.</td></tr>`;
    }
}


// ==========================================================
// E. NOTICE BOARD MODULE (STUDENT)
// ==========================================================

/**
 * Loads the HTML structure for the student's notice board.
 */
function loadNoticesModule(contentArea, token) {
    contentArea.innerHTML = `
        <section class="portal-section">
            <h2><i class="fas fa-bullhorn"></i> Hostel Notices</h2>
            <p>View all recent announcements from the administration.</p>
            
            <div id="notice-list-container">
                </div>
        </section>
    `;
    
    // Now, fetch the data to populate the list
    fetchStudentNotices(contentArea, token);
}

/**
 * Fetches the student's notices from the API (GET /api/v1/misc/notice/student)
 */
async function fetchStudentNotices(contentArea, token) {
    const noticeContainer = contentArea.querySelector('#notice-list-container');
    noticeContainer.innerHTML = '<p>Loading notices...</p>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/misc/notice/student`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            if (data.data.length === 0) {
                noticeContainer.innerHTML = '<p>There are no notices at this time.</p>';
                return;
            }

            noticeContainer.innerHTML = ''; // Clear loading message
            
            data.data.forEach(notice => {
                const targetHostel = notice.target_hostel ? notice.target_hostel.name : 'All Hostels';
                
                // Create the notice card
                const noticeCard = document.createElement('div');
                noticeCard.className = 'notice-card';
                if (notice.is_urgent) {
                    noticeCard.classList.add('urgent');
                }
                
                noticeCard.innerHTML = `
                    <div class="notice-header">
                        <h3>${notice.title}</h3>
                        <span class="notice-meta">
                            Posted by ${notice.posted_by.name} (${notice.posted_by.role})
                        </span>
                    </div>
                    <div class="notice-content">
                        <p>${notice.content.replace(/\n/g, '<br>')}</p> 
                    </div>
                    <div class="notice-footer">
                        <span>Target: <strong>${targetHostel}</strong></span>
                        <span>Date: <strong>${new Date(notice.published_date).toLocaleDateString()}</strong></span>
                    </div>
                `;
                noticeContainer.appendChild(noticeCard);
            });

        } else {
            noticeContainer.innerHTML = `<p style="color:red;">Error: ${data.message}</p>`;
        }
    } catch (error) {
        console.error('Fetch Student Notices Error:', error);
        noticeContainer.innerHTML = `<p style="color:red;">Network Error. Cannot reach API.</p>`;
    }
}
// ==========================================================
// C. LOGOUT FUNCTION
// ==========================================================
function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRollNumber'); 
    window.location.href = 'login.html';
}

// ==========================================================
// F. VISITOR HISTORY MODULE (STUDENT)
// ==========================================================

function loadStudentVisitorLog(contentArea, token) {
    contentArea.innerHTML = `
        <section class="portal-section">
            <h2><i class="fas fa-users"></i> My Visitor History</h2>
            <p>A log of all visitors checked in under your name by hostel staff.</p>
            
            <div class="data-view-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Visitor Name</th>
                            <th>Purpose</th>
                            <th>Checked In By</th>
                            <th>Entry Time</th>
                            <th>Exit Time</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody id="visitorLogBody">
                        </tbody>
                </table>
            </div>
        </section>
    `;
    
    fetchStudentVisitorLog(contentArea, token);
}

async function fetchStudentVisitorLog(contentArea, token) {
    const tableBody = contentArea.querySelector('#visitorLogBody');
    tableBody.innerHTML = '<tr><td colspan="6">Loading your visitor history...</td></tr>';
    
    try {
        // API Call: GET /api/v1/misc/visitor/me
        const response = await fetch(`${API_BASE_URL}/misc/visitor/me`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok && data.success) {
            tableBody.innerHTML = ''; 
            if (data.data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6">You have no visitor records.</td></tr>';
                return;
            }
            
            data.data.forEach(log => {
                const entry = new Date(log.entry_time).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
                let exit = 'N/A';
                let statusTag = `<span class="status-tag status-in-progress">Checked-In</span>`;

                if (log.exit_time) {
                    exit = new Date(log.exit_time).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
                    statusTag = `<span class="status-tag status-resolved">Checked Out</span>`;
                }

                const row = tableBody.insertRow();
                row.innerHTML = `
                    <td><strong>${log.visitor_name}</strong></td>
                    <td>${log.purpose}</td>
                    <td>${log.checked_by.name}</td>
                    <td>${entry}</td>
                    <td>${exit}</td>
                    <td>${statusTag}</td>
                `;
            });
        } else {
            tableBody.innerHTML = `<tr><td colspan="6" style="color:red;">Error: ${data.message}</td></tr>`;
        }
    } catch (error) {
        console.error('Fetch Student Visitor Log Error:', error);
        tableBody.innerHTML = `<tr><td colspan="6" style="color:red;">Network Error.</td></tr>`;
    }
}

// ==========================================================
// G. STUDENT ATTENDANCE LOG MODULE
// ==========================================================

/**
 * Loads the HTML structure for the student's attendance/leave log.
 */
function loadStudentAttendance(contentArea, token) {
    contentArea.innerHTML = `
        <section class="portal-section">
            <h2><i class="fas fa-calendar-check"></i> My Attendance & Leave Log</h2>
            <p>This is a record of all your approved leaves (check-outs and check-ins).</p>

            <div class="data-view-container">
                <h3>My Log History</h3>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Leave Type</th>
                            <th>Approved By</th>
                            <th>Out Time</th>
                            <th>Expected In</th>
                            <th>Actual In Time</th>
                        </tr>
                    </thead>
                    <tbody id="attendanceLogBody">
                        </tbody>
                </table>
            </div>
        </section>
    `;
    
    // Now, fetch the data to populate the table
    fetchStudentAttendance(contentArea, token);
}

/**
 * Fetches the student's personal attendance log (GET /api/v1/attendance/me)
 */
async function fetchStudentAttendance(contentArea, token) {
    const tableBody = contentArea.querySelector('#attendanceLogBody');
    tableBody.innerHTML = '<tr><td colspan="6">Loading your attendance log...</td></tr>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/attendance/me`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            if (data.data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6">No leave records found.</td></tr>';
                return;
            }

            tableBody.innerHTML = ''; // Clear loading message
            
            data.data.forEach(log => {
                const outTime = new Date(log.out_time).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
                const expectedIn = new Date(log.expected_in_time).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
                
                let actualIn = '---';
                let statusTag = `<span class="status-tag status-in-progress">Out</span>`; // 'Out'

                if (log.status === 'Returned') {
                    actualIn = new Date(log.actual_in_time).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
                    statusTag = `<span class="status-tag status-resolved">Returned</span>`;
                }

                const row = tableBody.insertRow();
                row.innerHTML = `
                    <td>${statusTag}</td>
                    <td>${log.leave_type}</td>
                    <td>${log.approved_by.name}</td>
                    <td>${outTime}</td>
                    <td>${expectedIn}</td>
                    <td>${actualIn}</td>
                `;
            });

        } else {
            tableBody.innerHTML = `<tr><td colspan="6" style="color:red;">Error: ${data.message}</td></tr>`;
        }
    } catch (error) {
        console.error('Fetch Student Attendance Error:', error);
        tableBody.innerHTML = `<tr><td colspan="6" style="color:red;">Network Error. Cannot reach API.</td></tr>`;
    }
}