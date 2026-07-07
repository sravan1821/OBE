with open(r'c:\Users\srava\OneDrive\Desktop\OBE\static\js\hod.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Marks Overview card body
old_card = """                <!-- Marks overview -->
                <div class="card">
                    <div class="card-header"><h3>Marks Overview</h3></div>
                    <div class="card-body">
                        <div class="mb-2">
                            <div class="progress-label"><span>Marks Entered</span><span>${marksEntered}/${subjects.length}</span></div>
                            <div class="progress-bar"><div class="progress-fill ${marksEntered/subjects.length < 0.5 ? 'low' : marksEntered/subjects.length < 0.8 ? 'medium' : 'high'}" style="width:${subjects.length?Math.round(marksEntered/subjects.length*100):0}%"></div></div>
                        </div>
                        <div class="mb-2">
                            <div class="progress-label"><span>Verified</span><span>${verified}/${subjects.length}</span></div>
                            <div class="progress-bar"><div class="progress-fill high" style="width:${subjects.length?Math.round(verified/subjects.length*100):0}%"></div></div>
                        </div>
                        <div style="margin-top:1.5rem">
                            ${subjects.filter(s => !DataStore.areMarksEntered(s.id)).length > 0
                                ? `<p class="text-sm" style="color:var(--danger)">⚠️ ${subjects.filter(s => !DataStore.areMarksEntered(s.id)).length} subject(s) still pending mark entry</p>`
                                : '<p class="text-sm text-success">✅ All marks have been entered</p>'}
                        </div>
                    </div>
                </div>"""

new_card = """                <!-- Marks overview -->
                <div class="card">
                    <div class="card-header"><h3>Marks Overview</h3></div>
                    <div class="card-body" style="display:flex; align-items:center; gap:20px; flex-wrap:wrap;">
                        <div style="flex:1; min-width: 150px; max-width: 150px; margin: 0 auto;">
                            <canvas id="hod-dashboard-chart"></canvas>
                        </div>
                        <div style="flex:2; min-width: 200px;">
                            <div class="mb-2">
                                <div class="progress-label"><span>Marks Entered</span><span>${marksEntered}/${subjects.length}</span></div>
                                <div class="progress-bar"><div class="progress-fill ${marksEntered/subjects.length < 0.5 ? 'low' : marksEntered/subjects.length < 0.8 ? 'medium' : 'high'}" style="width:${subjects.length?Math.round(marksEntered/subjects.length*100):0}%"></div></div>
                            </div>
                            <div class="mb-2">
                                <div class="progress-label"><span>Verified</span><span>${verified}/${subjects.length}</span></div>
                                <div class="progress-bar"><div class="progress-fill high" style="width:${subjects.length?Math.round(verified/subjects.length*100):0}%"></div></div>
                            </div>
                            <div style="margin-top:1rem">
                                ${subjects.filter(s => !DataStore.areMarksEntered(s.id)).length > 0
                                    ? `<p class="text-sm" style="color:var(--danger)">⚠️ ${subjects.filter(s => !DataStore.areMarksEntered(s.id)).length} subject(s) still pending mark entry</p>`
                                    : '<p class="text-sm text-success">✅ All marks have been entered</p>'}
                            </div>
                        </div>
                    </div>
                </div>"""

content = content.replace(old_card, new_card)

# Insert setTimeout to initialize chart at the end of renderDashboard
old_listener = """        document.getElementById('hod-reset-btn').addEventListener('click', () => {
            if (confirm('⚠️ This will reset ALL data to defaults. Continue?')) {
                DataStore.reset();
                App.showToast('All data reset to defaults', 'info');
                renderDashboard(c);
            }
        });"""

new_listener = """        document.getElementById('hod-reset-btn').addEventListener('click', () => {
            if (confirm('⚠️ This will reset ALL data to defaults. Continue?')) {
                DataStore.reset();
                App.showToast('All data reset to defaults', 'info');
                renderDashboard(c);
            }
        });

        setTimeout(() => {
            const ctx = document.getElementById('hod-dashboard-chart');
            if (ctx) {
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Entered', 'Pending'],
                        datasets: [{
                            data: [marksEntered, subjects.length - marksEntered],
                            backgroundColor: ['#00796B', '#cf2c31'],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { display: false }
                        },
                        cutout: '70%'
                    }
                });
            }
        }, 100);"""

content = content.replace(old_listener, new_listener)

with open(r'c:\Users\srava\OneDrive\Desktop\OBE\static\js\hod.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("HOD dashboard chart added successfully!")
