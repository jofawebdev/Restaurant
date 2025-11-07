/**
 * About Page JavaScript - Bootstrap 5 Enhanced
 * Modern, performant, and accessible interactive elements for the about page
 */

class AboutPage {
    constructor() {
        this.init();
    }

    /**
     * Initialize all about page functionality
     */
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initTestimonialCarousel();
            this.initStatisticsCounters();
            this.initTeamHoverEffects();
            this.initSmoothScrolling();
            this.initLoadingStates();
            this.initIntersectionObserver();
            
            console.log('About page initialized successfully');
        });
    }

    /**
     * Initialize testimonial carousel with Owl Carousel
     * Enhanced with Bootstrap 5 compatibility and error handling
     */
    initTestimonialCarousel() {
        const carouselElement = document.querySelector('.testimonial-carousel');
        
        if (!carouselElement) {
            console.warn('Testimonial carousel element not found');
            return;
        }

        if (typeof $.fn.owlCarousel === 'undefined') {
            console.error('Owl Carousel is not loaded');
            this.fallbackCarousel(carouselElement);
            return;
        }

        try {
            $(carouselElement).owlCarousel({
                loop: true,
                margin: 30,
                nav: true,
                dots: true,
                autoplay: true,
                autoplayTimeout: 6000,
                autoplayHoverPause: true,
                smartSpeed: 800,
                responsive: {
                    0: {
                        items: 1,
                        margin: 20
                    },
                    768: {
                        items: 2,
                        margin: 25
                    },
                    992: {
                        items: 3,
                        margin: 30
                    }
                },
                navText: [
                    '<i class="fa fa-chevron-left" aria-hidden="true"></i>',
                    '<i class="fa fa-chevron-right" aria-hidden="true"></i>'
                ],
                onInitialized: () => {
                    carouselElement.classList.add('owl-loaded');
                    this.dispatchEvent('carousel:initialized', { element: carouselElement });
                }
            });
        } catch (error) {
            console.error('Owl Carousel initialization failed:', error);
            this.fallbackCarousel(carouselElement);
        }
    }

    /**
     * Fallback carousel implementation if Owl Carousel fails
     */
    fallbackCarousel(carouselElement) {
        const testimonials = carouselElement.querySelectorAll('.testimonial-box');
        let currentIndex = 0;

        // Show only first testimonial
        testimonials.forEach((testimonial, index) => {
            testimonial.style.display = index === 0 ? 'block' : 'none';
        });

        // Simple manual navigation
        const navContainer = document.createElement('div');
        navContainer.className = 'fallback-nav text-center mt-4';
        navContainer.innerHTML = `
            <button class="btn btn-gold me-2 prev-btn">
                <i class="fa fa-chevron-left" aria-hidden="true"></i> Previous
            </button>
            <button class="btn btn-gold next-btn">
                Next <i class="fa fa-chevron-right" aria-hidden="true"></i>
            </button>
        `;

        carouselElement.parentNode.appendChild(navContainer);

        const showTestimonial = (index) => {
            testimonials.forEach(testimonial => testimonial.style.display = 'none');
            testimonials[index].style.display = 'block';
            currentIndex = index;
        };

        navContainer.querySelector('.prev-btn').addEventListener('click', () => {
            let newIndex = currentIndex - 1;
            if (newIndex < 0) newIndex = testimonials.length - 1;
            showTestimonial(newIndex);
        });

        navContainer.querySelector('.next-btn').addEventListener('click', () => {
            let newIndex = currentIndex + 1;
            if (newIndex >= testimonials.length) newIndex = 0;
            showTestimonial(newIndex);
        });
    }

    /**
     * Initialize statistics counters with Intersection Observer
     */
    initStatisticsCounters() {
        const statElements = document.querySelectorAll('.stat-number');
        
        if (statElements.length === 0) return;

        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const target = parseInt(element.getAttribute('data-count'));
                    const duration = 2000;
                    
                    this.animateCounter(element, target, duration);
                    observer.unobserve(element);
                }
            });
        }, observerOptions);

        statElements.forEach(stat => observer.observe(stat));
    }

    /**
     * Animate counter with smooth easing and performance optimization
     */
    animateCounter(element, target, duration) {
        let startTime = null;
        const startValue = 0;
        const easing = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

        const formatNumber = (num) => {
            if (num >= 1000000) {
                return (num / 1000000).toFixed(1) + 'M+';
            } else if (num >= 1000) {
                return (num / 1000).toFixed(1) + 'K+';
            }
            return num.toLocaleString();
        };

        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easing(progress);
            const currentValue = Math.floor(easedProgress * target);

            element.textContent = formatNumber(currentValue);

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                element.textContent = formatNumber(target);
                this.dispatchEvent('counter:complete', { element, target });
            }
        };

        requestAnimationFrame(step);
    }

    /**
     * Initialize team member hover effects with touch support
     */
    initTeamHoverEffects() {
        const teamBoxes = document.querySelectorAll('.team-box');
        
        teamBoxes.forEach(box => {
            // Preload images for better performance
            const img = box.querySelector('img');
            if (img) {
                this.preloadImage(img.src);
            }

            // Mouse events
            box.addEventListener('mouseenter', () => this.handleTeamHover(box, true));
            box.addEventListener('mouseleave', () => this.handleTeamHover(box, false));

            // Touch events for mobile
            box.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleTeamHover(box, true);
            }, { passive: false });

            box.addEventListener('touchend', () => {
                this.handleTeamHover(box, false);
            });
        });
    }

    /**
     * Handle team box hover state
     */
    handleTeamHover(box, isHovering) {
        if (isHovering) {
            box.classList.add('hover-active');
            this.dispatchEvent('team:hover', { element: box });
        } else {
            box.classList.remove('hover-active');
        }
    }

    /**
     * Initialize smooth scrolling for anchor links
     */
    initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;

                const targetElement = document.querySelector(href);
                if (targetElement) {
                    e.preventDefault();
                    this.scrollToElement(targetElement);
                }
            });
        });
    }

    /**
     * Smooth scroll to element with offset for fixed header
     */
    scrollToElement(element) {
        const headerHeight = document.querySelector('.header_section')?.offsetHeight || 0;
        const targetPosition = element.offsetTop - headerHeight - 20;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    /**
     * Initialize loading states and skeleton screens
     */
    initLoadingStates() {
        // Add loading class to images
        document.querySelectorAll('img').forEach(img => {
            if (!img.complete) {
                img.classList.add('loading');
                img.addEventListener('load', () => {
                    img.classList.remove('loading');
                    img.classList.add('loaded');
                });
            }
        });
    }

    /**
     * Initialize Intersection Observer for animations
     */
    initIntersectionObserver() {
        const animatedElements = document.querySelectorAll('.mission-box, .vision-box, .team-box, .stat-box');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        animatedElements.forEach(el => observer.observe(el));
    }

    /**
     * Preload images for better performance
     */
    preloadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = src;
            img.onload = resolve;
            img.onerror = reject;
        });
    }

    /**
     * Dispatch custom events for extensibility
     */
    dispatchEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }
}

// Initialize the about page
const aboutPage = new AboutPage();

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AboutPage;
}