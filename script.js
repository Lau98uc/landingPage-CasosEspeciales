// PWA Variables
let deferredPrompt;
let installPrompt;

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Animate on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.feature-card, .benefit-item, .contact-form, .hero-content, .hero-visual').forEach(el => {
        observer.observe(el);
    });
    
    // PWA Initialization
    initializePWA();

    // Button event listeners
    document.getElementById('demo-button').addEventListener('click', showDemo);
    document.getElementById('download-button').addEventListener('click', downloadApp);
    document.getElementById('install-button').addEventListener('click', installApp);
    document.getElementById('later-button').addEventListener('click', hideInstallPrompt);
});

// PWA Initialization
function initializePWA() {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration.scope);
                })
                .catch(err => {
                    console.log('Service Worker registration failed:', err);
                });
        });
    }

    // Installation prompt handling
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallPrompt();
    });

    // App installed event
    window.addEventListener('appinstalled', () => {
        hideInstallPrompt();
        deferredPrompt = null;
        console.log('PWA was installed');
    });
    
    // Online/Offline status
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
}

function updateOnlineStatus() {
    const offlineIndicator = document.getElementById('offline-indicator');
    if (navigator.onLine) {
        offlineIndicator.style.display = 'none';
        document.body.classList.remove('offline');
    } else {
        offlineIndicator.style.display = 'flex';
        document.body.classList.add('offline');
    }
}

function showInstallPrompt() {
    const installPrompt = document.getElementById('install-prompt');
    if (installPrompt) {
        installPrompt.classList.add('show');
        document.body.classList.add('install-prompt-visible');
    }
}

function hideInstallPrompt() {
    const installPrompt = document.getElementById('install-prompt');
    if (installPrompt) {
        installPrompt.classList.remove('show');
        document.body.classList.remove('install-prompt-visible');
    }
}

async function installApp() {
    hideInstallPrompt();
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        deferredPrompt = null;
    }
}

function showDemo() {
    showNotification('La demo estará disponible próximamente.', 'info');
}

function downloadApp() {
    if (deferredPrompt) {
        installApp();
    } else {
        showNotification('Puedes instalar la app desde el banner superior o el menú de tu navegador.', 'info');
    }
}

function showNotification(message, type = 'info') {
    let notification = document.querySelector('.notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    notification.textContent = message;
    notification.className = `notification show ${type}`;
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// Header background change on scroll
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.feature-card, .benefit-item, .contact-item, .stat-item');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Counter animation for statistics
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start) + (element.textContent.includes('%') ? '%' : '');
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + (element.textContent.includes('%') ? '%' : '');
        }
    }
    
    updateCounter();
}

// Trigger counter animation when stats section is visible
const statsObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const text = stat.textContent;
                const number = parseInt(text.replace(/\D/g, ''));
                if (number) {
                    animateCounter(stat, number);
                }
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', function() {
    const statsContainer = document.querySelector('.stats-container');
    if (statsContainer) {
        statsObserver.observe(statsContainer);
    }
});

// Form submission handling with offline support
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const name = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const subject = this.querySelectorAll('input[type="text"]')[1].value;
            const message = this.querySelector('textarea').value;
            
            // Simple validation
            if (!name || !email || !subject || !message) {
                showNotification('Por favor, completa todos los campos', 'error');
                return;
            }
            
            // Check if online
            if (navigator.onLine) {
                // Simulate online form submission
                showNotification('Mensaje enviado correctamente. Te contactaremos pronto.', 'success');
                this.reset();
            } else {
                // Store for later when online
                storeOfflineMessage({ name, email, subject, message });
                showNotification('Mensaje guardado. Se enviará cuando tengas conexión.', 'info');
                this.reset();
            }
        });
    }
});

// Store offline messages
function storeOfflineMessage(message) {
    let offlineMessages = JSON.parse(localStorage.getItem('offlineMessages') || '[]');
    offlineMessages.push({
        ...message,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('offlineMessages', JSON.stringify(offlineMessages));
}

// Send offline messages when back online
window.addEventListener('online', function() {
    const offlineMessages = JSON.parse(localStorage.getItem('offlineMessages') || '[]');
    if (offlineMessages.length > 0) {
        // Simulate sending stored messages
        offlineMessages.forEach(msg => {
            console.log('Sending offline message:', msg);
        });
        
        // Clear stored messages
        localStorage.removeItem('offlineMessages');
        showNotification(`${offlineMessages.length} mensaje(s) enviado(s)`, 'success');
    }
});

// Button click effects
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
});

