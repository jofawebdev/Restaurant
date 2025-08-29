/**
 * About Page JavaScript
 * Handles interactive elements for the about page
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize testimonial carousel
    initTestimonialCarousel();
    
    // Initialize statistics counters
    initStatisticsCounters();
    
    // Initialize team member hover effects
    initTeamHoverEffects();
});

/**
 * Initialize testimonial carousel with Owl Carousel
 */
function initTestimonialCarousel() {
    if (typeof $.fn.owlCarousel !== 'function') {
        console.error('Owl Carousel is not loaded');
        return;
    }
    
    $('.testimonial-carousel').owlCarousel({
        loop: true,
        margin: 20,
        nav: true,
        dots: false,
        autoplay: true,
        autoplayTimeout: 5000,
        autoplayHoverPause: true,
        responsive: {
            0: {
                items: 1
            },
            768: {
                items: 2
            },
            992: {
                items: 3
            }
        },
        navText: [
            '<i class="fa fa-chevron-left" aria-hidden="true"></i>',
            '<i class="fa fa-chevron-right" aria-hidden="true"></i>'
        ]
    });
}

/**
 * Initialize statistics counters with animation
 */
function initStatisticsCounters() {
    const statElements = document.querySelectorAll('.stat-number');
    
    // Only initialize if we have elements and Intersection Observer is supported
    if (statElements.length === 0 || !('IntersectionObserver' in window)) {
        return;
    }
    
    const options = {
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const target = parseInt(element.getAttribute('data-count'));
                animateCounter(element, target, 2000);
                observer.unobserve(element);
            }
        });
    }, options);
    
    statElements.forEach(stat => {
        observer.observe(stat);
    });
}

/**
 * Animate counter from 0 to target value
 * @param {HTMLElement} element - The element to animate
 * @param {number} target - The target value to count to
 * @param {number} duration - Animation duration in milliseconds
 */
function animateCounter(element, target, duration) {
    let startTime = null;
    const startValue = 0;
    
    function formatNumber(num) {
        return num.toLocaleString();
    }
    
    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const currentValue = Math.floor(progress * target);
        element.textContent = formatNumber(currentValue);
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            element.textContent = formatNumber(target);
        }
    }
    
    window.requestAnimationFrame(step);
}

/**
 * Initialize team member hover effects
 */
function initTeamHoverEffects() {
    const teamBoxes = document.querySelectorAll('.team-box');
    
    teamBoxes.forEach(box => {
        // Preload images for smoother hover effects
        const img = box.querySelector('img');
        if (img) {
            const imgSrc = img.getAttribute('src');
            if (imgSrc) {
                const preloadImg = new Image();
                preloadImg.src = imgSrc;
            }
        }
        
        // Add touch events for mobile devices
        box.addEventListener('touchstart', function() {
            this.classList.add('hover');
        }, {passive: true});
        
        box.addEventListener('touchend', function() {
            this.classList.remove('hover');
        }, {passive: true});
    });
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Export functions for use in other scripts if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initTestimonialCarousel,
        initStatisticsCounters,
        animateCounter,
        initTeamHoverEffects,
        initSmoothScrolling
    };
}