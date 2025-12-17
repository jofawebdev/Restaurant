// Home Page Specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize components when DOM is fully loaded
    
    // Initialize Owl Carousel for testimonials
    initTestimonialsCarousel();
    
    // Initialize smooth scrolling for anchor links
    initSmoothScrolling();
    
    // Initialize animations on scroll
    initScrollAnimations();
    
    // Initialize category filtering
    initCategoryFiltering();
    
    // Initialize date picker restrictions
    initDatePicker();
});

/**
 * Initialize Owl Carousel for testimonials section
 */
function initTestimonialsCarousel() {
    if (document.querySelector('.testimonials-carousel')) {
        $('.testimonials-carousel').owlCarousel({
            loop: true,
            margin: 20,
            nav: true,
            dots: true,
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
                1200: {
                    items: 3
                }
            }
        });
    }
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Initialize scroll animations for elements
 */
function initScrollAnimations() {
    // Create Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Observe elements with animation classes
    document.querySelectorAll('.offer-card, .menu-item, .testimonial-item').forEach(el => {
        observer.observe(el);
    });
}

/**
 * Initialize category filtering for menu items
 * Using Bootstrap 5 Tab component instead of custom JS filtering
 */
function initCategoryFiltering() {
    // Bootstrap 5 tabs handle the filtering, but we can add some custom enhancements
    
    // Add active state styling to tab buttons
    const tabButtons = document.querySelectorAll('#categoryTabs .nav-link');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Trigger custom event for any additional functionality
            document.dispatchEvent(new CustomEvent('categoryChanged', {
                detail: {
                    category: this.id.replace('-tab', '')
                }
            }));
        });
    });
}

/**
 * Initialize date picker with restrictions
 */
function initDatePicker() {
    const bookingDateInput = document.getElementById('booking_date');
    
    if (bookingDateInput) {
        // Set minimum date to today
        const today = new Date();
        const minDate = today.toISOString().split('T')[0];
        bookingDateInput.setAttribute('min', minDate);
        
        // Set maximum date to 3 months from today
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 3);
        const maxDateString = maxDate.toISOString().split('T')[0];
        bookingDateInput.setAttribute('max', maxDateString);
        
        // Add change event listener
        bookingDateInput.addEventListener('change', function() {
            validateBookingDate(this.value);
        });
    }
}

/**
 * Validate booking date
 */
function validateBookingDate(dateString) {
    const selectedDate = new Date(dateString);
    const today = new Date();
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    
    if (selectedDate < today) {
        alert('Please select a future date for your booking.');
        document.getElementById('booking_date').value = '';
        return false;
    }
    
    if (selectedDate > maxDate) {
        alert('Bookings can only be made up to 3 months in advance.');
        document.getElementById('booking_date').value = '';
        return false;
    }
    
    return true;
}

/**
 * Enhance form submission with validation
 */
function enhanceFormSubmission() {
    const bookingForm = document.querySelector('.booking-form form');
    
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            // Add any custom validation here
            const phoneNumber = document.getElementById('phone_number').value;
            
            // Simple phone validation
            if (!/^[\d\s\-\+\(\)]+$/.test(phoneNumber)) {
                e.preventDefault();
                alert('Please enter a valid phone number.');
                return false;
            }
            
            // If all validations pass, form will submit normally
            return true;
        });
    }
}

/**
 * Initialize Google Maps if needed
 */
function initGoogleMap() {
    // This function would initialize Google Maps
    // You would need to replace the placeholder with actual map initialization code
    
    const mapPlaceholder = document.getElementById('googleMap');
    
    if (mapPlaceholder && typeof google !== 'undefined') {
        // Example map initialization (you would need to customize with your API key and location)
        /*
        const map = new google.maps.Map(mapPlaceholder, {
            center: { lat: -34.397, lng: 150.644 },
            zoom: 8,
        });
        */
        
        // For now, we'll just remove the placeholder content
        mapPlaceholder.innerHTML = '<div class="d-flex justify-content-center align-items-center h-100 bg-light"><p class="text-muted">Map would load here with proper API configuration</p></div>';
    }
}

// Call initialization functions
enhanceFormSubmission();
initGoogleMap();