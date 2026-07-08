/* ============================================================
   OBE MicTech — Faculty Dashboard Module
   Uses MarksUtils for editable marks table (MID-I & MID-II)
   ============================================================ */
const FacultyModule = (() => {

    function renderSection(section) {
        const c = App.getContent();
        switch (section) {
            case 'dashboard': renderDashboard(c); break;
            case 'marks':     renderMarksEntry(c); break;
            case 'syllabus':  renderSyllabus(c); break;
            case 'timetable': renderTimetable(c); break;
            default:          renderDashboard(c);
        }
    }

    /* =================== DASHBOARD =================== */
    function renderDashboard(c) {
        const user = App.getCurrentUser();
        const subjects = DataStore.getSubjectsByFaculty(user.id);
        const dept = DataStore.getDepartmentById(user.departmentId);

        let totalStudents = 0, marksEntered = 0;
        subjects.forEach(s => {
            totalStudents += DataStore.getStudentsByDeptAndSemester(s.departmentId, s.semester).length;
            if (DataStore.areMarksEntered(s.id)) marksEntered++;
        });

        c.innerHTML = `
        <div class="fade-in">
            <div class="page-header">
                <h1>Welcome, ${user.name}</h1>
                <p>${dept ? dept.name : 'Department'} &bull; Faculty Dashboard</p>
            </div>

            <div class="stats-grid">
                <div class="stat-card blue">
                    <div class="stat-icon">📚</div>
                    <div class="stat-value">${subjects.length}</div>
                    <div class="stat-label">Assigned Subjects</div>
                </div>
                <div class="stat-card purple">
                    <div class="stat-icon">👥</div>
                    <div class="stat-value">${totalStudents}</div>
                    <div class="stat-label">Total Students</div>
                </div>
                <div class="stat-card green">
                    <div class="stat-icon">✅</div>
                    <div class="stat-value">${marksEntered} / ${subjects.length}</div>
                    <div class="stat-label">Marks Entered</div>
                </div>
                <div class="stat-card gold">
                    <div class="stat-icon">📧</div>
                    <div class="stat-value">${user.email ? user.email.split('@')[0] : '—'}</div>
                    <div class="stat-label">Email</div>
                </div>
            </div>

            <div class="grid grid-2" style="margin-bottom:2rem;">
                <!-- Marks Entry Donut Chart -->
                <div class="card" style="margin-bottom:0;">
                    <div class="card-header"><h3>Marks Entry Status</h3></div>
                    <div class="card-body" style="display:flex; align-items:center; justify-content:center; gap:20px; min-height:180px;">
                        <div style="flex:1; min-width: 130px; max-width: 130px; margin: 0 auto;">
                            <canvas id="fac-dashboard-chart"></canvas>
                        </div>
                        <div style="flex:1; font-size:0.95rem;">
                            <p style="margin-bottom:0.5rem;"><span style="display:inline-block; width:12px; height:12px; background:#1E73BE; margin-right:8px; border-radius:3px;"></span>Entered: <strong>${marksEntered}</strong></p>
                            <p><span style="display:inline-block; width:12px; height:12px; background:#cf2c31; margin-right:8px; border-radius:3px;"></span>Pending: <strong>${subjects.length - marksEntered}</strong></p>
                        </div>
                    </div>
                </div>

                <!-- Syllabus completion average -->
                <div class="card" style="margin-bottom:0;">
                    <div class="card-header"><h3>Syllabus Progress</h3></div>
                    <div class="card-body" style="display:flex; flex-direction:column; justify-content:center; min-height:180px;">
                        <h2 style="font-size:3rem; color:var(--accent); text-align:center; margin-bottom:10px;">
                            ${(() => {
                                let totalUnits = 0, completedUnits = 0;
                                subjects.forEach(s => {
                                    const units = DataStore.getSyllabusUnitsBySubject(s.id);
                                    totalUnits += units.length;
                                    completedUnits += units.filter(u => u.isCompleted).length;
                                });
                                return totalUnits ? Math.round((completedUnits/totalUnits)*100) : 0;
                            })()}%
                        </h2>
                        <p class="text-muted" style="text-align:center; font-size:0.85rem;">Average syllabus progress across your subjects</p>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header"><h2>My Subjects</h2></div>
                <div class="card-body no-pad">
                    <div class="table-wrapper">
                        <table class="table">
                            <thead><tr>
                                <th>Code</th><th>Subject</th><th>Semester</th><th>Credits</th><th>Marks Status</th><th>Verification</th>
                            </tr></thead>
                            <tbody>
                                ${subjects.map(s => {
                                    const entered = DataStore.areMarksEntered(s.id);
                                    const vd = DataStore.getVerificationDetails(s.id);
                                    let vBadge = '<span class="badge badge-neutral">Pending</span>';
                                    if (vd) {
                                        vBadge = vd.verified
                                            ? '<span class="verify-badge verified">✓ Verified</span>'
                                            : '<span class="verify-badge rejected">✗ Rejected</span>';
                                    }
                                    return `<tr>
                                        <td><span class="badge badge-info">${s.code}</span></td>
                                        <td class="fw-600">${s.name}</td>
                                        <td>Sem ${s.semester}</td>
                                        <td>${s.credits}</td>
                                        <td>
                                            <span class="status-dot ${entered?'green':'red'}"></span>
                                            ${entered ? 'Entered' : 'Not Entered'}
                                        </td>
                                        <td>${vBadge}</td>
                                    </tr>`;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>`;

        setTimeout(() => {
            const ctx = document.getElementById('fac-dashboard-chart');
            if (ctx) {
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Entered', 'Pending'],
                        datasets: [{
                            data: [marksEntered, subjects.length - marksEntered],
                            backgroundColor: ['#1e73be', '#cf2c31'],
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

    /* =================== SYLLABUS TRACKING =================== */
    function renderSyllabus(c) {
        const user = App.getCurrentUser();
        const subjects = DataStore.getSubjectsByFaculty(user.id);
        
        c.innerHTML = `
        <div class="fade-in">
            <div class="page-header" style="margin-bottom: 2rem;">
                <h1>Syllabus Tracking</h1>
                <p>Track your syllabus completion status for assigned subjects.</p>
            </div>
            
            <div class="form-group mb-4" style="max-width:300px;">
                <label class="form-label">Select Subject</label>
                <select class="form-select" id="fac-syl-select">
                    <option value="">— Choose a subject —</option>
                    ${subjects.map(s => `<option value="${s.id}">${s.code} — ${s.name}</option>`).join('')}
                </select>
            </div>
            
            <div id="syllabus-content"></div>
        </div>`;
        
        document.getElementById('fac-syl-select').addEventListener('change', (e) => {
            const sId = e.target.value;
            const container = document.getElementById('syllabus-content');
            if(!sId) { container.innerHTML = ''; return; }
            
            const units = DataStore.getSyllabusUnitsBySubject(sId);
            container.innerHTML = `
                <div class="card">
                    <div class="card-header"><h2>Units</h2></div>
                    <div class="card-body">
                        ${units.map(u => `
                            <div style="display:flex; align-items:center; padding:15px; border-bottom:1px solid var(--border-color);">
                                <input type="checkbox" id="unit-${u.id}" ${u.isCompleted ? 'checked' : ''} style="width:20px; height:20px; margin-right:15px; cursor:pointer;">
                                <label for="unit-${u.id}" style="font-size:1.1rem; font-weight:500; cursor:pointer;">${u.title}</label>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            
            units.forEach(u => {
                document.getElementById(`unit-${u.id}`).addEventListener('change', (ev) => {
                    DataStore.updateSyllabusUnit(u.id, ev.target.checked);
                    App.showToast('Syllabus updated successfully');
                });
            });
        });
    }

    /* =================== TIMETABLE =================== */
    function renderTimetable(c) {
        const user = App.getCurrentUser();
        const timetable = DataStore.getTimetableByFaculty(user.id);
        const subjects = DataStore.getSubjectsByFaculty(user.id);
        
        c.innerHTML = `
        <div class="fade-in">
            <div class="page-header" style="margin-bottom: 2rem;">
                <h1>My Timetable</h1>
                <p>View your assigned classes schedule.</p>
            </div>
            
            <div class="card">
                <div class="card-header"><h2>Schedule</h2></div>
                <div class="card-body no-pad">
                    <table class="table">
                        <thead>
                            <tr><th>Day</th><th>Period</th><th>Subject</th></tr>
                        </thead>
                        <tbody>
                            ${timetable.length === 0 ? '<tr><td colspan="3" style="text-align:center;">No timetable assigned yet.</td></tr>' : ''}
                            ${timetable.sort((a,b)=>a.day.localeCompare(b.day)).map(t => {
                                const sub = subjects.find(s=>s.id===t.subjectId);
                                return `<tr>
                                    <td class="fw-600">${t.day}</td>
                                    <td><span class="badge badge-info">${t.period}</span></td>
                                    <td>${sub ? sub.name : 'Unknown'}</td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>`;

        setTimeout(() => {
            const ctx = document.getElementById('fac-dashboard-chart');
            if (ctx) {
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Entered', 'Pending'],
                        datasets: [{
                            data: [marksEntered, subjects.length - marksEntered],
                            backgroundColor: ['#1e73be', '#cf2c31'],
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

    /* =================== EXCEL MARK ENTRY =================== */
    function renderMarksEntry(c) {
        const user = App.getCurrentUser();
        const role = App.getCurrentRole();
        const subjects = (role === 'faculty') ? DataStore.getSubjectsByFaculty(user.id) : DataStore.getSubjects();

        c.innerHTML = `
        <div class="fade-in">
            <div class="page-header" style="margin-bottom: 2rem;">
                <h1>Upload Marks Statement</h1>
                <p style="color: var(--text-muted);">Select a subject and upload the Autonomous Marks Statement (.xlsx) to calculate CO Attainments.</p>
            </div>

            <div class="card" style="max-width: 600px; margin: 0 auto;">
                <div class="card-header"><h2>Marks Upload</h2></div>
                <div class="card-body">
                    <div class="form-group mb-4">
                        <label class="form-label">Subject</label>
                        <select class="form-select" id="fac-marks-select">
                            <option value="">— Choose a subject —</option>
                            ${subjects.map(s => `<option value="${s.id}">${s.code} — ${s.name} (Sem ${s.semester})</option>`).join('')}
                        </select>
                    </div>

                    <div id="upload-area" style="display:none;">
                        <div class="form-group mb-4" style="max-width: 300px; margin: 0 auto 1.5rem auto;">
                            <label class="form-label">Select Regulation</label>
                            <select class="form-select" id="fac-reg-select">
                                <option value="MIC23">MIC 23</option>
                                <option value="MIC20">MIC 20</option>
                            </select>
                        </div>
                        <div class="upload-zone" id="file-drop-zone">
                            <div class="upload-icon">📄</div>
                            <div class="upload-title">Click or drag Excel file here</div>
                            <div class="upload-subtitle">Format: Autonomous Marks Statement (.xlsx)</div>
                            <input type="file" id="excel-file-input" accept=".xlsx, .xls">
                        </div>
                        <div id="upload-status" style="margin-top: 1rem; text-align: center; font-weight: 600;"></div>
                        
                        <div style="margin-top: 1.5rem; display: flex; gap: 1rem; flex-wrap: wrap;">
                            <button id="btn-process-save" class="btn-pro btn-pro-primary" style="display:none;">💾 Process & Save to DataStore</button>
                            <button id="btn-download-co" class="btn-pro btn-pro-success" style="display:none;">📥 Download CO Attainment</button>
                            <button id="btn-notify-hod" class="btn-pro btn-pro-warning" style="display:none;">🔔 Send Urgent Notification</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

        let parsedData = null; // Store parsed JSON here

        const select = document.getElementById('fac-marks-select');
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('excel-file-input');
        const dropZone = document.getElementById('file-drop-zone');
        const status = document.getElementById('upload-status');
        const btnProcess = document.getElementById('btn-process-save');
        const btnDownload = document.getElementById('btn-download-co');
        const btnNotify = document.getElementById('btn-notify-hod');

        select.addEventListener('change', (e) => {
            if (e.target.value) {
                uploadArea.style.display = 'block';
            } else {
                uploadArea.style.display = 'none';
            }
            // Reset state
            fileInput.value = '';
            parsedData = null;
            status.textContent = '';
            btnProcess.style.display = 'none';
            btnDownload.style.display = 'none';
            btnNotify.style.display = 'none';
        });

        dropZone.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            status.textContent = `Reading ${file.name}...`;
            status.style.color = 'var(--text-muted)';
            btnProcess.style.display = 'none';
            btnDownload.style.display = 'none';

            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, {type: 'array'});
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    // Read raw json, preserving empty rows/columns
                    const json = XLSX.utils.sheet_to_json(worksheet, {header: 1, defval: null});
                    
                    const regulation = document.getElementById('fac-reg-select').value;
                    parsedData = parseMarksSheet(json, regulation);
                    status.textContent = `Successfully parsed ${Object.keys(parsedData).length} student records for ${regulation}!`;
                    status.style.color = 'var(--success)';
                    btnProcess.style.display = 'block';
                } catch (err) {
                    console.error(err);
                    status.textContent = 'Error parsing Excel file. Ensure it matches the template format.';
                    status.style.color = 'var(--danger)';
                }
            };
            reader.readAsArrayBuffer(file);
        });

        btnProcess.addEventListener('click', () => {
            const subjectId = select.value;
            if (!subjectId || !parsedData) return;
            DataStore.saveBulkMarks(subjectId, parsedData);
            App.showToast('Marks processed and saved to DataStore successfully!', 'success');
            
            btnNotify.style.display = 'block';

            // Generate CO Data to allow download
            btnProcess.style.display = 'none';
            btnDownload.style.display = 'block';
        });

        btnNotify.addEventListener('click', () => {
            const msg = prompt('Enter notification message to send to HOD, Coordinator, and Management:');
            if (msg) {
                DataStore.addNotification('hod', msg, true);
                DataStore.addNotification('coordinator', msg, true);
                DataStore.addNotification('management', msg, true);
                App.showToast('Urgent alert sent to HOD, Coordinator, and Management!', 'success');
            }
        });

        btnDownload.addEventListener('click', () => {
            const subjectId = select.value;
            if (!subjectId || !parsedData) return;
            const regulation = document.getElementById('fac-reg-select').value;
            downloadCOExcel(subjectId, parsedData, regulation);
        });
    }

    function parseMarksSheet(rows, regulation) {
        const bulk = {};

        // Auto-detect the first data row by looking for a roll number pattern in column 1
        let startRow = 0;
        for (let i = 0; i < Math.min(rows.length, 30); i++) {
            if (rows[i] && rows[i][1] && /^[0-9]{2}[A-Za-z]/.test(String(rows[i][1]).trim())) {
                startRow = i;
                break;
            }
        }
        if (startRow === 0) startRow = 10; // fallback

        // Detect layout type based on header content (MID-I TOTAL or SCALE indicates the new detailed layout)
        let isNewLayout = false;
        for (let r = 0; r < Math.min(rows.length, 12); r++) {
            if (rows[r]) {
                for (let c = 0; c < rows[r].length; c++) {
                    const valStr = String(rows[r][c] || '').toUpperCase();
                    if (valStr.includes("MID-I TOTAL") || valStr.includes("SCALE")) {
                        isNewLayout = true;
                        break;
                    }
                }
            }
            if (isNewLayout) break;
        }

        for (let i = startRow; i < rows.length; i++) {
            const row = rows[i];
            if (!row || !row[1]) continue;

            const rollNo = row[1].toString().trim();
            if (!/[A-Za-z]/.test(rollNo)) continue; // skip non-roll rows

            // NO DataStore lookup — use roll number directly as key
            const val = (idx) => {
                let v = row[idx];
                if (v === 'AB' || v === 'ab' || v === undefined || v === null || v === '') return 0;
                const parsed = parseFloat(v);
                if (isNaN(parsed)) return 0;
                return parsed;
            };

            let m1 = {}, m2 = {};
            let finalInternal = 0;

            if (regulation === 'MIC23') {
                /* ===== MIC23 FORMAT =====
                   Each question has TWO evaluations (10 marks each).
                   Mid 1 columns: 3,4,5,6,7,8 (6 Q values), skip 9 (total), 10 (Quiz), 11 (Asgn)
                   Mid 2 columns: 13,14,15,16,17,18 (6 Q values), skip 19, 20 (Quiz), 21 (Asgn)
                */
                let ut1 = 11, asg1 = 13, m2q_start = 15, ut2 = 23, asg2 = 25;
                if (!isNewLayout) { 
                    // Fallback to old format
                    ut1 = 10; asg1 = 11; m2q_start = 13; ut2 = 20; asg2 = 21;
                }
                m1 = {
                    q1e1: val(3), q1e2: val(4), q2e1: val(5), q2e2: val(6), q3e1: val(7), q3e2: val(8),
                    unitTest: val(ut1), assignment: val(asg1)
                };
                m2 = {
                    q1e1: val(m2q_start), q1e2: val(m2q_start+1), q2e1: val(m2q_start+2), q2e2: val(m2q_start+3), q3e1: val(m2q_start+4), q3e2: val(m2q_start+5),
                    unitTest: val(ut2), assignment: val(asg2)
                };
                m1.midTotal = calcMidTotal_MIC23(m1);
                m2.midTotal = calcMidTotal_MIC23(m2);
                const maxMid = Math.max(m1.midTotal, m2.midTotal);
                const minMid = Math.min(m1.midTotal, m2.midTotal);
                finalInternal = (0.8 * maxMid) + (0.2 * minMid);

            } else {
                /* ===== MIC20 FORMAT =====
                   Each question has a SINGLE value (5 marks each).
                   Mid 1 columns: 2(Q1), 3(Q2), 4(Q3), 5(Quiz), 6(Asgn)
                   Mid 2 columns: 7(Q1), 8(Q2), 9(Q3), 10(Quiz), 11(Asgn)
                */
                m1 = {
                    q1: val(2), q2: val(3), q3: val(4),
                    unitTest: val(5), assignment: val(6)
                };
                m2 = {
                    q1: val(7), q2: val(8), q3: val(9),
                    unitTest: val(10), assignment: val(11)
                };
            }

            bulk[rollNo] = { mid1: m1, mid2: m2, finalInternal, regulation };
        }
        return bulk;
    }

    /*  MIC23 Mid Total Calculation (for 80/20 Final Internal rule):
        Step 1: =SUM(MAX(Q1e1,Q1e2) + MAX(Q2e1,Q2e2) + MAX(Q3e1,Q3e2))  → Descriptive total (out of 30)
        Step 2: =ROUNDUP(Descriptive / 2, 0)                              → Scaled descriptive (out of 15)
        Step 3: =ROUNDUP(Quiz / 2, 0)                                     → Scaled quiz
        Step 4: Mid Total = ScaledDescriptive + ScaledQuiz + Assignment
    */
    function calcMidTotal_MIC23(m) {
        const q1best = Math.max(m.q1e1 || 0, m.q1e2 || 0);
        const q2best = Math.max(m.q2e1 || 0, m.q2e2 || 0);
        const q3best = Math.max(m.q3e1 || 0, m.q3e2 || 0);
        const descriptive = q1best + q2best + q3best;

        return Math.ceil(descriptive / 2) + Math.ceil((m.unitTest || 0) / 2) + (m.assignment || 0);
    }

    /*  =================== DOWNLOAD CO ATTAINMENTS EXCEL ===================
        Implements ALL formulas from the user's reference images:

        IMAGE 1 (MIC20 – "21 TM.xlsx Important Formulas"):
        ─────────────────────────────────────────────────────
        Formula 1: =MAX(E14:F14)                              → External: Best of two evaluations
        Formula 2: =COUNTIF(X14:X62, ">=1.8")                 → Count students achieving ≥ 1.8
        Formula 3: =ROUND(O2/P2*3, 2)                         → Attainment value (0–3 scale)
        Formula 4: =O2/P2*100                                 → Pass percentage (CIE %)
        Formula 7: =ROUND((Internal*0.4 + External*0.6)*3, 2) → Overall Direct Attainment
        Formula 8: =ROUND(Direct*0.7 + Indirect*0.3, 2)       → Overall CO Attainment
        Formula 9: =ROUND(N9/3*100, 1)                        → Attainment Percentage
        Formula 10: =ROUND(0.3*B4 + 0.7*C4, 2)                → CO-PO Attainment

        IMAGE 2 (MIC23 – "Calculation of Total Marks"):
        ────────────────────────────────────────────────
        =SUM(MAX(D:E) + MAX(F:G) + MAX(H:I))                  → Total Descriptive Marks
        =ROUNDUP(J/2, 0)                                      → Scaled to 5-mark equivalent per Q

        Student-wise CO Attainment formula (both regulations):
        CO = ((Q_value + Quiz + Assignment) / MaxTotal) * 3

        MIC20: Q(5) + Quiz(10) + Asgn(5) = 20 max  →  CO = (sum/20)*3
        MIC23: Q_scaled(5) + Quiz(10) + Asgn(5) = 20 max  →  CO = (sum/20)*3
    */
    const BORDER_ALL = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' }
    };
    const STYLE_HDR = { font: { bold: true }, alignment: { horizontal: 'center', vertical: 'center' }, border: BORDER_ALL };
    const STYLE_GREEN_HDR = { font: { bold: true }, fill: { fgColor: { rgb: '92D050' } }, alignment: { horizontal: 'center', vertical: 'center' }, border: BORDER_ALL };
    const STYLE_GREEN = { fill: { fgColor: { rgb: '92D050' } }, alignment: { horizontal: 'center', vertical: 'center' }, border: BORDER_ALL };
    const STYLE_RED_TXT = { font: { color: { rgb: 'FF0000' } }, alignment: { horizontal: 'center', vertical: 'center' }, border: BORDER_ALL };
    const STYLE_RED_BOLD = { font: { bold: true, color: { rgb: 'FF0000' } }, alignment: { horizontal: 'left', vertical: 'center', wrapText: true }, border: BORDER_ALL };
    const STYLE_DATA = { alignment: { horizontal: 'center', vertical: 'center' }, border: BORDER_ALL };
    const STYLE_LEFT = { alignment: { horizontal: 'left', vertical: 'center' }, border: BORDER_ALL };

    function downloadCOExcel(subjectId, marksData, regulation) {
        const sub = DataStore.getSubjectById(subjectId);
        const rollNumbers = Object.keys(marksData).sort();
        const wb = XLSX.utils.book_new();

        if (regulation === 'MIC23') {
            // ==========================================
            // SHEET 1: MARKS STATEMENT (Styled)
            // ==========================================
            const wsMarks = {};
            let maxR = 0;
            const addCell = (r, c, v, s) => {
                const ref = XLSX.utils.encode_cell({r, c});
                wsMarks[ref] = { v: (v===undefined || v===null) ? '' : v, t: typeof v === 'number' ? 'n' : 's', s };
                maxR = Math.max(maxR, r);
            };

            addCell(0, 0, "DVR & Dr. HS MIC College of Technology", { font: { bold: true, sz: 16 }, alignment: { horizontal: 'center', vertical: 'center' } });
            addCell(5, 0, "AUTONOMOUS MARKS STATEMENT", { font: { bold: true, sz: 12, underline: true }, alignment: { horizontal: 'center', vertical: 'center' } });
            addCell(6, 0, "Academic Year : 2025-2026", { font: { bold: true }, alignment: { horizontal: 'center', vertical: 'center' } });
            addCell(7, 0, `SUBJECT: ${sub.name} (${sub.code})`, { font: { bold: true }, border: BORDER_ALL });
            addCell(7, 13, `FACULTY: ${App.getCurrentUser().name}`, { font: { bold: true }, border: BORDER_ALL });
            // Row 8 (index 8)
            addCell(8, 0, "Enter AB for absentees", STYLE_RED_BOLD);
            addCell(8, 3, "MID-I", STYLE_HDR);
            addCell(8, 12, "MID-II", STYLE_HDR);

            // Row 9 (index 9)
            addCell(9, 0, "S.NO", STYLE_HDR);
            addCell(9, 1, "Regd.No", STYLE_HDR);
            addCell(9, 2, "Name", STYLE_HDR);
            addCell(9, 3, "Descriptive", STYLE_HDR);
            addCell(9, 8, "Unit Test", STYLE_HDR);
            addCell(9, 10, "ASSIGNM ENT-1", STYLE_HDR);
            addCell(9, 11, "MID-I TOTAL", STYLE_HDR);
            addCell(9, 12, "Descriptive", STYLE_HDR);
            addCell(9, 17, "Unit Test", STYLE_HDR);
            addCell(9, 19, "ASSIGNM ENT-2", STYLE_HDR);
            addCell(9, 20, "MID-II TOTAL", STYLE_HDR);
            addCell(9, 21, "MARKS", STYLE_HDR);

            // Row 10 (index 10)
            const headers = [
                "", "", "",
                "CO1", "CO2", "CO3", "Total", "Scale", "Unit Test", "Scale", "ASSIGNM ENT-1", "MID-I TOTAL",
                "CO3", "CO4", "CO5", "Total", "Scale", "Unit Test", "Scale", "ASSIGNM ENT-2", "MID-II TOTAL",
                "MARKS"
            ];
            headers.forEach((h, c) => {
                if (h) addCell(10, c, h, STYLE_HDR);
            });

            // Row 11 (index 11) is the green max marks row
            const maxM = [
                "********", "********", "********",
                10, 10, 10, 30, 15, 20, 10, 5, 30,
                10, 10, 10, 30, 15, 20, 10, 5, 30,
                30
            ];
            maxM.forEach((m, c) => addCell(11, c, m, typeof m === 'number' ? STYLE_GREEN_HDR : STYLE_HDR));

            rollNumbers.forEach((roll, i) => {
                const rec = marksData[roll];
                const m1 = rec.mid1, m2 = rec.mid2;
                const r = 12 + i;

                const m1_max1 = Math.max(m1.q1e1||0, m1.q1e2||0);
                const m1_max2 = Math.max(m1.q2e1||0, m1.q2e2||0);
                const m1_max3 = Math.max(m1.q3e1||0, m1.q3e2||0);
                const m1_desc = m1_max1 + m1_max2 + m1_max3;
                const m1_desc2 = Math.ceil(m1_desc/2);
                const m1_ut2 = Math.ceil((m1.unitTest||0)/2);
                const m1_tot = m1_desc2 + m1_ut2 + (m1.assignment||0);

                const m2_max1 = Math.max(m2.q1e1||0, m2.q1e2||0);
                const m2_max2 = Math.max(m2.q2e1||0, m2.q2e2||0);
                const m2_max3 = Math.max(m2.q3e1||0, m2.q3e2||0);
                const m2_desc = m2_max1 + m2_max2 + m2_max3;
                const m2_desc2 = Math.ceil(m2_desc/2);
                const m2_ut2 = Math.ceil((m2.unitTest||0)/2);
                const m2_tot = m2_desc2 + m2_ut2 + (m2.assignment||0);

                const fin = Math.ceil(0.8 * Math.max(m1_tot, m2_tot) + 0.2 * Math.min(m1_tot, m2_tot));

                const data = [
                    i+1, roll, "Student Name",
                    m1_max1||'', m1_max2||'', m1_max3||'',
                    m1_desc||'', m1_desc2||'', m1.unitTest||'', m1_ut2||'', m1.assignment||'', m1_tot||'',
                    m2_max1||'', m2_max2||'', m2_max3||'',
                    m2_desc||'', m2_desc2||'', m2.unitTest||'', m2_ut2||'', m2.assignment||'', m2_tot||'',
                    fin||''
                ];

                data.forEach((val, c) => {
                    let st = STYLE_DATA;
                    if (c === 2) st = STYLE_LEFT;
                    if (c === 11 || c === 20 || c === 21) st = STYLE_GREEN;
                    if (c === 21 && fin < 15) st = { ...STYLE_GREEN, font: { color: { rgb: 'FF0000' }, bold: true } };
                    addCell(r, c, val, st);
                });
            });

                        wsMarks['!ref'] = XLSX.utils.encode_range({s:{r:0,c:0}, e:{r:maxR,c:21}});
            wsMarks['!merges'] = [
                { s:{r:0,c:0}, e:{r:4,c:21} }, 
                { s:{r:5,c:0}, e:{r:5,c:21} }, 
                { s:{r:6,c:0}, e:{r:6,c:21} }, 
                { s:{r:7,c:0}, e:{r:7,c:9} }, 
                { s:{r:7,c:10}, e:{r:7,c:21} }, 
                { s:{r:8,c:0}, e:{r:8,c:2} }, 
                { s:{r:8,c:3}, e:{r:8,c:11} }, 
                { s:{r:8,c:12}, e:{r:8,c:20} },
                { s:{r:9,c:0}, e:{r:10,c:0} }, // S.NO
                { s:{r:9,c:1}, e:{r:10,c:1} }, // Regd.No
                { s:{r:9,c:2}, e:{r:10,c:2} }, // Name
                { s:{r:9,c:3}, e:{r:9,c:5} }, // Descriptive 1
                { s:{r:9,c:8}, e:{r:9,c:9} }, // Unit Test 1
                { s:{r:9,c:10}, e:{r:10,c:10} }, // Assignment-1
                { s:{r:9,c:11}, e:{r:10,c:11} }, // MID-I TOTAL
                { s:{r:9,c:12}, e:{r:9,c:14} }, // Descriptive 2
                { s:{r:9,c:17}, e:{r:9,c:18} }, // Unit Test 2
                { s:{r:9,c:19}, e:{r:10,c:19} }, // Assignment-2
                { s:{r:9,c:20}, e:{r:10,c:20} }, // MID-II TOTAL
                { s:{r:9,c:21}, e:{r:10,c:21} } // MARKS
            ];
            wsMarks['!cols'] = [
                {wch:6}, {wch:15}, {wch:25},
                {wch:6},{wch:6},{wch:6},{wch:6},{wch:6},{wch:8},{wch:6},{wch:12},{wch:10},
                {wch:6},{wch:6},{wch:6},{wch:6},{wch:6},{wch:8},{wch:6},{wch:12},{wch:10},
                {wch:8}
            ];
            XLSX.utils.book_append_sheet(wb, wsMarks, 'Marks Statement');
        }

        // ==========================================
        // SHEET 2: CO ATTAINMENTS (Original logic)
        // ==========================================
        let co1Att=0, co2Att=0, co3Att=0, co4Att=0, co5Att=0;
        const studentRows = [];
        rollNumbers.forEach((rollNo, idx) => {
            const rec = marksData[rollNo];
            if (!rec) return;
            const m1 = rec.mid1, m2 = rec.mid2;
            let co1_q=0, co2_q=0, co3_q_m1=0, co3_q_m2=0, co4_q=0, co5_q=0;
            let quiz1=0, asgn1=0, quiz2=0, asgn2=0;
            let rowData = [];

            if (regulation === 'MIC23') {
                const m1_max1 = Math.max(m1.q1e1||0, m1.q1e2||0);
                const m1_max2 = Math.max(m1.q2e1||0, m1.q2e2||0);
                const m1_max3 = Math.max(m1.q3e1||0, m1.q3e2||0);
                const m2_max1 = Math.max(m2.q1e1||0, m2.q1e2||0);
                const m2_max2 = Math.max(m2.q2e1||0, m2.q2e2||0);
                const m2_max3 = Math.max(m2.q3e1||0, m2.q3e2||0);
                co1_q = Math.ceil(m1_max1/2); co2_q = Math.ceil(m1_max2/2); co3_q_m1 = Math.ceil(m1_max3/2);
                co3_q_m2 = Math.ceil(m2_max1/2); co4_q = Math.ceil(m2_max2/2); co5_q = Math.ceil(m2_max3/2);
                quiz1 = m1.unitTest||0; asgn1 = m1.assignment||0;
                quiz2 = m2.unitTest||0; asgn2 = m2.assignment||0;
                rowData = [idx+1, rollNo,
                    m1.q1e1||'', m1.q1e2||'', m1.q2e1||'', m1.q2e2||'', m1.q3e1||'', m1.q3e2||'',
                    m1_max1+m1_max2+m1_max3, Math.ceil((m1_max1+m1_max2+m1_max3)/2), quiz1||'', asgn1||'',
                    m2.q1e1||'', m2.q1e2||'', m2.q2e1||'', m2.q2e2||'', m2.q3e1||'', m2.q3e2||'',
                    m2_max1+m2_max2+m2_max3, Math.ceil((m2_max1+m2_max2+m2_max3)/2), quiz2||'', asgn2||''];
            } else {
                co1_q = m1.q1||0; co2_q = m1.q2||0; co3_q_m1 = m1.q3||0;
                co3_q_m2 = m2.q1||0; co4_q = m2.q2||0; co5_q = m2.q3||0;
                quiz1 = m1.unitTest||0; asgn1 = m1.assignment||0;
                quiz2 = m2.unitTest||0; asgn2 = m2.assignment||0;
                rowData = [idx+1, rollNo,
                    co1_q||'', co2_q||'', co3_q_m1||'', quiz1||'', asgn1||'',
                    co3_q_m2||'', co4_q||'', co5_q||'', quiz2||'', asgn2||''];
            }

            let co1 = ((co1_q + quiz1 + asgn1) / 20) * 3;
            let co2 = ((co2_q + quiz1 + asgn1) / 20) * 3;
            const co3_a = ((co3_q_m1 + quiz1 + asgn1) / 20) * 3;
            const co3_b = ((co3_q_m2 + quiz2 + asgn2) / 20) * 3;
            let co3 = (co3_a + co3_b) / 2;
            let co4 = ((co4_q + quiz2 + asgn2) / 20) * 3;
            let co5 = ((co5_q + quiz2 + asgn2) / 20) * 3;
            co1=Math.min(co1,3); co2=Math.min(co2,3); co3=Math.min(co3,3); co4=Math.min(co4,3); co5=Math.min(co5,3);
            if(co1>=1.8) co1Att++; if(co2>=1.8) co2Att++; if(co3>=1.8) co3Att++;
            if(co4>=1.8) co4Att++; if(co5>=1.8) co5Att++;
            rowData.push(co1.toFixed(2), co2.toFixed(2), co3.toFixed(2), co4.toFixed(2), co5.toFixed(2));
            studentRows.push(rowData);
        });

        const tot = rollNumbers.length || 1;
        const a3 = (a) => parseFloat(((a/tot)*3).toFixed(2));
        const pc = (a) => parseFloat(((a/tot)*100).toFixed(2));
        const exRows = [];

        if (regulation === 'MIC23') {
            exRows.push(['DEPARTMENT OF MECH','','','','','','','','','','','','','','','','','','','','','','','Attained','Appeared','3-SCALE','CIE (%)']);
            exRows.push(['Subject Code',sub.code,'','','','','','','','','','','','','','','','','','','','','CO 1',co1Att,tot,a3(co1Att),pc(co1Att)]);
            exRows.push(['Subject Name',sub.name,'','','','','','','','','','','','','','','','','','','','','CO 2',co2Att,tot,a3(co2Att),pc(co2Att)]);
            exRows.push(['Year & Sem','III YEAR- V SEM','','','','','','','','','','','','','','','','','','','','','CO 3',co3Att,tot,a3(co3Att),pc(co3Att)]);
            exRows.push(['Academic Year','2023-24','','','','','','','','','','','','','','','','','','','','','CO 4',co4Att,tot,a3(co4Att),pc(co4Att)]);
            exRows.push(['Faculty',App.getCurrentUser().name,'','','','','','','','','','','','','','','','','','','','','CO 5',co5Att,tot,a3(co5Att),pc(co5Att)]);
            exRows.push([]); exRows.push([]);
            exRows.push(['Sl.No.','Roll Numbers','First Mid','','','','','','','','','','Second Mid','','','','','','','','','','Studentwise CO Attainments','','','','']);
            exRows.push(['','','Q1','Q2','Q3','Q4','Q5','Q6','Total Desc','ROUNDUP(/2)','Quiz','Assignment','Q1','Q2','Q3','Q4','Q5','Q6','Total Desc','ROUNDUP(/2)','Quiz','Assignment','CO 1','CO 2','CO 3','CO 4','CO 5']);
            exRows.push(['','',10,10,10,10,10,10,'=SUM(MAX)','=ROUNDUP(/2)',10,5,10,10,10,10,10,10,'=SUM(MAX)','=ROUNDUP(/2)',10,5,'','','','','']);
            exRows.push(['','','CO1','CO1','CO2','CO2','CO3','CO3','','','','','CO3','CO3','CO4','CO4','CO5','CO5','','','','','','','','','']);
            studentRows.forEach(r => exRows.push(r));
            const wsCOSheet = XLSX.utils.aoa_to_sheet(exRows);
            XLSX.utils.book_append_sheet(wb, wsCOSheet, 'CO Attainments');
        } else {
            exRows.push(['DEPARTMENT OF MECH','','','','','','','','','','','Attained','Appeared','3-SCALE','CIE (%)']);
            exRows.push(['Subject Code',sub.code,'','','','','','','','CO 1','',co1Att,tot,a3(co1Att),pc(co1Att)]);
            exRows.push(['Subject Name',sub.name,'','','','','','','','CO 2','',co2Att,tot,a3(co2Att),pc(co2Att)]);
            exRows.push(['Year & Sem','III YEAR- V SEM','','','','','','','','CO 3','',co3Att,tot,a3(co3Att),pc(co3Att)]);
            exRows.push(['Academic Year','2023-24','','','','','','','','CO 4','',co4Att,tot,a3(co4Att),pc(co4Att)]);
            exRows.push(['Faculty',App.getCurrentUser().name,'','','','','','','','CO 5','',co5Att,tot,a3(co5Att),pc(co5Att)]);
            exRows.push(['','','','','','','','','','Total students =',tot]);
            exRows.push([]);
            exRows.push(['Sl.No.','Roll Numbers','First Mid','','','','','Second Mid','','','','','Studentwise CO Attainments','','','','']);
            exRows.push(['','','Q1','Q2','Q3','Quiz 1','Assignment 1','Q1','Q2','Q3','Quiz 2','Assignment 2','CO 1','CO 2','CO 3','CO 4','CO 5']);
            exRows.push(['','',5,5,5,10,5,5,5,5,10,5,'','','','','']);
            exRows.push(['','','CO 1','CO 2','CO 3','CO 1,2,3','CO 1,2,3','CO 3','CO 4','CO 5','CO 3,4,5','CO 3,4,5','','','','','']);
            studentRows.forEach(r => exRows.push(r));
            const wsCOSheet = XLSX.utils.aoa_to_sheet(exRows);
            XLSX.utils.book_append_sheet(wb, wsCOSheet, 'CO Attainments');
        }

        XLSX.writeFile(wb, `${sub.code}_Output_${regulation}.xlsx`);
    }
    return { renderSection, renderMarksEntry };
})();

window.FacultyModule = FacultyModule;

