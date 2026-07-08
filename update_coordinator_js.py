with open(r'c:\Users\srava\OneDrive\Desktop\OBE\static\js\coordinator.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the timetable entry table row template to include both Edit and Delete buttons
old_row = """                                return `<tr>
                                    <td>${DAYS[e.day] || '—'}</td>
                                    <td>Period ${e.period+1}</td>
                                    <td class="fw-600">${sub ? sub.name : '—'}</td>
                                    <td>${fac ? fac.name : '—'}</td>
                                    <td><button class="btn btn-danger btn-xs tt-del" data-id="${e.id}">✕</button></td>
                                </tr>`;"""

new_row = """                                return `<tr>
                                    <td>${DAYS[e.day] || '—'}</td>
                                    <td>Period ${e.period+1}</td>
                                    <td class="fw-600">${sub ? sub.name : '—'}</td>
                                    <td>${fac ? fac.name : '—'}</td>
                                    <td>
                                        <div class="flex gap-xs">
                                            <button class="btn btn-primary btn-xs tt-edit" data-id="${e.id}" style="padding: 4px 8px; font-size: 0.75rem; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px;">📝 Edit</button>
                                            <button class="btn btn-danger btn-xs tt-del" data-id="${e.id}" style="padding: 4px 8px; font-size: 0.75rem; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px;">✕ Delete</button>
                                        </div>
                                    </td>
                                </tr>`;"""

content = content.replace(old_row, new_row)

# Replace the delete listener code in renderTimetable to also bind edit listener
old_listeners = """        /* Delete entry from table */
        c.querySelectorAll('.tt-del').forEach(btn => {
            btn.addEventListener('click', () => {
                DataStore.deleteTimetableEntry(btn.dataset.id);
                renderTimetable(c);
                App.showToast('Entry removed', 'info');
            });
        });"""

new_listeners = """        /* Edit entry from table */
        c.querySelectorAll('.tt-edit').forEach(btn => {
            btn.addEventListener('click', () => {
                showTTModal(c, subjects, faculty, btn.dataset.id);
            });
        });

        /* Delete entry from table */
        c.querySelectorAll('.tt-del').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('Delete this timetable entry?')) {
                    DataStore.deleteTimetableEntry(btn.dataset.id);
                    renderTimetable(c);
                    App.showToast('Entry removed', 'info');
                }
            });
        });"""

content = content.replace(old_listeners, new_listeners)

# Update showTTModal signature and implementation
old_modal_func = """    function showTTModal(c, subjects, faculty) {
        const modal = document.getElementById('tt-modal');
        modal.style.display = '';
        modal.innerHTML = `
        <div class="inline-modal">
            <div class="modal-overlay" id="tt-modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Add Timetable Entry</h2>
                    <button class="modal-close" id="tt-modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label">Subject</label>
                        <select class="form-select" id="tt-subject">
                            <option value="">— Select —</option>
                            ${subjects.map(s => `<option value="${s.id}">${s.code} — ${s.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Faculty</label>
                        <select class="form-select" id="tt-faculty">
                            <option value="">— Select —</option>
                            ${faculty.map(f => `<option value="${f.id}">${f.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Day</label>
                            <select class="form-select" id="tt-day">
                                ${DAYS.map((d,i) => `<option value="${i}">${d}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Period</label>
                            <select class="form-select" id="tt-period">
                                ${PERIODS.map((p,i) => `<option value="${i}">Period ${i+1}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div id="tt-add-error" class="error-message" style="display:none"></div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="tt-cancel">Cancel</button>
                    <button class="btn btn-primary" id="tt-save">Add Entry</button>
                </div>
            </div>
        </div>`;

        /* Auto-select faculty when subject changes */
        document.getElementById('tt-subject').addEventListener('change', (e) => {
            const sub = DataStore.getSubjectById(e.target.value);
            if (sub && sub.facultyId) document.getElementById('tt-faculty').value = sub.facultyId;
        });

        const closeFn = () => { modal.style.display = 'none'; modal.innerHTML = ''; };
        document.getElementById('tt-modal-close').addEventListener('click', closeFn);
        document.getElementById('tt-modal-overlay').addEventListener('click', closeFn);
        document.getElementById('tt-cancel').addEventListener('click', closeFn);

        document.getElementById('tt-save').addEventListener('click', () => {
            const subId = document.getElementById('tt-subject').value;
            const facId = document.getElementById('tt-faculty').value;
            const day   = parseInt(document.getElementById('tt-day').value);
            const period = parseInt(document.getElementById('tt-period').value);

            if (!subId || !facId) {
                const err = document.getElementById('tt-add-error');
                err.textContent = 'Please select both subject and faculty.';
                err.style.display = 'block';
                return;
            }

            const result = DataStore.addTimetableEntry({ subjectId:subId, facultyId:facId, day, period });
            if (result.error) {
                const err = document.getElementById('tt-add-error');
                err.textContent = result.error;
                err.style.display = 'block';
                return;
            }

            closeFn();
            renderTimetable(c);
            App.showToast('Timetable entry added!', 'success');
        });
    }"""

new_modal_func = """    function showTTModal(c, subjects, faculty, existingEntryId = null) {
        const modal = document.getElementById('tt-modal');
        modal.style.display = '';

        let entry = null;
        if (existingEntryId) {
            entry = DataStore.getTimetable().find(e => e.id === existingEntryId);
        }

        modal.innerHTML = `
        <div class="inline-modal">
            <div class="modal-overlay" id="tt-modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${existingEntryId ? 'Edit Timetable Entry' : 'Add Timetable Entry'}</h2>
                    <button class="modal-close" id="tt-modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label">Subject</label>
                        <select class="form-select" id="tt-subject">
                            <option value="">— Select —</option>
                            ${subjects.map(s => `<option value="${s.id}" ${entry && entry.subjectId === s.id ? 'selected' : ''}>${s.code} — ${s.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Faculty</label>
                        <select class="form-select" id="tt-faculty">
                            <option value="">— Select —</option>
                            ${faculty.map(f => `<option value="${f.id}" ${entry && entry.facultyId === f.id ? 'selected' : ''}>${f.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Day</label>
                            <select class="form-select" id="tt-day">
                                ${DAYS.map((d,i) => `<option value="${i}" ${entry && entry.day === i ? 'selected' : ''}>${d}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Period</label>
                            <select class="form-select" id="tt-period">
                                ${PERIODS.map((p,i) => `<option value="${i}" ${entry && entry.period === i ? 'selected' : ''}>Period ${i+1}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div id="tt-add-error" class="error-message" style="display:none"></div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="tt-cancel">Cancel</button>
                    <button class="btn btn-primary" id="tt-save">${existingEntryId ? 'Save Changes' : 'Add Entry'}</button>
                </div>
            </div>
        </div>`;

        /* Auto-select faculty when subject changes */
        document.getElementById('tt-subject').addEventListener('change', (e) => {
            const sub = DataStore.getSubjectById(e.target.value);
            if (sub && sub.facultyId) document.getElementById('tt-faculty').value = sub.facultyId;
        });

        const closeFn = () => { modal.style.display = 'none'; modal.innerHTML = ''; };
        document.getElementById('tt-modal-close').addEventListener('click', closeFn);
        document.getElementById('tt-modal-overlay').addEventListener('click', closeFn);
        document.getElementById('tt-cancel').addEventListener('click', closeFn);

        document.getElementById('tt-save').addEventListener('click', () => {
            const subId = document.getElementById('tt-subject').value;
            const facId = document.getElementById('tt-faculty').value;
            const day   = parseInt(document.getElementById('tt-day').value);
            const period = parseInt(document.getElementById('tt-period').value);

            if (!subId || !facId) {
                const err = document.getElementById('tt-add-error');
                err.textContent = 'Please select both subject and faculty.';
                err.style.display = 'block';
                return;
            }

            let result;
            if (existingEntryId) {
                result = DataStore.updateTimetableEntry(existingEntryId, { subjectId: subId, facultyId: facId, day, period });
            } else {
                result = DataStore.addTimetableEntry({ subjectId: subId, facultyId: facId, day, period });
            }

            if (result && result.error) {
                const err = document.getElementById('tt-add-error');
                err.textContent = result.error;
                err.style.display = 'block';
                return;
            }

            closeFn();
            renderTimetable(c);
            App.showToast(existingEntryId ? 'Timetable entry updated!' : 'Timetable entry added!', 'success');
        });
    }"""

content = content.replace(old_modal_func, new_modal_func)

with open(r'c:\Users\srava\OneDrive\Desktop\OBE\static\js\coordinator.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("coordinator.js updated successfully!")
