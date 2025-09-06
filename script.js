// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.offsetTop;
            const offsetPosition = elementPosition - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Timeline functionality
function toggleTimelineContent(contentId) {
    const content = document.getElementById(contentId);
    const allContents = document.querySelectorAll('.timeline-content');
    
    // Close all other timeline contents
    allContents.forEach(item => {
        if (item.id !== contentId) {
            item.classList.remove('active');
        }
    });
    
    // Toggle the clicked content
    content.classList.toggle('active');
}

// Header background change on scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(0, 0, 0, 0.98)';
    } else {
        header.style.background = 'rgba(0, 0, 0, 0.95)';
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.timeline-item, .value-item, .command-member, .gallery-item, .news-item');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Form submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        // Simple validation
        if (!data.nome || !data.email || !data.telefone || !data.mensagem) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            alert('Por favor, insira um e-mail válido.');
            return;
        }
        
        // Show success message
        alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
        this.reset();
    });
}

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// News Management System
class NewsManager {
    constructor() {
        this.loadNews();
    }

    loadNews() {
        const savedNews = localStorage.getItem('adminNews');
        if (savedNews) {
            const newsData = JSON.parse(savedNews);
            this.displayNews(newsData);
        }
    }

    displayNews(newsArray) {
        const newsGrid = document.querySelector('.news-grid');
        if (!newsGrid) return;

        // Clear existing news
        newsGrid.innerHTML = '';

        // If no news from admin, show default news
        if (!newsArray || newsArray.length === 0) {
            this.showDefaultNews();
            return;
        }

        // Sort news by date (newest first)
        const sortedNews = newsArray.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Display up to 6 most recent news
        const recentNews = sortedNews.slice(0, 6);
        
        recentNews.forEach(news => {
            const newsItem = this.createNewsItem(news);
            newsGrid.appendChild(newsItem);
        });
    }

    createNewsItem(news) {
        const article = document.createElement('article');
        article.className = 'news-item';
        
        const formattedDate = this.formatDate(news.date);
        
        article.innerHTML = `
            <div class="news-date">${formattedDate}</div>
            <h3 class="news-title">${news.title}</h3>
            <p class="news-excerpt">${news.excerpt}</p>
            ${news.image ? `<div class="news-image"><img src="${news.image}" alt="${news.title}" loading="lazy"></div>` : ''}
        `;
        
        return article;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
        const day = date.getDate().toString().padStart(2, '0');
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    }

    showDefaultNews() {
        const newsGrid = document.querySelector('.news-grid');
        if (!newsGrid) return;

        newsGrid.innerHTML = `
            <article class="news-item">
                <div class="news-date">01 AGO 2024</div>
                <h3 class="news-title">15 Anos da Subsede Litoral do Paraná</h3>
                <p class="news-excerpt">Celebramos com orgulho mais um ano de estrada, fraternidade e liberdade ao lado dos valorosos irmãos do Bodes do Asfalto Litoral do Paraná.</p>
            </article>
            
            <article class="news-item">
                <div class="news-date">15 JUL 2024</div>
                <h3 class="news-title">Encontro Regional dos Bodes</h3>
                <p class="news-excerpt">Grande encontro reuniu irmãos de diversas subsedes para celebrar a união e compartilhar experiências na estrada.</p>
            </article>
            
            <article class="news-item">
                <div class="news-date">30 JUN 2024</div>
                <h3 class="news-title">Ação Social Beneficente</h3>
                <p class="news-excerpt">Os Bodes do Asfalto Litoral do Paraná realizaram mais uma ação social, distribuindo alimentos e agasalhos para famílias necessitadas.</p>
            </article>
        `;
    }
}

// Initialize News Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NewsManager();
});

// Listen for storage changes to update news in real-time
window.addEventListener('storage', (e) => {
    if (e.key === 'adminNews') {
        const newsManager = new NewsManager();
    }
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Counter animation for statistics (if needed in future)
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        element.textContent = Math.floor(start);
        
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        }
    }, 16);
}



// Add hover effects to navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('mouseenter', function() {
        this.style.textShadow = '0 0 10px rgba(255, 68, 68, 0.5)';
    });
    
    link.addEventListener('mouseleave', function() {
        this.style.textShadow = 'none';
    });
});

// Add typing effect to hero motto
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect when page loads
window.addEventListener('load', () => {
    const motto = document.querySelector('.hero-motto');
    if (motto) {
        const originalText = motto.textContent;
        setTimeout(() => {
            typeWriter(motto, originalText, 150);
        }, 1000);
    }
});

