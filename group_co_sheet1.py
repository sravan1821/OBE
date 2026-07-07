with open(r'c:\Users\srava\OneDrive\Desktop\OBE\static\js\faculty.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Locate the entire sheet 1 generation block to replace it
start_idx = content.find('            // Row 8 (index 8)\n            addCell(8, 0, "Enter AB for absentees", STYLE_RED_BOLD);')
end_idx = content.find('            wsMarks[\'!ref\'] = XLSX.utils.encode_range({s:{r:0,c:0}, e:{r:maxR,c:27}});')

# Let's inspect what is between them so we match it cleanly
old_block = content[start_idx:end_idx]

combined_new_sheet1 = """            // Row 8 (index 8)
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

            """

content = content.replace(old_block, combined_new_sheet1)

# Now update the merges and column widths
old_merges = """            wsMarks['!merges'] = [
                { s:{r:0,c:0}, e:{r:4,c:27} }, 
                { s:{r:5,c:0}, e:{r:5,c:27} }, 
                { s:{r:6,c:0}, e:{r:6,c:27} }, 
                { s:{r:7,c:0}, e:{r:7,c:12} }, 
                { s:{r:7,c:13}, e:{r:7,c:27} }, 
                { s:{r:8,c:0}, e:{r:8,c:2} }, 
                { s:{r:8,c:3}, e:{r:8,c:14} }, 
                { s:{r:8,c:15}, e:{r:8,c:26} },
                { s:{r:9,c:0}, e:{r:10,c:0} }, // S.NO
                { s:{r:9,c:1}, e:{r:10,c:1} }, // Regd.No
                { s:{r:9,c:2}, e:{r:10,c:2} }, // Name
                { s:{r:9,c:3}, e:{r:9,c:8} }, // Descriptive
                { s:{r:9,c:11}, e:{r:9,c:12} }, // Unit Test
                { s:{r:9,c:13}, e:{r:10,c:13} }, // Assignment-1
                { s:{r:9,c:14}, e:{r:10,c:14} }, // MID-1 Total
                { s:{r:9,c:15}, e:{r:9,c:20} }, // Descriptive 2
                { s:{r:9,c:23}, e:{r:9,c:24} }, // Unit Test 2
                { s:{r:9,c:25}, e:{r:10,c:25} }, // Assignment-2
                { s:{r:9,c:26}, e:{r:10,c:26} }, // MID-2 Total
                { s:{r:9,c:27}, e:{r:10,c:27} } // Marks
            ];
            wsMarks['!cols'] = [
                {wch:6}, {wch:15}, {wch:25},
                {wch:5},{wch:5},{wch:5},{wch:5},{wch:5},{wch:5},{wch:6},{wch:6},{wch:8},{wch:6},{wch:12},{wch:10},
                {wch:5},{wch:5},{wch:5},{wch:5},{wch:5},{wch:5},{wch:6},{wch:6},{wch:8},{wch:6},{wch:12},{wch:10},
                {wch:8}
            ];"""

new_merges = """            wsMarks['!ref'] = XLSX.utils.encode_range({s:{r:0,c:0}, e:{r:maxR,c:21}});
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
            ];"""

content = content.replace(old_merges, new_merges)

with open(r'c:\Users\srava\OneDrive\Desktop\OBE\static\js\faculty.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Sheet 1 rewritten for CO columns grouping successfully!")
