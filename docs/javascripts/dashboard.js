document.addEventListener('DOMContentLoaded', () => {
    updateDashboardProgress();
});

function updateDashboardProgress() {
    const table = document.querySelector('.md-typeset table');
    if (!table) return;

    const rows = table.querySelectorAll('tr');
    let completedCount = 0;
    let totalLessons = 0;

    rows.forEach(row => {
        const link = row.querySelector('a');
        const statusCell = row.querySelector('td:last-child');
        
        if (link && statusCell) {
            totalLessons++;
            const href = link.getAttribute('href');
            
            // Search localStorage for any key containing this lesson's slug
            const slug = href.replace('../', '').replace('.md', '').replace('index', '');
            let isComplete = false;
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('completed_') && key.includes(slug)) {
                    isComplete = true;
                    break;
                }
            }
            
            if (isComplete) {
                statusCell.innerHTML = '✅';
                completedCount++;
            } else {
                statusCell.innerHTML = '[ ]';
            }
        }
    });

    const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    
    // Update Progress Bar
    const progressBar = document.getElementById('global-progress-fill');
    const progressText = document.getElementById('global-progress-text');
    if (progressBar) progressBar.style.width = progressPercent + '%';
    if (progressText) progressText.innerText = `Mastery: ${progressPercent}% (${completedCount}/${totalLessons} Lessons)`;

    // Handle Certificate Button
    const certBtn = document.getElementById('claim-certificate-btn');
    if (certBtn) {
        if (progressPercent === 100) {
            certBtn.disabled = false;
            certBtn.classList.add('active');
        } else {
            certBtn.disabled = true;
            certBtn.title = "Complete 100% of the course to unlock your certificate!";
        }
    }
}

function generateCertificate() {
    const name = prompt("Enter your full name for the certificate:", "Odoo Architect");
    if (!name) return;

    const date = new Date().toLocaleDateString();
    const certHtml = `
        <div id="certificate-print-area" style="width: 800px; height: 600px; padding: 50px; border: 20px solid #3f51b5; background: white; font-family: 'Inter', sans-serif; text-align: center; color: #1e293b;">
            <div style="font-size: 50px; font-weight: 800; color: #3f51b5; margin-bottom: 20px;">CERTIFICATE OF COMPLETION</div>
            <div style="font-size: 24px; margin-bottom: 40px;">This acknowledges that</div>
            <div style="font-size: 40px; font-weight: 700; border-bottom: 2px solid #3f51b5; display: inline-block; margin-bottom: 40px; padding: 0 40px;">${name}</div>
            <div style="font-size: 24px; margin-bottom: 40px;">has successfully completed the</div>
            <div style="font-size: 32px; font-weight: 700; color: #3f51b5; margin-bottom: 60px;">ODOO 19 SENIOR MASTERCLASS</div>
            <div style="display: flex; justify-content: space-around; font-size: 18px;">
                <div>
                    <div style="border-top: 1px solid #334155; padding-top: 10px;">Date: ${date}</div>
                </div>
                <div>
                    <div style="border-top: 1px solid #334155; padding-top: 10px;">Odoo 19 Masterclass Authority</div>
                </div>
            </div>
            <div style="margin-top: 50px; font-size: 14px; color: #94a3b8;">Verification ID: O19M-${Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
        </div>
    `;

    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Odoo 19 Architect Certificate</title></head><body style="margin:0; display:flex; justify-content:center; align-items:center; background:#f1f5f9;">${certHtml}</body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); }, 500);
}

function copyBlueprint() {
    const manifest = `{
    'name': 'Auction Marketplace',
    'version': '1.0',
    'category': 'Sales',
    'summary': 'Manage real-time auctions',
    'description': 'A professional marketplace-style auction module for Odoo 19.',
    'author': 'Your Name',
    'depends': ['base', 'product', 'mail'],
    'data': [
        'security/ir.model.access.csv',
        'security/auction_security.xml',
        'data/cron.xml',
        'views/auction_menus.xml',
        'views/auction_listing_views.xml',
        'views/auction_bid_views.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'pways_auction/static/src/components/**/*'
        ],
    },
    'installable': True,
    'application': True,
    'license': 'LGPL-3',
}`;
    navigator.clipboard.writeText(manifest).then(() => {
        alert("Odoo 19 Manifest Blueprint copied to clipboard!");
    });
}
