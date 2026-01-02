// ==================== Initialize Admin Dashboard ====================

document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuthentication();
    initializeAdminDashboard();
});

// Check if user is admin
function checkAdminAuthentication() {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
        // Create default admin if doesn't exist
        const adminUser = {
            id: 1,
            fullName: 'Admin User',
            email: 'admin@assetmanagement.com',
            password: 'admin123',
            phone: '1234567890',
            address: 'Admin Address',
            nid: '123456789',
            role: 'admin',
            registeredDate: new Date().toLocaleDateString()
        };
        
        // Save admin if not exists
        if (!findUserByEmail('admin@assetmanagement.com')) {
            saveUser(adminUser);
        }
        
        // Set as current user for demo
        setCurrentUser(adminUser);
    }
}

// Initialize admin dashboard
function initializeAdminDashboard() {
    const currentUser = getCurrentUser();
    
    document.getElementById('adminFullName').textContent = currentUser.fullName;
    document.getElementById('adminEmail').textContent = currentUser.email;
    document.getElementById('adminAvatar').textContent = currentUser.fullName.charAt(0).toUpperCase();
    
    // Load all data
    loadAdminDashboardData();
    loadUsersList();
    loadAssets();
    loadPendingPayments();
    loadMembershipApprovals();
}

// ==================== Admin Section Navigation ====================

function showAdminSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    // Show selected section
    document.getElementById(sectionId).style.display = 'block';

    // Update active menu link
    const menuLinks = document.querySelectorAll('.menu-link');
    menuLinks.forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');

    // Load section-specific data
    if (sectionId === 'users') {
        loadUsersList();
    } else if (sectionId === 'assets') {
        loadAssets();
    } else if (sectionId === 'payments') {
        loadPendingPayments();
    } else if (sectionId === 'membership') {
        loadMembershipApprovals();
    } else if (sectionId === 'reports') {
        loadReports();
    }
}

// ==================== Dashboard Overview ====================

function loadAdminDashboardData() {
    const users = getAllUsers();
    const assets = getAllAssets();
    const transactions = getAllTransactions();
    const installations = getInstallments();

    // Calculate stats
    const totalUsers = users.length;
    const totalAssets = assets.length;
    const totalInvestments = users.reduce((sum, user) => sum + (parseFloat(user.totalInvestment) || 0), 0);
    const pendingPaymentsCount = installations.filter(i => i.status === 'pending').length;

    // Update dashboard cards
    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('totalAssets').textContent = totalAssets;
    document.getElementById('totalInvestments').textContent = formatCurrency(totalInvestments);
    document.getElementById('pendingPayments').textContent = pendingPaymentsCount;

    // Load recent transactions
    loadRecentTransactionsAdmin();
}

function loadRecentTransactionsAdmin() {
    const transactions = getAllTransactions();
    const tableBody = document.getElementById('recentTransactionsAdmin');

    if (transactions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">No transactions available</td></tr>';
        return;
    }

    const recentTransactions = transactions.slice(-5).reverse();
    
    tableBody.innerHTML = recentTransactions.map(trans => {
        const user = findUserById(trans.userId);
        return `
            <tr>
                <td>${user ? user.fullName : 'Unknown User'}</td>
                <td>${formatCurrency(trans.amount)}</td>
                <td>${trans.type}</td>
                <td>${trans.date}</td>
                <td><span style="padding: 0.3rem 0.8rem; border-radius: 20px; background: ${getStatusColor(trans.status)}; color: white; font-size: 0.85rem;">${trans.status}</span></td>
            </tr>
        `;
    }).join('');
}

// ==================== Manage Users ====================

