with open(r'c:\Users\srava\OneDrive\Desktop\OBE\static\js\faculty.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the start of parseMarksSheet to include header detection
old_start = """    function parseMarksSheet(rows, regulation) {
        const bulk = {};

        // Auto-detect the first data row by looking for a roll number pattern in column 1
        let startRow = 0;
        for (let i = 0; i < Math.min(rows.length, 30); i++) {
            if (rows[i] && rows[i][1] && /^[0-9]{2}[A-Za-z]/.test(String(rows[i][1]).trim())) {
                startRow = i;
                break;
            }
        }
        if (startRow === 0) startRow = 10; // fallback"""

new_start = """    function parseMarksSheet(rows, regulation) {
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
        }"""

content = content.replace(old_start, new_start)

# Replace the inner loop logic to use isNewLayout instead of row.length <= 23
old_inner = """                let ut1 = 11, asg1 = 13, m2q_start = 15, ut2 = 23, asg2 = 25;
                if (row.length <= 23) { 
                    // Fallback to old format
                    ut1 = 10; asg1 = 11; m2q_start = 13; ut2 = 20; asg2 = 21;
                }"""

new_inner = """                let ut1 = 11, asg1 = 13, m2q_start = 15, ut2 = 23, asg2 = 25;
                if (!isNewLayout) { 
                    // Fallback to old format
                    ut1 = 10; asg1 = 11; m2q_start = 13; ut2 = 20; asg2 = 21;
                }"""

content = content.replace(old_inner, new_inner)

with open(r'c:\Users\srava\OneDrive\Desktop\OBE\static\js\faculty.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Robust layout detection updated in faculty.js")