// Add floating animation to hero logo
const heroLogo = document.querySelector('.hero-logo-img');
if (heroLogo) {
    let floatDirection = 1;
    setInterval(() => {
        const currentTransform = heroLogo.style.transform || 'translateY(0px)';
        const currentY = parseFloat(currentTransform.match(/translateY\(([^)]+)\)/)?.[1] || 0);
        
        if (currentY >= 10) floatDirection = -1;
        if (currentY <= -10) floatDirection = 1;
        
        heroLogo.style.transform = `translateY(${currentY + (floatDirection * 0.5)}px)`;
    }, 50);
}

// Advanced scroll animations with Intersection Observer
const advancedObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

// Apply advanced animations to different elements
document.addEventListener('DOMContentLoaded', () => {
    // Fade in elements
    document.querySelectorAll('.section-title, .section-subtitle').forEach(el => {
        el.classList.add('fade-in');
        advancedObserver.observe(el);
    });
    
    // Fade in from left
    document.querySelectorAll('.timeline-date').forEach(el => {
        el.classList.add('fade-in-left');
        advancedObserver.observe(el);
    });
    
    // Fade in from right
    document.querySelectorAll('.timeline-content').forEach(el => {
        el.classList.add('fade-in-right');
        advancedObserver.observe(el);
    });
    
    // Add interactive card effects
    document.querySelectorAll('.command-member, .value-item, .news-item').forEach(el => {
        el.classList.add('interactive-card');
    });
    
    // Add glow effect to hero logo
    const heroLogo = document.querySelector('.hero-logo');
    if (heroLogo) {
        heroLogo.classList.add('glow');
    }
    
    // Add ripple effect to buttons
    document.querySelectorAll('.submit-btn').forEach(btn => {
        btn.classList.add('ripple');
    });
    
    // Add zoom effect to gallery items
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.classList.add('zoom-on-hover');
    });
});

// Particle system for hero section
function createParticles() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    hero.appendChild(particlesContainer);
    
    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 3 + 5) + 's';
        particle.style.animationDelay = Math.random() * 2 + 's';
        
        particlesContainer.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 8000);
    }
    
    // Create particles periodically
    setInterval(createParticle, 1000);
}

// Loading screen
function showLoadingScreen() {
    const loadingScreen = document.createElement('div');
    loadingScreen.className = 'loading-screen';
    loadingScreen.innerHTML = `
        <img src="bodes_do_asfalto_logo_litoral_refined.png" alt="Loading..." class="loading-logo">
    `;
    document.body.appendChild(loadingScreen);
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                if (loadingScreen.parentNode) {
                    loadingScreen.parentNode.removeChild(loadingScreen);
                }
            }, 500);
        }, 1500);
    });
}

// Enhanced form validation with better UX
function enhanceFormValidation() {
    const form = document.querySelector('.contact-form');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
        // Real-time validation
        input.addEventListener('blur', () => {
            validateField(input);
        });
        
        input.addEventListener('input', () => {
            if (input.classList.contains('error')) {
                validateField(input);
            }
        });
    });
    
    function validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let message = '';
        
        // Remove existing error styles
        field.classList.remove('error');
        removeErrorMessage(field);
        
        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            message = 'Este campo é obrigatório.';
        }
        
        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                message = 'Por favor, insira um e-mail válido.';
            }
        }
        
        // Phone validation
        if (field.type === 'tel' && value) {
            const phoneRegex = /^\(?\d{2}\)?[\s-]?9?\d{4}[\s-]?\d{4}$/;
            if (!phoneRegex.test(value)) {
                isValid = false;
                message = 'Por favor, insira um telefone válido.';
            }
        }
        
        if (!isValid) {
            field.classList.add('error');
            showErrorMessage(field, message);
        }
        
        return isValid;
    }
    
    function showErrorMessage(field, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #ff4444;
            font-size: 0.8rem;
            margin-top: 0.5rem;
            animation: shake 0.5s ease-in-out;
        `;
        
        field.parentNode.appendChild(errorDiv);
    }
    
    function removeErrorMessage(field) {
        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }
}

// Add CSS for error states
const errorStyles = document.createElement('style');
errorStyles.textContent = `
    .form-group input.error,
    .form-group textarea.error {
        border-color: #ff4444 !important;
        box-shadow: 0 0 10px rgba(255, 68, 68, 0.5) !important;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(errorStyles);

// Dynamic text animation for hero title
function animateHeroTitle() {
    const title = document.querySelector('.hero-title');
    if (!title) return;
    
    title.classList.add('animated-gradient');
}

// Smooth page transitions
function initPageTransitions() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    window.addEventListener('load', () => {
        document.body.style.opacity = '1';
    });
}

// Decorative goat interactions
function initDecorativeGoat() {
    const goat = document.querySelector('.decorative-goat');
    if (!goat) return;
    
    // Add click interaction
    goat.addEventListener('click', () => {
        goat.style.animation = 'none';
        goat.style.transform = 'scale(1.2) rotate(360deg)';
        
        setTimeout(() => {
            goat.style.animation = 'float-goat 4s ease-in-out infinite';
            goat.style.transform = '';
        }, 600);
    });
    
    // Add parallax effect
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.3;
        goat.style.transform = `translateY(${rate}px)`;
    });
}

