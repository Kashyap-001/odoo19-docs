function sendFeedback(helpful) {
    const container = document.querySelector('.feedback-container');
    const label = helpful ? "Thank you for the positive feedback!" : "Sorry to hear that. We will work to improve this page.";
    
    container.innerHTML = `
        <div style="animation: fadeIn 0.5s ease;">
            <span style="font-size: 1.5rem;">✨</span><br>
            <strong style="color: var(--odoo-teal); display: block; margin-top: 10px;">${label}</strong>
            <p style="color: var(--theme-text-light); font-size: 0.8rem; margin-top: 10px;">We use your input to improve the Odoo 19 Masterclass.</p>
        </div>
    `;
    
    // Send event to Google Analytics
    if (typeof gtag === 'function') {
        gtag('event', 'helpful_vote', {
            'page_path': window.location.pathname,
            'is_helpful': helpful ? 'yes' : 'no'
        });
    }

    console.log("Feedback sent:", helpful, window.location.pathname);
}
