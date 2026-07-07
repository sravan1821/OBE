with open(r'c:\Users\srava\OneDrive\Desktop\OBE\static\js\management.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Verification Summary block
old_summary = """            <!-- Verification Summary -->
            <div class="stats-grid" style="grid-template-columns:repeat(3,1fr);">
                <div class="stat-card green">
                    <div class="stat-icon">✅</div>
                    <div class="stat-value">${verified}</div>
                    <div class="stat-label">Verified</div>
                </div>
                <div class="stat-card gold">
                    <div class="stat-icon">⏳</div>
                    <div class="stat-value">${pending}</div>
                    <div class="stat-label">Pending Verification</div>
                </div>
                <div class="stat-card" style="border-left:3px solid var(--danger)">
                    <div class="stat-icon">❌</div>
                    <div class="stat-value">${rejected}</div>
                    <div class="stat-label">Rejected</div>
                </div>
            </div>"""

new_summary = """            <div class="grid grid-2" style="margin-bottom:2rem;">
                <!-- Verification Status Chart -->
                <div class="card" style="margin-bottom:0;">
                    <div class="card-header"><h3>Verification Status</h3></div>
                    <div class="card-body" style="display:flex; align-items:center; justify-content:center; gap:20px; min-height:180px;">
                        <div style="flex:1; min-width: 130px; max-width: 130px; margin: 0 auto;">
                            <canvas id="mgmt-dashboard-chart"></canvas>
                        </div>
                        <div style="flex:1; font-size:0.95rem;">
                            <p style="margin-bottom:0.4rem;"><span style="display:inline-block; width:12px; height:12px; background:#10B981; margin-right:8px; border-radius:3px;"></span>Verified: <strong>${verified}</strong></p>
                            <p style="margin-bottom:0.4rem;"><span style="display:inline-block; width:12px; height:12px; background:#f59e0b; margin-right:8px; border-radius:3px;"></span>Pending: <strong>${pending}</strong></p>
                            <p><span style="display:inline-block; width:12px; height:12px; background:#cf2c31; margin-right:8px; border-radius:3px;"></span>Rejected: <strong>${rejected}</strong></p>
                        </div>
                    </div>
                </div>

                <!-- Stats summary card -->
                <div class="card" style="margin-bottom:0;">
                    <div class="card-header"><h3>Overview Performance</h3></div>
                    <div class="card-body" style="display:flex; flex-direction:column; justify-content:center; min-height:180px;">
                        <div class="progress-label" style="font-size:0.95rem;"><span>Total Subjects Processed</span><span>${marksEntered}/${subjects.length}</span></div>
                        <div class="progress-bar" style="margin-bottom:1rem; width:100%;"><div class="progress-fill high" style="width:${subjects.length?Math.round(marksEntered/subjects.length*100):0}%"></div></div>
                        
                        <div class="progress-label" style="font-size:0.95rem;"><span>Verification Progress</span><span>${verified}/${marksEntered||1}</span></div>
                        <div class="progress-bar" style="width:100%;"><div class="progress-fill green" style="width:${marksEntered?Math.round(verified/marksEntered*100):0}%"></div></div>
                    </div>
                </div>
            </div>"""

content = content.replace(old_summary, new_summary)

# Insert setTimeout to initialize chart at the end of renderDashboard
old_end = """        </div>`;
    }"""

new_end = """        </div>`;

        setTimeout(() => {
            const ctx = document.getElementById('mgmt-dashboard-chart');
            if (ctx) {
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Verified', 'Pending', 'Rejected'],
                        datasets: [{
                            data: [verified, pending, rejected],
                            backgroundColor: ['#10B981', '#f59e0b', '#cf2c31'],
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

with open(r'c:\Users\srava\OneDrive\Desktop\OBE\static\js\management.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Management dashboard chart added successfully!")
