// Load FAQ data
fetch('data/faq.json')
    .then(response => response.json())
    .then(data => {
        const faqContainer = document.getElementById('faqContainer');
        data.faqs.forEach(faq => {
            const faqItem = document.createElement('div');
            faqItem.className = 'col-md-8 faq-item';
            faqItem.innerHTML = `
                <div class="faq-question" onclick="toggleAnswer(this)">
                    <h4>${faq.question}</h4>
                </div>
                <div class="faq-answer">
                    <p>${faq.answer}</p>
                </div>
            `;
            faqContainer.appendChild(faqItem);
        });
    });

// Toggle FAQ answers
function toggleAnswer(element) {
    const answer = element.nextElementSibling;
    const isVisible = answer.style.display === 'block';
    answer.style.display = isVisible ? 'none' : 'block';
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = target.offsetTop - navHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});