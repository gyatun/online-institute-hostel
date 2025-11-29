// client/assets/js/auth.js (FINAL CORRECTED CODE)

// CRITICAL FIX: Define the base URL directly in the script for the browser.
// Uses your confirmed running port (8000) and the API base path.
const API_BASE_URL = 'http://localhost:4006/api/v1/auth'; 


document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

async function handleLogin(event) {
    event.preventDefault(); 

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value; 
    
    const submissionMessage = document.getElementById('submissionMessage');

    if (submissionMessage) { submissionMessage.textContent = ''; }

    if (!username || !password || !role) {
        alert("Please fill in all fields and select a role.");
        return;
    }

    // 1. Determine the correct API endpoint (Now uses the API_BASE_URL)
    let specific_route = '';
    
    if (role === 'student') {
        specific_route = '/student/login'; 
    } else {
        specific_route = '/staff/login';
    }

    // CRITICAL FIX: Construct the full, absolute URL
    const full_endpoint_url = API_BASE_URL + specific_route;

    try {
        // FIX: Use the fully qualified URL
        const response = await fetch(full_endpoint_url, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, role }),
        });

        const data = await response.json();

        if (response.ok) {
            // 2. SUCCESS: Store the JWT token and user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('userName', data.name);
            
            if (data.role === 'student') {
                 localStorage.setItem('userRollNumber', data.roll_number); 
            }
            
            // 3. Redirect to the appropriate portal (using your confirmed file names)
            if (data.role === 'student') {
                window.location.href = 'student.html'; 
            } 
            else if (data.role === 'admin' || data.role === 'warden' || data.role === 'staff') {
                window.location.href = 'admin.html'; 
            }
        } else {
            // 4. FAILURE
            const errorMessage = data.message || 'Invalid credentials or login failed.';
            if (submissionMessage) {
                submissionMessage.textContent = `Login Failed: ${errorMessage}`;
                submissionMessage.style.color = 'red';
            }
        }

    }  catch (error) {
        console.error('Network Error during login:', error);
        
        // --- CORRECTED ERROR MESSAGE ---
        const netErrorMsg = "A critical network error occurred. Ensure the server is running on port 4000.";
        
        if (submissionMessage) {
            submissionMessage.textContent = netErrorMsg;
            submissionMessage.style.color = 'red';
        } else {
            alert(netErrorMsg);
        }
    }

}