function loadUsersList() {
    const users = getAllUsers().filter(u => u.role !== 'admin');
    const tableBody = document.getElementById('usersList');

    if (users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No users found</td></tr>';
        return;
    }

    tableBody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.fullName}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${user.registeredDate}</td>
            <td><span style="padding: 0.3rem 0.8rem; border-radius: 20px; background: ${user.membershipStatus === 'active' ? '#27ae60' : '#f39c12'}; color: white; font-size: 0.85rem;">${user.membershipStatus}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-view" onclick="viewUserDetails(${user.id})">View</button>
                    <button class="btn-delete" onclick="deleteUser(${user.id})">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function findUserById(userId) {
    const users = getAllUsers();
    return users.find(u => u.id === userId);
}

function viewUserDetails(userId) {
    const user = findUserById(userId);
    if (user) {
        alert(`User Details:\n\nName: ${user.fullName}\nEmail: ${user.email}\nPhone: ${user.phone}\nAddress: ${user.address}\nNID: ${user.nid}\nTotal Investment: $${user.totalInvestment || 0}`);
    }
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        const users = getAllUsers();
        const filteredUsers = users.filter(u => u.id !== userId);
        localStorage.setItem('users', JSON.stringify(filteredUsers));
        showNotification('User deleted successfully!', 'success');
        loadUsersList();
        loadAdminDashboardData();
    }
}

// ==================== Asset Management ====================

function getAllAssets() {
    const assets = localStorage.getItem('assets');
    return assets ? JSON.parse(assets) : [];
}

function saveAssets(assets) {
    localStorage.setItem('assets', JSON.stringify(assets));
}

