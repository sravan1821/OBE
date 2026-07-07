with open(r'c:\Users\srava\OneDrive\Desktop\OBE\static\js\data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Locate set(KEYS.timetable, []);
old_timetable_init = "set(KEYS.timetable, []);"

dummy_timetable_data = """const dummyTimetable = [
            { id: 'tt_1', subjectId: 'sub_1', facultyId: 'fac_1', day: 0, period: 0 },
            { id: 'tt_2', subjectId: 'sub_2', facultyId: 'fac_2', day: 0, period: 1 },
            { id: 'tt_3', subjectId: 'sub_3', facultyId: 'fac_1', day: 0, period: 2 },
            { id: 'tt_4', subjectId: 'sub_1', facultyId: 'fac_1', day: 1, period: 1 },
            { id: 'tt_5', subjectId: 'sub_4', facultyId: 'fac_2', day: 1, period: 3 },
            { id: 'tt_6', subjectId: 'sub_2', facultyId: 'fac_2', day: 2, period: 0 },
            { id: 'tt_7', subjectId: 'sub_3', facultyId: 'fac_1', day: 2, period: 2 },
            { id: 'tt_8', subjectId: 'sub_1', facultyId: 'fac_1', day: 2, period: 4 },
            { id: 'tt_9', subjectId: 'sub_4', facultyId: 'fac_2', day: 3, period: 1 },
            { id: 'tt_10', subjectId: 'sub_2', facultyId: 'fac_2', day: 3, period: 3 },
            { id: 'tt_11', subjectId: 'sub_3', facultyId: 'fac_1', day: 4, period: 0 },
            { id: 'tt_12', subjectId: 'sub_4', facultyId: 'fac_2', day: 4, period: 2 },
            { id: 'tt_13', subjectId: 'sub_1', facultyId: 'fac_1', day: 4, period: 5 },
            { id: 'tt_14', subjectId: 'sub_1', facultyId: 'fac_1', day: 5, period: 0 },
            { id: 'tt_15', subjectId: 'sub_2', facultyId: 'fac_2', day: 5, period: 1 }
        ];
        set(KEYS.timetable, dummyTimetable);"""

content = content.replace(old_timetable_init, dummy_timetable_data)

with open(r'c:\Users\srava\OneDrive\Desktop\OBE\static\js\data.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Dummy timetable entries written to data.js!")
