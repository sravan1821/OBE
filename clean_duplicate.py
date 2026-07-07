with open(r'c:\Users\srava\OneDrive\Desktop\OBE\static\js\faculty.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the duplicate ref line
old_line = """            wsMarks['!ref'] = XLSX.utils.encode_range({s:{r:0,c:0}, e:{r:maxR,c:27}});
            wsMarks['!ref'] = XLSX.utils.encode_range({s:{r:0,c:0}, e:{r:maxR,c:21}});"""

new_line = """            wsMarks['!ref'] = XLSX.utils.encode_range({s:{r:0,c:0}, e:{r:maxR,c:21}});"""

content = content.replace(old_line, new_line)

with open(r'c:\Users\srava\OneDrive\Desktop\OBE\static\js\faculty.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Duplicate ref line cleaned!")
