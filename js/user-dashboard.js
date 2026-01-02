// ==================== Initialize Dashboard ====================

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    loadUserData();
});

// ==================== Section Navigation ====================

function showSection(sectionId) {
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
}

// ==================== Load User Data ====================

function loadUserData() {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Update header
    document.getElementById('userFullName').textContent = currentUser.fullName;
    document.getElementById('userEmail').textContent = currentUser.email;
    document.getElementById('userAvatar').textContent = currentUser.fullName.charAt(0).toUpperCase();

    // Update dashboard stats
    document.getElementById('totalInvestment').textContent = formatCurrency(currentUser.totalInvestment || 0);
    document.getElementById('installmentsPaid').textContent = currentUser.installmentsPaid || 0;
    document.getElementById('membershipStatus').textContent = currentUser.membershipStatus || 'Pending';

    // Update profile section
    document.getElementById('profileFullName').textContent = currentUser.fullName;
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('profilePhone').textContent = currentUser.phone;
    document.getElementById('profileAddress').textContent = currentUser.address;
    document.getElementById('profileNID').textContent = currentUser.nid;
    document.getElementById('profileRegisteredDate').textContent = currentUser.registeredDate;

    // Pre-fill edit profile form
    document.getElementById('editFullName').value = currentUser.fullName;
    document.getElementById('editPhone').value = currentUser.phone;
    document.getElementById('editAddress').value = currentUser.address;

    // Load transactions
    loadTransactions();
    loadInstallments();
}

// ==================== Transactions ====================

function loadTransactions() {
    const currentUser = getCurrentUser();
    const transactions = getTransactions(currentUser.id) || [];
    const tableBody = document.getElementById('recentTransactions');

    if (transactions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem;">No transactions yet</td></tr>';
        return;
    }

    tableBody.innerHTML = transactions.slice(0, 5).map(transaction => `
        <tr>
            <td>${transaction.date}</td>
            <td>${formatCurrency(transaction.amount)}</td>
            <td>${transaction.type}</td>
            <td><span style="padding: 0.3rem 0.8rem; border-radius: 20px; background: ${getStatusColor(transaction.status)}; color: white; font-size: 0.85rem;">${transaction.status}</span></td>
        </tr>
    `).join('');
}

function getStatusColor(status) {
    switch(status) {
        case 'completed': return '#27ae60';
        case 'pending': return '#f39c12';
        case 'rejected': return '#e74c3c';
        default: return '#3498db';
    }
}

// ==================== Membership Management ====================

function openMembershipModal() {
    const currentUser = getCurrentUser();
    document.getElementById('memFullName').value = currentUser.fullName;
    document.getElementById('memNID').value = currentUser.nid;
    document.getElementById('memPhone').value = currentUser.phone;
    document.getElementById('membershipModal').classList.add('show');
}

function generateAgreement() {
    const currentUser = getCurrentUser();
    
    // Simple PDF-like content (in real app, use a library like jsPDF)
    const agreementContent = `
    MEMBERSHIP AGREEMENT
    
    This agreement is entered into on ${new Date().toLocaleDateString()} between:
    
    COMPANY: Asset Management Corporation
    
    AND
    
    MEMBER:
    Name: ${currentUser.fullName}
    Email: ${currentUser.email}
    NID: ${currentUser.nid}
    Phone: ${currentUser.phone}
    
    TERMS AND CONDITIONS:
    1. The member agrees to invest in the company's investment plans.
    2. The member shall pay monthly installments as per the selected plan.
    3. The company shall provide quarterly reports on investment performance.
    4. The member agrees to comply with all company policies and procedures.
    5. Late payments will incur a 1% fine after 10 days and 2% after 20 days.
    6. The agreement is valid for the duration of the investment plan.
    
    INVESTMENT TERMS:
    - Investment Amount: To be determined
    - Return Rate: As per selected plan
    - Payment Frequency: Monthly
    - Maturity Period: As per plan duration
    
    Both parties agree to the terms and conditions outlined above.
    `;

    // Save to localStorage for download
    localStorage.setItem('agreementContent', agreementContent);
    showNotification('Agreement generated successfully!', 'success');
}

function handleMembershipRegistration(event) {
    event.preventDefault();

    const currentUser = getCurrentUser();
    const membershipData = {
        userId: currentUser.id,
        fullName: document.getElementById('memFullName').value,
        presentAddress: document.getElementById('memPresentAddress').value,
        permanentAddress: document.getElementById('memPermanentAddress').value,
        nid: document.getElementById('memNID').value,
        phone: document.getElementById('memPhone').value,
        applicationDate: new Date().toLocaleDateString(),
        status: 'pending'
    };

    // Save membership data
    const memberships = getMemberships();
    memberships.push(membershipData);
    localStorage.setItem('memberships', JSON.stringify(memberships));

    // Update user status
    currentUser.membershipStatus = 'pending';
    setCurrentUser(currentUser);

    showNotification('Membership application submitted successfully!', 'success');
    closeModal('membershipModal');
    loadUserData();
}

