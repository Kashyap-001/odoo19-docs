document.addEventListener("DOMContentLoaded", function() {
    // Create the progress bar element
    const progressBar = document.createElement("div");
    progressBar.id = "read-progress-bar";
    document.body.prepend(progressBar);

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

    const currentSlug = getSlug(window.location.pathname);

    const checkProgress = () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        
        // Prevent division by zero on very short pages
        if (scrollHeight <= 0) {
            progressBar.style.width = "100%";
            // Mark very short pages as complete immediately
            if (currentSlug && currentSlug !== 'dashboard') {
                localStorage.setItem('completed_' + currentSlug, 'true');
            }
            return;
        }
        
        const progress = (scrollTop / scrollHeight) * 100;
        progressBar.style.width = progress + "%";

        // Mark page as complete if scrolled past 95%
        if (progress > 95 && currentSlug && currentSlug !== 'dashboard') {
            localStorage.setItem('completed_' + currentSlug, 'true');
        }
    };

    // Run immediately on page load in case scroll is already at bottom or page is very short
    checkProgress();

    // Run on scroll and resize
    window.addEventListener("scroll", checkProgress);
    window.addEventListener("resize", checkProgress);
});