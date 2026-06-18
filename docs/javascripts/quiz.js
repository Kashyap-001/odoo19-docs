function checkQuiz(button) {
    const container = button.closest('.quiz-container');
    const input = container.querySelector('.quiz-input');
    const result = container.querySelector('.quiz-result');
    const expected = button.getAttribute('data-answer').trim().toLowerCase();
    const actual = input.value.trim().toLowerCase();

    // Check if the answer is a technical term (short) or a sentence
    // For long answers, we'll allow a bit more flexibility or provide a 'Show' option
    if (actual === expected) {
        result.innerHTML = '<span style="color: #27ae60; font-weight: bold;">✅ Correct! Well done.</span>';
        result.className = 'quiz-result success';
        input.style.borderColor = '#27ae60';
    } else {
        result.innerHTML = `<span style="color: #e74c3c; font-weight: bold;">❌ Incorrect.</span> The correct answer is: <code style="background: #f8f9fa; padding: 2px 4px; border-radius: 4px;">${button.getAttribute('data-answer')}</code>`;
        result.className = 'quiz-result error';
        input.style.borderColor = '#e74c3c';
    }
    result.style.display = 'block';
    checkPageCompletion();
}

function checkCodeChallenge(button) {
    const container = button.closest('.code-challenge');
    const inputs = container.querySelectorAll('.quiz-input-inline');
    const result = container.querySelector('.quiz-result');
    let allCorrect = true;
    let feedback = [];

    inputs.forEach((input, index) => {
        const expected = input.getAttribute('data-answer').trim();
        const actual = input.value.trim();
        
        if (actual === expected) {
            input.style.backgroundColor = 'rgba(39, 174, 96, 0.2)';
            input.style.borderColor = '#27ae60';
        } else {
            input.style.backgroundColor = 'rgba(231, 76, 60, 0.2)';
            input.style.borderColor = '#e74c3c';
            allCorrect = false;
            feedback.push(`Slot ${index + 1} should be: <code>${expected}</code>`);
        }
    });

    if (allCorrect) {
        result.innerHTML = '<span style="color: #27ae60; font-weight: bold;">✅ Perfect! The code is correct.</span>';
        result.className = 'quiz-result success';
    } else {
        result.innerHTML = `<span style="color: #e74c3c; font-weight: bold;">❌ Some parts are incorrect.</span><br>${feedback.join('<br>')}`;
        result.className = 'quiz-result error';
    }
    result.style.display = 'block';
    checkPageCompletion();
}

// --- Gamification Logic ---

function checkPageCompletion() {
    const totalQuizzes = document.querySelectorAll('.quiz-container, .code-challenge').length;
    const correctQuizzes = document.querySelectorAll('.quiz-result.success').length;

    if (totalQuizzes > 0 && totalQuizzes === correctQuizzes) {
        const pagePath = window.location.pathname;
        localStorage.setItem(`completed_${pagePath}`, 'true');
        markSidebarAsComplete(pagePath);
    }
}

function markSidebarAsComplete(path) {
    // MkDocs Material navigation uses links. We find the one matching current path.
    const links = document.querySelectorAll('.md-nav__link');
    links.forEach(link => {
        if (link.getAttribute('href') && (link.getAttribute('href').includes(path) || path.includes(link.getAttribute('href')))) {
            if (!link.querySelector('.completion-check')) {
                const check = document.createElement('span');
                check.className = 'completion-check';
                check.innerHTML = ' ✅';
                check.style.fontSize = '0.8rem';
                link.appendChild(check);
            }
        }
    });
}

// Add event listener for "Enter" key on inputs and initial load
document.addEventListener('DOMContentLoaded', () => {
    // Restore completion marks in sidebar
    const links = document.querySelectorAll('.md-nav__link');
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && localStorage.getItem(`completed_${href}`)) {
            if (!link.querySelector('.completion-check')) {
                const check = document.createElement('span');
                check.className = 'completion-check';
                check.innerHTML = ' ✅';
                check.style.fontSize = '0.8rem';
                link.appendChild(check);
            }
        }
    });

    document.querySelectorAll('.quiz-input, .quiz-input-inline').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const container = input.closest('.quiz-container, .code-challenge');
                const button = container.querySelector('.quiz-check');
                if (button) {
                    if (container.classList.contains('code-challenge')) {
                        checkCodeChallenge(button);
                    } else {
                        checkQuiz(button);
                    }
                }
            }
        });
    });
});
