document.addEventListener('keydown', (e) => {
    // Only trigger if no input/textarea is focused
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

    if (e.key === 'h') {
        window.location.href = '/';
    } else if (e.key === 'd') {
        window.location.href = '/dashboard/';
    } else if (e.key === 's') {
        const searchInput = document.querySelector('.md-search__input');
        if (searchInput) searchInput.focus();
    } else if (e.key === '?') {
        showShortcutsHelp();
    }
});

function showShortcutsHelp() {
    const help = document.createElement('div');
    help.id = 'shortcuts-overlay';
    help.style.position = 'fixed';
    help.style.top = '50%';
    help.style.left = '50%';
    help.style.transform = 'translate(-50%, -50%)';
    help.style.backgroundColor = 'var(--theme-content-bg)';
    help.style.padding = '2rem';
    help.style.borderRadius = '12px';
    help.style.boxShadow = '0 20px 50px rgba(0,0,0,0.5)';
    help.style.zIndex = '10000';
    help.style.border = '2px solid var(--odoo-purple)';
    help.style.color = 'var(--theme-text)';
    help.style.maxWidth = '90%';

    help.innerHTML = `
        <h3 style="margin-top:0; color: var(--odoo-teal);">Senior Pro Shortcuts</h3>
        <p style="font-size: 0.9rem; color: var(--theme-text-light);">Master the Odoo 19 Masterclass UI with these keys:</p>
        <ul style="list-style: none; padding: 0;">
            <li style="margin-bottom: 0.5rem;"><strong>H</strong> - Go to Home</li>
            <li style="margin-bottom: 0.5rem;"><strong>D</strong> - Go to Dashboard</li>
            <li style="margin-bottom: 0.5rem;"><strong>S</strong> - Focus Search</li>
            <li style="margin-bottom: 0.5rem;"><strong>?</strong> - Show this help</li>
        </ul>
        <button onclick="this.parentElement.remove()" style="margin-top: 1rem; background: var(--odoo-purple); color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; width: 100%;">Close</button>
    `;
    document.body.appendChild(help);

    // Close on escape
    const closeOnEsc = (e) => {
        if (e.key === 'Escape') {
            help.remove();
            document.removeEventListener('keydown', closeOnEsc);
        }
    };
    document.addEventListener('keydown', closeOnEsc);
}
