/* ============================================================
   OBE MicTech — Shared Marks Utility
   Formula (matching MIC College Autonomous Statement):
     Per MID (I & II):
       Descriptive: Q1-Q6 (max 10 each), Best 3 of 6 → Total (max 30)
       Unit Test: max 20
       Assignment: max 10
       MID Total = (Desc/30 × 15) + (UT/20 × 10) + (Asgn/10 × 5) = max 30
     Final Internal = (MID-I Total + MID-II Total) / 2 = max 30
   ============================================================ */
import { icon, iconText } from './icons.js';

export const MarksUtils = (() => {
    function r2(n) { return Math.round(n * 100) / 100; }

    function calcMid(d) {
        if (!d) d = {};
        const qs = ['q1','q2','q3','q4','q5','q6'].map(k => Number(d[k]) || 0);
        const best3 = [...qs].sort((a,b) => b - a);
        const desc = best3[0] + best3[1] + best3[2];               // max 30
        const ut   = Number(d.unitTest) || 0;                       // max 20
        const asgn = Number(d.assignment) || 0;                     // max 10
        const sDesc = r2((desc / 30) * 15);
        const sUT   = r2((ut / 20) * 10);
        const sAsgn = r2((asgn / 10) * 5);
        return { desc, ut, asgn, sDesc, sUT, sAsgn, total: r2(sDesc + sUT + sAsgn) };
    }

    function calcFinal(m1d, m2d) {
        return r2((calcMid(m1d).total + calcMid(m2d).total) / 2);
    }

    /* ---------- Render full marks table ---------- */
    function renderTable(subjectId, editable) {
        const sub = DataStore.getSubjectById(subjectId);
        if (!sub) return '';
        const students = DataStore.getStudentsByDeptAndSemester(sub.departmentId, sub.semester);
        const marks    = DataStore.getMarksBySubject(subjectId);
        const fac      = sub.facultyId ? DataStore.getFacultyById(sub.facultyId) : null;

        if (!students.length)
            return `<div class="empty-state"><div class="empty-icon">${icon('inbox', { size: 48 })}</div><p>No students found for this subject.</p></div>`;

        const gv = (o,k) => (o && o[k] !== undefined && o[k] !== null) ? o[k] : '';
        const cell = (stuId, mid, field, max, val) => {
            if (editable)
                return `<td><input type="number" class="marks-input mi" data-s="${stuId}" data-m="${mid}" data-f="${field}" value="${val}" min="0" max="${max}" step="0.5"></td>`;
            return `<td>${val !== '' ? val : '—'}</td>`;
        };

        let rows = '';
        students.forEach((st, i) => {
            const m = marks[st.id] || {};
            const d1 = m.mid1 || {}, d2 = m.mid2 || {};
            const v = (o,k) => gv(o,k);
            const has1 = ['q1','q2','q3','q4','q5','q6'].some(k => v(d1,k) !== '');
            const has2 = ['q1','q2','q3','q4','q5','q6'].some(k => v(d2,k) !== '');
            const c1 = calcMid(d1), c2 = calcMid(d2);
            const fin = r2((c1.total + c2.total) / 2);

            rows += `<tr>
                <td class="sticky-col sc1">${i+1}</td>
                <td class="sticky-col sc2"><span class="badge badge-info">${st.rollNo}</span></td>
                <td class="sticky-col sc3 fw-600">${st.name}</td>
                ${cell(st.id,'mid1','q1',10,v(d1,'q1'))}${cell(st.id,'mid1','q2',10,v(d1,'q2'))}${cell(st.id,'mid1','q3',10,v(d1,'q3'))}
                ${cell(st.id,'mid1','q4',10,v(d1,'q4'))}${cell(st.id,'mid1','q5',10,v(d1,'q5'))}${cell(st.id,'mid1','q6',10,v(d1,'q6'))}
                <td class="fw-700 dc" data-s="${st.id}" data-m="mid1" style="color:var(--neon-cyan)">${has1?c1.desc:'—'}</td>
                ${cell(st.id,'mid1','unitTest',20,v(d1,'unitTest'))}
                ${cell(st.id,'mid1','assignment',10,v(d1,'assignment'))}
                <td class="fw-700 mc" data-s="${st.id}" data-m="mid1" style="color:var(--neon-blue)">${has1?c1.total:'—'}</td>
                ${cell(st.id,'mid2','q1',10,v(d2,'q1'))}${cell(st.id,'mid2','q2',10,v(d2,'q2'))}${cell(st.id,'mid2','q3',10,v(d2,'q3'))}
                ${cell(st.id,'mid2','q4',10,v(d2,'q4'))}${cell(st.id,'mid2','q5',10,v(d2,'q5'))}${cell(st.id,'mid2','q6',10,v(d2,'q6'))}
                <td class="fw-700 dc" data-s="${st.id}" data-m="mid2" style="color:var(--neon-cyan)">${has2?c2.desc:'—'}</td>
                ${cell(st.id,'mid2','unitTest',20,v(d2,'unitTest'))}
                ${cell(st.id,'mid2','assignment',10,v(d2,'assignment'))}
                <td class="fw-700 mc" data-s="${st.id}" data-m="mid2" style="color:var(--neon-purple)">${has2?c2.total:'—'}</td>
                <td class="fw-700 fc" data-s="${st.id}" style="color:var(--neon-green)">${(has1||has2)?fin:'—'}</td>
            </tr>`;
        });

        return `
        <div class="card fade-in" id="marks-card">
            <div class="card-header">
                <div>
                    <h2>${sub.code} — ${sub.name}</h2>
                    <div class="text-sm text-muted mt-1">Faculty: ${fac?fac.name:'Unassigned'} &bull; Semester ${sub.semester} &bull; ${students.length} students</div>
                </div>
                ${editable ? `<button class="btn btn-success" id="save-marks-btn">${iconText('save', 'Save All Marks')}</button>` : ''}
            </div>
            <div class="card-body" style="padding:0.6rem">
                <div style="background:rgba(79,106,255,0.05);border:1px solid rgba(79,106,255,0.1);border-radius:8px;padding:0.5rem 0.8rem;margin-bottom:0.8rem;font-size:0.75rem;color:var(--text-secondary);">
                    ${icon('ruler', { size: 16 })} <b>Desc</b> = Best 3 of Q1-Q6 (/30) → ×15/30 &nbsp;|&nbsp; <b>UT</b> (/20) → ×10/20 &nbsp;|&nbsp; <b>Asgn</b> (/10) → ×5/10 &nbsp;|&nbsp; <b>MID Total = /30</b> &nbsp;|&nbsp; <b>Final = (MID-I + MID-II) / 2</b>
                </div>
                <div class="table-wrapper" style="max-height:65vh;overflow:auto;">
                    <table class="table marks-table" style="font-size:0.76rem;white-space:nowrap;">
                        <thead>
                            <tr>
                                <th rowspan="2" class="sticky-col sc1" style="z-index:3">S.No</th>
                                <th rowspan="2" class="sticky-col sc2" style="z-index:3">Roll No</th>
                                <th rowspan="2" class="sticky-col sc3" style="z-index:3;min-width:110px">Name</th>
                                <th colspan="10" style="text-align:center;color:var(--neon-blue);border-bottom:2px solid rgba(79,106,255,0.4)">MID - I</th>
                                <th colspan="10" style="text-align:center;color:var(--neon-purple);border-bottom:2px solid rgba(168,85,247,0.4)">MID - II</th>
                                <th rowspan="2" style="text-align:center;color:var(--neon-green)">Final<br>/30</th>
                            </tr>
                            <tr>
                                <th>Q1</th><th>Q2</th><th>Q3</th><th>Q4</th><th>Q5</th><th>Q6</th>
                                <th style="color:var(--neon-cyan)">Desc</th><th>UT</th><th>Asgn</th>
                                <th style="color:var(--neon-blue)">Total</th>
                                <th>Q1</th><th>Q2</th><th>Q3</th><th>Q4</th><th>Q5</th><th>Q6</th>
                                <th style="color:var(--neon-cyan)">Desc</th><th>UT</th><th>Asgn</th>
                                <th style="color:var(--neon-purple)">Total</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            </div>
        </div>`;
    }

    /* ---------- Bind live-calculation events ---------- */
    function bindEvents(container, subjectId) {
        container.querySelectorAll('.mi').forEach(inp => {
            inp.addEventListener('input', () => {
                const f = inp.dataset.f;
                const max = f === 'unitTest' ? 20 : f === 'assignment' ? 10 : 10;
                const v = parseFloat(inp.value);
                if (v < 0 || v > max) inp.classList.add('invalid'); else inp.classList.remove('invalid');
                recalcRow(container, inp.dataset.s);
            });
        });

        const saveBtn = container.querySelector('#save-marks-btn');
        if (saveBtn) saveBtn.addEventListener('click', () => saveMarks(container, subjectId));
    }

    function recalcRow(container, stuId) {
        ['mid1','mid2'].forEach(mid => {
            const qVals = {};
            ['q1','q2','q3','q4','q5','q6','unitTest','assignment'].forEach(f => {
                const el = container.querySelector(`.mi[data-s="${stuId}"][data-m="${mid}"][data-f="${f}"]`);
                qVals[f] = el ? el.value : '';
            });
            const has = ['q1','q2','q3','q4','q5','q6'].some(k => qVals[k] !== '');
            const c = calcMid(qVals);
            const dc = container.querySelector(`.dc[data-s="${stuId}"][data-m="${mid}"]`);
            const mc = container.querySelector(`.mc[data-s="${stuId}"][data-m="${mid}"]`);
            if (dc) dc.textContent = has ? c.desc : '—';
            if (mc) mc.textContent = has ? c.total : '—';
        });

        // Final
        const m1d = {}, m2d = {};
        ['q1','q2','q3','q4','q5','q6','unitTest','assignment'].forEach(f => {
            const e1 = container.querySelector(`.mi[data-s="${stuId}"][data-m="mid1"][data-f="${f}"]`);
            const e2 = container.querySelector(`.mi[data-s="${stuId}"][data-m="mid2"][data-f="${f}"]`);
            m1d[f] = e1 ? e1.value : ''; m2d[f] = e2 ? e2.value : '';
        });
        const has1 = ['q1','q2','q3','q4','q5','q6'].some(k => m1d[k] !== '');
        const has2 = ['q1','q2','q3','q4','q5','q6'].some(k => m2d[k] !== '');
        const fin = r2((calcMid(m1d).total + calcMid(m2d).total) / 2);
        const fc = container.querySelector(`.fc[data-s="${stuId}"]`);
        if (fc) fc.textContent = (has1 || has2) ? fin : '—';
    }

    function saveMarks(container, subjectId) {
        const inputs = container.querySelectorAll('.mi');
        let valid = true;
        inputs.forEach(inp => {
            const v = inp.value.trim();
            if (v !== '') {
                const n = parseFloat(v);
                const f = inp.dataset.f;
                const max = f === 'unitTest' ? 20 : f === 'assignment' ? 10 : 10;
                if (isNaN(n) || n < 0 || n > max) { valid = false; inp.classList.add('invalid'); }
            }
        });
        if (!valid) { App.showToast('Fix invalid marks before saving (Q: 0-10, UT: 0-20, Asgn: 0-10)', 'error'); return; }

        const bulk = {};
        inputs.forEach(inp => {
            const s = inp.dataset.s, m = inp.dataset.m, f = inp.dataset.f;
            const v = inp.value.trim();
            if (!bulk[s]) bulk[s] = { mid1: {}, mid2: {} };
            if (!bulk[s][m]) bulk[s][m] = {};
            bulk[s][m][f] = v !== '' ? parseFloat(v) : null;
        });
        DataStore.saveBulkMarks(subjectId, bulk);
        App.showToast('All marks saved successfully!', 'success');
    }

    return { calcMid, calcFinal, renderTable, bindEvents, r2 };
})();
