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

        for (let i = startRow; i < rows.length; i++) {
            const row = rows[i];
            if (!row || !row[1]) continue;

            const rollNo = row[1].toString().trim();
            if (!/[A-Za-z]/.test(rollNo)) continue; // skip non-roll rows

            const allStudents = DataStore.getStudents();
            const st = allStudents.find(s => s.rollNo === rollNo);
            if (!st) continue;

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
                   Layout per Mid: Q1e1, Q1e2, Q2e1, Q2e2, Q3e1, Q3e2, [Total], Quiz, Assignment
                   Mid 1 columns: 3,4,5,6,7,8 (6 Q values), skip 9 (total), 10 (Quiz), 11 (Asgn)
                   Mid 2 columns: 13,14,15,16,17,18 (6 Q values), skip 19, 20 (Quiz), 21 (Asgn)
                */
                m1 = {
                    q1e1: val(3), q1e2: val(4),   // Q1: two evaluations (10 marks each)
                    q2e1: val(5), q2e2: val(6),   // Q2: two evaluations
                    q3e1: val(7), q3e2: val(8),   // Q3: two evaluations
                    unitTest: val(10),             // Quiz / Unit Test
                    assignment: val(11)            // Assignment
                };
                m2 = {
                    q1e1: val(13), q1e2: val(14),
                    q2e1: val(15), q2e2: val(16),
                    q3e1: val(17), q3e2: val(18),
                    unitTest: val(20),
                    assignment: val(21)
                };

                // Calculate Mid Totals for 80/20 Final Internal
                m1.midTotal = calcMidTotal_MIC23(m1);
                m2.midTotal = calcMidTotal_MIC23(m2);

                const maxMid = Math.max(m1.midTotal, m2.midTotal);
                const minMid = Math.min(m1.midTotal, m2.midTotal);
                finalInternal = (0.8 * maxMid) + (0.2 * minMid);

            } else {
                /* ===== MIC20 FORMAT =====
                   Each question has a SINGLE value (5 marks each).
                   Layout per Mid: Q1, Q2, Q3, Quiz(10), Assignment(5)
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

            bulk[st.id] = { mid1: m1, mid2: m2, finalInternal, regulation };
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
    function downloadCOExcel(subjectId, marksData, regulation) {
        const sub = DataStore.getSubjectById(subjectId);
        const stus = DataStore.getStudentsByDeptAndSemester(sub.departmentId, sub.semester);

        // Accumulators for Formula 2: COUNTIF >= 1.8
        let co1Att = 0, co2Att = 0, co3Att = 0, co4Att = 0, co5Att = 0;
        const studentRows = [];

        stus.forEach((st, idx) => {
            const rec = marksData[st.id];
            if (!rec) return;
            const m1 = rec.mid1, m2 = rec.mid2;

            // ─── Step 1: Scale Q values to 5-mark equivalent ───
            let co1_q = 0, co2_q = 0, co3_q_m1 = 0;
            let co3_q_m2 = 0, co4_q = 0, co5_q = 0;
            let quiz1 = 0, asgn1 = 0, quiz2 = 0, asgn2 = 0;

            if (regulation === 'MIC23') {
                // Formula from Image 2: =ROUNDUP(MAX(eval1, eval2) / 2, 0)
                // This scales each 10-mark question to a 5-mark equivalent
                co1_q    = Math.ceil(Math.max(m1.q1e1 || 0, m1.q1e2 || 0) / 2);  // CO1 (Mid1 Q1)
                co2_q    = Math.ceil(Math.max(m1.q2e1 || 0, m1.q2e2 || 0) / 2);  // CO2 (Mid1 Q2)
                co3_q_m1 = Math.ceil(Math.max(m1.q3e1 || 0, m1.q3e2 || 0) / 2);  // CO3 from Mid1 Q3
                co3_q_m2 = Math.ceil(Math.max(m2.q1e1 || 0, m2.q1e2 || 0) / 2);  // CO3 from Mid2 Q1
                co4_q    = Math.ceil(Math.max(m2.q2e1 || 0, m2.q2e2 || 0) / 2);  // CO4 (Mid2 Q2)
                co5_q    = Math.ceil(Math.max(m2.q3e1 || 0, m2.q3e2 || 0) / 2);  // CO5 (Mid2 Q3)

                // Quiz: stays at raw value (out of 10) for CO calculation
                quiz1 = m1.unitTest || 0;
                asgn1 = m1.assignment || 0;
                quiz2 = m2.unitTest || 0;
                asgn2 = m2.assignment || 0;

            } else {
                // MIC20: Q values are DIRECT (already out of 5)
                co1_q    = m1.q1 || 0;   // CO1 (Mid1 Q1, out of 5)
                co2_q    = m1.q2 || 0;   // CO2 (Mid1 Q2, out of 5)
                co3_q_m1 = m1.q3 || 0;   // CO3 from Mid1 Q3 (out of 5)
                co3_q_m2 = m2.q1 || 0;   // CO3 from Mid2 Q1 (out of 5)
                co4_q    = m2.q2 || 0;   // CO4 (Mid2 Q2, out of 5)
                co5_q    = m2.q3 || 0;   // CO5 (Mid2 Q3, out of 5)

                quiz1 = m1.unitTest || 0;   // Quiz out of 10
                asgn1 = m1.assignment || 0; // Assignment out of 5
                quiz2 = m2.unitTest || 0;
                asgn2 = m2.assignment || 0;
            }

            // ─── Step 2: Student-wise CO Attainment ───
            // Formula: CO = ((Q_value + Quiz + Assignment) / 20) * 3
            // Max per CO component: Q(5) + Quiz(10) + Asgn(5) = 20
            let co1 = ((co1_q + quiz1 + asgn1) / 20) * 3;
            let co2 = ((co2_q + quiz1 + asgn1) / 20) * 3;

            // CO3 spans both mids → average
            const co3_from_m1 = ((co3_q_m1 + quiz1 + asgn1) / 20) * 3;
            const co3_from_m2 = ((co3_q_m2 + quiz2 + asgn2) / 20) * 3;
            let co3 = (co3_from_m1 + co3_from_m2) / 2;

            let co4 = ((co4_q + quiz2 + asgn2) / 20) * 3;
            let co5 = ((co5_q + quiz2 + asgn2) / 20) * 3;

            // Cap at 3.0
            co1 = Math.min(co1, 3); co2 = Math.min(co2, 3);
            co3 = Math.min(co3, 3); co4 = Math.min(co4, 3); co5 = Math.min(co5, 3);

            // ─── Formula 2: Count students achieving ≥ 1.8 ───
            if (co1 >= 1.8) co1Att++;
            if (co2 >= 1.8) co2Att++;
            if (co3 >= 1.8) co3Att++;
            if (co4 >= 1.8) co4Att++;
            if (co5 >= 1.8) co5Att++;

            studentRows.push([
                idx + 1, st.rollNo,
                co1_q || '', co2_q || '', co3_q_m1 || '', quiz1 || '', asgn1 || '',
                co3_q_m2 || '', co4_q || '', co5_q || '', quiz2 || '', asgn2 || '',
                co1.toFixed(2), co2.toFixed(2), co3.toFixed(2), co4.toFixed(2), co5.toFixed(2)
            ]);
        });

        // ─── Summary Calculations ───
        const totalStudents = stus.length || 1;

        // Formula 3: Attainment Value (0–3 scale) = ROUND((Attained / Total) * 3, 2)
        const attScale = (att) => parseFloat(((att / totalStudents) * 3).toFixed(2));

        // Formula 4: Pass Percentage (CIE%) = ROUND((Attained / Total) * 100, 2)
        const passPct = (att) => parseFloat(((att / totalStudents) * 100).toFixed(2));

        // ─── Build Excel Rows ───
        const exRows = [];

        // ── Top Section: Department info + CO Summary Table ──
        // Row 0
        exRows.push([
            'DEPARTMENT OF MECH', '', '', '', '', '', '', '', '',
            '', '', 'Attained', 'Appeared', '3-SCALE', 'CIE (%)'
        ]);
        // Row 1: Subject Code + CO 1 summary
        exRows.push([
            'Subject Code', sub.code, '', '', '', '', '', '', '',
            'CO 1', 'Evaluate performance of thermal power plant',
            co1Att, totalStudents, attScale(co1Att), passPct(co1Att)
        ]);
        // Row 2: Subject Name + CO 2 summary
        exRows.push([
            'Subject Name', sub.name, '', '', '', '', '', '', '',
            'CO 2', 'Describes the working and analyze the performance',
            co2Att, totalStudents, attScale(co2Att), passPct(co2Att)
        ]);
        // Row 3: Year + CO 3 summary
        exRows.push([
            'Year & Sem', 'III YEAR- V SEM', '', '', '', '', '', '', '',
            'CO 3', 'analyze and evaluate the performance of steam',
            co3Att, totalStudents, attScale(co3Att), passPct(co3Att)
        ]);
        // Row 4: Academic Year + CO 4 summary
        exRows.push([
            'Academic Year', '2023-24', '', '', '', '', '', '', '',
            'CO 4', 'analyze and evaluate the performance of steam',
            co4Att, totalStudents, attScale(co4Att), passPct(co4Att)
        ]);
        // Row 5: Faculty + CO 5 summary
        exRows.push([
            'Faculty Name', App.getCurrentUser().name, '', '', '', '', '', '', '',
            'CO 5', 'Aanalyze and evaluate the performance of Gas',
            co5Att, totalStudents, attScale(co5Att), passPct(co5Att)
        ]);
        // Row 6: Total students counted
        exRows.push([
            '', '', '', '', '', '', '', '', '',
            '', 'Total students counted =', totalStudents, '', '', ''
        ]);

        // Row 7: blank
        exRows.push([]);

        // ── Marks Table Section ──
        // Row 8: Section headers
        exRows.push([
            'Sl.No.', 'Roll Numbers',
            'First Mid', '', '', '', '',
            'Second Mid', '', '', '', '',
            'Studentwise CO Attainments', '', '', '', ''
        ]);
        // Row 9: Column sub-headers
        exRows.push([
            '', '',
            'Q1', 'Q2', 'Q3', 'Quiz 1', 'Assignment 1',
            'Q1', 'Q2', 'Q3', 'Quiz 2', 'Assignment 2',
            'CO 1', 'CO 2', 'CO 3', 'CO 4', 'CO 5'
        ]);
        // Row 10: Max marks
        exRows.push([
            '', '',
            '5', '5', '5', '10', '5',
            '5', '5', '5', '10', '5',
            '', '', '', '', ''
        ]);
        // Row 11: CO mapping
        exRows.push([
            '', '',
            'CO 1', 'CO 2', 'CO 3', 'CO 1,2,3', 'CO 1,2,3',
            'CO 3', 'CO 4', 'CO 5', 'CO 3,4,5', 'CO 3,4,5',
            '', '', '', '', ''
        ]);

        // Row 12+: Student data
        studentRows.forEach(r => exRows.push(r));

        // ── Formula 7: Overall Direct Attainment (Internal 40% + External 60%) ──
        // Since we only have Internal Assessment, we show it and leave External as placeholder
        exRows.push([]);
        exRows.push(['', '', '', '', '', '', '', '', '', '', '', '',
            'Internal Attainment (IA)', '', '', '', '']);
        exRows.push(['', '', '', '', '', '', '', '', '', '', '', '',
            'CO 1', 'CO 2', 'CO 3', 'CO 4', 'CO 5']);
        exRows.push(['', '', '', '', '', '', '', '', '', '', '', '',
            attScale(co1Att), attScale(co2Att), attScale(co3Att), attScale(co4Att), attScale(co5Att)]);

        // Formula 7 placeholder row
        exRows.push(['', '', '', '', '', '', '', '', '', '', '', '',
            'Formula 7: Direct Att = ROUND((IA*0.4 + EA*0.6)*3, 2)', '', '', '', '']);
        // Formula 8 placeholder row
        exRows.push(['', '', '', '', '', '', '', '', '', '', '', '',
            'Formula 8: Overall CO = ROUND(Direct*0.7 + Indirect*0.3, 2)', '', '', '', '']);
        // Formula 9 placeholder row
        exRows.push(['', '', '', '', '', '', '', '', '', '', '', '',
            'Formula 9: Att % = ROUND(OverallCO / 3 * 100, 1)', '', '', '', '']);

        // ── Write to XLSX ──
        const ws = XLSX.utils.aoa_to_sheet(exRows);

        ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },    // DEPARTMENT header
            { s: { r: 8, c: 2 }, e: { r: 8, c: 6 } },    // First Mid
            { s: { r: 8, c: 7 }, e: { r: 8, c: 11 } },   // Second Mid
            { s: { r: 8, c: 12 }, e: { r: 8, c: 16 } }   // Studentwise CO
        ];

        ws['!cols'] = [
            { wch: 6 },                                    // Sl.No
            { wch: 15 },                                   // Roll Numbers
            { wch: 6 }, { wch: 6 }, { wch: 6 },           // Q1,Q2,Q3 Mid1
            { wch: 10 }, { wch: 14 },                     // Quiz1, Asgn1
            { wch: 6 }, { wch: 6 }, { wch: 6 },           // Q1,Q2,Q3 Mid2
            { wch: 10 }, { wch: 14 },                     // Quiz2, Asgn2
            { wch: 7 }, { wch: 7 }, { wch: 7 },           // CO1,CO2,CO3
            { wch: 7 }, { wch: 7 }                        // CO4,CO5
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'CO Attainments');
        XLSX.writeFile(wb, `${sub.code}_CO_Attainments.xlsx`);
    }

    return { renderSection, renderMarksEntry };
})();
