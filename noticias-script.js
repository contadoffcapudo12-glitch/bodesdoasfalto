// News Page JavaScript
class NewsPage {
    constructor() {
        this.newsData = [];
        this.filteredNews = [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        
        this.init();
    }

    async init() {
        await this.loadNews();
        this.setupEventListeners();
        this.displayNews();
    }

    async loadNews() {
        try {
            const response = await fetch('news.json');
            if (!response.ok) {
                throw new Error('Erro ao carregar notícias');
            }
            const data = await response.json();
            this.newsData = data.news || [];
            this.filteredNews = [...this.newsData];
        } catch (error) {
            console.error('Erro ao carregar notícias:', error);
            this.showError('Erro ao carregar as notícias. Tente novamente mais tarde.');
        }
    }

    setupEventListeners() {
        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.setActiveFilter(e.target);
                this.filterNews(category);
            });
        });

        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }

        // Modal events
        const modal = document.getElementById('newsModal');
        const modalClose = document.getElementById('modalClose');
        
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                this.closeModal();
            });
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    setActiveFilter(activeBtn) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    filterNews(category) {
        this.currentFilter = category;
        this.applyFilters();
    }

    applyFilters() {
        this.filteredNews = this.newsData.filter(news => {
            const matchesCategory = this.currentFilter === 'all' || news.category === this.currentFilter;
            const matchesSearch = this.searchTerm === '' || 
                news.title.toLowerCase().includes(this.searchTerm) ||
                news.excerpt.toLowerCase().includes(this.searchTerm) ||
                news.content.toLowerCase().includes(this.searchTerm);
            
            return matchesCategory && matchesSearch;
        });
        
        this.displayNews();
    }

    displayNews() {
        const newsGrid = document.getElementById('newsGrid');
        const loadingSpinner = document.getElementById('loadingSpinner');
        const noResults = document.getElementById('noResults');
        
        if (!newsGrid) return;

        // Hide loading spinner
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }

        // Clear existing news
        newsGrid.innerHTML = '';

        if (this.filteredNews.length === 0) {
            if (noResults) {
                noResults.style.display = 'block';
            }
            return;
        }

        if (noResults) {
            noResults.style.display = 'none';
        }

        // Sort news by date (newest first)
        const sortedNews = this.filteredNews.sort((a, b) => new Date(b.date) - new Date(a.date));

        sortedNews.forEach(news => {
            const newsCard = this.createNewsCard(news);
            newsGrid.appendChild(newsCard);
        });
    }

    createNewsCard(news) {
        const card = document.createElement('div');
        card.className = `news-card ${news.featured ? 'featured' : ''}`;
        card.addEventListener('click', () => this.openModal(news));

        const formattedDate = this.formatDate(news.date);
        
        card.innerHTML = `
            <div class="news-meta">
                <span class="news-date">${formattedDate}</span>
                <span class="news-category">${news.category}</span>
            </div>
            
            ${news.image ? `
                <div class="news-image">
                    <img src="${news.image}" alt="${news.title}" loading="lazy">
                </div>
            ` : ''}
            
            <h3 class="news-title">${news.title}</h3>
            <p class="news-excerpt">${news.excerpt}</p>
            
            <div class="news-footer">
                <span class="news-author">Por: ${news.author}</span>
                <a href="#" class="read-more">
                    Ler mais
                    <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        `;
        
        return card;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
        const day = date.getDate().toString().padStart(2, '0');
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    }

    openModal(news) {
        const modal = document.getElementById('newsModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalDate = document.getElementById('modalDate');
        const modalAuthor = document.getElementById('modalAuthor');
        const modalCategory = document.getElementById('modalCategory');
        const modalImageContainer = document.getElementById('modalImageContainer');
        const modalImage = document.getElementById('modalImage');
        const modalContent = document.getElementById('modalContent');
        
        if (!modal) return;

        // Populate modal content
        if (modalTitle) modalTitle.textContent = news.title;
        if (modalDate) modalDate.textContent = this.formatDate(news.date);
        if (modalAuthor) modalAuthor.textContent = `Por: ${news.author}`;
        if (modalCategory) modalCategory.textContent = news.category;
        
        // Handle image
        if (news.image && modalImageContainer && modalImage) {
            modalImage.src = news.image;
            modalImage.alt = news.title;
            modalImageContainer.style.display = 'block';
        } else if (modalImageContainer) {
            modalImageContainer.style.display = 'none';
        }
        
        // Format content with paragraphs
        if (modalContent) {
            const paragraphs = news.content.split('\n\n');
            modalContent.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');
        }
        
        // Show modal
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Store current news for sharing
        this.currentNews = news;
    }

    closeModal() {
        const modal = document.getElementById('newsModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    showError(message) {
        const newsGrid = document.getElementById('newsGrid');
        const loadingSpinner = document.getElementById('loadingSpinner');
        
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
        
        if (newsGrid) {
            newsGrid.innerHTML = `
                <div class="error-message" style="
                    text-align: center;
                    padding: 3rem;
                    color: #ff4444;
                    grid-column: 1 / -1;
                ">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <h3>Ops! Algo deu errado</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()" style="
                        margin-top: 1rem;
                        padding: 0.8rem 1.5rem;
                        background: linear-gradient(45deg, #ff4444, #ff6666);
                        color: white;
                        border: none;
                        border-radius: 25px;
                        cursor: pointer;
                        font-weight: 600;
                    ">Tentar Novamente</button>
                </div>
            `;
        }
    }
}

// Share functionality
function shareNews() {
    if (window.newsPage && window.newsPage.currentNews) {
        const news = window.newsPage.currentNews;
        const shareData = {
            title: news.title,
            text: news.excerpt,
            url: window.location.href
        };
        
        if (navigator.share) {
            navigator.share(shareData).catch(err => {
                console.log('Erro ao compartilhar:', err);
                fallbackShare(news);
            });
        } else {
            fallbackShare(news);
        }
    }
}

function fallbackShare(news) {
    const shareText = `${news.title}\n\n${news.excerpt}\n\nLeia mais em: ${window.location.href}`;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).then(() => {
            showNotification('Link copiado para a área de transferência!');
        }).catch(() => {
            showShareModal(shareText);
        });
    } else {
        showShareModal(shareText);
    }
}

