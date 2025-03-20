// Add this to your existing script.js
// document.querySelectorAll('.faq-question').forEach(question => {
//     question.addEventListener('click', () => {
//         const item = question.parentElement;
//         item.classList.toggle('active');
//         question.querySelector('.toggle').textContent = 
//             item.classList.contains('active') ? '-' : '+';
//     });
// });

// Load FAQ data
async function loadFAQ() {
    try {
        // const response = await fetch('faq.json');
        const response = await fetch('./data/faq.json');

        // Check if the response is successful
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const faqContainer = document.getElementById('faqContainer');
        
        data.faqs.forEach(faq => {
            const faqItem = document.createElement('div');
            faqItem.className = 'faq-item';
            faqItem.innerHTML = `
                <div class="faq-question">
                    ${faq.question}
                    <span class="toggle">+</span>
                </div>
                <div class="faq-answer">
                    ${faq.answer}
                </div>
            `;
            faqContainer.appendChild(faqItem);
        });

         document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', () => {
                const item = question.parentElement;
                item.classList.toggle('active');
                question.querySelector('.toggle').textContent = 
                    item.classList.contains('active') ? '-' : '+';
            });
        });
    } catch (error) {
        console.error('Error loading FAQ:', error);
    }
}

// Call loadFAQ when the document is loaded
document.addEventListener('DOMContentLoaded', loadFAQ);