// Initialize all enhancements
document.addEventListener('DOMContentLoaded', () => {
    showLoadingScreen();
    createParticles();
    enhanceFormValidation();
    animateHeroTitle();
    initPageTransitions();
    initDecorativeGoat();
});

// Performance optimization - reduce animations on slower devices
if (navigator.hardwareConcurrency < 4 || navigator.deviceMemory < 4) {
    document.documentElement.style.setProperty('--animation-duration', '0.3s');
    document.documentElement.style.setProperty('--particle-count', '5');
}

// Enhanced Lazy Loading for Images with Progressive Loading
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                
                // Add loading animation
                img.style.filter = 'blur(5px)';
                img.style.transition = 'filter 0.3s ease';
                
                // Create new image to preload
                const newImg = new Image();
                newImg.onload = () => {
                    img.src = img.dataset.src;
                    img.style.filter = 'blur(0)';
                    img.classList.remove('lazy');
                    img.classList.add('loaded');
                };
                newImg.onerror = () => {
                    img.style.filter = 'blur(0)';
                    img.classList.add('error');
                };
                newImg.src = img.dataset.src;
                
                imageObserver.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.1
    });

    images.forEach(img => {
        img.classList.add('lazy');
        imageObserver.observe(img);
    });
}

// Smooth Scroll Enhancement
function enhancedSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Enhanced Loading States
function addLoadingStates() {
    // Add loading state to buttons
    document.querySelectorAll('button, .btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (!this.classList.contains('loading')) {
                this.classList.add('loading');
                const originalText = this.textContent;
                this.textContent = 'Carregando...';
                
                setTimeout(() => {
                    this.classList.remove('loading');
                    this.textContent = originalText;
                }, 2000);
            }
        });
    });
}

// Progressive Web App Features
function initPWAFeatures() {
    // Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
    
    // Install prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Show install button if needed
        const installBtn = document.getElementById('install-btn');
        if (installBtn) {
            installBtn.style.display = 'block';
            installBtn.addEventListener('click', () => {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                    }
                    deferredPrompt = null;
                });
            });
        }
    });
}

// Enhanced User Experience Features
function enhanceUX() {
    // Add focus management for accessibility
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });
    
    // Add smooth transitions for dynamic content
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        node.style.opacity = '0';
                        node.style.transform = 'translateY(20px)';
                        node.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                        
                        requestAnimationFrame(() => {
                            node.style.opacity = '1';
                            node.style.transform = 'translateY(0)';
                        });
                    }
                });
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Performance Monitoring
function monitorPerformance() {
    // Monitor Core Web Vitals
    if ('web-vitals' in window) {
        const { getCLS, getFID, getFCP, getLCP, getTTFB } = window.webVitals;
        
        getCLS(console.log);
        getFID(console.log);
        getFCP(console.log);
        getLCP(console.log);
        getTTFB(console.log);
    }
    
    // Monitor loading performance
    window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`Page load time: ${loadTime}ms`);
        
        // Send analytics if needed
        if (loadTime > 3000) {
            console.warn('Page load time is slow');
        }
    });
}



// Initialize all enhancements
document.addEventListener('DOMContentLoaded', () => {
    lazyLoadImages();
    enhancedSmoothScroll();
    addLoadingStates();
    initPWAFeatures();
    enhanceUX();
    monitorPerformance();
});

console.log('🏍️ Bodes do Asfalto - Subsede Litoral do Paraná - Website enhanced and ready to rock! 🏍⁠️');
console.log('NÓS FAZEMOS POEIRA! 🔥');

