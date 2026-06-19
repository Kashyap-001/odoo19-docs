document.addEventListener('DOMContentLoaded', () => {
    updateDashboardProgress();
});

function updateDashboardProgress() {
    const tables = document.querySelectorAll('.md-typeset table');
    if (tables.length === 0) return;

    const getSlug = (href) => {
        if (!href) return '';
        let path = href;
        try {
            path = new URL(href, window.location.href).pathname;
        } catch (e) {}
        
        let cleanPath = path.split(/[?#]/)[0]
            .replace(/^\/|\/$/g, '')
            .replace(/\.html$/, '')
            .replace(/\.md$/, '')
            .replace(/\/index$/, '')
            .replace(/^index$/, '');
            
        const segments = cleanPath.split('/').filter(Boolean);
        if (segments.length >= 2) {
            return segments[segments.length - 2] + '/' + segments[segments.length - 1];
        }
        return segments[0] || '';
    };

    let completedCount = 0;
    let totalLessons = 0;

    tables.forEach(table => {
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
            const link = row.querySelector('a');
            const statusCell = row.querySelector('td:last-child');
            
            if (link && statusCell) {
                totalLessons++;
                const href = link.getAttribute('href');
                const slug = getSlug(href);
                
                const isComplete = localStorage.getItem('completed_' + slug) === 'true';
                
                if (isComplete) {
                    statusCell.innerHTML = '✅';
                    completedCount++;
                } else {
                    statusCell.innerHTML = '[ ]';
                }
            }
        });
    });

    const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    
    const progressBar = document.getElementById('global-progress-fill');
    const progressText = document.getElementById('global-progress-text');
    if (progressBar) progressBar.style.width = progressPercent + '%';
    if (progressText) progressText.innerText = 'Mastery: ' + progressPercent + '% (' + completedCount + '/' + totalLessons + ' Lessons)';

    const certBtn = document.getElementById('claim-certificate-btn');
    if (certBtn) {
        if (progressPercent === 100) {
            certBtn.disabled = false;
            certBtn.classList.add('active');
        } else {
            certBtn.disabled = true;
        }
    }
}

function generateCertificate() {
    const name = prompt("Enter your full name for the certificate:", "Odoo Architect");
    if (!name) return;

    const date = new Date().toLocaleDateString();
    const certHtml = `
        <div class="certificate-print-area">
            <div class="cert-header">CERTIFICATE OF COMPLETION</div>
            <div style="font-size: 24px; margin-bottom: 40px;">This acknowledges that</div>
            <div class="cert-recipient">${name}</div>
            <div style="font-size: 24px; margin-bottom: 40px;">has successfully completed the</div>
            <div style="font-size: 32px; font-weight: 700; color: var(--odoo-purple); margin-bottom: 60px;">ODOO 19 SENIOR MASTERCLASS</div>
            <div style="display: flex; justify-content: space-around; font-size: 18px;">
                <div style="border-top: 1px solid #334155; padding-top: 10px;">Date: ${date}</div>
                <div style="border-top: 1px solid #334155; padding-top: 10px;">Odoo 19 Masterclass Authority</div>
            </div>
            <div style="margin-top: 50px; font-size: 14px; color: #94a3b8;">Verification ID: O19M-${Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
        </div>
    `;

    const win = window.open('', '_blank');
    const extraCss = document.querySelector('link[href*="extra.css"]').href;
    win.document.write('<html><head><title>Odoo 19 Architect Certificate</title><link rel="stylesheet" href="' + extraCss + '"></head><body style="margin:0; display:flex; justify-content:center; align-items:center; background:#f1f5f9;">' + certHtml + '</body></html>');
    win.document.close();
    setTimeout(() => { win.print(); }, 1000);
}
