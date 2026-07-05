/* ============================================================
   OBE MicTech — Data Layer (localStorage)
   ============================================================ */
export const DataStore = (() => {
    const KEYS = {
        departments:      'obe_departments',
        faculty:          'obe_faculty',
        subjects:         'obe_subjects',
        students:         'obe_students',
        marks:            'obe_marks',
        timetable:        'obe_timetable',
        subjectStatus:    'obe_subject_status',
        markVerification: 'obe_mark_verification',
        initialized:      'obe_initialized'
    };

    /* ---------- helpers ---------- */
    function get(key)    { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } }
    function getObj(key) { try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; } }
    function set(key, v) { localStorage.setItem(key, JSON.stringify(v)); }
    function genId()     { return '_' + Math.random().toString(36).substr(2, 9); }

    /* ======================== SEED DATA ======================== */
    function init(force = false) {
        if (localStorage.getItem(KEYS.initialized) && !force) return;

        const departments = [
            { id: 'dept_cse', name: 'Computer Science & Engineering' },
            { id: 'dept_ece', name: 'Electronics & Communication Engineering' },
            { id: 'dept_me',  name: 'Mechanical Engineering' }
        ];

        const faculty = [
            { id: 'fac_1', name: 'Dr. Rajesh Kumar',    username: 'faculty1', password: 'fac123', departmentId: 'dept_cse', email: 'rajesh@obemictech.edu' },
            { id: 'fac_2', name: 'Prof. Anitha Sharma',  username: 'faculty2', password: 'fac123', departmentId: 'dept_cse', email: 'anitha@obemictech.edu' },
            { id: 'fac_3', name: 'Dr. Venkat Rao',       username: 'faculty3', password: 'fac123', departmentId: 'dept_ece', email: 'venkat@obemictech.edu' },
            { id: 'fac_4', name: 'Prof. Lakshmi Devi',   username: 'faculty4', password: 'fac123', departmentId: 'dept_ece', email: 'lakshmi@obemictech.edu' },
            { id: 'fac_5', name: 'Dr. Suresh Reddy',     username: 'faculty5', password: 'fac123', departmentId: 'dept_me',  email: 'suresh@obemictech.edu' }
        ];

        const subjects = [
            { id: 'sub_1', name: 'Data Structures',              code: 'CS301', departmentId: 'dept_cse', semester: 3, credits: 4, facultyId: 'fac_1' },
            { id: 'sub_2', name: 'Database Management Systems',  code: 'CS302', departmentId: 'dept_cse', semester: 3, credits: 4, facultyId: 'fac_2' },
            { id: 'sub_3', name: 'Operating Systems',            code: 'CS401', departmentId: 'dept_cse', semester: 4, credits: 4, facultyId: 'fac_1' },
            { id: 'sub_4', name: 'Computer Networks',            code: 'CS402', departmentId: 'dept_cse', semester: 4, credits: 3, facultyId: 'fac_2' },
            { id: 'sub_5', name: 'Digital Electronics',          code: 'EC301', departmentId: 'dept_ece', semester: 3, credits: 4, facultyId: 'fac_3' },
            { id: 'sub_6', name: 'Signals & Systems',            code: 'EC302', departmentId: 'dept_ece', semester: 3, credits: 3, facultyId: 'fac_4' },
            { id: 'sub_7', name: 'Thermodynamics',               code: 'ME301', departmentId: 'dept_me',  semester: 3, credits: 4, facultyId: 'fac_5' },
            { id: 'sub_8', name: 'Fluid Mechanics',              code: 'ME302', departmentId: 'dept_me',  semester: 3, credits: 3, facultyId: 'fac_5' }
        ];

        /* --- 30 sample students --- */
        const cseNames = ['Arun Kumar','Priya Nair','Karthik Reddy','Divya Sharma','Rahul Verma',
                          'Sneha Gupta','Vikram Singh','Meera Patel','Arjun Das','Pooja Rao'];
        const eceNames = ['Naveen Prasad','Swathi Kumari','Manoj Tiwari','Kavitha Rajan','Sanjay Bose',
                          'Deepa Iyer','Ravi Shankar','Anjali Menon','Sunil Pandey','Gayatri Joshi'];
        const meNames  = ['Harish Babu','Sindhu Reddy','Prasad Kulkarni','Bhavani Devi','Ganesh Kumar',
                          'Radha Krishna','Mohan Lal','Shalini S','Dinesh Nair','Uma Mahesh'];
        const students = [];
        cseNames.forEach((n,i) => students.push({ id:`stu_cse_${i+1}`, name:n, rollNo:`CSE${String(i+1).padStart(3,'0')}`, departmentId:'dept_cse', semester: i<5?3:4 }));
        eceNames.forEach((n,i) => students.push({ id:`stu_ece_${i+1}`, name:n, rollNo:`ECE${String(i+1).padStart(3,'0')}`, departmentId:'dept_ece', semester:3 }));
        meNames.forEach((n,i)  => students.push({ id:`stu_me_${i+1}`,  name:n, rollNo:`ME${String(i+1).padStart(3,'0')}`,  departmentId:'dept_me',  semester:3 }));

        set(KEYS.departments, departments);
        set(KEYS.faculty, faculty);
        set(KEYS.subjects, subjects);
        set(KEYS.students, students);
        set(KEYS.marks, {});
        set(KEYS.timetable, []);
        set(KEYS.subjectStatus, {});
        set(KEYS.markVerification, {});
        localStorage.setItem(KEYS.initialized, 'true');
    }

    function reset() {
        Object.values(KEYS).forEach(k => localStorage.removeItem(k));
        init(true);
    }

    /* ================== DEPARTMENTS ================== */
    function getDepartments()        { return get(KEYS.departments); }
    function getDepartmentById(id)   { return getDepartments().find(d => d.id === id); }
    function addDepartment(name)     { const a=getDepartments(), d={id:genId(),name}; a.push(d); set(KEYS.departments,a); return d; }
    function deleteDepartment(id)    { set(KEYS.departments, getDepartments().filter(d=>d.id!==id)); }

    /* ================== FACULTY ================== */
    function getFaculty()                  { return get(KEYS.faculty); }
    function getFacultyById(id)            { return getFaculty().find(f=>f.id===id); }
    function getFacultyByDepartment(dId)   { return getFaculty().filter(f=>f.departmentId===dId); }
    function addFaculty(data)              { const a=getFaculty(), f={id:genId(),...data}; a.push(f); set(KEYS.faculty,a); return f; }
    function updateFaculty(id,data)        { const a=getFaculty(), i=a.findIndex(f=>f.id===id); if(i>=0){a[i]={...a[i],...data}; set(KEYS.faculty,a);} }
    function deleteFaculty(id) {
        set(KEYS.faculty, getFaculty().filter(f=>f.id!==id));
        const subs = getSubjects(); subs.forEach(s=>{ if(s.facultyId===id) s.facultyId=null; });
        set(KEYS.subjects, subs);
    }

    /* ================== SUBJECTS ================== */
    function getSubjects()                   { return get(KEYS.subjects); }
    function getSubjectById(id)              { return getSubjects().find(s=>s.id===id); }
    function getSubjectsByDepartment(dId)    { return getSubjects().filter(s=>s.departmentId===dId); }
    function getSubjectsByFaculty(fId)       { return getSubjects().filter(s=>s.facultyId===fId); }
    function addSubject(data)                { const a=getSubjects(), s={id:genId(),...data}; a.push(s); set(KEYS.subjects,a); return s; }
    function updateSubject(id,data)          { const a=getSubjects(), i=a.findIndex(s=>s.id===id); if(i>=0){a[i]={...a[i],...data}; set(KEYS.subjects,a);} }
    function deleteSubject(id)               { set(KEYS.subjects, getSubjects().filter(s=>s.id!==id)); }
    function assignFacultyToSubject(sId,fId) { updateSubject(sId,{facultyId:fId}); }

    /* ================== STUDENTS ================== */
    function getStudents()                         { return get(KEYS.students); }
    function getStudentById(id)                    { return getStudents().find(s=>s.id===id); }
    function getStudentsByDepartment(dId)           { return getStudents().filter(s=>s.departmentId===dId); }
    function getStudentsByDeptAndSemester(dId,sem)  { return getStudents().filter(s=>s.departmentId===dId && s.semester===sem); }
    function addStudent(data)                       { const a=getStudents(), s={id:genId(),...data}; a.push(s); set(KEYS.students,a); return s; }
    function deleteStudent(id)                      { set(KEYS.students, getStudents().filter(s=>s.id!==id)); }

    /* ================== MARKS ================== */
    // Shape: { subjectId: { studentId: { mid1:{q1..q6,unitTest,assignment}, mid2:{...} } } }
    function getMarks()                { return getObj(KEYS.marks); }
    function getMarksBySubject(sId)    { return getMarks()[sId] || {}; }
    function saveMarks(sId, stuId, m)  { const a=getMarks(); if(!a[sId]) a[sId]={}; a[sId][stuId]=m; set(KEYS.marks,a); }
    function saveBulkMarks(sId, obj)   {
        const a = getMarks();
        if (!a[sId]) a[sId] = {};
        Object.keys(obj).forEach(stuId => {
            if (!a[sId][stuId]) a[sId][stuId] = {};
            const incoming = obj[stuId];
            ['mid1','mid2'].forEach(mid => {
                if (incoming[mid]) {
                    a[sId][stuId][mid] = { ...(a[sId][stuId][mid] || {}), ...incoming[mid] };
                }
            });
        });
        set(KEYS.marks, a);
    }
    function areMarksEntered(sId) {
        const m = getMarks();
        if (!m[sId]) return false;
        return Object.keys(m[sId]).some(stuId => {
            const s = m[sId][stuId];
            if (!s) return false;
            const m1 = s.mid1 || {}, m2 = s.mid2 || {};
            return ['q1','q2','q3','q4','q5','q6','unitTest','assignment'].some(k => m1[k] != null || m2[k] != null);
        });
    }

    /* ================== TIMETABLE ================== */
    function getTimetable()            { return get(KEYS.timetable); }
    function addTimetableEntry(data) {
        const tt=getTimetable();
        const dup=tt.find(e=>e.day===data.day && e.period===data.period);
        if(dup) return {error:'Time slot already occupied'};
        const entry={id:genId(),...data}; tt.push(entry); set(KEYS.timetable,tt); return entry;
    }
    function deleteTimetableEntry(id)  { set(KEYS.timetable, getTimetable().filter(e=>e.id!==id)); }
    function getTimetableByFaculty(fId){ return getTimetable().filter(e=>e.facultyId===fId); }
    function clearTimetable()          { set(KEYS.timetable,[]); }

    /* ================== SUBJECT STATUS ================== */
    function getSubjectStatus()          { return getObj(KEYS.subjectStatus); }
    function getSubjectStatusById(sId)   { return getSubjectStatus()[sId] || 0; }
    function setSubjectStatus(sId, pct)  { const o=getSubjectStatus(); o[sId]=Math.min(100,Math.max(0,pct)); set(KEYS.subjectStatus,o); }

    /* ================== MARK VERIFICATION ================== */
    function getMarkVerification()         { return getObj(KEYS.markVerification); }
    function verifyMarks(sId, data)        { const o=getMarkVerification(); o[sId]={...data,verifiedAt:new Date().toISOString()}; set(KEYS.markVerification,o); }
    function isMarksVerified(sId)          { const o=getMarkVerification(); return !!(o[sId]&&o[sId].verified); }
    function getVerificationDetails(sId)   { return getMarkVerification()[sId] || null; }

    /* ================== AUTH ================== */
    function authenticate(username, password) {
        // 1. Check Faculty
        const f = getFaculty().find(f => f.username === username && f.password === password);
        if (f) return { success: true, user: f, role: 'faculty' };

        // 2. Check Static Roles
        const creds = {
            coordinator: { username: 'coordinator', password: 'coord123' },
            management:  { username: 'management',  password: 'mgmt123' },
            hod:         { username: 'hod',         password: 'hod123' }
        };

        for (const [role, c] of Object.entries(creds)) {
            if (c.username === username && c.password === password) {
                return { success: true, user: { name: role.charAt(0).toUpperCase() + role.slice(1), role: role }, role: role };
            }
        }
        
        return { success: false };
    }

    /* ================== PUBLIC API ================== */
    return {
        init, reset,
        getDepartments, getDepartmentById, addDepartment, deleteDepartment,
        getFaculty, getFacultyById, getFacultyByDepartment, addFaculty, updateFaculty, deleteFaculty,
        getSubjects, getSubjectById, getSubjectsByDepartment, getSubjectsByFaculty, addSubject, updateSubject, deleteSubject, assignFacultyToSubject,
        getStudents, getStudentById, getStudentsByDepartment, getStudentsByDeptAndSemester, addStudent, deleteStudent,
        getMarks, getMarksBySubject, saveMarks, saveBulkMarks, areMarksEntered,
        getTimetable, addTimetableEntry, deleteTimetableEntry, getTimetableByFaculty, clearTimetable,
        getSubjectStatus, getSubjectStatusById, setSubjectStatus,
        getMarkVerification, verifyMarks, isMarksVerified, getVerificationDetails,
        authenticate
    };
})();

DataStore.init();
