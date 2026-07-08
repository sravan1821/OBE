/* ============================================================
   OBE MicTech — Management Dashboard Module
   (Primary role: Verify internal marks entered by faculty)
   ============================================================ */
const ManagementModule = (() => {

    function renderSection(section) {
        const c = App.getContent();
        switch (section) {
            case 'dashboard': renderDashboard(c); break;
            case 'verify':    renderVerify(c); break;
            default:          renderDashboard(c);
        }
    }

    /* =================== DASHBOARD =================== */
    function renderDashboard(c) {
        const subjects = DataStore.getSubjects();
        const faculty  = DataStore.getFaculty();
        const students = DataStore.getStudents();
        const depts    = DataStore.getDepartments();
        const mv       = DataStore.getMarkVerification();

        let marksEntered = 0, verified = 0, rejected = 0, pending = 0;
        subjects.forEach(s => {
            const entered = DataStore.areMarksEntered(s.id);
            if (entered) {
                marksEntered++;
                const vd = mv[s.id];
                if (vd && vd.verified) verified++;
                else if (vd && !vd.verified) rejected++;
                else pending++;
            }
        });

        c.innerHTML = `
        <div class="fade-in">
            <div class="page-header">
                <h1>Management Dashboard</h1>
                <p>Institutional analytics and mark verification overview</p>
            </div>

            <div class="stats-grid">
                <div class="stat-card gold">
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
                    <div class="stat-icon">👥</div>
                    <div class="stat-value">${students.length}</div>
                    <div class="stat-label">Students</div>
                </div>
                <div class="stat-card green">
                    <div class="stat-icon">📚</div>
                    <div class="stat-value">${subjects.length}</div>
                    <div class="stat-label">Subjects</div>
                </div>
            </div>

            <div class="grid grid-2" style="margin-bottom:2rem;">
                <!-- Verification Status Chart -->
                <div class="card" style="margin-bottom:0;">
                    <div class="card-header"><h3>Verification Status</h3></div>
                    <div class="card-body" style="display:flex; align-items:center; justify-content:center; gap:20px; min-height:180px;">
                        <div style="flex:1; min-width: 130px; max-width: 130px; margin: 0 auto;">
                            <canvas id="mgmt-dashboard-chart"></canvas>
                        </div>
                        <div style="flex:1; font-size:0.95rem;">
                            <p style="margin-bottom:0.4rem;"><span style="display:inline-block; width:12px; height:12px; background:#10B981; margin-right:8px; border-radius:3px;"></span>Verified: <strong>${verified}</strong></p>
                            <p style="margin-bottom:0.4rem;"><span style="display:inline-block; width:12px; height:12px; background:#f59e0b; margin-right:8px; border-radius:3px;"></span>Pending: <strong>${pending}</strong></p>
                            <p><span style="display:inline-block; width:12px; height:12px; background:#cf2c31; margin-right:8px; border-radius:3px;"></span>Rejected: <strong>${rejected}</strong></p>
                        </div>
                    </div>
                </div>

                <!-- Stats summary card -->
                <div class="card" style="margin-bottom:0;">
                    <div class="card-header"><h3>Overview Performance</h3></div>
                    <div class="card-body" style="display:flex; flex-direction:column; justify-content:center; min-height:180px;">
                        <div class="progress-label" style="font-size:0.95rem;"><span>Total Subjects Processed</span><span>${marksEntered}/${subjects.length}</span></div>
                        <div class="progress-bar" style="margin-bottom:1rem; width:100%;"><div class="progress-fill high" style="width:${subjects.length?Math.round(marksEntered/subjects.length*100):0}%"></div></div>
                        
                        <div class="progress-label" style="font-size:0.95rem;"><span>Verification Progress</span><span>${verified}/${marksEntered||1}</span></div>
                        <div class="progress-bar" style="width:100%;"><div class="progress-fill green" style="width:${marksEntered?Math.round(verified/marksEntered*100):0}%"></div></div>
                    </div>
                </div>
            </div>

            <!-- Department-wise Summary -->
            <div class="card">
                <div class="card-header"><h2>Department-wise Faculty Performance</h2></div>
                <div class="card-body no-pad">
                    <div class="table-wrapper">
                        <table class="table">
                            <thead><tr>
                                <th>Department</th><th>Faculty</th><th>Subjects</th><th>Marks Entered</th><th>Verified</th><th>Compliance</th>
                            </tr></thead>
                            <tbody>
                                ${depts.map(d => {
                                    const dFac  = DataStore.getFacultyByDepartment(d.id);
                                    const dSubs = DataStore.getSubjectsByDepartment(d.id);
                                    let dEntered = 0, dVerified = 0;
                                    dSubs.forEach(s => {
                                        if (DataStore.areMarksEntered(s.id)) dEntered++;
                                        if (DataStore.isMarksVerified(s.id)) dVerified++;
                                    });
                                    const compliance = dSubs.length ? Math.round((dEntered/dSubs.length)*100) : 0;
                                    const cClass = compliance < 50 ? 'low' : compliance < 80 ? 'medium' : 'high';
                                    return `<tr>
                                        <td class="fw-600">${d.name}</td>
                                        <td>${dFac.length}</td>
                                        <td>${dSubs.length}</td>
                                        <td>${dEntered} / ${dSubs.length}</td>
                                        <td>${dVerified} / ${dSubs.length}</td>
                                        <td style="min-width:120px">
                                            <div class="progress-bar"><div class="progress-fill ${cClass}" style="width:${compliance}%"></div></div>
                                            <small class="text-muted">${compliance}%</small>
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
            const ctx = document.getElementById('mgmt-dashboard-chart');
            if (ctx) {
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Verified', 'Pending', 'Rejected'],
                        datasets: [{
                            data: [verified, pending, rejected],
                            backgroundColor: ['#10B981', '#f59e0b', '#cf2c31'],
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

    /* =================== VERIFY MARKS =================== */
    function renderVerify(c) {
        const subjects = DataStore.getSubjects();
        const mv = DataStore.getMarkVerification();

        c.innerHTML = `
        <div class="fade-in">
            <div class="page-header">
                <h1>Verify Internal Marks</h1>
                <p>Review marks entered by faculty and approve or reject them</p>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2>Subjects with Marks</h2>
                    <div class="flex gap-sm">
                        <button class="btn btn-sm tab-filter active" data-filter="all">All</button>
                        <button class="btn btn-sm tab-filter" data-filter="pending">Pending</button>
                        <button class="btn btn-sm tab-filter" data-filter="verified">Verified</button>
                        <button class="btn btn-sm tab-filter" data-filter="rejected">Rejected</button>
                    </div>
                </div>
                <div class="card-body no-pad">
                    <div class="table-wrapper">
                        <table class="table" id="verify-table">
                            <thead><tr>
                                <th>Code</th><th>Subject</th><th>Department</th><th>Faculty</th><th>Status</th><th>Actions</th>
                            </tr></thead>
                            <tbody id="verify-tbody">
                                ${subjects.map(s => {
                                    const entered = DataStore.areMarksEntered(s.id);
                                    const fac = s.facultyId ? DataStore.getFacultyById(s.facultyId) : null;
                                    const dept = DataStore.getDepartmentById(s.departmentId);
                                    const vd = mv[s.id];
                                    let statusBadge, filterTag;
                                    let actionsHTML = '';

                                    if (!entered) {
                                        statusBadge = `<span class="badge" style="background: rgba(207, 44, 49, 0.08); color: var(--danger); border: 1px solid rgba(207, 44, 49, 0.2); font-weight: 600; padding: 5px 10px; border-radius: 6px; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;">⚠️ Not Entered</span>`;
                                        filterTag = 'pending';
                                        actionsHTML = `
                                            <div class="flex gap-sm" style="align-items: center; flex-wrap: nowrap; white-space: nowrap;">
                                                <span class="text-muted text-sm" style="font-weight: 500; font-size: 0.85rem; color: #64748B; margin-right: 8px; display: inline-flex; align-items: center; gap: 4px;">⏳ Waiting for Faculty</span>
                                                <button class="btn btn-warning btn-xs notify-btn" data-fid="${s.facultyId}" style="background: rgba(245, 158, 11, 0.1); color: #D97706; border: 1px solid rgba(245, 158, 11, 0.25); font-weight: 600; font-size: 0.8rem; padding: 6px 12px; border-radius: 6px; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 4px;" onmouseover="this.style.background='#F59E0B'; this.style.color='white';" onmouseout="this.style.background='rgba(245, 158, 11, 0.1)'; this.style.color='#D97706';">🔔 Send Notification</button>
                                            </div>
                                        `;
                                    } else {
                                        let verStatus = '';
                                        if (vd && vd.verified) {
                                            verStatus = '<span class="verify-badge verified">✓ Verified</span>';
                                            filterTag = 'verified';
                                        } else if (vd && !vd.verified) {
                                            verStatus = '<span class="verify-badge rejected">✗ Rejected</span>';
                                            filterTag = 'rejected';
                                        } else {
                                            verStatus = '<span class="verify-badge unverified">⏳ Pending</span>';
                                            filterTag = 'pending';
                                        }

                                        statusBadge = `<span class="badge" style="background:var(--success);color:white;margin-right:0.5rem">Work Done</span> ${verStatus}`;
                                        
                                        actionsHTML = `
                                            <div class="flex gap-sm">
                                                <button class="btn btn-primary btn-xs view-marks" data-subject="${s.id}">📋 View</button>
                                                <button class="btn btn-success btn-xs approve-btn" data-subject="${s.id}">✓ Approve</button>
                                                <button class="btn btn-danger btn-xs reject-btn" data-subject="${s.id}">✗ Reject</button>
                                                <button class="btn btn-warning btn-xs notify-btn" data-subject="${s.id}" data-fid="${s.facultyId}">🔔 Send Notification</button>
                                            </div>
                                        `;
                                    }

                                    return `<tr class="verify-row" data-status="${filterTag}" data-subject="${s.id}">
                                        <td><span class="badge badge-info">${s.code}</span></td>
                                        <td class="fw-600">${s.name}</td>
                                        <td>${dept ? dept.name : '—'}</td>
                                        <td>${fac ? fac.name : '—'}</td>
                                        <td>${statusBadge}</td>
                                        <td>${actionsHTML}</td>
                                    </tr>`;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                    ${subjects.filter(s => DataStore.areMarksEntered(s.id)).length === 0
                        ? '<div class="empty-state"><div class="empty-icon">📭</div><p>No marks have been entered by any faculty yet.</p></div>'
                        : ''}
                </div>
            </div>

            <div id="marks-view-modal"></div>
        </div>`;

        /* Filter tabs */
        c.querySelectorAll('.tab-filter').forEach(btn => {
            btn.addEventListener('click', () => {
                c.querySelectorAll('.tab-filter').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.dataset.filter;
                c.querySelectorAll('.verify-row').forEach(row => {
                    row.style.display = (filter === 'all' || row.dataset.status === filter) ? '' : 'none';
                });
            });
        });

        /* View marks */
        c.querySelectorAll('.view-marks').forEach(btn => {
            btn.addEventListener('click', () => showMarksModal(c, btn.dataset.subject));
        });

        /* Approve */
        c.querySelectorAll('.approve-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                DataStore.verifyMarks(btn.dataset.subject, { verified: true, remarks: 'Approved by Management' });
                App.showToast('Marks approved successfully!', 'success');
                renderVerify(c);
            });
        });

        /* Reject */
        c.querySelectorAll('.reject-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const remarks = prompt('Enter rejection remarks:');
                if (remarks !== null) {
                    DataStore.verifyMarks(btn.dataset.subject, { verified: false, remarks: remarks || 'Rejected by Management' });
                    App.showToast('Marks rejected.', 'error');
                    renderVerify(c);
                }
            });
        });

        /* Notify */
        c.querySelectorAll('.notify-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const msg = prompt('Enter notification message to send to Faculty, Coordinator, and HOD:');
                if (msg) {
                    if (btn.dataset.fid) DataStore.addNotification(btn.dataset.fid, msg, true);
                    DataStore.addNotification('coordinator', msg, true);
                    DataStore.addNotification('hod', msg, true);
                    App.showToast('Urgent alert sent to Faculty, Coordinator, and HOD!', 'success');
                }
            });
        });
    }

    function showMarksModal(c, subjectId) {
        const subject = DataStore.getSubjectById(subjectId);
        const fac = subject.facultyId ? DataStore.getFacultyById(subject.facultyId) : null;
        const vd = DataStore.getVerificationDetails(subjectId);

        let statusLine = '';
        if (vd && vd.verified) statusLine = '<span class="verify-badge verified">✓ Verified</span>';
        else if (vd && !vd.verified) statusLine = `<span class="verify-badge rejected">✗ Rejected — ${vd.remarks || ''}</span>`;
        else statusLine = '<span class="verify-badge unverified">⏳ Pending Verification</span>';

        const modal = document.getElementById('marks-view-modal');
        const marksTableHTML = MarksUtils.renderTable(subjectId, false);

        modal.innerHTML = `
        <div class="inline-modal">
            <div class="modal-overlay" id="mv-overlay"></div>
            <div class="modal-content" style="max-width:95vw;width:95vw;">
                <div class="modal-header">
                    <div>
                        <h2>${subject.code} — ${subject.name}</h2>
                        <div class="text-sm text-muted mt-1">Faculty: ${fac ? fac.name : 'N/A'} &bull; ${statusLine}</div>
                    </div>
                    <button class="modal-close" id="mv-close">&times;</button>
                </div>
                <div class="modal-body" style="max-height:70vh;overflow:auto;padding:0.5rem;">
                    <div style="background:rgba(255,190,11,0.06);border:1px solid rgba(255,190,11,0.12);border-radius:8px;padding:0.6rem 1rem;margin-bottom:0.8rem;font-size:0.8rem;color:var(--text-secondary);">
                        🔒 <strong>View Only</strong> — Management cannot edit marks. Use Approve/Reject to verify.
                    </div>
                    ${marksTableHTML}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-danger" id="mv-reject">✗ Reject</button>
                    <button class="btn btn-success" id="mv-approve">✓ Approve</button>
                </div>
            </div>
        </div>`;

        const closeFn = () => { modal.innerHTML = ''; };
        document.getElementById('mv-close').addEventListener('click', closeFn);
        document.getElementById('mv-overlay').addEventListener('click', closeFn);

        document.getElementById('mv-approve').addEventListener('click', () => {
            DataStore.verifyMarks(subjectId, { verified: true, remarks: 'Approved by Management' });
            closeFn();
            App.showToast('Marks approved!', 'success');
            renderVerify(c);
        });

        document.getElementById('mv-reject').addEventListener('click', () => {
            const remarks = prompt('Enter rejection remarks:');
            if (remarks !== null) {
                DataStore.verifyMarks(subjectId, { verified: false, remarks: remarks || 'Rejected by Management' });
                closeFn();
                App.showToast('Marks rejected.', 'error');
                renderVerify(c);
            }
        });
    }

    /* =================== PUBLIC =================== */
    return { renderSection };
})();
