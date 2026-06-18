document.addEventListener("DOMContentLoaded", function() {
    // Create the progress bar element
    const progressBar = document.createElement("div");
    progressBar.id = "read-progress-bar";
    document.body.prepend(progressBar);

    const getSlug = (path) => {
        if (!path) return '';
        return path.split(/[?#]/)[0]
            .replace(/^\/|\/$/g, '')
            .replace(/\.html$/, '')
            .replace(/\.md$/, '')
            .replace(/\/index$/, '')
            .replace(/^index$/, '');
    };

    const currentSlug = getSlug(window.location.pathname);

    // Update the width of the progress bar on scroll
    window.addEventListener("scroll", function() {
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
    });
});