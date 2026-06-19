document.addEventListener('DOMContentLoaded', () => {
    updateDashboardProgress();
    initResumeButton();
});

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

function updateDashboardProgress() {
    const tables = document.querySelectorAll('.md-typeset table');
    if (tables.length === 0) return;

    const recalculateProgress = () => {
        let completedCount = 0;
        let totalLessons = 0;
        
        tables.forEach(table => {
            const rows = table.querySelectorAll('tr');
            rows.forEach(row => {
                const link = row.querySelector('a');
                const checkbox = row.querySelector('.progress-checkbox');
                if (link && checkbox) {
                    totalLessons++;
                    if (checkbox.checked) {
                        completedCount++;
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
                certBtn.classList.remove('active');
            }
        }
    };

    tables.forEach(table => {
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
            const link = row.querySelector('a');
            const statusCell = row.querySelector('td:last-child');
            
            if (link && statusCell) {
                if (statusCell.querySelector('.progress-checkbox')) return;
                
                const href = link.getAttribute('href');
                const slug = getSlug(href);
                const isComplete = localStorage.getItem('completed_' + slug) === 'true';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'progress-checkbox';
                checkbox.checked = isComplete;
                checkbox.style.cursor = 'pointer';
                checkbox.style.transform = 'scale(1.2)';
                checkbox.style.accentColor = 'var(--odoo-purple)';
                
                checkbox.addEventListener('change', () => {
                    if (checkbox.checked) {
                        localStorage.setItem('completed_' + slug, 'true');
                    } else {
                        localStorage.removeItem('completed_' + slug);
                    }
                    recalculateProgress();
                });
                
                statusCell.innerHTML = '';
                statusCell.style.textAlign = 'center';
                statusCell.appendChild(checkbox);
            }
        });
    });

    recalculateProgress();
}

function initResumeButton() {
    const resumeContainer = document.getElementById('resume-container');
    const resumeLink = document.getElementById('resume-link');
    if (!resumeContainer || !resumeLink) return;

    const lessons = [
        'foundation/architecture', 'foundation/setup', 'foundation/models',
        'foundation/fields_basic', 'foundation/fields_relational', 'foundation/fields_advanced',
        'foundation/data_files', 'business/security', 'foundation/views_list',
        'foundation/views_form', 'foundation/views_kanban', 'business/inheritance',
        'foundation/xpath', 'business/rules', 'env/context', 'crud/index',
        'crud/create', 'crud/read', 'crud/write', 'crud/search_fetch',
        'advanced/decorators', 'wizards/wizards', 'business/actions', 'search/search',
        'search/performance_optimization', 'frontend/owl', 'advanced_owl/store',
        'advanced_owl/patching', 'frontend/reports', 'testing/unit_tests', 'testing/tours',
        'advanced/ui_display', 'multi_company/logic', 'multi_company/website',
        'integration/controllers', 'integration/api', 'integration/performance',
        'deployment/docker', 'deployment/scaling', 'migration/scripts',
        'advanced/performance_profiling', 'advanced/senior_toolkit',
        'advanced/debugging_vault', 'migration/cheat_sheet'
    ];

    let nextLesson = null;
    let started = false;

    for (const slug of lessons) {
        const isComplete = localStorage.getItem('completed_' + slug) === 'true';
        if (isComplete) {
            started = true;
        } else if (!nextLesson) {
            nextLesson = slug;
        }
    }

    if (started && nextLesson) {
        let pathPrefix = '/';
        const pathname = window.location.pathname;
        const categories = ['foundation', 'business', 'crud', 'env', 'search', 'advanced', 'wizards', 'frontend', 'advanced_owl', 'multi_company', 'integration', 'testing', 'deployment', 'migration', 'about'];
        for (const cat of categories) {
            const idx = pathname.indexOf('/' + cat + '/');
            if (idx !== -1) {
                pathPrefix = pathname.substring(0, idx + 1);
                break;
            }
        }
        if (pathname.includes('/dashboard/')) {
            pathPrefix = pathname.substring(0, pathname.indexOf('/dashboard/') + 1);
        }
        
        resumeLink.href = pathPrefix + nextLesson + '/';
        resumeContainer.style.display = 'block';
    }
}

function exportProgress() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('completed_')) {
            data[key] = localStorage.getItem(key);
        }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `odoo19_masterclass_progress_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importProgress(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            let count = 0;
            for (const key in data) {
                if (key.startsWith('completed_')) {
                    localStorage.setItem(key, data[key]);
                    count++;
                }
            }
            alert(`Successfully imported progress backup! Restored ${count} lessons.`);
            updateDashboardProgress();
            window.location.reload();
        } catch (err) {
            alert('Error parsing backup file. Please make sure it is a valid progress JSON file.');
        }
    };
    reader.readAsText(file);
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
