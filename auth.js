/**
 * Authentication System using Vercel Functions + Neon DB
 */

const Auth = {
    // Keys for localStorage (still used for session persistence)
    CURRENT_USER_KEY: 'app_current_user',

    /**
     * Initialize/Ensure Master Admin exists
     * (Now handled by /api/setup, but we can call it to be safe or just assume it's run)
     */
    initMasterAdmin: async function () {
        try {
            await fetch('/api/setup');
            console.log('Database setup checked.');
        } catch (e) {
            console.error('Setup check failed', e);
        }
    },

    /**
     * Register a new user
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<object>} { success: boolean, message: string }
     */
    register: async function (email, password) {
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            return await response.json();
        } catch (error) {
            console.error(error);
            return { success: false, message: 'Erro de conexão.' };
        }
    },

    /**
     * Login a user
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<object>} { success: boolean, message: string }
     */
    login: async function (email, password) {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (result.success) {
                this.setCurrentUser(result.user);
            }

            return result;
        } catch (error) {
            console.error(error);
            return { success: false, message: 'Erro de conexão.' };
        }
    },

    /**
     * Logout the current user
     */
    logout: function () {
        localStorage.removeItem(this.CURRENT_USER_KEY);
        window.location.reload();
    },

    /**
     * Get current logged in user
     * @returns {object|null}
     */
    getCurrentUser: function () {
        const userStr = localStorage.getItem(this.CURRENT_USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    },

    // --- Logging System (Now fetches from API) ---

    getLogs: async function () {
        try {
            const response = await fetch('/api/logs');
            return await response.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    clearLogs: async function () {
        try {
            await fetch('/api/logs', { method: 'DELETE' });
        } catch (error) {
            console.error(error);
        }
    },

    getUsers: async function () {
        try {
            const response = await fetch('/api/users');
            return await response.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    updateUserRole: async function (email, newRole) {
        try {
            const response = await fetch('/api/update-role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, role: newRole })
            });
            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error(error);
            return false;
        }
    },

    // --- Internal Helpers ---

    setCurrentUser: function (user) {
        // Store minimal info in session
        const sessionUser = {
            email: user.email,
            role: user.role || 'user'
        };
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(sessionUser));
    },

    /**
     * Update UI based on auth state
     * Should be called on page load
     */
    updateUI: function () {
        const currentUser = this.getCurrentUser();
        const navLinks = document.querySelector('.nav-links');

        if (!navLinks) return;

        // Clean up existing auth elements to avoid duplicates if called multiple times
        const existingAuthElements = navLinks.querySelectorAll('.auth-element');
        existingAuthElements.forEach(el => el.remove());

        const loginBtn = navLinks.querySelector('a[href="login.html"]');
        const cadastroBtn = navLinks.querySelector('a[href="cadastro.html"]');
        const adminBtn = navLinks.querySelector('a[href="admin.html"]');

        // Logic to hide/show original buttons
        if (currentUser) {
            // User is logged in
            if (loginBtn) loginBtn.style.display = 'none';
            if (cadastroBtn) cadastroBtn.style.display = 'none';

            // Check Role for Admin Button
            if (adminBtn) {
                if (currentUser.role === 'admin') {
                    adminBtn.style.display = 'inline-block';
                } else {
                    adminBtn.style.display = 'none';
                }
            }

            // Add Welcome + Logout
            const welcomeMsg = document.createElement('span');
            welcomeMsg.className = 'nav-btn auth-element';
            welcomeMsg.style.color = '#bb86fc';
            welcomeMsg.textContent = `Olá, ${currentUser.email}`;

            const logoutBtn = document.createElement('a');
            logoutBtn.href = '#';
            logoutBtn.className = 'nav-btn auth-element';
            logoutBtn.textContent = 'Sair';
            logoutBtn.onclick = (e) => {
                e.preventDefault();
                this.logout();
            };

            navLinks.appendChild(welcomeMsg);
            navLinks.appendChild(logoutBtn);
        } else {
            // User is logged out
            if (loginBtn) loginBtn.style.display = '';
            if (cadastroBtn) cadastroBtn.style.display = '';
            if (adminBtn) adminBtn.style.display = 'none';
        }
    }
};

// Initialize by checking setup (optional, but good for first run)
// Auth.initMasterAdmin(); 
// Better to not run initMasterAdmin on every page load to avoid spamming the DB helper.
// We will rely on manual visit to /api/setup or just let the user login flow work if tables exist.
// Re-enabling for safety so it creates tables on first run.
Auth.initMasterAdmin();
