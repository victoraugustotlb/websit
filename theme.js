const ThemeManager = {
    init() {
        const toggleCheckbox = document.getElementById('theme-checkbox');

        // Load saved theme or default to dark
        const savedTheme = localStorage.getItem('theme') || 'dark';
        this.applyTheme(savedTheme);

        if (toggleCheckbox) {
            // Sync checkbox state
            toggleCheckbox.checked = savedTheme === 'light';

            // Add event listener
            toggleCheckbox.addEventListener('change', (e) => {
                const newTheme = e.target.checked ? 'light' : 'dark';
                this.applyTheme(newTheme);
            });
        }
    },

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
});
