with open(r'c:\Users\srava\OneDrive\Desktop\OBE\static\css\styles.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Add inline-modal CSS rules to the end
inline_modal_css = """
/* ==================== INLINE MODAL STYLING ==================== */
.inline-modal {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
}

.inline-modal .modal-overlay {
    position: absolute;
    inset: 0;
    background: rgba(15, 23, 42, 0.5) !important;
    backdrop-filter: blur(4px) !important;
}

.inline-modal .modal-content {
    background: var(--bg-card);
    width: 100%;
    max-width: 480px;
    border-radius: 16px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
    z-index: 1010;
    position: relative;
    overflow: hidden;
    border-top: 5px solid var(--accent);
    animation: modalFadeIn 0.3s ease-out;
}

.inline-modal .modal-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.inline-modal .modal-header h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-main);
    font-family: var(--font-heading);
}

.inline-modal .modal-close {
    font-size: 1.5rem;
    color: var(--text-muted);
    cursor: pointer;
    background: none;
    border: none;
    transition: color 0.2s;
}

.inline-modal .modal-close:hover {
    color: var(--danger);
}

.inline-modal .modal-body {
    padding: 1.5rem;
}

.inline-modal .modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    background: var(--bg-main);
}

@keyframes modalFadeIn {
    from {
        opacity: 0;
        transform: translateY(15px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
"""

content += inline_modal_css

with open(r'c:\Users\srava\OneDrive\Desktop\OBE\static\css\styles.css', 'w', encoding='utf-8') as f:
    f.write(content)

print("inline-modal styles appended to styles.css successfully!")
