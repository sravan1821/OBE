with open(r'c:\Users\srava\OneDrive\Desktop\OBE\static\js\coordinator.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Quick Subject Overview grid start
old_block = """            <!-- Quick Subject Overview -->
            <div class="card">
                <div class="card-header"><h2>Subject Overview</h2></div>"""

new_block = """            <div class="grid grid-2" style="margin-bottom:2rem;">
                <!-- Subject Submission Chart -->
                <div class="card" style="margin-bottom:0;">
                    <div class="card-header"><h3>Submission Status</h3></div>
                    <div class="card-body" style="display:flex; align-items:center; justify-content:center; gap:20px; min-height:200px;">
                        <div style="flex:1; min-width: 140px; max-width: 140px; margin: 0 auto;">
                            <canvas id="coord-dashboard-chart"></canvas>
                        </div>
                        <div style="flex:1; font-size:0.95rem;">
                            <p style="margin-bottom:0.5rem;"><span style="display:inline-block; width:12px; height:12px; background:#5E35B1; margin-right:8px; border-radius:3px;"></span>Entered: <strong>${entered}</strong></p>
                            <p><span style="display:inline-block; width:12px; height:12px; background:#cf2c31; margin-right:8px; border-radius:3px;"></span>Pending: <strong>${notEntered}</strong></p>
                        </div>
                    </div>
                </div>

                <!-- Syllabus Completion Card -->
                <div class="card" style="margin-bottom:0;">
                    <div class="card-header"><h3>Average Syllabus Progress</h3></div>
                    <div class="card-body" style="display:flex; flex-direction:column; justify-content:center; min-height:200px;">
                        <h2 style="font-size:3rem; color:var(--accent); text-align:center; margin-bottom:10px;">${avgCompletion}%</h2>
                        <div class="progress-bar" style="max-width:300px; margin:0 auto; width:100%;"><div class="progress-fill high" style="width:${avgCompletion}%"></div></div>
                        <p class="text-muted" style="text-align:center; font-size:0.85rem; margin-top:10px;">Across all syllabus units</p>
                    </div>
                </div>
            </div>

            <!-- Quick Subject Overview -->
            <div class="card">
                <div class="card-header"><h2>Subject Overview</h2></div>"""

content = content.replace(old_block, new_block)

# Insert Chart.js setTimeout loader at end of renderDashboard
old_end = """        </div>`;
    }"""

new_end = """        </div>`;

        setTimeout(() => {
            const ctx = document.getElementById('coord-dashboard-chart');
            if (ctx) {
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Entered', 'Pending'],
                        datasets: [{
                            data: [entered, notEntered],
                            backgroundColor: ['#5E35B1', '#cf2c31'],
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

with open(r'c:\Users\srava\OneDrive\Desktop\OBE\static\js\coordinator.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Coordinator dashboard chart added successfully!")
