/* ============================================================
   OBE MicTech — Coordinator Dashboard Module
   ============================================================ */
const CoordinatorModule = (() => {

    function renderSection(section) {
        const c = App.getContent();
        switch (section) {
            case 'dashboard':  renderDashboard(c); break;
            case 'marks':      FacultyModule.renderMarksEntry(c); break;
            case 'timetable':  renderTimetable(c); break;
            case 'status':     renderSubjectStatus(c); break;
            default:           renderDashboard(c);
        }
    }

    /* =================== DASHBOARD =================== */
    function renderDashboard(c) {
        const subjects = DataStore.getSubjects();
        const faculty  = DataStore.getFaculty();
        const students = DataStore.getStudents();
        const tt       = DataStore.getTimetable();

        let entered = 0, notEntered = 0;
        subjects.forEach(s => {
            if (DataStore.areMarksEntered(s.id)) entered++; else notEntered++;
        });

        const statuses = DataStore.getSubjectStatus();
        let avgCompletion = 0;
        const sIds = Object.keys(statuses);
        if (sIds.length) avgCompletion = Math.round(sIds.reduce((a, k) => a + statuses[k], 0) / sIds.length);

        c.innerHTML = `
        <div class="fade-in">
            <div class="page-header">
                <h1>Coordinator Dashboard</h1>
                <p>Overview of timetable assignments, subject progress, and mark entry status</p>
            </div>

            <div class="stats-grid">
                <div class="stat-card purple">
                    <div class="stat-icon">📚</div>
                    <div class="stat-value">${subjects.length}</div>
                    <div class="stat-label">Total Subjects</div>
                </div>
                <div class="stat-card blue">
                    <div class="stat-icon">👨‍🏫</div>
                    <div class="stat-value">${faculty.length}</div>
                    <div class="stat-label">Faculty Members</div>
                </div>
                <div class="stat-card green">
                    <div class="stat-icon">✅</div>
                    <div class="stat-value">${entered}</div>
                    <div class="stat-label">Marks Entered</div>
                </div>
                <div class="stat-card gold">
                    <div class="stat-icon">⚠️</div>
                    <div class="stat-value">${notEntered}</div>
                    <div class="stat-label">Marks Pending</div>
                </div>
            </div>

            <div class="grid grid-2" style="margin-bottom:2rem;">
                <!-- Subject Submission Chart -->
                <div class="card" style="margin-bottom:0;">
                    <div class="card-header"><h3>Submission Status</h3></div>
                    <div class="card-body" style="display:flex; align-items:center; justify-content:center; gap:20px; min-height:200px;">
                        <div style="flex:1; min-width: 140px; max-width: 140px; margin: 0 auto;">
                            <canvas id="coord-dashboard-chart"></canvas>
                        </div>
                        <div style="flex:1; font-size:0.95rem;">
                            <p style="margin-bottom:0.5rem;"><span style="display:inline-block; width:12px; height:12px; background:#5E35B1; margin-right:8px; border-radius:3px;"></span>Entered: <strong>${entered}</strong></p>
                            <p><span style="display:inline-block; width:12px; height:12px; background:#cf2c31; margin-right:8px; border-radius:3px;"></span>Pending: <strong>${notEntered}</strong></p>
                        </div>
                    </div>
                </div>

                <!-- Syllabus Completion Card -->
                <div class="card" style="margin-bottom:0;">
                    <div class="card-header"><h3>Average Syllabus Progress</h3></div>
                    <div class="card-body" style="display:flex; flex-direction:column; justify-content:center; min-height:200px;">
                        <h2 style="font-size:3rem; color:var(--accent); text-align:center; margin-bottom:10px;">${avgCompletion}%</h2>
                        <div class="progress-bar" style="max-width:300px; margin:0 auto; width:100%;"><div class="progress-fill high" style="width:${avgCompletion}%"></div></div>
                        <p class="text-muted" style="text-align:center; font-size:0.85rem; margin-top:10px;">Across all syllabus units</p>
                    </div>
                </div>
            </div>

            <!-- Quick Subject Overview -->
            <div class="card">
                <div class="card-header"><h2>Subject Overview</h2></div>
                <div class="card-body no-pad">
                    <div class="table-wrapper">
                        <table class="table">
                            <thead><tr>
                                <th>Code</th><th>Subject</th><th>Faculty</th><th>Completion</th><th>Marks Status</th>
                            </tr></thead>
                            <tbody>
                                ${subjects.map(s => {
                                    const fac = s.facultyId ? DataStore.getFacultyById(s.facultyId) : null;
                                    const pct = DataStore.getSubjectStatusById(s.id);
                                    const entered = DataStore.areMarksEntered(s.id);
                                    const pClass = pct < 40 ? 'low' : pct < 75 ? 'medium' : 'high';
                                    return `<tr>
                                        <td><span class="badge badge-info">${s.code}</span></td>
                                        <td class="fw-600">${s.name}</td>
                                        <td>${fac ? fac.name : '<span class="text-muted">Unassigned</span>'}</td>
                                        <td style="min-width:150px">
                                            <div class="progress-label"><span>${pct}%</span></div>
                                            <div class="progress-bar"><div class="progress-fill ${pClass}" style="width:${pct}%"></div></div>
                                        </td>
                                        <td>
                                            <span class="status-dot ${entered?'green':'red'}"></span>
                                            ${entered
                                                ? '<span class="badge badge-success">Entered</span>'
                                                : '<span class="badge badge-danger">Not Entered</span>'}
                                        </td>
                                    </tr>`;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>`;

        setTimeout(() => {
            const ctx = document.getElementById('coord-dashboard-chart');
            if (ctx) {
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Entered', 'Pending'],
                        datasets: [{
                            data: [entered, notEntered],
                            backgroundColor: ['#5E35B1', '#cf2c31'],
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

    /* =================== TIMETABLE =================== */
    const DAYS    = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const PERIODS = ['Period 1\n9:00-10:00','Period 2\n10:00-11:00','Period 3\n11:15-12:15',
                     'Period 4\n12:15-1:15','Period 5\n2:00-3:00','Period 6\n3:00-4:00'];

    function renderTimetable(c) {
        const subjects = DataStore.getSubjects();
        const faculty  = DataStore.getFaculty();
        const tt       = DataStore.getTimetable();

        c.innerHTML = `
        <div class="fade-in">
            <div class="page-header">
                <h1>Assign Timetable</h1>
                <p>Map faculty and subjects to weekly time slots</p>
                <div class="page-actions">
                    <button class="btn btn-primary" id="tt-add-btn">➕ Add Entry</button>
                    <button class="btn btn-danger btn-sm" id="tt-clear-btn">🗑️ Clear All</button>
                </div>
            </div>

            <!-- Timetable Grid -->
            <div class="card">
                <div class="card-body" style="overflow-x:auto">
                    <div class="timetable-grid" id="tt-grid">
                        <div class="tt-cell tt-header"></div>
                        ${DAYS.map(d => `<div class="tt-cell tt-header">${d.substring(0,3)}</div>`).join('')}
                        ${PERIODS.map((p, pi) => {
                            const pLabel = p.split('\n');
                            let row = `<div class="tt-cell tt-label">${pLabel[0]}<br><small>${pLabel[1]}</small></div>`;
                            DAYS.forEach((d, di) => {
                                const entry = tt.find(e => e.day === di && e.period === pi);
                                if (entry) {
                                    const sub = DataStore.getSubjectById(entry.subjectId);
                                    const fac = DataStore.getFacultyById(entry.facultyId);
                                    row += `<div class="tt-cell tt-filled" data-id="${entry.id}" title="Click to remove">
                                        <div class="tt-subject">${sub ? sub.code : '?'}</div>
                                        <div class="tt-faculty">${fac ? fac.name.split(' ').pop() : '?'}</div>
                                    </div>`;
                                } else {
                                    row += `<div class="tt-cell"></div>`;
                                }
                            });
                            return row;
                        }).join('')}
                    </div>
                </div>
            </div>

            <!-- Timetable entries list -->
            <div class="card">
                <div class="card-header"><h2>All Entries</h2></div>
                <div class="card-body no-pad">
                    ${tt.length === 0
                        ? '<div class="empty-state"><div class="empty-icon">📅</div><p>No timetable entries yet. Click "Add Entry" to start.</p></div>'
                        : `<div class="table-wrapper"><table class="table">
                            <thead><tr><th>Day</th><th>Period</th><th>Subject</th><th>Faculty</th><th>Action</th></tr></thead>
                            <tbody>${tt.map(e => {
                                const sub = DataStore.getSubjectById(e.subjectId);
                                const fac = DataStore.getFacultyById(e.facultyId);
                                return `<tr>
                                    <td>${DAYS[e.day] || '—'}</td>
                                    <td>Period ${e.period+1}</td>
                                    <td class="fw-600">${sub ? sub.name : '—'}</td>
                                    <td>${fac ? fac.name : '—'}</td>
                                    <td>
                                        <div class="flex gap-xs">
                                            <button class="btn btn-primary btn-xs tt-edit" data-id="${e.id}" style="padding: 4px 8px; font-size: 0.75rem; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px;">📝 Edit</button>
                                            <button class="btn btn-danger btn-xs tt-del" data-id="${e.id}" style="padding: 4px 8px; font-size: 0.75rem; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px;">✕ Delete</button>
                                        </div>
                                    </td>
                                </tr>`;
                            }).join('')}</tbody>
                        </table></div>`
                    }
                </div>
            </div>

            <!-- Add Entry Modal (inline) -->
            <div id="tt-modal" style="display:none"></div>
        </div>`;

        /* Delete entry from grid */
        c.querySelectorAll('.tt-filled').forEach(el => {
            el.addEventListener('click', () => {
                if (confirm('Remove this timetable entry?')) {
                    DataStore.deleteTimetableEntry(el.dataset.id);
                    renderTimetable(c);
                    App.showToast('Entry removed', 'info');
                }
            });
        });

        /* Edit entry from table */
        c.querySelectorAll('.tt-edit').forEach(btn => {
            btn.addEventListener('click', () => {
                showTTModal(c, subjects, faculty, btn.dataset.id);
            });
        });

        /* Delete entry from table */
        c.querySelectorAll('.tt-del').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('Delete this timetable entry?')) {
                    DataStore.deleteTimetableEntry(btn.dataset.id);
                    renderTimetable(c);
                    App.showToast('Entry removed', 'info');
                }
            });
        });

        /* Clear all */
        document.getElementById('tt-clear-btn').addEventListener('click', () => {
            if (confirm('Clear the entire timetable?')) {
                DataStore.clearTimetable();
                renderTimetable(c);
                App.showToast('Timetable cleared', 'info');
            }
        });

        /* Add entry modal */
        document.getElementById('tt-add-btn').addEventListener('click', () => showTTModal(c, subjects, faculty));
    }

    function showTTModal(c, subjects, faculty, existingEntryId = null) {
        const modal = document.getElementById('tt-modal');
        modal.style.display = '';

        let entry = null;
        if (existingEntryId) {
            entry = DataStore.getTimetable().find(e => e.id === existingEntryId);
        }

        modal.innerHTML = `
        <div class="inline-modal">
            <div class="modal-overlay" id="tt-modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${existingEntryId ? 'Edit Timetable Entry' : 'Add Timetable Entry'}</h2>
                    <button class="modal-close" id="tt-modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label">Subject</label>
                        <select class="form-select" id="tt-subject">
                            <option value="">— Select —</option>
                            ${subjects.map(s => `<option value="${s.id}" ${entry && entry.subjectId === s.id ? 'selected' : ''}>${s.code} — ${s.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Faculty</label>
                        <select class="form-select" id="tt-faculty">
                            <option value="">— Select —</option>
                            ${faculty.map(f => `<option value="${f.id}" ${entry && entry.facultyId === f.id ? 'selected' : ''}>${f.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Day</label>
                            <select class="form-select" id="tt-day">
                                ${DAYS.map((d,i) => `<option value="${i}" ${entry && entry.day === i ? 'selected' : ''}>${d}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Period</label>
                            <select class="form-select" id="tt-period">
                                ${PERIODS.map((p,i) => `<option value="${i}" ${entry && entry.period === i ? 'selected' : ''}>Period ${i+1}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div id="tt-add-error" class="error-message" style="display:none"></div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="tt-cancel">Cancel</button>
                    <button class="btn btn-primary" id="tt-save">${existingEntryId ? 'Save Changes' : 'Add Entry'}</button>
                </div>
            </div>
        </div>`;

        /* Auto-select faculty when subject changes */
        document.getElementById('tt-subject').addEventListener('change', (e) => {
            const sub = DataStore.getSubjectById(e.target.value);
            if (sub && sub.facultyId) document.getElementById('tt-faculty').value = sub.facultyId;
        });

        const closeFn = () => { modal.style.display = 'none'; modal.innerHTML = ''; };
        document.getElementById('tt-modal-close').addEventListener('click', closeFn);
        document.getElementById('tt-modal-overlay').addEventListener('click', closeFn);
        document.getElementById('tt-cancel').addEventListener('click', closeFn);

        document.getElementById('tt-save').addEventListener('click', () => {
            const subId = document.getElementById('tt-subject').value;
            const facId = document.getElementById('tt-faculty').value;
            const day   = parseInt(document.getElementById('tt-day').value);
            const period = parseInt(document.getElementById('tt-period').value);

            if (!subId || !facId) {
                const err = document.getElementById('tt-add-error');
                err.textContent = 'Please select both subject and faculty.';
                err.style.display = 'block';
                return;
            }

            let result;
            if (existingEntryId) {
                result = DataStore.updateTimetableEntry(existingEntryId, { subjectId: subId, facultyId: facId, day, period });
            } else {
                result = DataStore.addTimetableEntry({ subjectId: subId, facultyId: facId, day, period });
            }

            if (result && result.error) {
                const err = document.getElementById('tt-add-error');
                err.textContent = result.error;
                err.style.display = 'block';
                return;
            }

            closeFn();
            renderTimetable(c);
            App.showToast(existingEntryId ? 'Timetable entry updated!' : 'Timetable entry added!', 'success');
        });
    }

    /* =================== SUBJECT STATUS =================== */
    function renderSubjectStatus(c) {
        const subjects = DataStore.getSubjects();

        c.innerHTML = `
        <div class="fade-in">
            <div class="page-header">
                <h1>Subject Status Tracker</h1>
                <p>Verify syllabus completion and mark entry status. Send notifications to faculty if necessary.</p>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2>All Subjects</h2>
                    <span class="badge badge-info">${subjects.length} subjects</span>
                </div>
                <div class="card-body no-pad">
                    <div class="table-wrapper">
                        <table class="table">
                            <thead><tr>
                                <th>Code</th><th>Subject</th><th>Faculty</th><th>Syllabus Status</th><th>Marks Status</th><th>Actions</th>
                            </tr></thead>
                            <tbody>
                                ${subjects.map(s => {
                                    const fac = s.facultyId ? DataStore.getFacultyById(s.facultyId) : null;
                                    const units = DataStore.getSyllabusUnitsBySubject(s.id);
                                    const comp = units.filter(u=>u.isCompleted).length;
                                    const pct = units.length ? Math.round((comp / units.length) * 100) : 0;
                                    const entered = DataStore.areMarksEntered(s.id);
                                    const pClass = pct < 40 ? 'low' : pct < 75 ? 'medium' : 'high';
                                    return `<tr>
                                        <td><span class="badge badge-info">${s.code}</span></td>
                                        <td class="fw-600">${s.name}</td>
                                        <td>${fac ? fac.name : '<span class="text-muted">—</span>'}</td>
                                        <td style="min-width:180px">
                                            <div class="flex gap-sm" style="align-items:center">
                                                <span class="status-pct fw-600">${pct}% Completed</span>
                                            </div>
                                            <div class="progress-bar mt-1"><div class="progress-fill ${pClass}" style="width:${pct}%"></div></div>
                                            <div style="font-size:0.8rem; color:var(--text-muted); margin-top:5px;">${comp} / ${units.length} Units Done</div>
                                        </td>
                                        <td>
                                            <span class="status-dot ${entered?'green':'red'}"></span>
                                            ${entered
                                                ? '<span class="badge badge-success">✓ Entered</span>'
                                                : '<span class="badge badge-danger">✗ Pending</span>'}
                                        <td>
                                            <div style="display:flex; flex-direction:column; gap:5px;">
                                                ${!entered && s.facultyId ? `<button class="btn btn-danger btn-xs btn-notify" data-fid="${s.facultyId}" data-msg="Mid marks for ${s.name} are pending. Please enter them immediately.">Send Notification (Marks)</button>` : ''}
                                                ${pct < 100 && s.facultyId ? `<button class="btn btn-warning btn-xs btn-notify" data-fid="${s.facultyId}" data-msg="Your syllabus completion for ${s.name} is behind schedule. Please update it.">Send Notification (Syllabus)</button>` : ''}
                                                ${s.facultyId ? `<button class="btn btn-primary btn-xs btn-notify-custom" data-fid="${s.facultyId}">Send Notification</button>` : ''}
                                            </div>
                                        </td>
                                    </tr>`;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>`;

        c.querySelectorAll('.btn-notify').forEach(btn => {
            btn.addEventListener('click', () => {
                DataStore.addNotification(btn.dataset.fid, btn.dataset.msg, true);
                App.showToast('Urgent notification sent to faculty!', 'success');
            });
        });

        c.querySelectorAll('.btn-notify-custom').forEach(btn => {
            btn.addEventListener('click', () => {
                const msg = prompt('Enter the red pop-up notification message to send to this Faculty:');
                if (msg) {
                    DataStore.addNotification(btn.dataset.fid, msg, true);
                    App.showToast('Custom red popup sent to faculty!', 'success');
                }
            });
        });
    }



    /* =================== PUBLIC =================== */
    return { renderSection };
})();

window.CoordinatorModule = CoordinatorModule;
