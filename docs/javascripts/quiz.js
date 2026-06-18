function checkQuiz(button) {
    const container = button.closest('.quiz-container');
    const input = container.querySelector('.quiz-input');
    const result = container.querySelector('.quiz-result');
    const expected = button.getAttribute('data-answer').trim().toLowerCase();
    const actual = input.value.trim().toLowerCase();

    if (actual === expected) {
        result.innerHTML = '<span class="quiz-result-success">✅ Correct! Well done.</span>';
        result.className = 'quiz-result success';
        input.style.borderColor = 'var(--md-typeset-color)';
    } else {
        result.innerHTML = '<span class="quiz-result-error">❌ Incorrect.</span> The correct answer is: <code class="quiz-code-hint">' + button.getAttribute('data-answer') + '</code>';
        result.className = 'quiz-result error';
        input.style.borderColor = 'var(--md-accent-fg-color)';
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
            input.style.backgroundColor = 'transparent';
            input.style.borderColor = 'var(--md-typeset-color)';
        } else {
            input.style.backgroundColor = 'rgba(231, 76, 60, 0.1)';
            input.style.borderColor = 'var(--md-accent-fg-color)';
            allCorrect = false;
            feedback.push('Slot ' + (index + 1) + ' should be: <code>' + expected + '</code>');
        }
    });

    if (allCorrect) {
        result.innerHTML = '<span class="quiz-result-success">✅ Perfect! The code is correct.</span>';
        result.className = 'quiz-result success';
    } else {
        result.innerHTML = '<span class="quiz-result-error">❌ Some parts are incorrect.</span><br>' + feedback.join('<br>');
        result.className = 'quiz-result error';
    }
    result.style.display = 'block';
    checkPageCompletion();
}

function checkPageCompletion() {
    const totalQuizzes = document.querySelectorAll('.quiz-container, .code-challenge').length;
    const correctQuizzes = document.querySelectorAll('.quiz-result.success').length;

    if (totalQuizzes > 0 && totalQuizzes === correctQuizzes) {
        const getSlug = (path) => {
            if (!path) return '';
            return path.split(/[?#]/)[0]
                .replace(/^\/|\/$/g, '')
                .replace(/\.html$/, '')
                .replace(/\.md$/, '')
                .replace(/\/index$/, '')
                .replace(/^index$/, '');
        };
        const slug = getSlug(window.location.pathname);
        localStorage.setItem('completed_' + slug, 'true');
        markSidebarAsComplete(window.location.pathname);
    }
}

function markSidebarAsComplete(path) {
    const getSlug = (p) => {
        if (!p) return '';
        return p.split(/[?#]/)[0]
            .replace(/^\/|\/$/g, '')
            .replace(/\.html$/, '')
            .replace(/\.md$/, '')
            .replace(/\/index$/, '')
            .replace(/^index$/, '');
    };
    const currentSlug = getSlug(path);
    const links = document.querySelectorAll('.md-nav__link');
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && getSlug(href) === currentSlug) {
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

document.addEventListener('DOMContentLoaded', () => {
    const getSlug = (p) => {
        if (!p) return '';
        return p.split(/[?#]/)[0]
            .replace(/^\/|\/$/g, '')
            .replace(/\.html$/, '')
            .replace(/\.md$/, '')
            .replace(/\/index$/, '')
            .replace(/^index$/, '');
    };
    const links = document.querySelectorAll('.md-nav__link');
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && localStorage.getItem('completed_' + getSlug(href))) {
            if (!link.querySelector('.completion-check')) {
                const check = document.createElement('span');
                check.className = 'completion-check';
                check.innerHTML = ' ✅';
                check.style.fontSize = '0.8rem';
                link.appendChild(check);
            }
        }
    });
...
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
