with open(r'c:\Users\srava\OneDrive\Desktop\OBE\static\js\faculty.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Locate Sheet 1 generation block
start_block = """            addCell(8, 0, "Enter AB for absentees", STYLE_RED_BOLD);
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
                const r = 11 + i;"""

new_block = """            // Row 8 (index 8)
            addCell(8, 0, "Enter AB for absentees", STYLE_RED_BOLD);
            addCell(8, 3, "MID-I", STYLE_HDR);
            addCell(8, 15, "MID-II", STYLE_HDR);

            // Row 9 (index 9)
            addCell(9, 0, "S.NO", STYLE_HDR);
            addCell(9, 1, "Regd.No", STYLE_HDR);
            addCell(9, 2, "Name", STYLE_HDR);
            addCell(9, 3, "Descriptive", STYLE_HDR);
            addCell(9, 11, "Unit Test", STYLE_HDR);
            addCell(9, 13, "ASSIGNM ENT-1", STYLE_HDR);
            addCell(9, 14, "MID-I TOTAL", STYLE_HDR);
            addCell(9, 15, "Descriptive", STYLE_HDR);
            addCell(9, 23, "Unit Test", STYLE_HDR);
            addCell(9, 25, "ASSIGNM ENT-2", STYLE_HDR);
            addCell(9, 26, "MID-II TOTAL", STYLE_HDR);
            addCell(9, 27, "MARKS", STYLE_HDR);

            // Row 10 (index 10)
            const headers = [
                "", "", "",
                "Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Total", "Scale", "Unit Test", "Scale", "ASSIGNM ENT-1", "MID-I TOTAL",
                "Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Total", "Scale", "Unit Test", "Scale", "ASSIGNM ENT-2", "MID-II TOTAL",
                "MARKS"
            ];
            headers.forEach((h, c) => {
                if (h) addCell(10, c, h, STYLE_HDR);
            });

            // Row 11 (index 11) is the green max marks row
            const maxM = [
                "********", "********", "********",
                10, 10, 10, 10, 10, 10, 30, 15, 20, 10, 5, 30,
                10, 10, 10, 10, 10, 10, 30, 15, 20, 10, 5, 30,
                30
            ];
            maxM.forEach((m, c) => addCell(11, c, m, typeof m === 'number' ? STYLE_GREEN_HDR : STYLE_HDR));

            rollNumbers.forEach((roll, i) => {
                const rec = marksData[roll];
                const m1 = rec.mid1, m2 = rec.mid2;
                const r = 12 + i;"""

content = content.replace(start_block, new_block)

# Locate and replace merges list
old_merges = """            wsMarks['!merges'] = [
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
            ];"""

new_merges = """            wsMarks['!merges'] = [
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
            ];"""

content = content.replace(old_merges, new_merges)

with open(r'c:\Users\srava\OneDrive\Desktop\OBE\static\js\faculty.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Sheet 1 merged layout fixed!")
