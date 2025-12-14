/**
 * Simple Authentication System using localStorage
 */

const Auth = {
    // Keys for localStorage
    USERS_KEY: 'app_users',
    USERS_KEY: 'app_users',
    CURRENT_USER_KEY: 'app_current_user',
    LOGS_KEY: 'app_system_logs',

    /**
     * Initialize/Ensure Master Admin exists
     */
    initMasterAdmin: function () {
        const users = this.getUsers();
        const masterEmail = 'admin@master.com';

        if (!users.find(u => u.email === masterEmail)) {
            users.push({
                email: masterEmail,
                password: 'admin123',
                role: 'admin'
            });
            this.saveUsers(users);
            console.log('Master Admin created.');
            this.addLog('System', 'Master Admin account created automatically.');
        }
    },

    /**
     * Register a new user
     * @param {string} email 
     * @param {string} password 
     * @returns {object} { success: boolean, message: string }
     */
    register: function (email, password) {
        const users = this.getUsers();

        // Check if user already exists
        if (users.find(u => u.email === email)) {
            this.addLog('Auth', `Failed registration attempt for existing email: ${email}`);
            return { success: false, message: 'Este email já está cadastrado.' };
        }

        // Add new user (default role: user)
        users.push({ email, password, role: 'user' });
        this.saveUsers(users);
        this.addLog('Auth', `New user registered: ${email}`);

        return { success: true, message: 'Cadastro realizado com sucesso!' };
    },

    /**
     * Login a user
     * @param {string} email 
     * @param {string} password 
     * @returns {object} { success: boolean, message: string }
     */
    login: function (email, password) {
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            this.setCurrentUser(user);
            this.addLog('Auth', `User login successful: ${email} (${user.role || 'user'})`);
            return { success: true, message: 'Login realizado com sucesso!' };
        } else {
            this.addLog('Auth', `Failed login attempt for: ${email}`);
            return { success: false, message: 'Email ou senha incorretos.' };
        }
    },

    /**
     * Logout the current user
     */
    logout: function () {
        const user = this.getCurrentUser();
        if (user) {
            this.addLog('Auth', `User logout: ${user.email}`);
        }
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

    // --- Internal Helpers ---

    getUsers: function () {
        const usersStr = localStorage.getItem(this.USERS_KEY);
        return usersStr ? JSON.parse(usersStr) : [];
    },

    saveUsers: function (users) {
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    },

    // --- Logging System ---

    getLogs: function () {
        const logsStr = localStorage.getItem(this.LOGS_KEY);
        return logsStr ? JSON.parse(logsStr) : [];
    },

    saveLogs: function (logs) {
        localStorage.setItem(this.LOGS_KEY, JSON.stringify(logs));
    },

    addLog: function (type, message) {
        const logs = this.getLogs();
        const now = new Date();
        const timestamp = now.toISOString().replace('T', ' ').substring(0, 19); // Simplified ISO format

        logs.unshift({ timestamp, type, message }); // Add to beginning

        // Keep only last 100 logs
        if (logs.length > 100) {
            logs.length = 100;
        }

        this.saveLogs(logs);
    },

    clearLogs: function () {
        localStorage.removeItem(this.LOGS_KEY);
    },

    /**
     * Update a user's role
     * @param {string} email 
     * @param {string} newRole 
     * @returns {boolean} success
     */
    updateUserRole: function (email, newRole) {
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.email === email);

        if (userIndex !== -1) {
            users[userIndex].role = newRole;
            this.saveUsers(users);

            // If updating current user, update session too
            const currentUser = this.getCurrentUser();
            if (currentUser && currentUser.email === email) {
                this.setCurrentUser(users[userIndex]);
            }
            this.addLog('Admin', `Role update for ${email}: ${newRole}`);
            return true;
        }
        return false;
    },

    setCurrentUser: function (user) {
        // Store minimal info in session
        const sessionUser = {
            email: user.email,
            role: user.role || 'user' // Default to user if undefined
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

        // Clean up existing auth buttons
        const existingAuthElements = navLinks.querySelectorAll('.auth-element');
        existingAuthElements.forEach(el => el.remove());

        const loginBtn = navLinks.querySelector('a[href="login.html"]');
        const cadastroBtn = navLinks.querySelector('a[href="cadastro.html"]');
        const adminBtn = navLinks.querySelector('a[href="admin.html"]');

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
            logoutBtn.textContent = 'Sair'; // duplicated line removed in thought, but let's be clean
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

// Initialize Master Admin on script load
Auth.initMasterAdmin();