function showShareModal(text) {
    const shareModal = document.createElement('div');
    shareModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 3000;
    `;
    
    shareModal.innerHTML = `
        <div style="
            background: #2d2d2d;
            padding: 2rem;
            border-radius: 15px;
            max-width: 500px;
            margin: 1rem;
        ">
            <h3 style="color: #ff4444; margin-bottom: 1rem;">Compartilhar Notícia</h3>
            <textarea readonly style="
                width: 100%;
                height: 150px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 10px;
                color: white;
                padding: 1rem;
                margin-bottom: 1rem;
                resize: none;
            ">${text}</textarea>
            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
                    padding: 0.8rem 1.5rem;
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 25px;
                    cursor: pointer;
                ">Fechar</button>
                <button onclick="
                    const textarea = this.parentElement.parentElement.querySelector('textarea');
                    textarea.select();
                    document.execCommand('copy');
                    showNotification('Texto copiado!');
                    this.parentElement.parentElement.parentElement.remove();
                " style="
                    padding: 0.8rem 1.5rem;
                    background: linear-gradient(45deg, #ff4444, #ff6666);
                    color: white;
                    border: none;
                    border-radius: 25px;
                    cursor: pointer;
                ">Copiar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(shareModal);
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: linear-gradient(45deg, #ff4444, #ff6666);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        z-index: 4000;
        animation: slideIn 0.3s ease;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.newsPage = new NewsPage();
});

// Smooth scroll for anchor links
document.addEventListener('click', (e) => {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});