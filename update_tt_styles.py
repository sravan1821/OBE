with open(r'c:\Users\srava\OneDrive\Desktop\OBE\static\css\styles.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Add timetable styles to the end of the file
timetable_styles = """
/* ==================== TIMETABLE STYLES ==================== */
.timetable-grid {
    display: grid;
    grid-template-columns: 120px repeat(6, 1fr); /* 1 for period labels, 6 for Mon-Sat */
    gap: 8px;
    min-width: 800px;
    margin-top: 1rem;
}

.tt-cell {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 10px;
    text-align: center;
    min-height: 70px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease-in-out;
}

.tt-cell.tt-header {
    background: var(--primary);
    color: white;
    font-weight: 700;
    min-height: 45px;
    border-color: var(--primary);
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 0.5px;
}

.tt-cell.tt-label {
    background: var(--bg-main);
    font-weight: 600;
    font-size: 0.85rem;
    color: var(--text-main);
    border-color: var(--border-color);
}

.tt-cell.tt-filled {
    background: rgba(45, 165, 235, 0.15);
    border-color: var(--accent);
    color: var(--accent);
    cursor: pointer;
}

body.theme-purple .tt-cell.tt-filled {
    background: rgba(94, 53, 177, 0.15);
}

body.theme-teal .tt-cell.tt-filled {
    background: rgba(0, 121, 107, 0.15);
}

body.theme-orange .tt-cell.tt-filled {
    background: rgba(216, 67, 21, 0.15);
}

.tt-cell.tt-filled:hover {
    background: rgba(207, 44, 49, 0.15) !important;
    border-color: var(--danger) !important;
    color: var(--danger) !important;
}

.tt-subject {
    font-weight: 700;
    font-size: 0.95rem;
    margin-bottom: 2px;
}

.tt-faculty {
    font-size: 0.75rem;
    color: var(--text-muted);
}
"""

content += timetable_styles

with open(r'c:\Users\srava\OneDrive\Desktop\OBE\static\css\styles.css', 'w', encoding='utf-8') as f:
    f.write(content)

print("Timetable grid styling appended successfully!")
