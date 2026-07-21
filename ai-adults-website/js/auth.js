// Auth Helper Functions - Server-side auth via API
// ============================================

function isAuthPage() {
    var path = window.location.pathname;
    return path.endsWith('login.html') || path.endsWith('register.html');
}

function protectPage() {
    if (isAuthPage()) return;
    fetch('/api/auth/session', { credentials: 'same-origin' })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (!data.session || !data.user) {
                window.location.href = 'login.html';
            } else {
                displayUserInfo(data.user);
            }
        })
        .catch(function() {
            window.location.href = 'login.html';
        });
}

function displayUserInfo(user) {
    var avatarEls = document.querySelectorAll('.user-avatar');
    var name = user.user_metadata && user.user_metadata.full_name
        ? user.user_metadata.full_name
        : user.email;
    var initials = name.split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().substring(0, 2);
    avatarEls.forEach(function(el) {
        el.textContent = initials;
        el.title = user.email;
    });
}

async function handleLogin(email, password) {
    try {
        var res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ email: email, password: password })
        });
        var data = await res.json();
        if (!res.ok) return { error: { message: data.error } };
        return { data: data };
    } catch (err) {
        return { error: { message: err.message } };
    }
}

async function handleRegister(email, password, fullName) {
    try {
        var res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ email: email, password: password, fullName: fullName })
        });
        var data = await res.json();
        if (!res.ok) return { error: { message: data.error } };
        return { data: data };
    } catch (err) {
        return { error: { message: err.message } };
    }
}

async function handleLogout() {
    await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin'
    });
    window.location.href = 'login.html';
}

function addLogoutButton() {
    if (isAuthPage()) return;
    var headerActions = document.querySelector('.header-actions');
    if (!headerActions) return;
    var logoutBtn = document.createElement('button');
    logoutBtn.className = 'header-btn logout-btn';
    logoutBtn.setAttribute('aria-label', 'Logout');
    logoutBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>';
    logoutBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to logout?')) {
            handleLogout();
        }
    });
    headerActions.appendChild(logoutBtn);
}

function updateWelcomeMessage() {
    fetch('/api/auth/session', { credentials: 'same-origin' })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.user) {
                var name = data.user.user_metadata && data.user.user_metadata.full_name
                    ? data.user.user_metadata.full_name
                    : data.user.email.split('@')[0];
                var heroTitle = document.querySelector('.page-hero h1');
                if (heroTitle) {
                    heroTitle.textContent = 'Welcome back, ' + name;
                }
            }
        })
        .catch(function() {});
}

document.addEventListener('DOMContentLoaded', function() {
    protectPage();
    addLogoutButton();
    updateWelcomeMessage();
});
