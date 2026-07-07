with open(r'c:\Users\srava\OneDrive\Desktop\OBE\static\js\faculty.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace My Subjects card start to inject grid
old_block = """            <div class="card">
                <div class="card-header"><h2>My Subjects</h2></div>"""

new_block = """            <div class="grid grid-2" style="margin-bottom:2rem;">
                <!-- Marks Entry Donut Chart -->
                <div class="card" style="margin-bottom:0;">
                    <div class="card-header"><h3>Marks Entry Status</h3></div>
                    <div class="card-body" style="display:flex; align-items:center; justify-content:center; gap:20px; min-height:180px;">
                        <div style="flex:1; min-width: 130px; max-width: 130px; margin: 0 auto;">
                            <canvas id="fac-dashboard-chart"></canvas>
                        </div>
                        <div style="flex:1; font-size:0.95rem;">
                            <p style="margin-bottom:0.5rem;"><span style="display:inline-block; width:12px; height:12px; background:#1E73BE; margin-right:8px; border-radius:3px;"></span>Entered: <strong>${marksEntered}</strong></p>
                            <p><span style="display:inline-block; width:12px; height:12px; background:#cf2c31; margin-right:8px; border-radius:3px;"></span>Pending: <strong>${subjects.length - marksEntered}</strong></p>
                        </div>
                    </div>
                </div>

                <!-- Syllabus completion average -->
                <div class="card" style="margin-bottom:0;">
                    <div class="card-header"><h3>Syllabus Progress</h3></div>
                    <div class="card-body" style="display:flex; flex-direction:column; justify-content:center; min-height:180px;">
                        <h2 style="font-size:3rem; color:var(--accent); text-align:center; margin-bottom:10px;">
                            ${(() => {
                                let totalUnits = 0, completedUnits = 0;
                                subjects.forEach(s => {
                                    const units = DataStore.getSyllabusUnitsBySubject(s.id);
                                    totalUnits += units.length;
                                    completedUnits += units.filter(u => u.isCompleted).length;
                                });
                                return totalUnits ? Math.round((completedUnits/totalUnits)*100) : 0;
                            })()}%
                        </h2>
                        <p class="text-muted" style="text-align:center; font-size:0.85rem;">Average syllabus progress across your subjects</p>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header"><h2>My Subjects</h2></div>"""

content = content.replace(old_block, new_block)

# Insert setTimeout loader at the end of renderDashboard
old_end = """        </div>`;
    }"""

new_end = """        </div>`;

        setTimeout(() => {
            const ctx = document.getElementById('fac-dashboard-chart');
            if (ctx) {
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Entered', 'Pending'],
                        datasets: [{
                            data: [marksEntered, subjects.length - marksEntered],
                            backgroundColor: ['#1e73be', '#cf2c31'],
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
        }, 100);
    }"""

content = content.replace(old_end, new_end)

with open(r'c:\Users\srava\OneDrive\Desktop\OBE\static\js\faculty.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Faculty dashboard chart added successfully!")