// Add ripple animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .nav-menu.active {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        padding: 1rem;
    }
    
    @media (max-width: 768px) {
        .nav-menu {
            display: none;
        }
        
        .nav-menu.active {
            display: flex;
        }
    }
`;
document.head.appendChild(style);

// Parallax effect for hero section
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const aiAnimation = document.querySelector('.ai-animation');
    
    if (hero && aiAnimation) {
        const rate = scrolled * -0.5;
        aiAnimation.style.transform = `translateY(${rate}px)`;
    }
});

// Loading animation
window.addEventListener('load', function() {
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }
    
    // Add offline class to body when offline
    if (!navigator.onLine) {
        document.body.classList.add('offline');
    }
});

// Add some interactive hover effects
document.addEventListener('DOMContentLoaded', function() {
    // Feature cards hover effect
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Social links hover effect
    const socialLinks = document.querySelectorAll('.social-links a');
    socialLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) rotate(10deg)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) rotate(0deg)';
        });
    });
});

// Cache management
function clearCache() {
    if ('caches' in window) {
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    return caches.delete(cacheName);
                })
            );
        }).then(() => {
            showNotification('Caché limpiado exitosamente', 'success');
        });
    }
}

// Export functions for global access
window.installApp = installApp;
window.hideInstallPrompt = hideInstallPrompt;
window.clearCache = clearCache;

// --- Kevin Chatbot Logic ---
document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('kevin-chatbot-button');
    const windowEl = document.getElementById('kevin-chatbot-window');
    const closeBtn = document.getElementById('kevin-chatbot-close');
    const options = document.getElementById('kevin-options');
    const body = document.getElementById('kevin-chatbot-body');

    if (!btn || !windowEl) return;

    btn.addEventListener('click', () => {
        windowEl.style.display = 'flex';
        btn.style.display = 'none';
    });
    closeBtn.addEventListener('click', () => {
        windowEl.style.display = 'none';
        btn.style.display = 'flex';
        resetChat();
    });

    options.addEventListener('click', function(e) {
        if (e.target.classList.contains('kevin-option')) {
            const opt = e.target.getAttribute('data-option');
            handleOption(opt);
        }
    });

    function handleOption(opt) {
        let msg = '';
        if (opt === 'login') {
            msg = `<b>¿Cómo iniciar sesión?</b><br>\
1. Selecciona tu carrera en el menú desplegable.<br>\
2. Ingresa tu registro universitario.<br>\
3. Escribe tu contraseña (si es tu primera vez, crea una nueva).<br>\
4. Haz clic en <b>Iniciar Sesión</b>.<br>\
¡Listo! Accederás al panel principal.`;
        } else if (opt === 'solicitud') {
            msg = `<b>¿Cómo solicitar un caso especial?</b><br>\
1. Inicia sesión en el sistema.<br>\
2. Ve al menú <b>Solicitud Caso Especial</b>.<br>\
3. Completa el formulario con los datos requeridos.<br>\
4. Los documentos necesarios ya se encuentran en el sistema.<br>\
5. Envía tu solicitud y espera la confirmación.`;
        } else if (opt === 'estado') {
            msg = `<b>¿Cómo ver el estado de mi solicitud?</b><br>\
1. Inicia sesión y accede al panel.<br>\
2. Haz clic en <b>Procesos Estados</b> en el menú lateral.<br>\
3. Verás el listado y estado de tus solicitudes.<br>\
Puedes consultar detalles y notificaciones aquí.`;
        } else if (opt === 'soporte') {
            msg = `<b>¿Cómo contactar soporte?</b><br>\
Puedes escribirnos al correo <b>ugartelaura3@gmail.com</b> o usar la sección de <b>Contacto</b> en la página principal.<br>\
¡Kevin siempre está para ayudarte!`;
        }
        showBotMessage(msg);
        showBackToMenu();
    }

    function showBotMessage(msg) {
        const div = document.createElement('div');
        div.className = 'kevin-message kevin-message-bot';
        div.innerHTML = msg;
        body.appendChild(div);
        options.style.display = 'none';
        body.scrollTop = body.scrollHeight;
    }
    function showBackToMenu() {
        let backBtn = document.createElement('button');
        backBtn.className = 'kevin-option';
        backBtn.textContent = 'Volver al menú principal';
        backBtn.onclick = function() {
            resetChat();
        };
        let wrap = document.createElement('div');
        wrap.className = 'kevin-options';
        wrap.appendChild(backBtn);
        body.appendChild(wrap);
        body.scrollTop = body.scrollHeight;
    }
    function resetChat() {
        // Remove all except the first bot message and options
        while (body.children.length > 2) {
            body.removeChild(body.lastChild);
        }
        options.style.display = 'flex';
    }
});
