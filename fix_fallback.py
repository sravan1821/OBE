with open(r'c:\Users\srava\OneDrive\Desktop\OBE\static\js\faculty.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the incorrect fallback check
old_check = 'if (row[13] === undefined && row[11] !== undefined) {'
new_check = 'if (row.length <= 23) {'

content = content.replace(old_check, new_check)

with open(r'c:\Users\srava\OneDrive\Desktop\OBE\static\js\faculty.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Check updated successfully!")
