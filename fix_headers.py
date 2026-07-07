with open(r'c:\Users\srava\OneDrive\Desktop\OBE\static\js\faculty.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace headers in Sheet 2 (CO Attainments)
old_headers = "exRows.push(['','','Q1 E1','Q1 E2','Q2 E1','Q2 E2','Q3 E1','Q3 E2','Total Desc','ROUNDUP(/2)','Quiz','Assignment','Q1 E1','Q1 E2','Q2 E1','Q2 E2','Q3 E1','Q3 E2','Total Desc','ROUNDUP(/2)','Quiz','Assignment','CO 1','CO 2','CO 3','CO 4','CO 5']);"
new_headers = "exRows.push(['','','Q1','Q2','Q3','Q4','Q5','Q6','Total Desc','ROUNDUP(/2)','Quiz','Assignment','Q1','Q2','Q3','Q4','Q5','Q6','Total Desc','ROUNDUP(/2)','Quiz','Assignment','CO 1','CO 2','CO 3','CO 4','CO 5']);"

content = content.replace(old_headers, new_headers)

with open(r'c:\Users\srava\OneDrive\Desktop\OBE\static\js\faculty.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Headers updated successfully!")
