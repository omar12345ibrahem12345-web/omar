// Auth Helper Functions
// ============================================

function isAuthPage() {
    var path = window.location.pathname;
    return path.endsWith('login.html') || path.endsWith('register.html');
}

function getSupabaseAuthClient() {
    if (!window.supabaseClient) {
        showAuthSetupError();
        return null;
    }
    return window.supabaseClient;
}

function showAuthSetupError() {
    var errorDiv = document.querySelector('.auth-error');
    if (errorDiv) {
        errorDiv.textContent = 'Supabase is not configured. Check js/supabase-client.js.';
        errorDiv.style.display = 'block';
    }
}

// Protect page - redirect to login if not authenticated
function protectPage() {
    if (isAuthPage()) return;
    var client = getSupabaseAuthClient();
    if (!client) return;
    client.auth.getSession().then(function(result) {
        if (!result.data.session) {
            window.location.href = 'login.html';
        } else {
            displayUserInfo(result.data.session.user);
        }
    });
}

// Display user info in the header
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

// Login
async function handleLogin(email, password) {
    var client = getSupabaseAuthClient();
    if (!client) return { error: { message: 'Supabase is not configured.' } };
    var result = await client.auth.signInWithPassword({ email: email, password: password });
    return result;
}

// Register
async function handleRegister(email, password, fullName) {
    var client = getSupabaseAuthClient();
    if (!client) return { error: { message: 'Supabase is not configured.' } };
    var result = await client.auth.signUp({
        email: email,
        password: password,
        options: {
            data: { full_name: fullName }
        }
    });
    return result;
}

// Logout
async function handleLogout() {
    var client = getSupabaseAuthClient();
    if (client) await client.auth.signOut();
    window.location.href = 'login.html';
}

// Add logout button to header on all protected pages
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

// Update welcome message with user name
function updateWelcomeMessage() {
    var client = getSupabaseAuthClient();
    if (!client) return;
    client.auth.getSession().then(function(result) {
        if (result.data.session) {
            var user = result.data.session.user;
            var name = user.user_metadata && user.user_metadata.full_name
                ? user.user_metadata.full_name
                : user.email.split('@')[0];
            var heroTitle = document.querySelector('.page-hero h1');
            if (heroTitle) {
                heroTitle.textContent = 'Welcome back, ' + name;
            }
        }
    });
}

// Init auth on page load
document.addEventListener('DOMContentLoaded', function() {
    protectPage();
    addLogoutButton();
    updateWelcomeMessage();
});
