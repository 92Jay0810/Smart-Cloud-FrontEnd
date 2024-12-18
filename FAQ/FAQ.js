const faqItems = document.querySelectorAll('.faq');

faqItems.forEach(item => {
    const question = item.querySelector('.question');
    const answer = item.querySelector('.answer');
    const toggle = item.querySelector('.faq-toggle');

    question.addEventListener('click', () => {
        answer.classList.toggle('open');
        toggle.textContent = toggle.textContent === '+' ? '-' : '+';
        answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
    });
});
