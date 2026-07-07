/* ============================================================
   OBE MicTech — HOD Dashboard Module
   Full control: CRUD Faculty, Departments, Subjects, Assignments
   ============================================================ */
const HODModule = (() => {

    function renderSection(section) {
        const c = App.getContent();
        switch (section) {
            case 'dashboard':   renderDashboard(c); break;
            case 'marks':       FacultyModule.renderMarksEntry(c); break;
            case 'faculty':     renderFaculty(c); break;
            case 'departments': renderDepartments(c); break;
            case 'subjects':    renderSubjects(c); break;
            case 'assignments': renderAssignments(c); break;
            case 'syllabus':    renderSyllabus(c); break;
            default:            renderDashboard(c);
        }
    }

    /* =================== DASHBOARD =================== */
    function renderDashboard(c) {
        const depts    = DataStore.getDepartments();
        const faculty  = DataStore.getFaculty();
        const subjects = DataStore.getSubjects();
        const students = DataStore.getStudents();

        let marksEntered = 0, verified = 0;
        subjects.forEach(s => {
            if (DataStore.areMarksEntered(s.id)) marksEntered++;
            if (DataStore.isMarksVerified(s.id)) verified++;
        });

        c.innerHTML = `
        <div class="fade-in">
            <div class="page-header">
                <h1>HOD Control Panel</h1>
                <p>Full administrative control over departments, faculty, subjects, and assignments</p>
            </div>

            <div class="stats-grid">
                <div class="stat-card green">
                    <div class="stat-icon">🏛️</div>
                    <div class="stat-value">${depts.length}</div>
                    <div class="stat-label">Departments</div>
                </div>
                <div class="stat-card blue">
                    <div class="stat-icon">👨‍🏫</div>
                    <div class="stat-value">${faculty.length}</div>
                    <div class="stat-label">Faculty</div>
                </div>
                <div class="stat-card purple">
                    <div class="stat-icon">📚</div>
                    <div class="stat-value">${subjects.length}</div>
                    <div class="stat-label">Subjects</div>
                </div>
                <div class="stat-card gold">
                    <div class="stat-icon">👥</div>
                    <div class="stat-value">${students.length}</div>
                    <div class="stat-label">Students</div>
                </div>
            </div>

            <div class="grid grid-2">
                <!-- Department-wise breakdown -->
                <div class="card">
                    <div class="card-header"><h3>Department Breakdown</h3></div>
                    <div class="card-body no-pad">
                        <div class="table-wrapper">
                            <table class="table">
                                <thead><tr><th>Department</th><th>Faculty</th><th>Subjects</th><th>Students</th></tr></thead>
                                <tbody>
                                    ${depts.map(d => `<tr>
                                        <td class="fw-600">${d.name}</td>
                                        <td>${DataStore.getFacultyByDepartment(d.id).length}</td>
                                        <td>${DataStore.getSubjectsByDepartment(d.id).length}</td>
                                        <td>${DataStore.getStudentsByDepartment(d.id).length}</td>
                                    </tr>`).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Marks overview -->
                <div class="card">
                    <div class="card-header"><h3>Marks Overview</h3></div>
                    <div class="card-body" style="display:flex; align-items:center; gap:20px; flex-wrap:wrap;">
                        <div style="flex:1; min-width: 150px; max-width: 150px; margin: 0 auto;">
                            <canvas id="hod-dashboard-chart"></canvas>
                        </div>
                        <div style="flex:2; min-width: 200px;">
                            <div class="mb-2">
                                <div class="progress-label"><span>Marks Entered</span><span>${marksEntered}/${subjects.length}</span></div>
                                <div class="progress-bar"><div class="progress-fill ${marksEntered/subjects.length < 0.5 ? 'low' : marksEntered/subjects.length < 0.8 ? 'medium' : 'high'}" style="width:${subjects.length?Math.round(marksEntered/subjects.length*100):0}%"></div></div>
                            </div>
                            <div class="mb-2">
                                <div class="progress-label"><span>Verified</span><span>${verified}/${subjects.length}</span></div>
                                <div class="progress-bar"><div class="progress-fill high" style="width:${subjects.length?Math.round(verified/subjects.length*100):0}%"></div></div>
                            </div>
                            <div style="margin-top:1rem">
                                ${subjects.filter(s => !DataStore.areMarksEntered(s.id)).length > 0
                                    ? `<p class="text-sm" style="color:var(--danger)">⚠️ ${subjects.filter(s => !DataStore.areMarksEntered(s.id)).length} subject(s) still pending mark entry</p>`
                                    : '<p class="text-sm text-success">✅ All marks have been entered</p>'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick actions -->
            <div class="card">
                <div class="card-header"><h3>Quick Actions</h3></div>
                <div class="card-body">
                    <div class="flex gap-md" style="flex-wrap:wrap">
                        <button class="btn btn-primary" onclick="HODModule.renderSection('faculty')">👨‍🏫 Manage Faculty</button>
                        <button class="btn btn-success" onclick="HODModule.renderSection('departments')">🏛️ Manage Departments</button>
                        <button class="btn btn-warning" onclick="HODModule.renderSection('subjects')">📚 Manage Subjects</button>
                        <button class="btn btn-secondary" onclick="HODModule.renderSection('assignments')">🔗 Assignments</button>
                        <button class="btn btn-danger btn-sm" id="hod-reset-btn">🔄 Reset All Data</button>
                    </div>
                </div>
            </div>
        </div>`;

        document.getElementById('hod-reset-btn').addEventListener('click', () => {
            if (confirm('⚠️ This will reset ALL data to defaults. Continue?')) {
                DataStore.reset();
                App.showToast('All data reset to defaults', 'info');
                renderDashboard(c);
            }
        });

        setTimeout(() => {
            const ctx = document.getElementById('hod-dashboard-chart');
            if (ctx) {
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Entered', 'Pending'],
                        datasets: [{
                            data: [marksEntered, subjects.length - marksEntered],
                            backgroundColor: ['#00796B', '#cf2c31'],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { display: false }
                        },
                        cutout: '70%'
                    }
                });
            }
        }, 100);
    }

    /* =================== MANAGE FACULTY =================== */
    function renderFaculty(c) {
        const faculty = DataStore.getFaculty();
        const depts   = DataStore.getDepartments();

        c.innerHTML = `
        <div class="fade-in">
            <div class="page-header">
                <h1>Manage Faculty</h1>
                <p>Create, view, and remove faculty members</p>
                <div class="page-actions">
                    <button class="btn btn-primary" id="add-faculty-btn">➕ Add Faculty</button>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2>All Faculty (${faculty.length})</h2>
                </div>
                <div class="card-body no-pad">
                    ${faculty.length === 0
                        ? '<div class="empty-state"><div class="empty-icon">👨‍🏫</div><p>No faculty members yet.</p></div>'
                        : `<div class="table-wrapper"><table class="table">
                            <thead><tr><th>Name</th><th>Username</th><th>Email</th><th>Department</th><th>Subjects</th><th>Actions</th></tr></thead>
                            <tbody>
                                ${faculty.map(f => {
                                    const dept = DataStore.getDepartmentById(f.departmentId);
                                    const subs = DataStore.getSubjectsByFaculty(f.id);
                                    return `<tr>
                                        <td class="fw-600">${f.name}</td>
                                        <td><span class="badge badge-neutral">${f.username}</span></td>
                                        <td class="text-muted">${f.email || '—'}</td>
                                        <td>${dept ? dept.name : '<span class="text-muted">—</span>'}</td>
                                        <td>${subs.length > 0 ? subs.map(s => `<span class="badge badge-info" style="margin:2px">${s.code}</span>`).join('') : '<span class="text-muted">None</span>'}</td>
                                        <td>
                                            <div class="flex gap-sm">
                                                <button class="btn btn-danger btn-xs del-faculty" data-id="${f.id}" data-name="${f.name}">🗑️ Delete</button>
                                            </div>
                                        </td>
                                    </tr>`;
                                }).join('')}
                            </tbody>
                        </table></div>`
                    }
                </div>
            </div>

            <div id="faculty-modal-area"></div>
        </div>`;

        /* Delete faculty */
        c.querySelectorAll('.del-faculty').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm(`Delete faculty "${btn.dataset.name}"? This will unassign them from all subjects.`)) {
                    DataStore.deleteFaculty(btn.dataset.id);
                    App.showToast('Faculty deleted', 'info');
                    renderFaculty(c);
                }
            });
        });

        /* Add faculty */
        document.getElementById('add-faculty-btn').addEventListener('click', () => showAddFacultyModal(c, depts));
    }

    function showAddFacultyModal(c, depts) {
        const area = document.getElementById('faculty-modal-area');
        area.innerHTML = `
        <div class="inline-modal">
            <div class="modal-overlay" id="af-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Add New Faculty</h2>
                    <button class="modal-close" id="af-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label">Full Name</label>
                        <input type="text" class="form-input" id="af-name" placeholder="e.g., Dr. John Smith" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Username</label>
                            <input type="text" class="form-input" id="af-username" placeholder="e.g., faculty6">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Password</label>
                            <input type="text" class="form-input" id="af-password" value="fac123" placeholder="Password">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-input" id="af-email" placeholder="e.g., john@obemictech.edu">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Department</label>
                        <select class="form-select" id="af-dept">
                            <option value="">— Select Department —</option>
                            ${depts.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                        </select>
                    </div>
                    <div id="af-error" class="error-message" style="display:none"></div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="af-cancel">Cancel</button>
                    <button class="btn btn-primary" id="af-save">Add Faculty</button>
                </div>
            </div>
        </div>`;

        const closeFn = () => { area.innerHTML = ''; };
        document.getElementById('af-close').addEventListener('click', closeFn);
        document.getElementById('af-overlay').addEventListener('click', closeFn);
        document.getElementById('af-cancel').addEventListener('click', closeFn);

        document.getElementById('af-save').addEventListener('click', () => {
            const name     = document.getElementById('af-name').value.trim();
            const username = document.getElementById('af-username').value.trim();
            const password = document.getElementById('af-password').value.trim();
            const email    = document.getElementById('af-email').value.trim();
            const deptId   = document.getElementById('af-dept').value;
            const errEl    = document.getElementById('af-error');

            if (!name || !username || !password || !deptId) {
                errEl.textContent = 'Please fill in all required fields.';
                errEl.style.display = 'block';
                return;
            }

            // Check duplicate username
            const existing = DataStore.getFaculty().find(f => f.username === username);
            if (existing) {
                errEl.textContent = 'Username already exists. Choose a different one.';
                errEl.style.display = 'block';
                return;
            }

            DataStore.addFaculty({ name, username, password, email, departmentId: deptId });
            closeFn();
            App.showToast('Faculty added successfully!', 'success');
            renderFaculty(c);
        });
    }

    /* =================== MANAGE DEPARTMENTS =================== */
    function renderDepartments(c) {
        const depts = DataStore.getDepartments();

        c.innerHTML = `
        <div class="fade-in">
            <div class="page-header">
                <h1>Manage Departments</h1>
                <p>Create and manage academic departments</p>
            </div>

            <!-- Add Department -->
            <div class="card">
                <div class="card-header"><h2>Add New Department</h2></div>
                <div class="card-body">
                    <div class="flex gap-sm" style="max-width:500px">
                        <input type="text" class="form-input" id="new-dept-name" placeholder="e.g., Information Technology">
                        <button class="btn btn-primary" id="add-dept-btn" style="white-space:nowrap">➕ Add</button>
                    </div>
                    <div id="dept-error" class="error-message mt-1" style="display:none;max-width:500px"></div>
                </div>
            </div>

            <!-- Department List -->
            <div class="card">
                <div class="card-header"><h2>All Departments (${depts.length})</h2></div>
                <div class="card-body no-pad">
                    ${depts.length === 0
                        ? '<div class="empty-state"><div class="empty-icon">🏛️</div><p>No departments created yet.</p></div>'
                        : `<div class="table-wrapper"><table class="table">
                            <thead><tr><th>Department Name</th><th>Faculty</th><th>Subjects</th><th>Students</th><th>Actions</th></tr></thead>
                            <tbody>
                                ${depts.map(d => {
                                    const fCount = DataStore.getFacultyByDepartment(d.id).length;
                                    const sCount = DataStore.getSubjectsByDepartment(d.id).length;
                                    const stCount = DataStore.getStudentsByDepartment(d.id).length;
                                    return `<tr>
                                        <td class="fw-600">${d.name}</td>
                                        <td><span class="badge badge-info">${fCount}</span></td>
                                        <td><span class="badge badge-info">${sCount}</span></td>
                                        <td><span class="badge badge-info">${stCount}</span></td>
                                        <td><button class="btn btn-danger btn-xs del-dept" data-id="${d.id}" data-name="${d.name}">🗑️ Delete</button></td>
                                    </tr>`;
                                }).join('')}
                            </tbody>
                        </table></div>`
                    }
                </div>
            </div>
        </div>`;

        /* Add */
        document.getElementById('add-dept-btn').addEventListener('click', () => {
            const name = document.getElementById('new-dept-name').value.trim();
            const errEl = document.getElementById('dept-error');
            if (!name) { errEl.textContent = 'Please enter a department name.'; errEl.style.display = 'block'; return; }
            const exists = DataStore.getDepartments().find(d => d.name.toLowerCase() === name.toLowerCase());
            if (exists) { errEl.textContent = 'Department already exists.'; errEl.style.display = 'block'; return; }
            DataStore.addDepartment(name);
            App.showToast('Department created!', 'success');
            renderDepartments(c);
        });

        /* Delete */
        c.querySelectorAll('.del-dept').forEach(btn => {
            btn.addEventListener('click', () => {
                const fCount = DataStore.getFacultyByDepartment(btn.dataset.id).length;
                const sCount = DataStore.getSubjectsByDepartment(btn.dataset.id).length;
                let warning = `Delete department "${btn.dataset.name}"?`;
                if (fCount || sCount) warning += ` This department has ${fCount} faculty and ${sCount} subjects.`;
                if (confirm(warning)) {
                    DataStore.deleteDepartment(btn.dataset.id);
                    App.showToast('Department deleted', 'info');
                    renderDepartments(c);
                }
            });
        });
    }

    /* =================== MANAGE SUBJECTS =================== */
    function renderSubjects(c) {
        const subjects = DataStore.getSubjects();
        const depts    = DataStore.getDepartments();

        c.innerHTML = `
        <div class="fade-in">
            <div class="page-header">
                <h1>Manage Subjects</h1>
                <p>Create and manage academic subjects across departments</p>
                <div class="page-actions">
                    <button class="btn btn-primary" id="add-subject-btn">➕ Add Subject</button>
                </div>
            </div>

            <!-- Filter by department -->
            <div class="card">
                <div class="card-header">
                    <h2>All Subjects (${subjects.length})</h2>
                    <select class="form-select" id="dept-filter" style="width:auto;min-width:200px;">
                        <option value="">All Departments</option>
                        ${depts.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                    </select>
                </div>
                <div class="card-body no-pad">
                    ${subjects.length === 0
                        ? '<div class="empty-state"><div class="empty-icon">📚</div><p>No subjects created yet.</p></div>'
                        : `<div class="table-wrapper"><table class="table">
                            <thead><tr><th>Code</th><th>Subject</th><th>Department</th><th>Semester</th><th>Credits</th><th>Faculty</th><th>Actions</th></tr></thead>
                            <tbody id="subjects-tbody">
                                ${subjects.map(s => {
                                    const dept = DataStore.getDepartmentById(s.departmentId);
                                    const fac = s.facultyId ? DataStore.getFacultyById(s.facultyId) : null;
                                    return `<tr class="subject-row" data-dept="${s.departmentId}">
                                        <td><span class="badge badge-info">${s.code}</span></td>
                                        <td class="fw-600">${s.name}</td>
                                        <td>${dept ? dept.name : '—'}</td>
                                        <td>Sem ${s.semester}</td>
                                        <td>${s.credits}</td>
                                        <td>${fac ? fac.name : '<span class="text-muted">Unassigned</span>'}</td>
                                        <td><button class="btn btn-danger btn-xs del-subject" data-id="${s.id}" data-name="${s.name}">🗑️</button></td>
                                    </tr>`;
                                }).join('')}
                            </tbody>
                        </table></div>`
                    }
                </div>
            </div>

            <div id="subject-modal-area"></div>
        </div>`;

        /* Filter */
        document.getElementById('dept-filter').addEventListener('change', (e) => {
            const deptId = e.target.value;
            c.querySelectorAll('.subject-row').forEach(row => {
                row.style.display = (!deptId || row.dataset.dept === deptId) ? '' : 'none';
            });
        });

        /* Delete */
        c.querySelectorAll('.del-subject').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm(`Delete subject "${btn.dataset.name}"?`)) {
                    DataStore.deleteSubject(btn.dataset.id);
                    App.showToast('Subject deleted', 'info');
                    renderSubjects(c);
                }
            });
        });

        /* Add subject modal */
        document.getElementById('add-subject-btn').addEventListener('click', () => showAddSubjectModal(c, depts));
    }

    function showAddSubjectModal(c, depts) {
        const area = document.getElementById('subject-modal-area');
        area.innerHTML = `
        <div class="inline-modal">
            <div class="modal-overlay" id="as-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Add New Subject</h2>
                    <button class="modal-close" id="as-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label">Subject Name</label>
                        <input type="text" class="form-input" id="as-name" placeholder="e.g., Machine Learning">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Subject Code</label>
                            <input type="text" class="form-input" id="as-code" placeholder="e.g., CS501">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Credits</label>
                            <input type="number" class="form-input" id="as-credits" value="4" min="1" max="6">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Department</label>
                            <select class="form-select" id="as-dept">
                                <option value="">— Select —</option>
                                ${depts.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Semester</label>
                            <select class="form-select" id="as-semester">
                                ${[1,2,3,4,5,6,7,8].map(s => `<option value="${s}" ${s===3?'selected':''}>${s}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div id="as-error" class="error-message" style="display:none"></div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="as-cancel">Cancel</button>
                    <button class="btn btn-primary" id="as-save">Add Subject</button>
                </div>
            </div>
        </div>`;

        const closeFn = () => { area.innerHTML = ''; };
        document.getElementById('as-close').addEventListener('click', closeFn);
        document.getElementById('as-overlay').addEventListener('click', closeFn);
        document.getElementById('as-cancel').addEventListener('click', closeFn);

        document.getElementById('as-save').addEventListener('click', () => {
            const name     = document.getElementById('as-name').value.trim();
            const code     = document.getElementById('as-code').value.trim();
            const credits  = parseInt(document.getElementById('as-credits').value);
            const deptId   = document.getElementById('as-dept').value;
            const semester = parseInt(document.getElementById('as-semester').value);
            const errEl    = document.getElementById('as-error');

            if (!name || !code || !deptId) {
                errEl.textContent = 'Please fill in all required fields.';
                errEl.style.display = 'block';
                return;
            }

            DataStore.addSubject({ name, code, credits, departmentId: deptId, semester, facultyId: null });
            closeFn();
            App.showToast('Subject created!', 'success');
            renderSubjects(c);
        });
    }

    /* =================== FACULTY ASSIGNMENTS =================== */
    function renderAssignments(c) {
        const subjects = DataStore.getSubjects();
        const faculty  = DataStore.getFaculty();
        const depts    = DataStore.getDepartments();

        c.innerHTML = `
        <div class="fade-in">
            <div class="page-header">
                <h1>Faculty — Subject Assignments</h1>
                <p>Assign or reassign faculty members to subjects</p>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2>Subject Assignments</h2>
                    <select class="form-select" id="assign-dept-filter" style="width:auto;min-width:200px;">
                        <option value="">All Departments</option>
                        ${depts.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                    </select>
                </div>
                <div class="card-body no-pad">
                    ${subjects.length === 0
                        ? '<div class="empty-state"><div class="empty-icon">🔗</div><p>No subjects available. Create subjects first.</p></div>'
                        : `<div class="table-wrapper"><table class="table">
                            <thead><tr><th>Code</th><th>Subject</th><th>Department</th><th>Semester</th><th>Assigned Faculty</th><th>Action</th></tr></thead>
                            <tbody id="assign-tbody">
                                ${subjects.map(s => {
                                    const dept = DataStore.getDepartmentById(s.departmentId);
                                    const fac = s.facultyId ? DataStore.getFacultyById(s.facultyId) : null;
                                    // Get faculty from same department for assignment
                                    const deptFaculty = DataStore.getFacultyByDepartment(s.departmentId);
                                    const allFaculty  = DataStore.getFaculty();
                                    return `<tr class="assign-row" data-dept="${s.departmentId}">
                                        <td><span class="badge badge-info">${s.code}</span></td>
                                        <td class="fw-600">${s.name}</td>
                                        <td>${dept ? dept.name : '—'}</td>
                                        <td>Sem ${s.semester}</td>
                                        <td>
                                            <select class="form-select assign-select" data-subject="${s.id}" style="min-width:180px">
                                                <option value="">— Unassigned —</option>
                                                ${allFaculty.map(f => {
                                                    const fDept = DataStore.getDepartmentById(f.departmentId);
                                                    const selected = s.facultyId === f.id ? 'selected' : '';
                                                    return `<option value="${f.id}" ${selected}>${f.name} (${fDept?fDept.name.split(' ')[0]:''})</option>`;
                                                }).join('')}
                                            </select>
                                        </td>
                                        <td>
                                            <button class="btn btn-success btn-xs save-assign" data-subject="${s.id}">💾 Save</button>
                                        </td>
                                    </tr>`;
                                }).join('')}
                            </tbody>
                        </table></div>`
                    }
                </div>
            </div>

            <!-- Faculty Workload Summary -->
            <div class="card">
                <div class="card-header"><h2>Faculty Workload Summary</h2></div>
                <div class="card-body no-pad">
                    <div class="table-wrapper">
                        <table class="table">
                            <thead><tr><th>Faculty</th><th>Department</th><th>Assigned Subjects</th><th>Mark Entry Status</th></tr></thead>
                            <tbody>
                                ${faculty.map(f => {
                                    const dept = DataStore.getDepartmentById(f.departmentId);
                                    const subs = DataStore.getSubjectsByFaculty(f.id);
                                    const allEntered = subs.length > 0 && subs.every(s => DataStore.areMarksEntered(s.id));
                                    return `<tr>
                                        <td class="fw-600">${f.name}</td>
                                        <td>${dept ? dept.name : '—'}</td>
                                        <td>${subs.length > 0 ? subs.map(s => `<span class="badge badge-info" style="margin:2px">${s.code}</span>`).join('') : '<span class="text-muted">None</span>'}</td>
                                        <td>
                                            ${subs.length === 0 ? '<span class="text-muted">N/A</span>'
                                              : allEntered
                                                ? '<span class="badge badge-success">✓ All entered</span>'
                                                : `<span class="badge badge-danger">${subs.filter(s => !DataStore.areMarksEntered(s.id)).length} pending</span>`}
                                        </td>
                                    </tr>`;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>`;

        /* Filter */
        document.getElementById('assign-dept-filter').addEventListener('change', (e) => {
            const deptId = e.target.value;
            c.querySelectorAll('.assign-row').forEach(row => {
                row.style.display = (!deptId || row.dataset.dept === deptId) ? '' : 'none';
            });
        });

        /* Save assignment */
        c.querySelectorAll('.save-assign').forEach(btn => {
            btn.addEventListener('click', () => {
                const subId = btn.dataset.subject;
                const select = c.querySelector(`.assign-select[data-subject="${subId}"]`);
                const facId = select.value || null;
                DataStore.assignFacultyToSubject(subId, facId);
                App.showToast('Assignment updated!', 'success');
            });
        });
    }

    /* =================== SYLLABUS (EDITABLE) =================== */
    function renderSyllabus(c) {
        const subjects = DataStore.getSubjects();
        
        c.innerHTML = `
        <div class="fade-in">
            <div class="page-header" style="margin-bottom: 2rem;">
                <h1>Syllabus Tracking (HOD)</h1>
                <p>Modify syllabus completion status for any subject.</p>
            </div>
            
            <div class="form-group mb-4" style="max-width:400px;">
                <label class="form-label">Select Subject</label>
                <select class="form-select" id="hod-syl-select">
                    <option value="">— Choose a subject —</option>
                    ${subjects.map(s => `<option value="${s.id}">${s.code} — ${s.name}</option>`).join('')}
                </select>
            </div>
            
            <div id="hod-syllabus-content"></div>
        </div>`;
        
        document.getElementById('hod-syl-select').addEventListener('change', (e) => {
            const sId = e.target.value;
            const container = document.getElementById('hod-syllabus-content');
            if(!sId) { container.innerHTML = ''; return; }
            
            const units = DataStore.getSyllabusUnitsBySubject(sId);
            container.innerHTML = `
                <div class="card">
                    <div class="card-header"><h2>Units</h2></div>
                    <div class="card-body">
                        ${units.map(u => `
                            <div style="display:flex; align-items:center; padding:15px; border-bottom:1px solid var(--border-color);">
                                <input type="checkbox" id="hod-unit-${u.id}" ${u.isCompleted ? 'checked' : ''} style="width:20px; height:20px; margin-right:15px; cursor:pointer;">
                                <label for="hod-unit-${u.id}" style="font-size:1.1rem; font-weight:500; cursor:pointer;">${u.title}</label>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            
            units.forEach(u => {
                document.getElementById(`hod-unit-${u.id}`).addEventListener('change', (ev) => {
                    DataStore.updateSyllabusUnit(u.id, ev.target.checked);
                    App.showToast('Syllabus updated successfully');
                });
            });
        });
    }

    /* =================== PUBLIC =================== */
    return { renderSection };
})();
