// Utility helpers for localStorage, downloads and simple UI helpers

// LocalStorage helpers
function lsGet(key, defaultVal = null) {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : defaultVal;
}

function lsSet(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function lsRemove(key) {
    localStorage.removeItem(key);
}

// Simple file download helper
function downloadFile(filename, content, mime = 'text/plain') {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

// Download generated agreement (uses agreementContent from localStorage)
function downloadAgreement(filename = 'membership-agreement.txt') {
    const content = lsGet('agreementContent', 'No agreement found.');
    downloadFile(filename, content, 'text/plain');
}

// Simple global loader for async tasks (show/hide)
function showLoader(message = 'Loading...') {
    let el = document.getElementById('globalLoader');
    if (!el) {
        el = document.createElement('div');
        el.id = 'globalLoader';
        el.style.position = 'fixed';
        el.style.left = 0;
        el.style.top = 0;
        el.style.width = '100%';
        el.style.height = '100%';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.background = 'rgba(0,0,0,0.4)';
        el.style.zIndex = 4000;
        el.innerHTML = `<div style="background:#fff;padding:1rem 1.5rem;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.2);font-weight:600">${message}</div>`;
        document.body.appendChild(el);
    } else {
        el.firstElementChild.textContent = message;
        el.style.display = 'flex';
    }
}

function hideLoader() {
    const el = document.getElementById('globalLoader');
    if (el) el.style.display = 'none';
}

// Simple debounce helper
function debounce(fn, wait = 300) {
    let t;
    return function (...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
    };
}

console.log('utils.js loaded');