function getMemberships() {
    const memberships = localStorage.getItem('memberships');
    return memberships ? JSON.parse(memberships) : [];
}

// ==================== Installment Management ====================

function openInstallmentModal() {
    document.getElementById('installmentModal').classList.add('show');
}

function updatePaymentForm() {
    const method = document.getElementById('paymentMethod').value;
    
    // Hide all forms
    document.getElementById('slipUploadForm').style.display = 'none';
    document.getElementById('transactionForm').style.display = 'none';
    document.getElementById('onlinePaymentForm').style.display = 'none';

    // Show selected form
    if (method === 'slip') {
        document.getElementById('slipUploadForm').style.display = 'block';
    } else if (method === 'transaction') {
        document.getElementById('transactionForm').style.display = 'block';
    } else if (method === 'online') {
        document.getElementById('onlinePaymentForm').style.display = 'block';
    }
}

function handleInstallmentSubmission(event) {
    event.preventDefault();

    const currentUser = getCurrentUser();
    const method = document.getElementById('paymentMethod').value;
    
    let installmentData = {
        userId: currentUser.id,
        submissionDate: new Date().toLocaleDateString(),
        method: method,
        status: 'pending'
    };

    if (method === 'slip') {
        const slipImage = document.getElementById('slipImage').files[0];
        if (!slipImage) {
            showNotification('Please upload a slip image!', 'error');
            return;
        }
        installmentData.amount = prompt('Enter installment amount:');
        installmentData.type = 'slip';
    } else if (method === 'transaction') {
        installmentData.transactionId = document.getElementById('transactionId').value;
        installmentData.amount = document.getElementById('transactionAmount').value;
        installmentData.type = 'transaction';
    } else if (method === 'online') {
        installmentData.amount = document.getElementById('onlineAmount').value;
        installmentData.type = 'online';
    }

    if (!installmentData.amount) {
        showNotification('Please enter amount!', 'error');
        return;
    }

    // Save installment
    const installments = getInstallments();
    installments.push(installmentData);
    localStorage.setItem('installments', JSON.stringify(installments));

    // Add transaction
    const transaction = {
        userId: currentUser.id,
        date: new Date().toLocaleDateString(),
        amount: installmentData.amount,
        type: 'Installment Payment',
        status: 'pending'
    };
    saveTransaction(transaction);

    showNotification('Installment submitted successfully! Awaiting verification.', 'success');
    closeModal('installmentModal');
    document.getElementById('installmentForm').reset();
    loadUserData();
}

function loadInstallments() {
    const currentUser = getCurrentUser();
    const installments = getInstallments().filter(i => i.userId === currentUser.id) || [];
    const tableBody = document.getElementById('installmentHistory');

    if (installments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">No installments submitted yet</td></tr>';
        return;
    }

    tableBody.innerHTML = installments.map((inst, index) => `
        <tr>
            <td>Month ${index + 1}</td>
            <td>${formatCurrency(inst.amount)}</td>
            <td>${inst.submissionDate}</td>
            <td><span style="padding: 0.3rem 0.8rem; border-radius: 20px; background: ${getStatusColor(inst.status)}; color: white; font-size: 0.85rem;">${inst.status}</span></td>
            <td>
                <button class="btn-view" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">View</button>
            </td>
        </tr>
    `).join('');
}

function getInstallments() {
    const installments = localStorage.getItem('installments');
    return installments ? JSON.parse(installments) : [];
}

// ==================== Profile Management ====================

function openEditProfileModal() {
    document.getElementById('editProfileModal').classList.add('show');
}

function handleProfileUpdate(event) {
    event.preventDefault();

    const currentUser = getCurrentUser();
    
    currentUser.fullName = document.getElementById('editFullName').value;
    currentUser.phone = document.getElementById('editPhone').value;
    currentUser.address = document.getElementById('editAddress').value;

    setCurrentUser(currentUser);
    showNotification('Profile updated successfully!', 'success');
    closeModal('editProfileModal');
    loadUserData();
}

// ==================== Payment Processing ====================

function processOnlinePayment() {
    const amount = document.getElementById('onlineAmount').value;
    
    if (!amount || amount <= 0) {
        showNotification('Please enter a valid amount!', 'error');
        return;
    }

    showNotification('Processing payment... Please wait.', 'info');
    
    setTimeout(() => {
        // Simulate payment processing
        const transactionId = 'TXN' + Date.now();
        const currentUser = getCurrentUser();

        const transaction = {
            userId: currentUser.id,
            transactionId: transactionId,
            date: new Date().toLocaleDateString(),
            amount: amount,
            type: 'Online Payment',
            method: 'Online',
            status: 'completed'
        };

        saveTransaction(transaction);

        // Update user investment
        currentUser.totalInvestment = (parseFloat(currentUser.totalInvestment) || 0) + parseFloat(amount);
        currentUser.installmentsPaid = (currentUser.installmentsPaid || 0) + 1;
        setCurrentUser(currentUser);

        showNotification(`Payment of ${formatCurrency(amount)} processed successfully! Transaction ID: ${transactionId}`, 'success');
        closeModal('installmentModal');
        document.getElementById('installmentForm').reset();
        loadUserData();
    }, 2000);
}

