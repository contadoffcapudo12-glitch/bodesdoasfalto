// Configurações e constantes
const ADMIN_TOKEN = 'bodesdoasfalto2025parasempre';
const STORAGE_KEYS = {
    NEWS: 'bda_news',
    MEDIA: 'bda_media',
    AUTH: 'bda_auth'
};

// Estado da aplicação
let currentUser = null;
let newsData = [];
let mediaData = [];
let currentEditingNews = null;

// Utilitários
class Utils {
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    static formatDate(date) {
        return new Date(date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static sanitizeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    static validateImage(file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
            throw new Error('Formato de imagem não suportado. Use JPG, PNG, GIF ou WebP.');
        }

        if (file.size > maxSize) {
            throw new Error('Imagem muito grande. Tamanho máximo: 5MB.');
        }

        return true;
    }

    static resizeImage(file, maxWidth = 800, maxHeight = 600, quality = 0.8) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                let { width, height } = img;

                // Calcular novas dimensões mantendo proporção
                if (width > height) {
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob(resolve, 'image/jpeg', quality);
            };

            img.src = URL.createObjectURL(file);
        });
    }
}

// Gerenciador de armazenamento
class StorageManager {
    static save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
            return false;
        }
    }

    static load(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            return null;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Erro ao remover dados:', error);
            return false;
        }
    }
}

