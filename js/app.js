/**
 * Halima's Cakes - Main Application JavaScript
 * Online Cake Ordering System
 */

// ===========================
// APP STATE
// ===========================
const state = {
    cart: JSON.parse(localStorage.getItem('halimaCakes_cart') || '[]'),
    currentTestimonial: 0,
    testimonialCount: 0,
    isMenuOpen: false
};

// ===========================
// DOM ELEMENTS
// ===========================
const DOM = {
    preloader: document.getElementById('preloader'),
    navbar: document.getElementById('navbar'),
    navLinks: document.getElementById('navLinks'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    cartBtn: document.getElementById('cartBtn'),
    cartCount: document.getElementById('cartCount'),
    cartItems: document.getElementById('cartItems'),
    cartTotal: document.getElementById('cartTotal'),
    subtotal: document.getElementById('subtotal'),
    grandTotal: document.getElementById('grandTotal'),
    clearCartBtn: document.getElementById('clearCartBtn'),
    menuGrid: document.getElementById('menuGrid'),
    orderForm: document.getElementById('orderForm'),
    successModal: document.getElementById('successModal'),
    backToTop: document.getElementById('backToTop'),
    testimonialsSlider: document.getElementById('testimonialsSlider'),
    testimonialDots: document.getElementById('testimonialDots'),
    prevTestimonial: document.getElementById('prevTestimonial'),
    nextTestimonial: document.getElementById('nextTestimonial'),
    deliverySelect: document.getElementById('delivery'),
    addressGroup: document.getElementById('addressGroup'),
    particles: document.getElementById('particles')
};

// ===========================
// INITIALIZATION
// ===========================
document.addEventListener('DOMContentLoaded', init);

function init() {
    // Preloader
    setTimeout(() => {
        DOM.preloader.classList.add('hidden');
    }, 1500);

    // Initialize components
    initNavbar();
    initMobileMenu();
    initCart();
    initMenuFilter();
    initTestimonials();
    initOrderForm();
    initScrollAnimations();
    initBackToTop();
    initParticles();
    initCounterAnimation();
    initDeliveryToggle();
    setMinDate();

    // Update cart display
    updateCartUI();
}

// ===========================
// NAVBAR
// ===========================
function initNavbar() {
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            DOM.navbar.classList.add('scrolled');
        } else {
            DOM.navbar.classList.remove('scrolled');
        }
        
        // Update active nav link
        updateActiveNavLink();
        lastScroll = currentScroll;
    });
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        if (window.pageYOffset >= sectionTop) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// ===========================
// MOBILE MENU
// ===========================
function initMobileMenu() {
    DOM.mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    
    // Close menu on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
        if (state.isMenuOpen && !e.target.closest('.nav-links') && !e.target.closest('.mobile-menu-btn')) {
            closeMobileMenu();
        }
    });
}

function toggleMobileMenu() {
    state.isMenuOpen = !state.isMenuOpen;
    DOM.navLinks.classList.toggle('active');
    DOM.mobileMenuBtn.classList.toggle('active');
}

function closeMobileMenu() {
    state.isMenuOpen = false;
    DOM.navLinks.classList.remove('active');
    DOM.mobileMenuBtn.classList.remove('active');
}

// ===========================
// CART SYSTEM
// ===========================
function initCart() {
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', handleAddToCart);
    });
    
    // Clear cart
    DOM.clearCartBtn.addEventListener('click', clearCart);
    
    // Cart button scroll to order
    DOM.cartBtn.addEventListener('click', () => {
        document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
    });
}

function handleAddToCart(e) {
    const btn = e.currentTarget;
    const id = btn.dataset.id;
    const name = btn.dataset.name;
    const price = parseFloat(btn.dataset.price);
    
    addToCart({ id, name, price });
    
    // Button feedback
    const originalText = btn.textContent;
    btn.textContent = 'Added! ✓';
    btn.classList.add('added');
    
    setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('added');
    }, 1500);
    
    // Animate cart count
    DOM.cartCount.classList.add('pop');
    setTimeout(() => DOM.cartCount.classList.remove('pop'), 300);
}