// ==================== Transaction Management ====================

function saveTransaction(transaction) {
    const transactions = localStorage.getItem('transactions');
    const allTransactions = transactions ? JSON.parse(transactions) : [];
    allTransactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(allTransactions));
}

function getTransactions(userId) {
    const transactions = localStorage.getItem('transactions');
    const allTransactions = transactions ? JSON.parse(transactions) : [];
    return allTransactions.filter(t => t.userId === userId);
}

// ==================== Payment History ====================

function loadPaymentHistory() {
    const currentUser = getCurrentUser();
    const transactions = getTransactions(currentUser.id) || [];
    const tableBody = document.getElementById('paymentHistory');

    if (transactions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">No payment history available</td></tr>';
        return;
    }

    tableBody.innerHTML = transactions.map(trans => `
        <tr>
            <td>${trans.date}</td>
            <td>${formatCurrency(trans.amount)}</td>
            <td>${trans.method || trans.type}</td>
            <td>${trans.transactionId || 'N/A'}</td>
            <td><span style="padding: 0.3rem 0.8rem; border-radius: 20px; background: ${getStatusColor(trans.status)}; color: white; font-size: 0.85rem;">${trans.status}</span></td>
        </tr>
    `).join('');
}

console.log('User Dashboard JS loaded successfully!');


// ...existing code...
(function seedDemoData() {
    if (localStorage.getItem('seeded')) return;

    const admin = {
        id: 1,
        fullName: 'Admin User',
        email: 'admin@assetmanagement.com',
        password: 'admin123',
        phone: '0123456789',
        address: 'HQ Address',
        nid: '000111222',
        role: 'admin',
        registeredDate: new Date().toLocaleDateString(),
        membershipStatus: 'active',
        totalInvestment: 0,
        installmentsPaid: 0
    };

    const user = {
        id: 2,
        fullName: 'Demo User',
        email: 'user@example.com',
        password: 'user123',
        phone: '0987654321',
        address: 'User Address',
        nid: '333444555',
        role: 'user',
        registeredDate: new Date().toLocaleDateString(),
        membershipStatus: 'pending',
        totalInvestment: 1200,
        installmentsPaid: 3
    };

    const assets = [
        {
            id: 101,
            name: 'Head Office Building',
            type: 'Building',
            purchaseDate: '2018-05-10',
            purchaseCost: 150000,
            currentValue: 250000,
            location: 'City Center',
            ownershipStatus: 'Owned',
            description: 'Main office building',
            status: 'Active',
            createdDate: new Date().toLocaleDateString()
        },
        {
            id: 102,
            name: 'Delivery Truck',
            type: 'Vehicle',
            purchaseDate: '2020-03-22',
            purchaseCost: 30000,
            currentValue: 18000,
            location: 'Warehouse',
            ownershipStatus: 'Owned',
            description: 'Used for logistics',
            status: 'Active',
            createdDate: new Date().toLocaleDateString()
        }
    ];

    const transactions = [
        { userId: 2, date: new Date().toLocaleDateString(), amount: 400, type: 'Installment Payment', status: 'completed', transactionId: 'TXN1001' },
        { userId: 2, date: new Date().toLocaleDateString(), amount: 400, type: 'Installment Payment', status: 'completed', transactionId: 'TXN1002' },
        { userId: 2, date: new Date().toLocaleDateString(), amount: 400, type: 'Installment Payment', status: 'completed', transactionId: 'TXN1003' }
    ];

    const installments = [
        { userId: 2, submissionDate: new Date().toLocaleDateString(), amount: 400, method: 'online', status: 'completed', type: 'online' }
    ];

    const memberships = [
        { userId: 2, fullName: 'Demo User', presentAddress: 'User Address', permanentAddress: 'User Address', nid: '333444555', phone: '0987654321', applicationDate: new Date().toLocaleDateString(), status: 'pending' }
    ];

    // Only set keys if they don't exist (preserve real data)
    if (!localStorage.getItem('users')) localStorage.setItem('users', JSON.stringify([admin, user]));
    if (!localStorage.getItem('assets')) localStorage.setItem('assets', JSON.stringify(assets));
    if (!localStorage.getItem('transactions')) localStorage.setItem('transactions', JSON.stringify(transactions));
    if (!localStorage.getItem('installments')) localStorage.setItem('installments', JSON.stringify(installments));
    if (!localStorage.getItem('memberships')) localStorage.setItem('memberships', JSON.stringify(memberships));

    localStorage.setItem('seeded', '1');
    console.log('Demo data seeded');
})();