// Gerenciador de notificações
class NotificationManager {
    static show(message, type = 'success', duration = 5000) {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        toast.innerHTML = `
            <i class="toast-icon ${iconMap[type]}"></i>
            <span class="toast-message">${message}</span>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(toast);

        // Evento de fechar
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.remove(toast);
        });

        // Auto remover
        setTimeout(() => {
            this.remove(toast);
        }, duration);
    }

    static remove(toast) {
        toast.style.animation = 'toastSlideOut 0.3s ease forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
}

// Gerenciador de autenticação
class AuthManager {
    static login(token) {
        if (token === ADMIN_TOKEN) {
            const authData = {
                token: token,
                loginTime: Date.now(),
                expiresIn: 24 * 60 * 60 * 1000 // 24 horas
            };
            
            StorageManager.save(STORAGE_KEYS.AUTH, authData);
            currentUser = { token: token, loginTime: authData.loginTime };
            return true;
        }
        return false;
    }

    static logout() {
        StorageManager.remove(STORAGE_KEYS.AUTH);
        currentUser = null;
        this.showLoginScreen();
    }

    static checkAuth() {
        const authData = StorageManager.load(STORAGE_KEYS.AUTH);
        
        if (!authData) return false;
        
        const now = Date.now();
        const isExpired = (now - authData.loginTime) > authData.expiresIn;
        
        if (isExpired) {
            this.logout();
            return false;
        }
        
        currentUser = { token: authData.token, loginTime: authData.loginTime };
        return true;
    }

    static showLoginScreen() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('adminPanel').style.display = 'none';
    }

    static showAdminPanel() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'grid';
    }
}

// Gerenciador de notícias
class NewsManager {
    static loadNews() {
        newsData = StorageManager.load(STORAGE_KEYS.NEWS) || [];
        this.updateStats();
        this.renderNewsList();
    }

    static async saveNews() {
        try {
            const newsDataToSave = {
                news: newsData,
                lastUpdated: new Date().toISOString()
            };
            
            // In a real application, this would be sent to a server
            // For now, we'll update localStorage and show a message
            StorageManager.save(STORAGE_KEYS.NEWS, newsData);
            StorageManager.save('newsData', newsDataToSave);
            
            NotificationManager.show('Notícia salva com sucesso! Para aplicar no site, atualize o arquivo news.json.', 'success');
            return true;
        } catch (error) {
            console.error('Erro ao salvar notícia:', error);
            NotificationManager.show('Erro ao salvar notícia. Tente novamente.', 'error');
            return false;
        }
    }

    static createNews(newsItem) {
        const news = {
            id: Utils.generateId(),
            title: Utils.sanitizeHtml(newsItem.title),
            excerpt: Utils.sanitizeHtml(newsItem.excerpt),
            content: Utils.sanitizeHtml(newsItem.content),
            image: newsItem.image || null,
            status: newsItem.status || 'draft',
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        newsData.unshift(news);
        this.saveNews();
        this.updateStats();
        this.renderNewsList();
        
        NotificationManager.show('Notícia criada com sucesso!', 'success');
        return news;
    }

    static updateNews(id, updates) {
        const index = newsData.findIndex(news => news.id === id);
        if (index === -1) return false;

        newsData[index] = {
            ...newsData[index],
            ...updates,
            updatedAt: Date.now()
        };

        this.saveNews();
        this.updateStats();
        this.renderNewsList();
        
        NotificationManager.show('Notícia atualizada com sucesso!', 'success');
        return newsData[index];
    }

    static deleteNews(id) {
        const index = newsData.findIndex(news => news.id === id);
        if (index === -1) return false;

        newsData.splice(index, 1);
        this.saveNews();
        this.updateStats();
        this.renderNewsList();
        
        NotificationManager.show('Notícia removida com sucesso!', 'success');
        return true;
    }

    static getNews(id) {
        return newsData.find(news => news.id === id);
    }

    static updateStats() {
        const total = newsData.length;
        const published = newsData.filter(news => news.status === 'published').length;
        const draft = newsData.filter(news => news.status === 'draft').length;

        document.getElementById('totalNews').textContent = total;
        document.getElementById('publishedNews').textContent = published;
        document.getElementById('draftNews').textContent = draft;
    }

    static renderNewsList(filteredNews = null) {
        const container = document.getElementById('newsList');
        const newsToRender = filteredNews || newsData;

        if (newsToRender.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-newspaper"></i>
                    <h3>Nenhuma notícia encontrada</h3>
                    <p>Comece criando sua primeira notícia!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = newsToRender.map(news => `
            <div class="news-item" data-id="${news.id}">
                <div class="news-item-content">
                    <img src="${news.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMTIwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjdGQUZDIi8+CjxwYXRoIGQ9Ik00MCA0MEg4MFY0NEg0MFY0MFoiIGZpbGw9IiNBMEFFQzAiLz4KPHA+dGggZD0iTTQ4IDUwSDcyVjUySDQ4VjUwWiIgZmlsbD0iI0EwQUVDMCIvPgo8L3N2Zz4K'}" 
                         alt="${news.title}" class="news-thumbnail">
                    <div class="news-info">
                        <h3 class="news-title">${news.title}</h3>
                        <p class="news-excerpt">${news.excerpt}</p>
                        <div class="news-meta">
                            <span><i class="fas fa-calendar"></i> ${Utils.formatDate(news.createdAt)}</span>
                            <span class="news-status status-${news.status}">${news.status === 'published' ? 'Publicada' : 'Rascunho'}</span>
                        </div>
                    </div>
                    <div class="news-actions">
                        <button class="action-btn edit-btn" onclick="NewsManager.editNews('${news.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="NewsManager.confirmDelete('${news.id}')" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    static editNews(id) {
        const news = this.getNews(id);
        if (!news) return;

        currentEditingNews = news;
        
        // Preencher formulário
        document.getElementById('newsId').value = news.id;
        document.getElementById('newsTitle').value = news.title;
        document.getElementById('newsExcerpt').value = news.excerpt;
        document.getElementById('newsContent').value = news.content;
        document.getElementById('newsStatus').value = news.status;
        
        // Mostrar imagem se existir
        if (news.image) {
            const preview = document.getElementById('imagePreview');
            const previewImg = document.getElementById('previewImg');
            const placeholder = document.querySelector('.upload-placeholder');
            
            previewImg.src = news.image;
            preview.style.display = 'block';
            placeholder.style.display = 'none';
        }
        
        // Atualizar título do formulário
        document.getElementById('formTitle').textContent = 'Editar Notícia';
        document.getElementById('submitBtnText').textContent = 'Atualizar Notícia';
        
        // Mostrar seção de edição
        UIManager.showSection('addNewsSection');
    }

    static confirmDelete(id) {
        const news = this.getNews(id);
        if (!news) return;

        ModalManager.show(
            'Confirmar Exclusão',
            `Tem certeza que deseja excluir a notícia "${news.title}"? Esta ação não pode ser desfeita.`,
            () => this.deleteNews(id)
        );
    }

    static filterNews() {
        const searchTerm = document.getElementById('searchNews').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value;

        let filtered = newsData;

        if (searchTerm) {
            filtered = filtered.filter(news => 
                news.title.toLowerCase().includes(searchTerm) ||
                news.excerpt.toLowerCase().includes(searchTerm)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(news => news.status === statusFilter);
        }

        this.renderNewsList(filtered);
    }
}

// Gerenciador de mídia
class MediaManager {
    static loadMedia() {
        mediaData = StorageManager.load(STORAGE_KEYS.MEDIA) || [];
        this.renderMediaGrid();
    }