function loadAssets() {
    const assets = getAllAssets();
    const tableBody = document.getElementById('assetsList');

    if (assets.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No assets found</td></tr>';
        return;
    }

    tableBody.innerHTML = assets.map(asset => `
        <tr>
            <td>${asset.name}</td>
            <td>${asset.type}</td>
            <td>${formatCurrency(asset.purchaseCost)}</td>
            <td>${formatCurrency(asset.currentValue)}</td>
            <td>${asset.location}</td>
            <td><span style="padding: 0.3rem 0.8rem; border-radius: 20px; background: ${asset.status === 'Active' ? '#27ae60' : '#95a5a6'}; color: white; font-size: 0.85rem;">${asset.status || 'Active'}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="openEditAssetModal(${asset.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteAsset(${asset.id})">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openAddAssetModal() {
    document.getElementById('addAssetModal').classList.add('show');
}

function handleAddAsset(event) {
    event.preventDefault();

    const asset = {
        id: Date.now(),
        name: document.getElementById('assetName').value,
        type: document.getElementById('assetType').value,
        purchaseDate: document.getElementById('purchaseDate').value,
        purchaseCost: parseFloat(document.getElementById('purchaseCost').value),
        currentValue: parseFloat(document.getElementById('currentValue').value),
        location: document.getElementById('assetLocation').value,
        ownershipStatus: document.getElementById('ownershipStatus').value,
        description: document.getElementById('assetDescription').value,
        status: 'Active',
        createdDate: new Date().toLocaleDateString()
    };

    // Validation
    if (!asset.name || !asset.type || !asset.location) {
        showNotification('Please fill in all required fields!', 'error');
        return;
    }

    const assets = getAllAssets();
    assets.push(asset);
    saveAssets(assets);

    showNotification('Asset added successfully!', 'success');
    closeModal('addAssetModal');
    document.getElementById('assetForm').reset();
    loadAssets();
    loadAdminDashboardData();
}

function openEditAssetModal(assetId) {
    const assets = getAllAssets();
    const asset = assets.find(a => a.id === assetId);
    
    if (asset) {
        document.getElementById('editAssetId').value = asset.id;
        document.getElementById('editAssetName').value = asset.name;
        document.getElementById('editCurrentValue').value = asset.currentValue;
        document.getElementById('editAssetStatus').value = asset.status;
        document.getElementById('editAssetModal').classList.add('show');
    }
}

function handleEditAsset(event) {
    event.preventDefault();

    const assetId = parseInt(document.getElementById('editAssetId').value);
    const assets = getAllAssets();
    const assetIndex = assets.findIndex(a => a.id === assetId);

    if (assetIndex !== -1) {
        assets[assetIndex].name = document.getElementById('editAssetName').value;
        assets[assetIndex].currentValue = parseFloat(document.getElementById('editCurrentValue').value);
        assets[assetIndex].status = document.getElementById('editAssetStatus').value;
        
        saveAssets(assets);
        showNotification('Asset updated successfully!', 'success');
        closeModal('editAssetModal');
        loadAssets();
        loadAdminDashboardData();
    }
}

function deleteAsset(assetId) {
    if (confirm('Are you sure you want to delete this asset?')) {
        const assets = getAllAssets();
        const filteredAssets = assets.filter(a => a.id !== assetId);
        saveAssets(filteredAssets);
        showNotification('Asset deleted successfully!', 'success');
        loadAssets();
        loadAdminDashboardData();
    }
}

// ==================== Pending Payments ====================

function loadPendingPayments() {
    const installations = getInstallments();
    const pendingInstallments = installations.filter(i => i.status === 'pending');
    const tableBody = document.getElementById('pendingPaymentsList');

    if (pendingInstallments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No pending payments</td></tr>';
        return;
    }

    tableBody.innerHTML = pendingInstallments.map(inst => {
        const user = findUserById(inst.userId);
        return `
            <tr>
                <td>${user ? user.fullName : 'Unknown'}</td>
                <td>${formatCurrency(inst.amount)}</td>
                <td>${inst.type}</td>
                <td>${inst.submissionDate}</td>
                <td><span style="padding: 0.3rem 0.8rem; border-radius: 20px; background: #f39c12; color: white; font-size: 0.85rem;">Pending</span></td>
                <td>
                    <button class="btn-view" onclick="openPaymentVerificationModal(${inst.userId}, ${inst.amount})">Verify</button>
                </td>
            </tr>
        `;
    }).join('');
}

function openPaymentVerificationModal(userId, amount) {
    const user = findUserById(userId);
    
    document.getElementById('paymentDetails').innerHTML = `
        <p><strong>User:</strong> ${user.fullName}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Amount:</strong> ${formatCurrency(amount)}</p>
        <p><strong>Submission Date:</strong> ${new Date().toLocaleDateString()}</p>
    `;
    
    window.currentPaymentUserId = userId;
    window.currentPaymentAmount = amount;
    
    document.getElementById('paymentVerificationModal').classList.add('show');
}

function approvePayment() {
    const userId = window.currentPaymentUserId;
    const amount = window.currentPaymentAmount;
    
    const user = findUserById(userId);
    if (user) {
        user.totalInvestment = (parseFloat(user.totalInvestment) || 0) + parseFloat(amount);
        user.installmentsPaid = (user.installmentsPaid || 0) + 1;
        
        const users = getAllUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            users[userIndex] = user;
            localStorage.setItem('users', JSON.stringify(users));
        }
    }

    // Update installment status
    const installments = getInstallments();
    const pendingInstallment = installments.find(i => i.userId === userId && i.status === 'pending');
    if (pendingInstallment) {
        pendingInstallment.status = 'approved';
        localStorage.setItem('installments', JSON.stringify(installments));
    }

    showNotification('Payment approved successfully!', 'success');
    closeModal('paymentVerificationModal');
    loadPendingPayments();
    loadAdminDashboardData();
}

function rejectPayment() {
    const userId = window.currentPaymentUserId;
    
    const installments = getInstallments();
    const pendingInstallment = installments.find(i => i.userId === userId && i.status === 'pending');
    if (pendingInstallment) {
        pendingInstallment.status = 'rejected';
        localStorage.setItem('installments', JSON.stringify(installments));
    }

    showNotification('Payment rejected!', 'error');
    closeModal('paymentVerificationModal');
    loadPendingPayments();
    loadAdminDashboardData();
}

// ==================== Membership Approvals ====================

function loadMembershipApprovals() {
    const memberships = getMemberships();
    const pendingMemberships = memberships.filter(m => m.status === 'pending');
    const tableBody = document.getElementById('membershipList');

    if (pendingMemberships.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No pending memberships</td></tr>';
        return;
    }

    tableBody.innerHTML = pendingMemberships.map(membership => `
        <tr>
            <td>${membership.fullName}</td>
            <td>${membership.fullName}</td>
            <td>${membership.phone}</td>
            <td>${membership.applicationDate}</td>
            <td><span style="padding: 0.3rem 0.8rem; border-radius: 20px; background: #f39c12; color: white; font-size: 0.85rem;">Pending</span></td>
            <td>
                <button class="btn-success" onclick="approveMembership('${membership.fullName}')">Approve</button>
                <button class="btn-danger" onclick="rejectMembership('${membership.fullName}')">Reject</button>
            </td>
        </tr>
    `).join('');
}

function approveMembership(userName) {
    const memberships = getMemberships();
    const membership = memberships.find(m => m.fullName === userName);
    
    if (membership) {
        membership.status = 'active';
        localStorage.setItem('memberships', JSON.stringify(memberships));

        // Update user membership status
        const users = getAllUsers();
        const user = users.find(u => u.fullName === userName);
        if (user) {
            user.membershipStatus = 'active';
            localStorage.setItem('users', JSON.stringify(users));
        }
    }

    showNotification('Membership approved!', 'success');
    loadMembershipApprovals();
    loadAdminDashboardData();
}

function rejectMembership(userName) {
    const memberships = getMemberships();
    const membership = memberships.find(m => m.fullName === userName);
    
    if (membership) {
        membership.status = 'rejected';
        localStorage.setItem('memberships', JSON.stringify(memberships));
    }

    showNotification('Membership rejected!', 'error');
    loadMembershipApprovals();
    loadAdminDashboardData();
}

// ==================== Reports ====================

function loadReports() {
    const users = getAllUsers();
    const assets = getAllAssets();
    const transactions = getAllTransactions();

    const totalFund = transactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const totalAssetValue = assets.reduce((sum, a) => sum + parseFloat(a.currentValue || 0), 0);
    const activeMembers = users.filter(u => u.membershipStatus === 'active').length;

    document.getElementById('totalFund').textContent = formatCurrency(totalFund);
    document.getElementById('totalAssetValue').textContent = formatCurrency(totalAssetValue);
    document.getElementById('activeMembers').textContent = activeMembers;
}

function generateReport() {
    const users = getAllUsers();
    const assets = getAllAssets();
    const transactions = getAllTransactions();

    const report = `
    ===== ASSET MANAGEMENT SYSTEM - FULL REPORT =====
    Generated Date: ${new Date().toLocaleDateString()}
    
    SUMMARY:
    Total Users: ${users.length}
    Total Assets: ${assets.length}
    Total Transactions: ${transactions.length}
    
    USERS:
    ${users.map(u => `- ${u.fullName} (${u.email})`).join('\n')}
    
    ASSETS:
    ${assets.map(a => `- ${a.name} - ${a.type} - Value: $${a.currentValue}`).join('\n')}
    
    RECENT TRANSACTIONS:
    ${transactions.slice(-10).map(t => `- ${t.date}: $${t.amount} - ${t.type} - ${t.status}`).join('\n')}
    `;

    alert(report);
    console.log(report);
}

// ==================== Utility Functions ====================

function getAllTransactions() {
    const transactions = localStorage.getItem('transactions');
    return transactions ? JSON.parse(transactions) : [];
}

function getStatusColor(status) {
    switch(status) {
        case 'completed': return '#27ae60';
        case 'approved': return '#27ae60';
        case 'pending': return '#f39c12';
        case 'rejected': return '#e74c3c';
        default: return '#3498db';
    }
}

console.log('Admin Dashboard JS loaded successfully!');