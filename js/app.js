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
            { id:'marks',     icon:'📝', label:'Enter Marks' }
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
            { id:'assignments', icon:'🔗', label:'Assignments' }
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

        // Render Topbar and Content Wrapper
        main.innerHTML = `
            <div class="topbar">
                <div class="topbar-title">Dashboard Overview</div>
                <div class="topbar-right">
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

        sidebar.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', e => {
                e.preventDefault();
                sidebar.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                loadModule(item.dataset.section);
            });
        });

        document.getElementById('btn-logout').addEventListener('click', logout);
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

    /* =================== PUBLIC =================== */
    return { init, getContent, getCurrentUser, getCurrentRole, showToast, logout, loadModule };
})();

document.addEventListener('DOMContentLoaded', App.init);