    static saveMedia() {
        return StorageManager.save(STORAGE_KEYS.MEDIA, mediaData);
    }

    static async addMedia(file) {
        try {
            Utils.validateImage(file);
            
            // Redimensionar imagem
            const resizedFile = await Utils.resizeImage(file);
            
            // Converter para base64
            const reader = new FileReader();
            return new Promise((resolve, reject) => {
                reader.onload = (e) => {
                    const media = {
                        id: Utils.generateId(),
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        data: e.target.result,
                        uploadedAt: Date.now()
                    };

                    mediaData.unshift(media);
                    this.saveMedia();
                    this.renderMediaGrid();
                    
                    NotificationManager.show('Mídia adicionada com sucesso!', 'success');
                    resolve(media);
                };
                
                reader.onerror = () => reject(new Error('Erro ao processar arquivo'));
                reader.readAsDataURL(resizedFile);
            });
        } catch (error) {
            NotificationManager.show(error.message, 'error');
            throw error;
        }
    }

    static renderMediaGrid() {
        const container = document.getElementById('mediaGrid');
        
        if (mediaData.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-images"></i>
                    <h3>Nenhuma mídia encontrada</h3>
                    <p>Faça upload de suas primeiras imagens!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = mediaData.map(media => `
            <div class="media-item" data-id="${media.id}">
                <img src="${media.data}" alt="${media.name}" class="media-thumbnail">
                <div class="media-info">
                    <div class="media-name">${media.name}</div>
                    <div class="media-size">${(media.size / 1024).toFixed(1)} KB</div>
                </div>
            </div>
        `).join('');
    }
}

// Gerenciador de UI
class UIManager {
    static showSection(sectionId) {
        // Esconder todas as seções
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Mostrar seção específica
        document.getElementById(sectionId).classList.add('active');
        
        // Atualizar navegação
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const navMap = {
            'newsSection': 'news',
            'addNewsSection': 'add-news',
            'mediaSection': 'media'
        };
        
        const targetNav = navMap[sectionId];
        if (targetNav) {
            document.querySelector(`[data-section="${targetNav}"]`).parentElement.classList.add('active');
        }
    }

    static resetNewsForm() {
        document.getElementById('newsForm').reset();
        document.getElementById('newsId').value = '';
        document.getElementById('formTitle').textContent = 'Adicionar Nova Notícia';
        document.getElementById('submitBtnText').textContent = 'Salvar Notícia';
        
        // Resetar preview de imagem
        const preview = document.getElementById('imagePreview');
        const placeholder = document.querySelector('.upload-placeholder');
        preview.style.display = 'none';
        placeholder.style.display = 'block';
        
        currentEditingNews = null;
    }

    static updateCharCount(textarea, countElement) {
        const current = textarea.value.length;
        const max = textarea.getAttribute('maxlength');
        countElement.textContent = `${current}/${max} caracteres`;
        
        if (current > max * 0.9) {
            countElement.style.color = '#e53e3e';
        } else {
            countElement.style.color = '#a0aec0';
        }
    }
}

// Gerenciador de modal
class ModalManager {
    static show(title, message, onConfirm, onCancel = null) {
        const modal = document.getElementById('confirmModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        const confirmBtn = document.getElementById('modalConfirm');
        const cancelBtn = document.getElementById('modalCancel');
        
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        
        // Remover listeners anteriores
        const newConfirmBtn = confirmBtn.cloneNode(true);
        const newCancelBtn = cancelBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        
        // Adicionar novos listeners
        newConfirmBtn.addEventListener('click', () => {
            this.hide();
            if (onConfirm) onConfirm();
        });
        
        newCancelBtn.addEventListener('click', () => {
            this.hide();
            if (onCancel) onCancel();
        });
        
        modal.style.display = 'flex';
    }

    static hide() {
        document.getElementById('confirmModal').style.display = 'none';
    }
}

// Inicialização da aplicação
class App {
    static init() {
        this.setupEventListeners();
        this.checkAuthentication();
    }

    static checkAuthentication() {
        if (AuthManager.checkAuth()) {
            AuthManager.showAdminPanel();
            this.loadData();
        } else {
            AuthManager.showLoginScreen();
        }
    }

    static loadData() {
        NewsManager.loadNews();
        MediaManager.loadMedia();
    }

