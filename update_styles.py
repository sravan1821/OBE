with open(r'c:\Users\srava\OneDrive\Desktop\OBE\static\css\styles.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the :root variables definition to use the multi-theme structure
root_pattern = """:root {
    /* Core Brand Colors */
    --primary: #172f41; /* Deep Blue Sidebar */
    --primary-light: #21425c;
    --accent: #2da5eb; /* Blue accents */
    --accent-hover: #1b8cd1;
    --danger: #cf2c31; /* Red accents */
    --success: #10B981;
    --warning: #F59E0B;
    
    /* Backgrounds & Surfaces */
    --bg-main: #F4F7FE; /* Soft light background for dashboard */
    --bg-card: #ffffff;
    --border-color: #E2E8F0;
    
    /* Text */
    --text-main: #1E293B;
    --text-muted: #64748B;
    --text-light: #F8FAFC;
    
    /* Layout */
    --sidebar-width: 260px;
    --header-height: 70px;
    
    /* Fonts */
    --font-sans: 'Inter', system-ui, sans-serif;
    --font-heading: 'Outfit', sans-serif;
    
    /* Shadows */
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.05);
    --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
    --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.05);
}"""

theme_styles = """:root {
    /* Constant Colors */
    --danger: #cf2c31;
    --success: #10B981;
    --warning: #F59E0B;
    
    /* Layout constants */
    --sidebar-width: 260px;
    --header-height: 70px;
    
    /* Fonts */
    --font-sans: 'Inter', system-ui, sans-serif;
    --font-heading: 'Outfit', sans-serif;
    
    /* Shadows */
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.05);
    --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
    --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.05);

    /* Default Theme (Deep Blue) variables */
    --primary: #0F2D4A;
    --primary-light: #1A3E62;
    --accent: #2da5eb;
    --accent-hover: #1b8cd1;
    --header-bg: #1D5F9F;
    --header-text: #ffffff;
    --bg-main: #F4F7FE;
    --bg-card: #ffffff;
    --border-color: #E2E8F0;
    --text-main: #1E293B;
    --text-muted: #64748B;
    --text-light: #F8FAFC;
}

/* ============================================================
   THEME DEFINITIONS (Matching College Marks UI Themes Image)
   ============================================================ */

body.theme-deep-blue {
    --primary: #0F2D4A;
    --primary-light: #1A3E62;
    --accent: #2da5eb;
    --accent-hover: #1b8cd1;
    --header-bg: #1D5F9F;
    --header-text: #ffffff;
    --bg-main: #F4F7FE;
    --bg-card: #ffffff;
    --border-color: #E2E8F0;
    --text-main: #1E293B;
    --text-muted: #64748B;
}

body.theme-green-academic {
    --primary: #143324;
    --primary-light: #1E4633;
    --accent: #2E7D32;
    --accent-hover: #1B5E20;
    --header-bg: #2E7D32;
    --header-text: #ffffff;
    --bg-main: #F4F9F5;
    --bg-card: #ffffff;
    --border-color: #E2E8F0;
    --text-main: #1E293B;
    --text-muted: #64748B;
}

body.theme-purple {
    --primary: #1E152A;
    --primary-light: #2C203B;
    --accent: #5E35B1;
    --accent-hover: #4527A0;
    --header-bg: #5E35B1;
    --header-text: #ffffff;
    --bg-main: #F5F2F9;
    --bg-card: #ffffff;
    --border-color: #E2E8F0;
    --text-main: #1E293B;
    --text-muted: #64748B;
}

body.theme-orange {
    --primary: #2D1F18;
    --primary-light: #3D2D24;
    --accent: #D84315;
    --accent-hover: #BF360C;
    --header-bg: #D84315;
    --header-text: #ffffff;
    --bg-main: #FAF6F2;
    --bg-card: #ffffff;
    --border-color: #E2E8F0;
    --text-main: #1E293B;
    --text-muted: #64748B;
}

body.theme-teal {
    --primary: #00332C;
    --primary-light: #00463D;
    --accent: #00796B;
    --accent-hover: #004D40;
    --header-bg: #00796B;
    --header-text: #ffffff;
    --bg-main: #F2F9F8;
    --bg-card: #ffffff;
    --border-color: #E2E8F0;
    --text-main: #1E293B;
    --text-muted: #64748B;
}

body.theme-dark-slate {
    --primary: #121212;
    --primary-light: #1E1E1E;
    --accent: #38bdf8;
    --accent-hover: #0ea5e9;
    --header-bg: #1E1E1E;
    --header-text: #ffffff;
    --bg-main: #0F172A;
    --bg-card: #1E293B;
    --border-color: #334155;
    --text-main: #F1F5F9;
    --text-muted: #94A3B8;
}"""

content = content.replace(root_pattern, theme_styles)

# Update topbar classes to use header background variables
old_topbar = """.topbar {
    height: var(--header-height);
    background: var(--bg-card);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 2rem;
    box-shadow: var(--shadow-sm);
    z-index: 10;
}
.topbar-title { font-size: 1.25rem; font-weight: 700; color: var(--text-main); }
.topbar-right { display: flex; align-items: center; gap: 1.5rem; }"""

new_topbar = """.topbar {
    height: var(--header-height);
    background: var(--header-bg);
    color: var(--header-text);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 2rem;
    box-shadow: var(--shadow-sm);
    z-index: 10;
}
.topbar-title { font-size: 1.25rem; font-weight: 700; color: var(--header-text); }
.topbar-right { display: flex; align-items: center; gap: 1.5rem; color: var(--header-text); }
.user-role { font-size: 0.75rem; color: rgba(255,255,255,0.7) !important; text-transform: uppercase; letter-spacing: 0.5px; }"""

content = content.replace(old_topbar, new_topbar)

with open(r'c:\Users\srava\OneDrive\Desktop\OBE\static\css\styles.css', 'w', encoding='utf-8') as f:
    f.write(content)

print("Theme styles successfully written to styles.css!")
