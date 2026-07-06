import re

with open(r'c:\Users\srava\OneDrive\Desktop\OBE\static\js\faculty.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update parseMarksSheet for MIC23
parse_old = '''                m1 = {
                    q1e1: val(3), q1e2: val(4),
                    q2e1: val(5), q2e2: val(6),
                    q3e1: val(7), q3e2: val(8),
                    unitTest: val(10), assignment: val(11)
                };
                m2 = {
                    q1e1: val(13), q1e2: val(14),
                    q2e1: val(15), q2e2: val(16),
                    q3e1: val(17), q3e2: val(18),
                    unitTest: val(20), assignment: val(21)
                };'''

parse_new = '''                let ut1 = 11, asg1 = 13, m2q_start = 15, ut2 = 23, asg2 = 25;
                if (row[13] === undefined && row[11] !== undefined) { 
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
                };'''

content = content.replace(parse_old, parse_new)

# 2. Replace downloadCOExcel entirely
start_idx = content.find('    function downloadCOExcel(subjectId, marksData, regulation) {')
end_idx = content.find('    return { renderSection, renderMarksEntry };')
old_download = content[start_idx:end_idx]

combined_export = '''    const BORDER_ALL = {
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
            addCell(8, 0, "Enter AB for absentees", STYLE_RED_BOLD);
            addCell(8, 3, "MID-I", STYLE_HDR);
            addCell(8, 15, "MID-II", STYLE_HDR);
            addCell(8, 3, "Descriptive", STYLE_HDR);
            addCell(8, 15, "Descriptive", STYLE_HDR);

            const headers = [
                "S.NO", "Regd.No", "Name",
                "Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Total", "Scale", "Unit Test", "Scale", "ASSIGNM ENT-1", "MID-I TOTAL",
                "Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Total", "Scale", "Unit Test", "Scale", "ASSIGNM ENT-2", "MID-II TOTAL",
                "MARKS"
            ];
            headers.forEach((h, c) => addCell(9, c, h, STYLE_HDR));

            const maxM = [
                "********", "********", "********",
                10, 10, 10, 10, 10, 10, 30, 15, 20, 10, 5, 30,
                10, 10, 10, 10, 10, 10, 30, 15, 20, 10, 5, 30,
                30
            ];
            maxM.forEach((m, c) => addCell(10, c, m, typeof m === 'number' ? STYLE_GREEN_HDR : STYLE_HDR));

            rollNumbers.forEach((roll, i) => {
                const rec = marksData[roll];
                const m1 = rec.mid1, m2 = rec.mid2;
                const r = 11 + i;

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
                    m1.q1e1||'', m1.q1e2||'', m1.q2e1||'', m1.q2e2||'', m1.q3e1||'', m1.q3e2||'',
                    m1_desc||'', m1_desc2||'', m1.unitTest||'', m1_ut2||'', m1.assignment||'', m1_tot||'',
                    m2.q1e1||'', m2.q1e2||'', m2.q2e1||'', m2.q2e2||'', m2.q3e1||'', m2.q3e2||'',
                    m2_desc||'', m2_desc2||'', m2.unitTest||'', m2_ut2||'', m2.assignment||'', m2_tot||'',
                    fin||''
                ];

                data.forEach((val, c) => {
                    let st = STYLE_DATA;
                    if (c === 2) st = STYLE_LEFT;
                    if (c === 14 || c === 26 || c === 27) st = STYLE_GREEN;
                    if (c === 27 && fin < 15) st = { ...STYLE_GREEN, font: { color: { rgb: 'FF0000' }, bold: true } };
                    addCell(r, c, val, st);
                });
            });

            wsMarks['!ref'] = XLSX.utils.encode_range({s:{r:0,c:0}, e:{r:maxR,c:27}});
            wsMarks['!merges'] = [
                { s:{r:0,c:0}, e:{r:4,c:27} }, 
                { s:{r:5,c:0}, e:{r:5,c:27} }, 
                { s:{r:6,c:0}, e:{r:6,c:27} }, 
                { s:{r:7,c:0}, e:{r:7,c:12} }, 
                { s:{r:7,c:13}, e:{r:7,c:27} }, 
                { s:{r:8,c:0}, e:{r:8,c:2} }, 
                { s:{r:8,c:3}, e:{r:8,c:14} }, 
                { s:{r:8,c:15}, e:{r:8,c:26} },
                { s:{r:9,c:3}, e:{r:9,c:8} }, 
                { s:{r:9,c:15}, e:{r:9,c:20} }
            ];
            wsMarks['!cols'] = [
                {wch:6}, {wch:15}, {wch:25},
                {wch:5},{wch:5},{wch:5},{wch:5},{wch:5},{wch:5},{wch:6},{wch:6},{wch:8},{wch:6},{wch:12},{wch:10},
                {wch:5},{wch:5},{wch:5},{wch:5},{wch:5},{wch:5},{wch:6},{wch:6},{wch:8},{wch:6},{wch:12},{wch:10},
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
            exRows.push(['','','Q1 E1','Q1 E2','Q2 E1','Q2 E2','Q3 E1','Q3 E2','Total Desc','ROUNDUP(/2)','Quiz','Assignment','Q1 E1','Q1 E2','Q2 E1','Q2 E2','Q3 E1','Q3 E2','Total Desc','ROUNDUP(/2)','Quiz','Assignment','CO 1','CO 2','CO 3','CO 4','CO 5']);
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
'''

content = content.replace(old_download, combined_export)

with open(r'c:\Users\srava\OneDrive\Desktop\OBE\static\js\faculty.js', 'w', encoding='utf-8') as f:
    f.write(content)