    static setupEventListeners() {
        // Login
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const token = document.getElementById('tokenInput').value;
            const errorDiv = document.getElementById('loginError');
            
            if (AuthManager.login(token)) {
                AuthManager.showAdminPanel();
                this.loadData();
                errorDiv.style.display = 'none';
            } else {
                errorDiv.textContent = 'Token de acesso inválido!';
                errorDiv.style.display = 'block';
                document.getElementById('tokenInput').value = '';
            }
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            ModalManager.show(
                'Confirmar Logout',
                'Tem certeza que deseja sair do painel administrativo?',
                () => AuthManager.logout()
            );
        });

        // Navegação
        document.querySelectorAll('[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                
                if (section === 'news') {
                    UIManager.showSection('newsSection');
                } else if (section === 'add-news') {
                    UIManager.resetNewsForm();
                    UIManager.showSection('addNewsSection');
                } else if (section === 'media') {
                    UIManager.showSection('mediaSection');
                }
            });
        });

        // Botões de ação
        document.getElementById('addNewsBtn').addEventListener('click', () => {
            UIManager.resetNewsForm();
            UIManager.showSection('addNewsSection');
        });

        document.getElementById('backToNewsBtn').addEventListener('click', () => {
            UIManager.showSection('newsSection');
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            UIManager.showSection('newsSection');
        });

        // Formulário de notícia
        document.getElementById('newsForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                title: document.getElementById('newsTitle').value.trim(),
                excerpt: document.getElementById('newsExcerpt').value.trim(),
                content: document.getElementById('newsContent').value.trim(),
                status: document.getElementById('newsStatus').value,
                image: document.getElementById('previewImg').src || null
            };

            if (!formData.title || !formData.excerpt || !formData.content) {
                NotificationManager.show('Preencha todos os campos obrigatórios!', 'error');
                return;
            }

            const newsId = document.getElementById('newsId').value;
            
            if (newsId) {
                // Atualizar notícia existente
                NewsManager.updateNews(newsId, formData);
            } else {
                // Criar nova notícia
                NewsManager.createNews(formData);
            }

            UIManager.showSection('newsSection');
        });

        // Upload de imagem
        const imageUploadArea = document.getElementById('imageUploadArea');
        const imageInput = document.getElementById('newsImage');
        const imagePreview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        const uploadPlaceholder = document.querySelector('.upload-placeholder');
        const removeImageBtn = document.getElementById('removeImage');

        imageUploadArea.addEventListener('click', () => {
            imageInput.click();
        });

        imageInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                Utils.validateImage(file);
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    previewImg.src = e.target.result;
                    imagePreview.style.display = 'block';
                    uploadPlaceholder.style.display = 'none';
                };
                reader.readAsDataURL(file);
            } catch (error) {
                NotificationManager.show(error.message, 'error');
                imageInput.value = '';
            }
        });

        removeImageBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            imageInput.value = '';
            previewImg.src = '';
            imagePreview.style.display = 'none';
            uploadPlaceholder.style.display = 'block';
        });

        // Contador de caracteres
        const excerptTextarea = document.getElementById('newsExcerpt');
        const charCount = document.querySelector('.char-count');
        
        excerptTextarea.addEventListener('input', () => {
            UIManager.updateCharCount(excerptTextarea, charCount);
        });

        // Filtros de notícias
        document.getElementById('searchNews').addEventListener('input', () => {
            NewsManager.filterNews();
        });

        document.getElementById('statusFilter').addEventListener('change', () => {
            NewsManager.filterNews();
        });

        // Upload de mídia
        document.getElementById('uploadMediaBtn').addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.multiple = true;
            
            input.addEventListener('change', async (e) => {
                const files = Array.from(e.target.files);
                
                for (const file of files) {
                    try {
                        await MediaManager.addMedia(file);
                    } catch (error) {
                        console.error('Erro ao fazer upload:', error);
                    }
                }
            });
            
            input.click();
        });

        // Modal
        document.getElementById('modalClose').addEventListener('click', () => {
            ModalManager.hide();
        });

        document.getElementById('confirmModal').addEventListener('click', (e) => {
            if (e.target.id === 'confirmModal') {
                ModalManager.hide();
            }
        });

        // Atalhos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                ModalManager.hide();
            }
        });
    }
}

// Adicionar CSS para animação de saída do toast
const style = document.createElement('style');
style.textContent = `
    @keyframes toastSlideOut {
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// Inicializar aplicação quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Expor funções globais necessárias
window.NewsManager = NewsManager;
window.MediaManager = MediaManager;
window.ModalManager = ModalManager;