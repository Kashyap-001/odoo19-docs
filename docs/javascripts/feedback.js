function sendFeedback(isHelpful) {
    const container = document.querySelector('.feedback-container');
    const pagePath = window.location.pathname;
    
    // Save to localStorage (simulate sending to server)
    localStorage.setItem(`feedback_${pagePath}`, isHelpful ? 'positive' : 'negative');
    
    container.innerHTML = `
        <div class="feedback-thanks">
            <span style="font-size: 1.5rem;">✨</span><br>
            <strong>Thank you for your feedback!</strong><br>
            <span style="color: var(--academy-muted); font-size: 0.8rem;">We use your input to improve the Odoo 19 Masterclass.</span>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    const pagePath = window.location.pathname;
    if (localStorage.getItem(`feedback_${pagePath}`)) {
        const container = document.querySelector('.feedback-container');
        if (container) {
            container.innerHTML = `<div class="feedback-thanks">You've already provided feedback for this page. Thank you!</div>`;
        }
    }
});
