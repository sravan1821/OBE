/* ============================================================
   OBE MicTech — Application Router & Auth
   ============================================================ */
const App = (() => {
    let currentUser = null;
    let currentRole = null;

    /* =================== INIT =================== */
    function init() {
        DataStore.init();
        bindLoginEvents();

        const savedTheme = localStorage.getItem('obe_theme') || 'theme-deep-blue';
        document.body.className = savedTheme;

        const session = JSON.parse(localStorage.getItem('obe_session') || 'null');
        if (session) {
            currentUser = session.user;
            currentRole = session.role;
            showDashboard();
        } else {
            showLogin();
        }
    }

    /* =================== LOGIN PAGE =================== */
    function showLogin() {
        document.body.className = 'theme-deep-blue';
        document.getElementById('login-page').style.display = '';
        document.getElementById('dashboard-page').style.display = 'none';
    }

    function bindLoginEvents() {
        /* Open portal login modal */
        const portalBtn = document.getElementById('btn-portal-login');
        if (portalBtn) {
            portalBtn.addEventListener('click', openLoginModal);
        }

        /* Modal close */
        document.getElementById('login-modal-close').addEventListener('click', closeLoginModal);
        document.getElementById('login-modal-overlay').addEventListener('click', closeLoginModal);

        /* Form submit */
        document.getElementById('login-form').addEventListener('submit', handleLogin);
    }

    const roleLabels = { faculty:'Faculty', coordinator:'Coordinator', management:'Management', hod:'HOD' };

    function openLoginModal() {
        document.getElementById('login-role').value = '';
        document.getElementById('modal-title').textContent = 'Portal Login';
        document.getElementById('login-error').style.display = 'none';
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';

        const mc = document.getElementById('login-modal-content');
        mc.className = 'modal-content';

        document.getElementById('login-modal').classList.add('active');
    }

    function closeLoginModal() {
        document.getElementById('login-modal').classList.remove('active');
    }

    function handleLogin(e) {
        e.preventDefault();
        const role     = document.getElementById('login-role').value;
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;

        const result = DataStore.authenticate(username, password, role);
        if (result.success) {
            currentUser = result.user;
            currentRole = role;
            localStorage.setItem('obe_session', JSON.stringify({ user: currentUser, role: currentRole }));
            closeLoginModal();
            showDashboard();
        } else {
            const err = document.getElementById('login-error');
            err.textContent = 'Invalid username or password. Please try again.';
            err.style.display = 'block';
        }
    }

    /* =================== DASHBOARD =================== */
    function showDashboard() {
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('dashboard-page').style.display = '';
        renderSidebar();
        loadModule('dashboard');
    }

    /* --- Sidebar --- */
    const NAV = {
        faculty: [
            { id:'dashboard', icon:'📊', label:'My Dashboard' },
            { id:'marks',     icon:'📝', label:'Enter Marks' },
            { id:'syllabus',  icon:'📖', label:'Syllabus Tracking' },
            { id:'timetable', icon:'📅', label:'My Timetable' }
        ],
        coordinator: [
            { id:'dashboard', icon:'📊', label:'Dashboard' },
            { id:'marks',     icon:'📝', label:'Marks Entry' },
            { id:'timetable', icon:'📅', label:'Assign Timetable' },
            { id:'status',    icon:'📈', label:'Subject Status' }
        ],
        management: [
            { id:'dashboard', icon:'📊', label:'Dashboard' },
            { id:'verify',    icon:'✅', label:'Verify Marks' }
        ],
        hod: [
            { id:'dashboard',   icon:'📊', label:'Dashboard' },
            { id:'marks',       icon:'📝', label:'Marks Entry' },
            { id:'faculty',     icon:'👨‍🏫', label:'Manage Faculty' },
            { id:'departments', icon:'🏛️', label:'Departments' },
            { id:'subjects',    icon:'📚', label:'Subjects' },
            { id:'assignments', icon:'🔗', label:'Assignments' },
            { id:'syllabus',    icon:'📖', label:'Syllabus' }
        ]
    };

    function renderSidebar() {
        const items = NAV[currentRole] || [];
        const sidebar = document.getElementById('sidebar');
        const main = document.getElementById('main-content');
        const userName = currentUser.name || currentRole;

        sidebar.innerHTML = `
            <div class="sidebar-header">
                <div class="sidebar-logo">OBE MicTech</div>
            </div>
            <nav class="sidebar-nav">
                <div style="padding-bottom:10px; font-size:12px; color:rgba(255,255,255,0.4); text-transform:uppercase; font-weight:700;">Menu</div>
                ${items.map((it, i) => `
                    <a href="#" class="nav-item ${i===0?'active':''}" data-section="${it.id}">
                        <span class="nav-icon">${it.icon}</span>
                        <span class="nav-label">${it.label}</span>
                    </a>`).join('')}
            </nav>
            <div class="sidebar-footer">
                <button class="btn-logout" id="btn-logout"><span>🚪</span> Logout</button>
            </div>`;

        // Assign role-specific theme class automatically to look professional
        let themeClass = 'theme-deep-blue'; // Default / Faculty
        if (currentRole === 'hod') {
            themeClass = 'theme-teal'; // Teal Modern for HOD
        } else if (currentRole === 'coordinator') {
            themeClass = 'theme-purple'; // Purple Elegant for Coordinator
        } else if (currentRole === 'management') {
            themeClass = 'theme-orange'; // Orange Warm for Manager/Management
        }
        const savedTheme = themeClass;
        document.body.className = savedTheme;
        localStorage.setItem('obe_theme', savedTheme);

        main.innerHTML = `
            <div class="topbar">
                <div class="topbar-title">Dashboard Overview</div>
                <div class="topbar-right" style="display:flex; align-items:center;">
                    <select class="form-select" id="theme-selector" style="width: auto; max-width: 180px; padding: 0.35rem 0.5rem; font-size: 0.85rem; border-radius: 6px; background: rgba(255,255,255,0.15); color: white; border: 1px solid rgba(255,255,255,0.3); margin-right: 1.5rem; font-weight: 600; cursor: pointer;">
                        <option value="theme-deep-blue" ${savedTheme==='theme-deep-blue'?'selected':''} style="color: black;">Theme: Deep Blue</option>
                        <option value="theme-green-academic" ${savedTheme==='theme-green-academic'?'selected':''} style="color: black;">Theme: Green Academic</option>
                        <option value="theme-purple" ${savedTheme==='theme-purple'?'selected':''} style="color: black;">Theme: Purple Elegant</option>
                        <option value="theme-orange" ${savedTheme==='theme-orange'?'selected':''} style="color: black;">Theme: Orange Warm</option>
                        <option value="theme-teal" ${savedTheme==='theme-teal'?'selected':''} style="color: black;">Theme: Teal Modern</option>
                        <option value="theme-dark-slate" ${savedTheme==='theme-dark-slate'?'selected':''} style="color: black;">Theme: Dark Slate</option>
                    </select>
                    <div class="notifications-container" style="position:relative; margin-right:1.5rem; cursor:pointer;" onclick="App.toggleNotifications()">
                        <span style="font-size:1.4rem;">🔔</span>
                        <span id="notif-badge" class="badge" style="display:none; position:absolute; top:-5px; right:-10px; background:var(--danger); color:white; border-radius:50%; padding:2px 6px; font-size:0.7rem; font-weight:bold;">0</span>
                        <div id="notif-dropdown" style="display:none; position:absolute; right:-10px; top:40px; width:300px; background:var(--bg-card); box-shadow:var(--shadow-lg); border-radius:8px; z-index:100; border:1px solid var(--border-color); max-height:350px; overflow-y:auto; padding:0; text-align:left;">
                        </div>
                    </div>
                    <div class="user-profile">
                        <div class="user-info" style="text-align:right">
                            <div class="user-name">${userName}</div>
                            <div class="user-role">${roleLabels[currentRole]}</div>
                        </div>
                        <div class="user-avatar">${userName[0].toUpperCase()}</div>
                    </div>
                </div>
            </div>
            <div id="page-content" class="page-content"></div>
        `;

        // Theme switching listener
        document.getElementById('theme-selector').addEventListener('change', (e) => {
            const newTheme = e.target.value;
            document.body.className = newTheme;
            localStorage.setItem('obe_theme', newTheme);
        });

        sidebar.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', e => {
                e.preventDefault();
                sidebar.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                loadModule(item.dataset.section);
            });
        });

        document.getElementById('btn-logout').addEventListener('click', logout);
        refreshNotifications();
    }

    /* --- Notifications --- */
    function refreshNotifications() {
        if (!currentUser) return;
        const notifs = DataStore.getNotificationsByUser(currentUser.id || currentRole);
        
        // Check for urgent unshown alerts
        const unshownAlerts = notifs.filter(n => n.isAlert && !n.alertShown);
        unshownAlerts.forEach(n => {
            showRedAlert(n.message);
            DataStore.markAlertShown(n.id);
        });

        const unreadCount = notifs.filter(n => !n.isRead).length;
        const badge = document.getElementById('notif-badge');
        
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }

        const drop = document.getElementById('notif-dropdown');
        if (notifs.length === 0) {
            drop.innerHTML = '<div style="padding:15px; text-align:center; color:#94A3B8;">No notifications</div>';
        } else {
            drop.innerHTML = notifs.map(n => `
                <div style="padding:12px 15px; border-bottom:1px solid var(--border-color); background:${n.isRead ? 'transparent' : 'rgba(255,255,255,0.05)'}; cursor:pointer;" onclick="App.markNotifRead('${n.id}')">
                    <div style="font-size:0.9rem; color:var(--text); margin-bottom:4px;">${n.message}</div>
                    <div style="font-size:0.75rem; color:#64748b;">${new Date(n.createdAt).toLocaleString()}</div>
                </div>
            `).join('');
        }
    }

    function toggleNotifications() {
        const drop = document.getElementById('notif-dropdown');
        drop.style.display = drop.style.display === 'none' ? 'block' : 'none';
    }

    function markNotifRead(id) {
        DataStore.markNotificationRead(id);
        refreshNotifications();
    }

    /* --- Load the right module section --- */
    function loadModule(section) {
        switch (currentRole) {
            case 'faculty':     FacultyModule.renderSection(section); break;
            case 'coordinator': CoordinatorModule.renderSection(section); break;
            case 'management':  ManagementModule.renderSection(section); break;
            case 'hod':         HODModule.renderSection(section); break;
        }
    }

    /* =================== LOGOUT =================== */
    function logout() {
        currentUser = null;
        currentRole = null;
        localStorage.removeItem('obe_session');
        showLogin();
    }

    /* =================== HELPERS =================== */
    function getContent()     { return document.getElementById('page-content'); }
    function getCurrentUser() { return currentUser; }
    function getCurrentRole() { return currentRole; }

    function showToast(message, type = 'success') {
        const t = document.createElement('div');
        t.className = `toast toast-${type}`;
        t.textContent = message;
        document.body.appendChild(t);
        requestAnimationFrame(() => t.classList.add('show'));
        setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 350); }, 3000);
    }

    function showRedAlert(msg) {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0'; overlay.style.left = '0';
        overlay.style.width = '100vw'; overlay.style.height = '100vh';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.6)';
        overlay.style.zIndex = '99999';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';

        const modal = document.createElement('div');
        modal.style.backgroundColor = '#ef4444';
        modal.style.color = 'white';
        modal.style.padding = '30px';
        modal.style.borderRadius = '12px';
        modal.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
        modal.style.maxWidth = '400px';
        modal.style.textAlign = 'center';
        modal.innerHTML = `
            <div style="font-size:3rem; margin-bottom:10px;">🚨</div>
            <h2 style="margin:0 0 10px 0; color:white;">Urgent Notification</h2>
            <p style="font-size:1.1rem; margin-bottom:20px;">${msg}</p>
            <button style="background:white; color:#ef4444; border:none; padding:10px 20px; border-radius:6px; font-weight:bold; cursor:pointer;" onclick="this.parentElement.parentElement.remove()">Acknowledge</button>
        `;
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }

    /* =================== PUBLIC =================== */
    return { init, getContent, getCurrentUser, getCurrentRole, showToast, logout, loadModule, toggleNotifications, markNotifRead, refreshNotifications, showRedAlert };
})();

document.addEventListener('DOMContentLoaded', App.init);

// Live update notifications across tabs
window.addEventListener('storage', (e) => {
    if (e.key === 'obe_notifications') {
        App.refreshNotifications();
    }
});
