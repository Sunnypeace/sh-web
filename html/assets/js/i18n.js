let currentLang = localStorage.getItem('preferred-language') || 'hk';
let translations = {};

async function loadTranslations(lang) {
    try {
        const response = await fetch(`lang/${lang}.json`);
        translations[lang] = await response.json();
        return translations[lang];
    } catch (error) {
        console.error('Error loading translations:', error);
        return null;
    }
}

function updateContent(lang) {
    document.documentElement.lang = lang === 'en' ? 'en' : (lang === 'cn' ? 'zh-CN' : 'zh-HK');
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        const keys = key.split('.');
        let translation = translations[lang];
        
        for (const k of keys) {
            translation = translation?.[k];
        }
        
        if (translation) {
            if (element.tagName === 'INPUT') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', async function() {
    // Load initial translations
    await loadTranslations(currentLang);
    updateContent(currentLang);

    // Add language switcher event listeners
    document.querySelectorAll('[data-lang]').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const lang = e.target.getAttribute('data-lang');
            currentLang = lang;
            localStorage.setItem('preferred-language', lang);
            
            if (!translations[lang]) {
                await loadTranslations(lang);
            }
            updateContent(lang);
        });
    });
});

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadTranslations,
        updateContent,
        currentLang,
        translations
    };
}