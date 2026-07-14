/* ============================================================
   OBE MicTech — Faculty Dashboard Module
   Uses MarksUtils for editable marks table (MID-I & MID-II)
   ============================================================ */
const FacultyModule = (() => {

    const ROMAN_NUMERALS = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    function getRomanSemester(sem) {
        return ROMAN_NUMERALS[parseInt(sem)] || sem;
    }

    function renderSection(section) {
        const c = App.getContent();
        switch (section) {
            case 'dashboard':         renderDashboard(c); break;
            case 'assigned_subjects': renderAssignedSubjects(c); break;
            case 'marks':             renderMarksEntry(c); break;
            case 'syllabus':          renderSyllabus(c); break;
            default:                  renderDashboard(c);
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

            <div class="grid grid-2" style="margin-bottom:2rem;">
                <!-- Marks Entry Donut Chart -->
                <div class="card" style="margin-bottom:0;">
                    <div class="card-header"><h3>Attainment Status</h3></div>
                    <div class="card-body" style="display:flex; align-items:center; justify-content:center; gap:20px; min-height:180px;">
                        <div style="flex:1; min-width: 130px; max-width: 130px; margin: 0 auto;">
                            <canvas id="fac-dashboard-chart"></canvas>
                        </div>
                        <div style="flex:1; font-size:0.95rem;">
                            <p style="margin-bottom:0.5rem;"><span style="display:inline-block; width:12px; height:12px; background:#1E73BE; margin-right:8px; border-radius:3px;"></span>Assigned: <strong>${marksEntered}</strong></p>
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
                                            ? `<span class="verify-badge verified">${iconText('check', 'Verified', { size: 14 })}</span>`
                                            : `<span class="verify-badge rejected">${iconText('x', 'Rejected', { size: 14 })}</span>`;
                                    }
                                    return `<tr>
                                        <td><span class="badge badge-info">${s.code}</span></td>
                                        <td class="fw-600">${s.name}</td>
                                        <td>Sem ${getRomanSemester(s.semester)}</td>
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
                        labels: ['Assigned', 'Pending'],
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

    /* ======================== SEED / STATIC OUTCOMES AND OUTCOME MAPPING ======================== */
    const COURSE_OUTCOMES = {
        'sub_1': [
            { co: 'CO1', desc: 'Understand the key concepts of algorithm analysis, asymptotic notations, and Big-O complexity.' },
            { co: 'CO2', desc: 'Design and implement linear data structures like stacks, queues, and linked lists for efficient data storage.' },
            { co: 'CO3', desc: 'Develop methods utilizing non-linear structures including trees and graphs to solve complex computing challenges.' },
            { co: 'CO4', desc: 'Select and implement appropriate sorting, searching, and hashing algorithms for diverse datasets.' },
            { co: 'CO5', desc: 'Formulate dynamic solutions utilizing robust memory allocation and structural design principles.' }
        ],
        'sub_2': [
            { co: 'CO1', desc: 'Identify and describe relational database architectures, components, and Entity-Relationship models.' },
            { co: 'CO2', desc: 'Formulate relational algebraic expressions and complex SQL queries to query and modify database systems.' },
            { co: 'CO3', desc: 'Apply structural normalization (1NF to BCNF) to design robust, anomaly-free relational databases.' },
            { co: 'CO4', desc: 'Analyze concurrent transaction executions, database states, locking mechanisms, and crash recovery schemes.' },
            { co: 'CO5', desc: 'Implement storage security policies and describe distributed and modern NoSQL databases.' }
        ],
        'sub_3': [
            { co: 'CO1', desc: 'Examine operating system architectures, service abstractions, and process control mechanisms.' },
            { co: 'CO2', desc: 'Develop process synchronization solutions, CPU scheduling algorithms, and deadlock resolution procedures.' },
            { co: 'CO3', desc: 'Evaluate physical memory allocation, paging schemes, segmentation, and virtual memory virtualization.' },
            { co: 'CO4', desc: 'Formulate storage management plans including disk head scheduling, directory structures, and file protection.' },
            { co: 'CO5', desc: 'Explain security barriers, access control, virtual machines, and sandboxed computing systems.' }
        ],
        'sub_4': [
            { co: 'CO1', desc: 'Differentiate TCP/IP and OSI protocol architectures, routing topologies, and networking design goals.' },
            { co: 'CO2', desc: 'Implement framing, error flow controls (sliding window), and error checking in link layers.' },
            { co: 'CO3', desc: 'Implement CIDR subnets, IPv4/IPv6 packet headers, and static/dynamic network routing protocols.' },
            { co: 'CO4', desc: 'Analyze transport layer congestion controls, packet flow algorithms, and TCP window controls.' },
            { co: 'CO5', desc: 'Configure standard application protocols (DNS, HTTP, SMTP) and describe basic network cryptographies.' }
        ]
    };

    const PROGRAM_OUTCOMES = [
        { po: 'PO1', title: 'Engineering Knowledge', desc: 'Apply knowledge of mathematics, science, engineering fundamentals, and specialization to solve complex engineering problems.' },
        { po: 'PO2', title: 'Problem Analysis', desc: 'Identify, formulate, research literature, and analyze complex engineering problems reaching substantiated conclusions.' },
        { po: 'PO3', title: 'Design/Development of Solutions', desc: 'Design solutions for complex engineering problems and design system components or processes that meet specific needs.' },
        { po: 'PO4', title: 'Conduct Investigations of Complex Problems', desc: 'Use research-based knowledge and research methods including design of experiments, analysis, and interpretation of data.' },
        { po: 'PO5', title: 'Modern Tool Usage', desc: 'Create, select, and apply appropriate techniques, resources, and modern engineering and IT tools.' },
        { po: 'PO6', title: 'The Engineer and Society', desc: 'Apply reasoning informed by contextual knowledge to assess societal, health, safety, legal, and cultural issues.' },
        { po: 'PO7', title: 'Environment and Sustainability', desc: 'Understand the impact of professional engineering solutions in societal and environmental contexts, demonstrating sustainable development.' },
        { po: 'PO8', title: 'Ethics', desc: 'Apply ethical principles and commit to professional ethics and responsibilities and norms of engineering practice.' },
        { po: 'PO9', title: 'Individual and Team Work', desc: 'Function effectively as an individual, and as a member or leader in diverse teams and multi-disciplinary settings.' },
        { po: 'PO10', title: 'Communication', desc: 'Communicate effectively on complex engineering activities with the engineering community and society at large.' },
        { po: 'PO11', title: 'Project Management and Finance', desc: 'Demonstrate knowledge and understanding of engineering and management principles to manage projects.' },
        { po: 'PO12', title: 'Life-long Learning', desc: 'Recognize the need for, and have the preparation and ability to engage in independent and life-long learning.' }
    ];

    function getCourseOutcomesForSubject(subject) {
        if (COURSE_OUTCOMES[subject.id]) {
            return COURSE_OUTCOMES[subject.id];
        }
        return [
            { co: 'CO1', desc: `Explain foundational theories, paradigms, and fundamental mechanics of ${subject.name}.` },
            { co: 'CO2', desc: `Analyze quantitative and qualitative models associated with the study of ${subject.name}.` },
            { co: 'CO3', desc: `Design practical implementations and apply conceptual tools of ${subject.name} to realistic projects.` },
            { co: 'CO4', desc: `Formulate diagnostic tests, debug errors, and optimize operations in ${subject.name} projects.` },
            { co: 'CO5', desc: `Evaluate professional limitations, environmental footprint, and modern tool alternatives of ${subject.name}.` }
        ];
    }

    function getCOPOMapping(subjectId) {
        const mapping = {};
        const cos = ['CO1', 'CO2', 'CO3', 'CO4', 'CO5'];
        cos.forEach((co, idx) => {
            mapping[co] = {};
            for (let p = 1; p <= 12; p++) {
                const po = `PO${p}`;
                if (p <= 5) {
                    mapping[co][po] = ((idx + p) % 2 === 0) ? 3 : 2;
                } else if (p === 9 || p === 10 || p === 12) {
                    mapping[co][po] = ((idx + p) % 3 === 0) ? 2 : 1;
                } else if (p === 7 || p === 8) {
                    mapping[co][po] = ((idx + p) % 4 === 0) ? 1 : '';
                } else {
                    mapping[co][po] = '';
                }
            }
        });
        return mapping;
    }

    let expandedSubjectId = null;
    let activeSubTab = 'marks'; // 'marks' | 'syllabus' | 'indirect'
    let activeMarksType = 'internal'; // 'internal' | 'external'
    let activeSyllabusTab = 'cos'; // 'cos' | 'pos' | 'mapping'
    const tempUploadedMarks = {}; // sId -> marks map
    const tempUploadedFileName = {}; // sId -> string

    const UPLOADS_KEY = 'obe_faculty_marks_uploads';
    const charts = {};

    function getUploadedMarks() {
        try {
            return JSON.parse(localStorage.getItem(UPLOADS_KEY)) || {};
        } catch {
            return {};
        }
    }

    function saveUploadedMarks(subjectId, examType, marks) {
        const data = getUploadedMarks();
        if (!data[subjectId]) data[subjectId] = {};
        data[subjectId][examType] = marks;
        localStorage.setItem(UPLOADS_KEY, JSON.stringify(data));
    }

    /* =================== ASSIGNED SUBJECTS (EXPANDABLE FLOW & NESTED TAB VIEWS) =================== */    function renderAssignedSubjects(c) {
        const user = App.getCurrentUser();
        const subjects = DataStore.getSubjectsByFaculty(user.id);
        const uploads = getUploadedMarks();

        if (expandedSubjectId) {
            const s = subjects.find(sub => sub.id === expandedSubjectId);
            const subUploads = uploads[s.id] || {};

            c.innerHTML = `
            <div class="fade-in">
                <!-- Header with Back Button on the left side -->
                <div class="page-header" style="margin-bottom: 2rem; display: flex; align-items: center; gap: 15px;">
                    <button class="btn btn-secondary btn-sm back-to-subjects-btn" style="padding: 8px 16px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;">
                        ${icon('arrow-left', { size: 16 })} Back
                    </button>
                    <div>
                        <h1 style="margin: 0; font-size: 1.8rem; font-weight: 800; color: var(--text-dark);">${s.name}(${s.code})</h1>
                        <p style="margin: 4px 0 0 0; color: var(--accent); font-size: 0.9rem; font-weight: 600;">
                            Regulation: MIC-23 &bull; Academic Year: 2025-2026 &bull; Semester ${getRomanSemester(s.semester)}
                        </p>
                    </div>
                </div>

                <div class="card" style="border-radius: 12px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); background: #fff; padding: 1.5rem;">
                    <!-- Tabs selection menu -->
                    <div class="menu-options-container" style="display: flex; gap: 8px; flex-wrap: wrap; border-bottom: 2px solid var(--border-color); padding-bottom: 12px; margin-bottom: 15px;">
                        <button class="menu-option-btn ${activeSubTab === 'syllabus' ? 'active' : ''}" data-tab="syllabus">Syllabus</button>
                        <button class="menu-option-btn ${activeSubTab === 'cos' ? 'active' : ''}" data-tab="cos">List of CO's</button>
                        <button class="menu-option-btn ${activeSubTab === 'pos' ? 'active' : ''}" data-tab="pos">List of PO's</button>
                        <button class="menu-option-btn ${activeSubTab === 'mapping' ? 'active' : ''}" data-tab="mapping">Articulatior matrix</button>
                        <button class="menu-option-btn ${activeSubTab === 'marks' ? 'active' : ''}" data-tab="marks">Marks entry</button>
                        <button class="menu-option-btn ${activeSubTab === 'indirect' ? 'active' : ''}" data-tab="indirect">Indirect Assessment</button>
                    </div>

                    <!-- Tab content panels -->
                    <div class="tab-content-area" style="margin-top: 1.25rem;">
                        ${renderCardSubTabContent(s, subUploads)}
                    </div>
                </div>
            </div>`;

            // Bind back button
            c.querySelector('.back-to-subjects-btn').addEventListener('click', () => {
                expandedSubjectId = null;
                renderAssignedSubjects(c);
            });

            // Bind tab buttons
            c.querySelectorAll('.menu-option-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    activeSubTab = btn.dataset.tab;
                    if (activeSubTab === 'marks') {
                        activeMarksType = 'internal';
                    }
                    renderAssignedSubjects(c);
                });
            });

            // Bind events for the active panel
            bindExpandedPanelEvents(c, s.id, uploads);

        } else {
            c.innerHTML = `
            <div class="fade-in">
                <div class="page-header" style="margin-bottom: 2rem;">
                    <h1>Assigned Subjects</h1>
                    <p>Select any subject card to view evaluation milestones, syllabus tracking, or direct/indirect outcome mapping.</p>
                </div>

                <div class="grid grid-3" id="assigned-subjects-grid">
                    ${subjects.map(s => {
                        return `
                        <div class="card subject-card subject-card-clickable subject-select-card" data-sid="${s.id}" style="border-radius: 12px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); overflow: hidden; background: var(--bg-card); transition: all 0.3s ease; padding: 1.5rem; text-align: center; cursor: pointer;">
                            <h3 style="margin: 0 auto 8px auto; font-size: 1.3rem; font-weight: 700; color: var(--text-dark);">
                                ${s.name}(${s.code})
                            </h3>
                            <div style="font-size: 0.85rem; font-weight: 600; color: var(--accent); margin-bottom: 12px;">Regulation: MIC-23</div>
                            <div style="font-size: 0.82rem; color: var(--text-muted);">
                                Academic Year: 2025-2026 &bull; Semester ${getRomanSemester(s.semester)}
                            </div>
                            <div style="margin-top: 15px;">
                                <button class="btn btn-outline btn-xs" style="font-weight: 600; padding: 6px 14px; border-radius: 6px;">
                                    View Details &rarr;
                                </button>
                            </div>
                        </div>`;
                    }).join('')}
                </div>
            </div>`;

            // Bind click on subject cards to open detailed view
            c.querySelectorAll('.subject-select-card').forEach(card => {
                card.addEventListener('click', () => {
                    const sId = card.dataset.sid;
                    expandedSubjectId = sId;
                    activeSubTab = 'syllabus';
                    activeMarksType = 'internal';
                    renderAssignedSubjects(c);
                });
            });
        }
    }

    function renderCardSubTabContent(s, subUploads) {
        const hasInternal = subUploads.internal && Object.keys(subUploads.internal).length > 0;
        const hasExternal = subUploads.external && Object.keys(subUploads.external).length > 0;

        if (activeSubTab === 'syllabus') {
            const units = DataStore.getSyllabusUnitsBySubject(s.id);
            return `
            <div class="nested-panel">
                <h4 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: var(--primary); text-align: center;">Subject Units (Syllabus)</h4>
                <div style="display: flex; flex-direction: column; gap: 12px; max-width: 700px; margin: 0 auto;">
                    ${units.length > 0 ? units.map(u => `
                        <div style="border: 1px solid var(--border-color); border-radius: 8px; padding: 15px; background: #fff; display: flex; justify-content: space-between; align-items: center; gap: 15px; text-align: left;">
                            <div style="flex: 1;">
                                <strong style="color: var(--text-dark); font-size: 0.95rem;">${u.title.toLowerCase().startsWith('unit') ? u.title : `Unit ${u.unitNumber}: ${u.title}`}</strong>
                                <p style="margin: 4px 0 0 0; font-size: 0.82rem; color: var(--text-muted); line-height: 1.4;">${u.description || 'No description available for this unit.'}</p>
                            </div>
                            <span class="badge ${u.isCompleted ? 'badge-success' : 'badge-neutral'}" style="padding: 4px 10px; font-size: 0.75rem; font-weight: 600; flex-shrink: 0;">
                                ${u.isCompleted ? 'Completed' : 'In Progress'}
                            </span>
                        </div>
                    `).join('') : `
                        <p style="text-align: center; color: var(--text-muted); font-style: italic;">No syllabus units loaded for this subject.</p>
                    `}
                </div>
            </div>
            `;
        }

        if (activeSubTab === 'cos') {
            const cos = getCourseOutcomesForSubject(s);
            return `
            <div class="nested-panel">
                <h4 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: var(--primary); text-align: center;">Course Outcomes (COs)</h4>
                <div class="table-wrapper" style="max-width: 800px; margin: 0 auto;">
                    <table class="table text-left" style="font-size: 0.9rem;">
                        <thead>
                            <tr>
                                <th style="width: 100px;">Outcome</th>
                                <th>Description / Statements</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${cos.map(item => `
                                <tr>
                                    <td><span class="badge badge-info" style="font-weight: 700;">${item.co}</span></td>
                                    <td style="font-size: 0.9rem; font-weight: 500; color: var(--text-dark); line-height: 1.45;">${item.desc}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            `;
        }

        if (activeSubTab === 'pos') {
            return `
            <div class="nested-panel">
                <h4 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: var(--primary); text-align: center;">Program Outcomes (POs)</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; text-align: left; max-width: 900px; margin: 0 auto;">
                    ${PROGRAM_OUTCOMES.map(item => `
                        <div style="border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; background: #fff; transition: all 0.2s ease;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                                <span class="badge badge-primary" style="font-weight: 800; font-size: 0.78rem; padding: 3px 6px;">${item.po}</span>
                                <strong style="font-size: 0.9rem; color: var(--text-dark);">${item.title}</strong>
                            </div>
                            <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.35; margin: 0;">${item.desc}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            `;
        }

        if (activeSubTab === 'mapping') {
            const mapping = getCOPOMapping(s.id);
            const cos = ['CO1', 'CO2', 'CO3', 'CO4', 'CO5'];
            return `
            <div class="nested-panel">
                <h4 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: var(--primary); text-align: center;">Articulatior Matrix</h4>
                <div style="max-width: 800px; margin: 0 auto;">
                    <div style="margin-bottom: 0.75rem; font-size: 0.75rem; color: var(--text-muted); display: flex; gap: 12px; justify-content: flex-end;">
                        <span>3 = High</span>
                        <span>2 = Medium</span>
                        <span>1 = Low</span>
                        <span>- = None</span>
                    </div>
                    <div class="table-wrapper">
                        <table class="table" style="text-align: center; font-size: 0.85rem;">
                            <thead>
                                <tr>
                                    <th style="text-align: left;">Course Outcome</th>
                                    ${Array.from({length: 12}, (_, i) => `<th>PO${i+1}</th>`).join('')}
                                </tr>
                            </thead>
                            <tbody>
                                ${cos.map(co => `
                                    <tr>
                                        <td style="text-align: left; font-weight: 700; color: var(--text-dark);">${co}</td>
                                        ${Array.from({length: 12}, (_, i) => {
                                            const val = mapping[co][`PO${i+1}`];
                                            let cellBg = '';
                                            if (val === 3) cellBg = 'background: rgba(59, 130, 246, 0.12); font-weight: bold; color: #1d4ed8;';
                                            else if (val === 2) cellBg = 'background: rgba(99, 102, 241, 0.08); font-weight: bold; color: #4338ca;';
                                            else if (val === 1) cellBg = 'background: rgba(226, 232, 240, 0.4); color: #475569;';
                                            return `<td style="${cellBg}">${val || '-'}</td>`;
                                        }).join('')}
                                    </tr>
                                    `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            `;
        }

        if (activeSubTab === 'marks') {
            const tempFile = tempUploadedFileName[s.id];
            
            return `
            <div class="nested-panel">
                <h4 style="margin: 0 0 1rem 0; font-size: 1.1rem; text-align: center; color: var(--primary);">Evaluation Marks Entry</h4>
                
                <div class="form-group" style="max-width: 300px; margin: 0 auto 1.5rem auto;">
                    <label class="form-label" style="font-weight: 700; text-align: center; display: block; margin-bottom: 6px;">Assessment Milestone</label>
                    <select class="form-select marks-type-select" style="text-align-last: center;">
                        <option value="internal" ${activeMarksType === 'internal' ? 'selected' : ''}>Internal Marks</option>
                        <option value="external" ${activeMarksType === 'external' ? 'selected' : ''}>External Marks</option>
                    </select>
                </div>

                <!-- Aligned action buttons (identical styling for both - constrained widths to prevent unprofessional stretch) -->
                <div style="display: flex; gap: 15px; justify-content: center; margin-bottom: 1.5rem; flex-wrap: wrap;">
                    <button class="btn btn-outline btn-sm marks-download-btn" style="padding: 8px 16px; font-weight: 600; width: 130px; display: inline-flex; align-items: center; justify-content: center;">
                        ${iconText('download', 'Download')}
                    </button>
                    <button class="btn btn-outline btn-sm marks-upload-btn" style="padding: 8px 16px; font-weight: 600; width: 130px; display: inline-flex; align-items: center; justify-content: center;">
                        ${iconText('upload', 'Upload')}
                    </button>
                    <button class="btn btn-primary btn-sm marks-submit-btn" style="padding: 8px 16px; font-weight: 600; width: 130px; display: inline-flex; align-items: center; justify-content: center;">
                        ${iconText('check', 'Submit')}
                    </button>
                </div>

                <!-- Dynamic upload zone placeholder -->
                <div class="nested-upload-zone" style="display: none; border: 2px dashed var(--border-color); border-radius: 8px; padding: 20px; text-align: center; background: #fff; max-width: 400px; margin: 0 auto 1.5rem auto;">
                    <div style="margin-bottom: 15px; color: var(--text-muted); font-size: 0.85rem;">
                        ${icon('file-text', { size: 36, style: 'margin: 0 auto 8px auto; color: #94a3b8;' })}
                        <span class="file-info-label">${tempFile ? `Selected: ${tempFile}` : `Drag & drop or click to upload the ${activeMarksType} Excel file`}</span>
                        <input type="file" class="hidden-file-input" accept=".xlsx, .xls" style="display: none;">
                    </div>
                    <div style="display: flex; justify-content: center;">
                        <button class="btn btn-xs btn-success autofill-demo-btn" style="font-size: 0.75rem; padding: 4px 12px; width: 160px; display: inline-flex; align-items: center; justify-content: center;">
                            ${iconText('zap', 'Auto-Fill Demo Marks')}
                        </button>
                    </div>
                    <div class="upload-status" style="margin-top: 10px; font-size: 0.8rem; font-weight: 600;">
                        ${tempFile ? `<span style="color:var(--success)">Spreadsheet loaded. Click "Submit" to save!</span>` : ''}
                    </div>
                </div>

                <!-- Marks verification state & chart -->
                <div style="margin-top: 1.5rem; text-align: center;">
                    <div style="font-size: 0.85rem; color: var(--text-muted); display: flex; gap: 15px; justify-content: center; margin-bottom: 1rem;">
                        <span style="display: flex; align-items: center; gap: 5px;">
                            <span class="status-dot ${hasInternal ? 'green' : 'red'}"></span> Internal uploaded
                        </span>
                        <span style="display: flex; align-items: center; gap: 5px;">
                            <span class="status-dot ${hasExternal ? 'green' : 'red'}"></span> External uploaded
                        </span>
                    </div>

                    ${hasInternal && hasExternal ? `
                    <div class="chart-section" style="padding: 1.5rem; border: 1px solid var(--border-color); border-radius: 8px; background: rgba(0,0,0,0.005); max-width: 800px; margin: 0 auto;">
                        <h4 style="margin: 0 0 15px 0; font-size: 1rem; color: var(--text-dark);">Cohort Marks Performance Graph (Internal vs External)</h4>
                        <div style="height: 250px; position: relative;">
                            <canvas id="chart-${s.id}"></canvas>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
            `;
        }

        if (activeSubTab === 'indirect') {
            return `
            <div class="nested-panel" style="text-align: center;">
                <h4 style="margin: 0 0 10px 0; color: var(--primary); font-size: 1.1rem;">Indirect Attainment (Course End Survey)</h4>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem; max-width: 500px; margin-left: auto; margin-right: auto;">
                    Provide student feedback scores (on a 0.0 - 3.0 scale) for each Course Outcome. This score reflects indirect survey evaluation feedback.
                </p>
                <div style="display: flex; flex-direction: column; gap: 12px; max-width: 400px; margin: 0 auto; background: #fff; padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border-color); align-items: center;">
                    ${['CO1', 'CO2', 'CO3', 'CO4', 'CO5'].map(co => `
                        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                            <strong style="color: var(--text-dark);">${co}:</strong>
                            <input type="number" step="0.1" min="0" max="3" class="form-input survey-input" data-co="${co}" value="${(Math.random() * 0.5 + 2.2).toFixed(1)}" style="width: 80px; padding: 4px 8px; font-size: 0.85rem; text-align: center;">
                        </div>
                    `).join('')}
                    <button class="btn btn-primary btn-sm submit-indirect-btn" style="margin-top: 10px; font-weight: 600; width: 220px; display: inline-flex; align-items: center; justify-content: center;">
                        ${iconText('check', 'Submit Indirect Marks')}
                    </button>
                </div>
            </div>
            `;
        }

        return '';
    }



    function bindExpandedPanelEvents(c, sId, uploads) {
        const panel = c.querySelector('.tab-content-area');
        if (!panel) return;

        const s = DataStore.getSubjectById(sId);
        const students = DataStore.getStudentsByDeptAndSemester(s.departmentId, s.semester);

        if (activeSubTab === 'marks') {
            const selectType = panel.querySelector('.marks-type-select');
            const dlBtn = panel.querySelector('.marks-download-btn');
            const ulBtn = panel.querySelector('.marks-upload-btn');
            const submitBtn = panel.querySelector('.marks-submit-btn');
            const uploadZone = panel.querySelector('.nested-upload-zone');
            const fileInput = panel.querySelector('.hidden-file-input');
            const fileLabel = panel.querySelector('.file-info-label');
            const statusText = panel.querySelector('.upload-status');

            // Dropdown select change
            selectType.addEventListener('change', (e) => {
                activeMarksType = e.target.value;
                renderAssignedSubjects(c);
            });

            // Download template (empty marks Excel sheet)
            dlBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                downloadTemplateExcel(s, activeMarksType);
            });

            // Upload Excel display toggle
            ulBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                uploadZone.style.display = uploadZone.style.display === 'none' ? 'block' : 'none';
            });

            // Hidden file selector click
            uploadZone.addEventListener('click', (e) => {
                if (e.target.closest('.autofill-demo-btn')) return; // skip for autofill
                fileInput.click();
            });

            // File upload parsing
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                statusText.textContent = `Reading file...`;
                statusText.style.color = '#64748b';

                const reader = new FileReader();
                reader.onload = function(evt) {
                    try {
                        const data = new Uint8Array(evt.target.result);
                        const workbook = XLSX.read(data, {type: 'array'});
                        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                        const rows = XLSX.utils.sheet_to_json(worksheet, {header: 1});

                        let parsed = {};
                        let validRows = 0;
                        for (let i = 1; i < rows.length; i++) {
                            const row = rows[i];
                            if (!row || !row[1]) continue;
                            const rollNo = String(row[1]).trim();
                            const val = parseFloat(row[3]);
                            parsed[rollNo] = isNaN(val) ? 0 : val;
                            validRows++;
                        }

                        if (validRows > 0) {
                            tempUploadedMarks[sId] = parsed;
                            tempUploadedFileName[sId] = file.name;
                            
                            fileLabel.textContent = `Selected: ${file.name}`;
                            statusText.textContent = `Spreadsheet successfully loaded (${validRows} rows). Click "Submit" to save!`;
                            statusText.style.color = 'var(--success)';
                        } else {
                            statusText.textContent = `Invalid excel template format!`;
                            statusText.style.color = '#ef4444';
                        }
                    } catch (err) {
                        console.error(err);
                        statusText.textContent = `Error parsing excel spreadsheet.`;
                        statusText.style.color = '#ef4444';
                    }
                };
                reader.readAsArrayBuffer(file);
            });

            // Autofill demo marks
            const autofillBtn = panel.querySelector('.autofill-demo-btn');
            if (autofillBtn) {
                autofillBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const demoMarks = {};
                    students.forEach(student => {
                        if (activeMarksType === 'internal') {
                            demoMarks[student.rollNo] = Math.floor(Math.random() * 11) + 20; // 20 - 30 marks
                        } else {
                            demoMarks[student.rollNo] = Math.floor(Math.random() * 31) + 40; // 40 - 70 marks
                        }
                    });
                    tempUploadedMarks[sId] = demoMarks;
                    tempUploadedFileName[sId] = `demo_${activeMarksType}_data.xlsx`;
                    
                    fileLabel.textContent = `Selected: demo_${activeMarksType}_data.xlsx`;
                    statusText.textContent = `Auto-filled mock data (${students.length} students). Click "Submit" to save!`;
                    statusText.style.color = 'var(--success)';
                });
            }

            // Submit processed marks
            submitBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const marks = tempUploadedMarks[sId];
                if (!marks) {
                    App.showToast('Please upload or auto-fill marks before submitting.', 'warning');
                    return;
                }

                saveUploadedMarks(sId, activeMarksType, marks);
                delete tempUploadedMarks[sId];
                delete tempUploadedFileName[sId];

                App.showToast(`${activeMarksType.charAt(0).toUpperCase() + activeMarksType.slice(1)} marks submitted successfully!`, 'success');
                renderAssignedSubjects(c);
            });
        }


        if (activeSubTab === 'indirect') {
            const indBtn = panel.querySelector('.submit-indirect-btn');
            if (indBtn) {
                indBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    App.showToast('Indirect attainment scores saved successfully!', 'success');
                });
            }
        }

        // Initialize and update Chart.js
        const subUploads = uploads[sId] || {};
        if (subUploads.internal && subUploads.external && activeSubTab === 'marks') {
            const ctx = panel.querySelector(`#chart-${sId}`);
            if (ctx) {
                if (charts[sId]) {
                    charts[sId].destroy();
                }

                const rolls = Object.keys(subUploads.internal).sort();
                const internalValues = rolls.map(r => subUploads.internal[r] || 0);
                const externalValues = rolls.map(r => subUploads.external[r] || 0);

                charts[sId] = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: rolls,
                        datasets: [
                            {
                                label: 'Internal Marks (Max 30)',
                                data: internalValues,
                                backgroundColor: 'rgba(59, 130, 246, 0.75)', // blue-500
                                borderColor: 'rgba(59, 130, 246, 1)',
                                borderWidth: 1.5,
                                borderRadius: 4
                            },
                            {
                                label: 'External Marks (Max 70)',
                                data: externalValues,
                                backgroundColor: 'rgba(239, 68, 68, 0.75)', // red-500
                                borderColor: 'rgba(239, 68, 68, 1)',
                                borderWidth: 1.5,
                                borderRadius: 4
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 70,
                                grid: { color: 'rgba(0,0,0,0.05)' }
                            },
                            x: {
                                grid: { display: false }
                            }
                        },
                        plugins: {
                            legend: {
                                position: 'top',
                                labels: { font: { size: 9, weight: 'bold' } }
                            }
                        }
                    }
                });
            }
        }
    }

    function downloadTemplateExcel(subject, examType) {
        const students = DataStore.getStudentsByDeptAndSemester(subject.departmentId, subject.semester);
        
        // EMPTY template means marks column is blank so faculty can write in it
        const header = ["S.No", "Regd.No", "Student Name", examType === 'internal' ? "Internal Marks (Max 30)" : "External Marks (Max 70)"];
        const dataRows = students.map((s, idx) => [idx + 1, s.rollNo, s.name, ""]);

        const aoa = [header, ...dataRows];
        const ws = XLSX.utils.aoa_to_sheet(aoa);
        
        ws['!cols'] = [
            { wch: 6 },  // S.No
            { wch: 15 }, // Regd.No
            { wch: 25 }, // Student Name
            { wch: 25 }  // Marks Column
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `${examType.toUpperCase()} Template`);

        XLSX.writeFile(wb, `${subject.code}_${examType}_marks_template.xlsx`);
        App.showToast(`Downloaded empty template for ${subject.code} ${examType} marks!`, 'success');
    }

    /* =================== TABBED SYLLABUS =================== */
    function renderSyllabus(c) {
        renderAssignedSubjects(c);
    }

    /* =================== EXCEL MARK ENTRY =================== */
    function renderMarksEntry(c) {
        const role = App.getCurrentRole();
        const user = App.getCurrentUser();
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
                            <div class="upload-icon">${icon('file-text', { size: 48 })}</div>
                            <div class="upload-title">Click or drag Excel file here</div>
                            <div class="upload-subtitle">Format: Autonomous Marks Statement (.xlsx)</div>
                            <input type="file" id="excel-file-input" accept=".xlsx, .xls">
                        </div>
                        <div id="upload-status" style="margin-top: 1rem; text-align: center; font-weight: 600;"></div>
                        
                        <div style="margin-top: 1.5rem; display: flex; gap: 1rem; flex-wrap: wrap;">
                            <button id="btn-process-save" class="btn-pro btn-pro-primary" style="display:none;">${iconText('save', 'Process & Save to DataStore')}</button>
                            <button id="btn-download-co" class="btn-pro btn-pro-success" style="display:none;">${iconText('download', 'Download CO Attainment')}</button>
                            <button id="btn-notify-hod" class="btn-pro btn-pro-warning" style="display:none;">${iconText('bell', 'Send Urgent Notification')}</button>
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

