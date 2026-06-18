let lastKey = '';
let lastTime = 0;

document.addEventListener('keydown', (e) => {
    const currentTime = new Date().getTime();
    const key = e.key.toLowerCase();

    // Check for sequence: G then [target]
    if (lastKey === 'g' && (currentTime - lastTime) < 1000) {
        switch (key) {
            case 'h': window.location.href = window.location.origin + '/index.html'; break;
            case 'c': window.location.href = window.location.origin + '/advanced/cheat_sheets/index.html'; break;
            case 'd': window.location.href = window.location.origin + '/dashboard/index.html'; break;
            case 's': window.location.href = window.location.origin + '/foundation/setup/index.html'; break;
            case 'f': window.location.href = window.location.origin + '/foundation/fields/index.html'; break;
            case 'o': window.location.href = window.location.origin + '/crud/index/index.html'; break;
            case 'p': window.location.href = window.location.origin + '/advanced/performance_profiling/index.html'; break;
        }
        e.preventDefault();
        lastKey = ''; // Reset
    } else {
        lastKey = key;
        lastTime = currentTime;
    }

    // Modal Help for shortcuts: Press '?'
    if (e.key === '?') {
        showShortcutsHelp();
    }
});

function showShortcutsHelp() {
    if (document.getElementById('shortcuts-help-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'shortcuts-help-modal';
    modal.style = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: #1e293b; color: white; padding: 2rem; border-radius: 12px;
        z-index: 20000; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
        font-family: 'Inter', sans-serif; min-width: 300px;
    `;
    modal.innerHTML = `
        <h3 style="margin-top:0; color: #818cf8;">Senior Pro Shortcuts</h3>
        <p style="font-size: 0.9rem; color: #94a3b8;">Press <strong>G</strong> then follow with:</p>
        <ul style="list-style: none; padding: 0;">
            <li style="margin-bottom: 0.5rem;"><code>H</code> &rarr; 🏠 Home</li>
            <li style="margin-bottom: 0.5rem;"><code>C</code> &rarr; 📜 Cheat Sheets</li>
            <li style="margin-bottom: 0.5rem;"><code>D</code> &rarr; 📊 Dashboard</li>
            <li style="margin-bottom: 0.5rem;"><code>O</code> &rarr; 🛠️ ORM Engine</li>
            <li style="margin-bottom: 0.5rem;"><code>P</code> &rarr; 🔬 Performance</li>
        </ul>
        <button onclick="this.parentElement.remove()" style="
            background: #334155; border: none; color: white; padding: 0.5rem 1rem;
            border-radius: 6px; cursor: pointer; width: 100%; margin-top: 1rem;
        ">Close</button>
    `;
    document.body.appendChild(modal);
}