function addToCart(item) {
    const existing = state.cart.find(i => i.id === item.id);
    
    if (existing) {
        existing.qty += 1;
    } else {
        state.cart.push({ ...item, qty: 1 });
    }
    
    saveCart();
    updateCartUI();
}

function removeFromCart(id) {
    state.cart = state.cart.filter(item => item.id !== id);
    saveCart();
    updateCartUI();
}

function updateQuantity(id, delta) {
    const item = state.cart.find(i => i.id === id);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
            removeFromCart(id);
            return;
        }
    }
    saveCart();
    updateCartUI();
}

function clearCart() {
    state.cart = [];
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('halimaCakes_cart', JSON.stringify(state.cart));
}

function updateCartUI() {
    const totalItems = state.cart.reduce((sum, item) => sum + item.qty, 0);
    DOM.cartCount.textContent = totalItems;
    
    if (state.cart.length === 0) {
        DOM.cartItems.innerHTML = `
            <div class="cart-empty">
                <span>🧁</span>
                <p>Your cart is empty</p>
                <small>Browse our menu and add items!</small>
            </div>
        `;
        DOM.cartTotal.style.display = 'none';
        DOM.clearCartBtn.style.display = 'none';
    } else {
        DOM.cartItems.innerHTML = state.cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${escapeHtml(item.name)}</div>
                    <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
                </div>
                <div class="cart-item-qty">
                    <button class="qty-btn" onclick="updateQuantity('${escapeHtml(item.id)}', -1)">-</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn" onclick="updateQuantity('${escapeHtml(item.id)}', 1)">+</button>
                    <span class="cart-item-remove" onclick="removeFromCart('${escapeHtml(item.id)}')">×</span>
                </div>
            </div>
        `).join('');
        
        const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        DOM.subtotal.textContent = `$${subtotal.toFixed(2)}`;
        DOM.grandTotal.textContent = `$${subtotal.toFixed(2)}`;
        DOM.cartTotal.style.display = 'block';
        DOM.clearCartBtn.style.display = 'block';
    }
}

// ===========================
// MENU FILTER
// ===========================
function initMenuFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const products = document.querySelectorAll('.product-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            
            products.forEach(product => {
                if (filter === 'all' || product.dataset.category === filter) {
                    product.classList.remove('hidden');
                    product.style.animation = 'scaleIn 0.4s ease forwards';
                } else {
                    product.classList.add('hidden');
                }
            });
        });
    });
}

// ===========================
// TESTIMONIALS SLIDER
// ===========================
function initTestimonials() {
    const cards = DOM.testimonialsSlider.querySelectorAll('.testimonial-card');
    state.testimonialCount = cards.length;
    
    // Create dots
    for (let i = 0; i < state.testimonialCount; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToTestimonial(i));
        DOM.testimonialDots.appendChild(dot);
    }
    
    DOM.prevTestimonial.addEventListener('click', () => {
        goToTestimonial((state.currentTestimonial - 1 + state.testimonialCount) % state.testimonialCount);
    });
    
    DOM.nextTestimonial.addEventListener('click', () => {
        goToTestimonial((state.currentTestimonial + 1) % state.testimonialCount);
    });
    
    // Auto-play
    setInterval(() => {
        goToTestimonial((state.currentTestimonial + 1) % state.testimonialCount);
    }, 5000);
}

function goToTestimonial(index) {
    const cards = DOM.testimonialsSlider.querySelectorAll('.testimonial-card');
    const dots = DOM.testimonialDots.querySelectorAll('.dot');
    
    cards[state.currentTestimonial].classList.remove('active');
    dots[state.currentTestimonial].classList.remove('active');
    
    state.currentTestimonial = index;
    
    cards[state.currentTestimonial].classList.add('active');
    dots[state.currentTestimonial].classList.add('active');
}

// ===========================
// ORDER FORM
// ===========================
function initOrderForm() {
    DOM.orderForm.addEventListener('submit', handleOrderSubmit);
}

function handleOrderSubmit(e) {
    e.preventDefault();
    
    // Collect form data
    const formData = new FormData(DOM.orderForm);
    const orderData = Object.fromEntries(formData.entries());
    
    // Add cart items to order
    orderData.cartItems = state.cart;
    orderData.cartTotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    orderData.orderDate = new Date().toISOString();
    
    // Store order (in real app, this would go to a backend)
    const orders = JSON.parse(localStorage.getItem('halimaCakes_orders') || '[]');
    orders.push(orderData);
    localStorage.setItem('halimaCakes_orders', JSON.stringify(orders));
    
    // Show success modal
    DOM.successModal.classList.add('active');
    
    // Reset form and cart
    DOM.orderForm.reset();
    clearCart();
    
    // Create confetti effect
    createConfetti();
}

function closeModal() {
    DOM.successModal.classList.remove('active');
}

// Close modal on overlay click
document.querySelector('.modal-overlay')?.addEventListener('click', closeModal);

// ===========================
// DELIVERY TOGGLE
// ===========================
function initDeliveryToggle() {
    DOM.deliverySelect.addEventListener('change', () => {
        const value = DOM.deliverySelect.value;
        if (value.includes('delivery')) {
            DOM.addressGroup.style.display = 'block';
        } else {
            DOM.addressGroup.style.display = 'none';
        }
    });
}

// ===========================
// SCROLL ANIMATIONS (Intersection Observer)
// ===========================
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Don't unobserve to allow re-animation if needed
            }
        });
    }, observerOptions);
    
    // Observe all animatable elements
    const animElements = document.querySelectorAll(
        '.section-header, .category-card, .product-card, .cakepop-card, ' +
        '.custom-feature, .tier-card, .gallery-item, .bundle-card, ' +
        '.order-form-container, .order-sidebar > *, ' +
        '.animate-fade-in, .animate-slide-up, .animate-slide-left, .animate-slide-right, .animate-scale'
    );
    
    animElements.forEach(el => observer.observe(el));
}

// ===========================
// BACK TO TOP
// ===========================
function initBackToTop() {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 500) {
            DOM.backToTop.classList.add('visible');
        } else {
            DOM.backToTop.classList.remove('visible');
        }
    });
    
    DOM.backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ===========================
// PARTICLES
// ===========================
function initParticles() {
    if (!DOM.particles) return;
    
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.width = `${Math.random() * 6 + 2}px`;
        particle.style.height = particle.style.width;
        particle.style.animationDelay = `${Math.random() * 10}s`;
        particle.style.animationDuration = `${Math.random() * 10 + 8}s`;
        DOM.particles.appendChild(particle);
    }
}

// ===========================
// COUNTER ANIMATION
// ===========================
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
    const target = parseInt(element.dataset.count);
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// ===========================
// CONFETTI EFFECT
// ===========================
function createConfetti() {
    const colors = ['#E8739E', '#C9A96E', '#FF6B9D', '#F5A3C4', '#10B981'];
    const emojis = ['🎂', '🧁', '🍰', '🎉', '✨', '🎊'];
    
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            confetti.style.position = 'fixed';
            confetti.style.left = `${Math.random() * 100}vw`;
            confetti.style.top = '100vh';
            confetti.style.fontSize = `${Math.random() * 20 + 16}px`;
            confetti.style.zIndex = '10001';
            confetti.style.pointerEvents = 'none';
            confetti.style.animation = `confetti ${Math.random() * 2 + 2}s ease-out forwards`;
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 4000);
        }, i * 80);
    }
}

// ===========================
// UTILITY FUNCTIONS
// ===========================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function setMinDate() {
    const dateInput = document.getElementById('deliveryDate');
    if (dateInput) {
        const today = new Date();
        today.setDate(today.getDate() + 3); // Minimum 3 days notice
        dateInput.min = today.toISOString().split('T')[0];
    }
}

// ===========================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ===========================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ===========================
// BUTTON RIPPLE EFFECT
// ===========================
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
});
