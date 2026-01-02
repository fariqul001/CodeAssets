// ==================== Modal Functions ====================

// Open modals
function openCompanyInfoModal() {
    document.getElementById('companyInfoModal').classList.add('show');
}

function openPlansModal() {
    document.getElementById('plansModal').classList.add('show');
}

function openMissionModal() {
    document.getElementById('missionModal').classList.add('show');
}

function openLoginModal() {
    document.getElementById('loginModal').classList.add('show');
}

function openRegisterModal() {
    document.getElementById('registerModal').classList.add('show');
}

// Close modal function
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('show');
    }
}

// ==================== Notification System ====================

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification show ${type}`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// ==================== Local Storage Management ====================

// Get all users from localStorage
function getAllUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

// Save user to localStorage
function saveUser(userData) {
    const users = getAllUsers();
    users.push(userData);
    localStorage.setItem('users', JSON.stringify(users));
}

// Find user by email
function findUserByEmail(email) {
    const users = getAllUsers();
    return users.find(user => user.email === email);
}

// Get current logged-in user
function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

// Set current logged-in user
function setCurrentUser(userData) {
    localStorage.setItem('currentUser', JSON.stringify(userData));
}

// Logout user
function logoutUser() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// ==================== Registration Handler ====================

function handleRegister(event) {
    event.preventDefault();

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const nid = document.getElementById('nid').value.trim();

    // Validation
    if (!fullName || !email || !password || !phone || !address || !nid) {
        showNotification('All fields are required!', 'error');
        return;
    }

    if (password.length < 6) {
        showNotification('Password must be at least 6 characters!', 'error');
        return;
    }

    // Check if user already exists
    if (findUserByEmail(email)) {
        showNotification('Email already registered!', 'error');
        return;
    }

    // Create user object
    const newUser = {
        id: Date.now(),
        fullName,
        email,
        password,
        phone,
        address,
        nid,
        registeredDate: new Date().toLocaleDateString(),
        membershipStatus: 'pending',
        totalInvestment: 0,
        installmentsPaid: 0
    };

    // Save user
    saveUser(newUser);

    // Show success notification
    showNotification('Registration successful!', 'success');

    // Display credentials
    document.getElementById('credEmail').textContent = email;
    document.getElementById('credPassword').textContent = password;

    // Close register modal and show credentials modal
    closeModal('registerModal');
    document.getElementById('credentialsModal').classList.add('show');

    // Reset form
    document.getElementById('registerForm').reset();
}

// Redirect to login after registration
function redirectToLogin() {
    closeModal('credentialsModal');
    openLoginModal();
}

// ==================== Login Handler ====================

function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Validation
    if (!email || !password) {
        showNotification('Email and password are required!', 'error');
        return;
    }

    // Find user
    const user = findUserByEmail(email);

    if (!user) {
        showNotification('User not found!', 'error');
        return;
    }

    if (user.password !== password) {
        showNotification('Invalid password!', 'error');
        return;
    }

    // Set current user and redirect
    setCurrentUser(user);
    showNotification('Login successful!', 'success');

    setTimeout(() => {
        // Check if user is admin
        if (user.role === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else {
            window.location.href = 'user-dashboard.html';
        }
    }, 1500);

    // Reset form
    document.getElementById('loginForm').reset();
}

// ==================== Page Load Checks ====================

// Check if user is logged in on dashboard pages
function checkAuthentication() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'index.html';
    }
    return currentUser;
}

// Initialize dashboard
function initializeDashboard() {
    const currentUser = checkAuthentication();
    if (currentUser) {
        document.getElementById('userFullName').textContent = currentUser.fullName;
        document.getElementById('userEmail').textContent = currentUser.email;
        document.getElementById('userAvatar').textContent = currentUser.fullName.charAt(0).toUpperCase();
    }
}

// ==================== Utility Functions ====================

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate phone number (basic validation)
function isValidPhone(phone) {
    const phoneRegex = /^[0-9]{10,}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
}

function createDefaultAdmin() {
    const users = getAllUsers();

    const adminExists = users.some(
        u => u.email === "admin@assetmanagement.com"
    );

    if (!adminExists) {
        users.push({
            id: Date.now(),
            fullName: "System Admin",
            email: "admin@assetmanagement.com",
            password: "admin123",
            role: "admin",
            registeredDate: new Date().toLocaleDateString()
        });

        localStorage.setItem("users", JSON.stringify(users));
        console.log("Default admin created");
    }
}

createDefaultAdmin();


console.log('App.js loaded successfully!');