document.addEventListener("DOMContentLoaded", function() {
    // Create the progress bar element
    const progressBar = document.createElement("div");
    progressBar.id = "read-progress-bar";
    document.body.prepend(progressBar);

    // Update the width of the progress bar on scroll
    window.addEventListener("scroll", function() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        
        // Prevent division by zero on very short pages
        if (scrollHeight <= 0) {
            progressBar.style.width = "0%";
            return;
        }
        
        const progress = (scrollTop / scrollHeight) * 100;
        progressBar.style.width = progress + "%";
    });
});