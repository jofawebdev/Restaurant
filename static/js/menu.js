/**
 * Menu Page JavaScript
 * Handles interactive elements for the menu page
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize menu functionality
    initMenuPage();
});

/**
 * Initialize all menu page functionality
 */
function initMenuPage() {
    // Initialize category tabs interaction
    initCategoryTabs();
    
    // Initialize menu item animations
    initMenuAnimations();
    
    // Initialize pagination enhancements
    initPaginationEnhancements();
    
    // Initialize cart interaction handlers
    initCartInteractions();
}

/**
 * Initialize category tabs with enhanced interaction
 */
function initCategoryTabs() {
    const categoryTabs = document.getElementById('categoryTabs');
    
    if (categoryTabs) {
        const navLinks = categoryTabs.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            // Add click animation
            link.addEventListener('click', function(e) {
                // Add loading state for better UX during page transition
                if (!this.classList.contains('disabled')) {
                    this.classList.add('loading');
                    
                    // Remove loading state after a short delay
                    setTimeout(() => {
                        this.classList.remove('loading');
                    }, 1000);
                }
            });
            
            // Add hover effects
            link.addEventListener('mouseenter', function() {
                if (!this.classList.contains('active') && !this.classList.contains('disabled')) {
                    this.style.transform = 'translateY(-2px)';
                }
            });
            
            link.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    }
}

/**
 * Initialize menu item animations and interactions
 */
function initMenuAnimations() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    // Add intersection observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Set initial state and observe each menu item
    menuItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        item.style.transitionDelay = `${index * 0.1}s`;
        
        observer.observe(item);
    });
}

/**
 * Enhance pagination with additional functionality
 */
function initPaginationEnhancements() {
    const paginationLinks = document.querySelectorAll('.pagination .page-link');
    
    paginationLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Add loading indicator for pagination
            const paginationContainer = this.closest('.pagination');
            if (paginationContainer) {
                paginationContainer.style.opacity = '0.7';
                
                // Restore opacity after a delay
                setTimeout(() => {
                    paginationContainer.style.opacity = '1';
                }, 500);
            }
        });
    });
}

/**
 * Initialize cart interaction handlers
 */
function initCartInteractions() {
    const addToCartForms = document.querySelectorAll('form[action*="add_to_cart"]');
    
    addToCartForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const button = this.querySelector('button[type="submit"]');
            const originalText = button.innerHTML;
            
            // Show loading state
            button.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Adding...';
            button.disabled = true;
            
            // Store form data for potential retry
            const formData = new FormData(this);
            
            // Submit form via AJAX for better UX
            e.preventDefault();
            
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': formData.get('csrfmiddlewaretoken')
                }
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Network response was not ok.');
            })
            .then(data => {
                // Show success feedback
                showCartFeedback('Item added to cart!', 'success');
                
                // Update cart counter if exists
                updateCartCounter(data.cart_count);
                
                // Reset button
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.disabled = false;
                }, 1500);
            })
            .catch(error => {
                console.error('Error adding to cart:', error);
                
                // Show error feedback
                showCartFeedback('Failed to add item. Please try again.', 'error');
                
                // Reset button
                button.innerHTML = originalText;
                button.disabled = false;
            });
        });
    });
}

/**
 * Show feedback message for cart actions
 * @param {string} message - The message to display
 * @param {string} type - The type of feedback (success, error, etc.)
 */
function showCartFeedback(message, type) {
    // Remove existing feedback if any
    const existingFeedback = document.querySelector('.cart-feedback');
    if (existingFeedback) {
        existingFeedback.remove();
    }
    
    // Create feedback element
    const feedback = document.createElement('div');
    feedback.className = `cart-feedback alert alert-${type === 'success' ? 'success' : 'danger'} position-fixed`;
    feedback.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 1050;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    `;
    feedback.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2"></i>
            <span>${message}</span>
            <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(feedback);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.remove();
        }
    }, 3000);
    
    // Initialize Bootstrap dismiss functionality
    const closeButton = feedback.querySelector('.btn-close');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            feedback.remove();
        });
    }
}

/**
 * Update cart counter in the navigation
 * @param {number} count - The new cart count
 */
function updateCartCounter(count) {
    const cartCounter = document.querySelector('.cart-counter');
    if (cartCounter) {
        // Add animation
        cartCounter.style.transform = 'scale(1.2)';
        setTimeout(() => {
            cartCounter.style.transform = 'scale(1)';
        }, 300);
        
        // Update count
        cartCounter.textContent = count;
    }
}

/**
 * Utility function to format prices
 * @param {number} price - The price to format
 * @returns {string} Formatted price string
 */
function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}

// Export functions for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initMenuPage,
        initCategoryTabs,
        initMenuAnimations,
        formatPrice
    };
}