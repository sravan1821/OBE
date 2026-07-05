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

    /* =================== EXCEL MARK ENTRY =================== */
    function renderMarksEntry(c) {
        const user = App.getCurrentUser();
        const subjects = DataStore.getSubjectsByFaculty(user.id);

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
                        <div class="upload-zone" id="file-drop-zone">
                            <div class="upload-icon">📄</div>
                            <div class="upload-title">Click or drag Excel file here</div>
                            <div class="upload-subtitle">Format: Autonomous Marks Statement (.xlsx)</div>
                            <input type="file" id="excel-file-input" accept=".xlsx, .xls">
                        </div>
                        <div id="upload-status" style="margin-top: 1rem; text-align: center; font-weight: 600;"></div>
                        
                        <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
                            <button id="btn-process-save" class="btn-primary" style="display:none;">Process & Save to DataStore</button>
                            <button id="btn-download-co" class="btn-primary" style="display:none; background: var(--success);">Download CO Attainment</button>
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
                    
                    parsedData = parseMarksSheet(json);
                    status.textContent = `Successfully parsed ${Object.keys(parsedData).length} student records!`;
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
            
            // Generate CO Data to allow download
            btnProcess.style.display = 'none';
            btnDownload.style.display = 'block';
        });

        btnDownload.addEventListener('click', () => {
            const subjectId = select.value;
            if (!subjectId || !parsedData) return;
            downloadCOExcel(subjectId, parsedData);
        });
    }

    function parseMarksSheet(rows) {
        // Based on Image 1 format mapping:
        // Row index 12 (0-indexed) is the first student row.
        // Col mapping:
        // 1: RollNo
        // MID 1: 3-8(Q1-Q6), 10(UT), 11(Asgn)
        // MID 2: 13-18(Q1-Q6), 20(UT), 21(Asgn)
        const bulk = {};
        for (let i = 12; i < rows.length; i++) {
            const row = rows[i];
            if (!row || !row[1]) continue; // Skip if no roll no
            
            const rollNo = row[1].toString().trim();
            // In a real system, we look up the student ID by roll no.
            // For this prototype, our dummy data student IDs match "stuX" but we don't have roll->id mapping easily.
            // Wait! The DataStore actually has roll numbers. Let's find the student.
            const allStudents = DataStore.getStudents();
            const st = allStudents.find(s => s.rollNo === rollNo);
            const stuId = st ? st.id : null;
            if (!stuId) continue;

            const val = (idx) => {
                let v = row[idx];
                if (v === 'AB' || v === 'ab' || v === undefined || v === null || v === '') return null;
                return parseFloat(v);
            };

            bulk[stuId] = {
                mid1: {
                    q1: val(3), q2: val(4), q3: val(5), q4: val(6), q5: val(7), q6: val(8),
                    unitTest: val(10), assignment: val(11)
                },
                mid2: {
                    q1: val(13), q2: val(14), q3: val(15), q4: val(16), q5: val(17), q6: val(18),
                    unitTest: val(20), assignment: val(21)
                }
            };
        }
        return bulk;
    }

    function downloadCOExcel(subjectId, marksData) {
        const sub = DataStore.getSubjectById(subjectId);
        const stus = DataStore.getStudentsByDeptAndSemester(sub.departmentId, sub.semester);
        
        let co1Att = 0, co2Att = 0, co3Att = 0, co4Att = 0, co5Att = 0;
        const studentRows = [];

        stus.forEach((st, i) => {
            const m = marksData[st.id] || { mid1:{}, mid2:{} };
            const m1 = m.mid1, m2 = m.mid2;
            
            // Apply University formula mapping: Max pairs divided by 2 (ROUNDUP)
            const m1_q1 = Math.ceil(Math.max(m1.q1||0, m1.q2||0) / 2);
            const m1_q2 = Math.ceil(Math.max(m1.q3||0, m1.q4||0) / 2);
            const m1_q3 = Math.ceil(Math.max(m1.q5||0, m1.q6||0) / 2);
            const m1_quiz = Math.ceil((m1.unitTest||0) / 2);
            const m1_asgn = m1.assignment||0;

            const m2_q1 = Math.ceil(Math.max(m2.q1||0, m2.q2||0) / 2);
            const m2_q2 = Math.ceil(Math.max(m2.q3||0, m2.q4||0) / 2);
            const m2_q3 = Math.ceil(Math.max(m2.q5||0, m2.q6||0) / 2);
            const m2_quiz = Math.ceil((m2.unitTest||0) / 2);
            const m2_asgn = m2.assignment||0;

            // Student-wise CO calculations
            const co1 = ((m1_q1 + m1_quiz + m1_asgn) / 20) * 3;
            const co2 = ((m1_q2 + m1_quiz + m1_asgn) / 20) * 3;
            const co3 = ((m1_q3 + m2_q1 + m1_quiz + m2_quiz + m1_asgn + m2_asgn) / 40) * 3;
            const co4 = ((m2_q2 + m2_quiz + m2_asgn) / 20) * 3;
            const co5 = ((m2_q3 + m2_quiz + m2_asgn) / 20) * 3;

            if (co1 >= 1.8) co1Att++;
            if (co2 >= 1.8) co2Att++;
            if (co3 >= 1.8) co3Att++;
            if (co4 >= 1.8) co4Att++;
            if (co5 >= 1.8) co5Att++;

            studentRows.push([
                i+1, 
                st.rollNo, 
                m1_q1||'', m1_q2||'', m1_q3||'', m1_quiz||'', m1_asgn||'',
                m2_q1||'', m2_q2||'', m2_q3||'', m2_quiz||'', m2_asgn||'',
                co1.toFixed(2), co2.toFixed(2), co3.toFixed(2), co4.toFixed(2), co5.toFixed(2)
            ]);
        });

        const app = stus.length || 1;
        const s3 = (att) => (Math.round((att/app)*3*100)/100).toFixed(2);
        const pc = (att) => (Math.round((att/app)*100*100)/100).toFixed(2);

        // Build rows for Excel
        const rows = [];
        
        // Top Header
        rows.push(['DEPARTMENT OF MECH', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
        rows.push(['', '', '', '', '', '', '', '', '', 'COs', 'Course Outcomes', 'Attained', 'Appeared', '3-SCALE', 'CIE(%)']);
        rows.push(['Subject Code', sub.code, '', '', '', '', '', '', '', 'CO 1', 'Evaluate performance...', co1Att, app, s3(co1Att), pc(co1Att)]);
        rows.push(['Subject Name', sub.name, '', '', '', '', '', '', '', 'CO 2', 'Describes the working...', co2Att, app, s3(co2Att), pc(co2Att)]);
        rows.push(['Year & Sem', 'III YEAR- V SEM', '', '', '', '', '', '', '', 'CO 3', 'analyze and evaluate...', co3Att, app, s3(co3Att), pc(co3Att)]);
        rows.push(['Academic Year', '2023-24', '', '', '', '', '', '', '', 'CO 4', 'analyze and evaluate...', co4Att, app, s3(co4Att), pc(co4Att)]);
        rows.push(['Faculty Name', App.getCurrentUser().name, '', '', '', '', '', '', '', 'CO 5', 'Aanalyze and evaluate...', co5Att, app, s3(co5Att), pc(co5Att)]);
        rows.push([]);
        rows.push([]);
        
        // Headers
        rows.push(['Sl.No.', 'Roll Numbers', 'First Mid', '', '', '', '', 'Second Mid', '', '', '', '', 'Studentwise CO Attainments', '', '', '', '']);
        rows.push(['', '', 'Q1', 'Q2', 'Q3', 'Quiz 1', 'Assignment 1', 'Q1', 'Q2', 'Q3', 'Quiz 2', 'Assignment 2', 'CO 1', 'CO 2', 'CO 3', 'CO 4', 'CO 5']);
        rows.push(['', '', '5', '5', '5', '10', '5', '5', '5', '5', '10', '5', '', '', '', '', '']);
        rows.push(['', '', 'CO 1', 'CO 2', 'CO 3', 'CO 1,2,3', 'CO 1,2,3', 'CO 3', 'CO 4', 'CO 5', 'CO 3,4,5', 'CO 3,4,5', '', '', '', '', '']);
        
        // Append all computed student rows
        studentRows.forEach(r => rows.push(r));

        // Write to XLSX
        const ws = XLSX.utils.aoa_to_sheet(rows);
        
        // Apply styling/merges
        ws['!merges'] = [
            { s: {r: 0, c: 0}, e: {r: 0, c: 16} }, // DEPARTMENT OF MECH
            { s: {r: 9, c: 2}, e: {r: 9, c: 6} }, // First Mid
            { s: {r: 9, c: 7}, e: {r: 9, c: 11} }, // Second Mid
            { s: {r: 9, c: 12}, e: {r: 9, c: 16} } // Studentwise CO Attainments
        ];
        
        ws['!cols'] = [
            {wch: 6}, // Sl No
            {wch: 15}, // Roll
            {wch: 6}, {wch: 6}, {wch: 6}, {wch: 10}, {wch: 14}, // Mid 1
            {wch: 6}, {wch: 6}, {wch: 6}, {wch: 10}, {wch: 14}, // Mid 2
            {wch: 6}, {wch: 6}, {wch: 6}, {wch: 6}, {wch: 6} // COs
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "CO Attainments");
        XLSX.writeFile(wb, `${sub.code}_CO_Attainments.xlsx`);
    }

    return { renderSection };
})();
