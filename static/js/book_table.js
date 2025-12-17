/**
 * Book Table JavaScript
 * Handles table booking form validation, date/time selection, and Google Maps integration
 */

// Global variables
let map;
let marker;
let bookingCalendar;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize booking form functionality
    initBookingForm();
    
    // Initialize date restrictions
    initDateRestrictions();
    
    // Initialize time slot selection
    initTimeSelection();
    
    // Initialize form validation
    initFormValidation();
});

/**
 * Initialize the main booking form functionality
 */
function initBookingForm() {
    const bookingForm = document.getElementById('bookingForm');
    const submitButton = document.getElementById('submitButton');
    
    if (!bookingForm) return;
    
    // Add real-time validation as user types
    addRealTimeValidation(bookingForm);
    
    // Handle form submission
    bookingForm.addEventListener('submit', function(event) {
        if (!validateForm(bookingForm)) {
            event.preventDefault();
            showFormErrors(bookingForm);
            return;
        }
        
        // Show loading state on submit button
        showLoadingState(submitButton, true);
        
        // Additional validation for date and time
        if (!validateBookingDateTime()) {
            event.preventDefault();
            showLoadingState(submitButton, false);
            return;
        }
        
        // Form is valid, allow submission to proceed
        console.log('Booking form submitted successfully');
    });
    
    // Phone number formatting
    const phoneInput = document.getElementById('phoneNumber');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            formatPhoneNumber(this);
        });
    }
    
    // Real-time availability check when date changes
    const dateInput = document.getElementById('bookingDate');
    if (dateInput) {
        dateInput.addEventListener('change', function() {
            checkDateAvailability(this.value);
        });
    }
}

/**
 * Initialize date restrictions for booking
 */
function initDateRestrictions() {
    const dateInput = document.getElementById('bookingDate');
    if (!dateInput) return;
    
    // Set minimum date to today
    const today = new Date();
    const minDate = today.toISOString().split('T')[0];
    dateInput.min = minDate;
    
    // Set maximum date to 3 months from today
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    dateInput.max = maxDate.toISOString().split('T')[0];
    
    // Disable past dates
    dateInput.addEventListener('input', function() {
        const selectedDate = new Date(this.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            this.value = minDate;
            showToast('Please select a future date.', 'warning');
        }
    });
}

/**
 * Initialize time slot selection functionality
 */
function initTimeSelection() {
    const timeSelect = document.getElementById('bookingTime');
    if (!timeSelect) return;
    
    // Create visual time slots if they don't exist
    createTimeSlots();
    
    // Update time slots based on selected date
    const dateInput = document.getElementById('bookingDate');
    if (dateInput) {
        dateInput.addEventListener('change', function() {
            updateTimeSlotsAvailability(this.value);
        });
    }
}

/**
 * Create visual time slot buttons
 */
function createTimeSlots() {
    const timeSelect = document.getElementById('bookingTime');
    const timeContainer = timeSelect.parentNode;
    
    // Remove existing time slots container if it exists
    const existingSlots = document.getElementById('timeSlotsContainer');
    if (existingSlots) {
        existingSlots.remove();
    }
    
    // Create time slots container
    const slotsContainer = document.createElement('div');
    slotsContainer.id = 'timeSlotsContainer';
    slotsContainer.className = 'time-slots mt-2';
    
    // Define available time slots
    const timeSlots = [
        '12:00', '12:30', '13:00', '13:30', '14:00',
        '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'
    ];
    
    // Create time slot buttons
    timeSlots.forEach(slot => {
        const slotButton = document.createElement('button');
        slotButton.type = 'button';
        slotButton.className = 'time-slot';
        slotButton.textContent = formatTimeForDisplay(slot);
        slotButton.dataset.time = slot;
        
        slotButton.addEventListener('click', function() {
            selectTimeSlot(this);
        });
        
        slotsContainer.appendChild(slotButton);
    });
    
    // Insert after the select element
    timeSelect.style.display = 'none';
    timeContainer.appendChild(slotsContainer);
    
    // Hide the original label and show new one
    const originalLabel = timeContainer.querySelector('label');
    if (originalLabel) {
        originalLabel.textContent = 'Preferred Time';
    }
}

/**
 * Select a time slot
 */
function selectTimeSlot(slotElement) {
    // Remove selected class from all slots
    const allSlots = document.querySelectorAll('.time-slot');
    allSlots.forEach(slot => {
        slot.classList.remove('selected');
    });
    
    // Add selected class to clicked slot
    slotElement.classList.add('selected');
    
    // Update the hidden select value
    const timeSelect = document.getElementById('bookingTime');
    timeSelect.value = slotElement.dataset.time;
}

/**
 * Format time for display (convert 24h to 12h)
 */
function formatTimeForDisplay(time24) {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12}:${minutes} ${ampm}`;
}

/**
 * Update time slots availability based on selected date
 */
function updateTimeSlotsAvailability(selectedDate) {
    const timeSlots = document.querySelectorAll('.time-slot');
    
    // Simulate availability check (in real app, this would be an API call)
    const today = new Date().toISOString().split('T')[0];
    const isToday = selectedDate === today;
    
    timeSlots.forEach(slot => {
        const slotTime = slot.dataset.time;
        const [hours] = slotTime.split(':');
        const currentHour = new Date().getHours();
        
        // If booking is for today, disable past times
        if (isToday && parseInt(hours) <= currentHour) {
            slot.classList.add('unavailable');
            slot.disabled = true;
        } else {
            slot.classList.remove('unavailable');
            slot.disabled = false;
            
            // Simulate random availability for demonstration
            const isAvailable = Math.random() > 0.3; // 70% available
            if (!isAvailable) {
                slot.classList.add('unavailable');
                slot.disabled = true;
            }
        }
    });
    
    // Show availability message
    showAvailabilityMessage(selectedDate);
}

/**
 * Show availability message for selected date
 */
function showAvailabilityMessage(date) {
    // Remove existing message
    const existingMessage = document.getElementById('availabilityMessage');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const dateInput = document.getElementById('bookingDate');
    const parent = dateInput.parentNode;
    
    // Create availability message
    const message = document.createElement('div');
    message.id = 'availabilityMessage';
    message.className = 'availability-indicator availability-available mt-2';
    message.innerHTML = '<i class="fas fa-check-circle me-1"></i> Good availability';
    
    parent.appendChild(message);
}

/**
 * Initialize comprehensive form validation
 */
function initFormValidation() {
    const form = document.getElementById('bookingForm');
    if (!form) return;
    
    // Add input event listeners for real-time validation
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', function() {
            validateField(this);
        });
    });
}

/**
 * Add real-time validation to form fields
 */
function addRealTimeValidation(form) {
    const fields = form.querySelectorAll('input, textarea, select');
    
    fields.forEach(field => {
        // Validate on input change
        field.addEventListener('input', function() {
            // Clear validation state when user starts typing
            if (this.classList.contains('is-invalid')) {
                validateField(this);
            }
        });
        
        // Validate on blur (when field loses focus)
        field.addEventListener('blur', function() {
            validateField(this);
        });
    });
}

/**
 * Validate a single form field
 */
function validateField(field) {
    // Remove previous validation states
    field.classList.remove('is-valid', 'is-invalid');
    
    // Skip validation if field is not required and empty
    if (!field.hasAttribute('required') && !field.value.trim()) {
        return true;
    }
    
    let isValid = true;
    
    // Field-specific validation rules
    switch (field.type) {
        case 'tel':
            isValid = validatePhoneNumber(field.value);
            break;
        case 'email':
            isValid = validateEmail(field.value);
            break;
        case 'date':
            isValid = validateDate(field.value);
            break;
        default:
            if (field.hasAttribute('required')) {
                isValid = field.value.trim() !== '';
            }
            break;
    }
    
    // Select elements validation
    if (field.tagName === 'SELECT' && field.hasAttribute('required')) {
        isValid = field.value !== '' && field.value !== null;
    }
    
    // Apply validation styling
    if (isValid) {
        field.classList.add('is-valid');
    } else {
        field.classList.add('is-invalid');
    }
    
    return isValid;
}

/**
 * Validate phone number format
 */
function validatePhoneNumber(phone) {
    if (!phone) return false;
    
    // Basic phone validation - adjust regex for your country
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate email format
 */
function validateEmail(email) {
    if (!email) return true; // Email is optional
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate date
 */
function validateDate(date) {
    if (!date) return false;
    
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return selectedDate >= today;
}

/**
 * Format phone number as user types
 */
function formatPhoneNumber(input) {
    // Remove all non-digit characters
    let numbers = input.value.replace(/\D/g, '');
    
    // Limit to 15 digits
    numbers = numbers.substring(0, 15);
    
    // Format based on length
    let formatted = numbers;
    if (numbers.length > 7) {
        formatted = numbers.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    } else if (numbers.length > 3) {
        formatted = numbers.replace(/(\d{3})(\d{0,3})/, '$1-$2');
    }
    
    input.value = formatted;
}

/**
 * Validate entire form before submission
 */
function validateForm(form) {
    let isValid = true;
    const fields = form.querySelectorAll('input, textarea, select');
    
    fields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

/**
 * Validate booking date and time combination
 */
function validateBookingDateTime() {
    const dateInput = document.getElementById('bookingDate');
    const timeSelect = document.getElementById('bookingTime');
    
    if (!dateInput.value) {
        showToast('Please select a booking date.', 'error');
        return false;
    }
    
    // If time is selected, validate it's not in the past for today
    if (timeSelect.value) {
        const selectedDate = new Date(dateInput.value);
        const today = new Date();
        
        if (selectedDate.toDateString() === today.toDateString()) {
            const [selectedHours, selectedMinutes] = timeSelect.value.split(':');
            const selectedTime = new Date();
            selectedTime.setHours(parseInt(selectedHours), parseInt(selectedMinutes));
            
            if (selectedTime < today) {
                showToast('Please select a future time for today\'s booking.', 'error');
                return false;
            }
        }
    }
    
    return true;
}

/**
 * Check date availability (simulated)
 */
function checkDateAvailability(date) {
    // In a real application, this would be an API call
    console.log('Checking availability for:', date);
    
    // Simulate API delay
    setTimeout(() => {
        const isAvailable = Math.random() > 0.1; // 90% available
        
        if (!isAvailable) {
            showToast('Selected date is fully booked. Please choose another date.', 'warning');
        }
    }, 500);
}

/**
 * Display form errors to user
 */
function showFormErrors(form) {
    const invalidFields = form.querySelectorAll('.is-invalid');
    
    if (invalidFields.length > 0) {
        // Scroll to first invalid field
        invalidFields[0].scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
        
        // Focus on first invalid field
        invalidFields[0].focus();
        
        // Show toast notification
        showToast('Please correct the errors in the form before submitting.', 'error');
    }
}

/**
 * Show/hide loading state on submit button
 */
function showLoadingState(button, isLoading) {
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner me-2"></i>Processing...';
    } else {
        button.classList.remove('loading');
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-calendar-check me-2"></i>Confirm Reservation';
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-bg-${type === 'error' ? 'danger' : type} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${getToastIcon(type)} me-2"></i>${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    // Show toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 5000
    });
    
    toast.show();
    
    // Remove toast from DOM after it's hidden
    toastElement.addEventListener('hidden.bs.toast', function() {
        this.remove();
    });
}

/**
 * Get appropriate icon for toast type
 */
function getToastIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    
    return icons[type] || 'info-circle';
}

/**
 * Google Maps initialization
 */
function initMap() {
    // Default coordinates (replace with your restaurant's coordinates)
    const restaurantLocation = { lat: -1.2921, lng: 36.8219 }; // Nairobi coordinates
    
    // Create map
    map = new google.maps.Map(document.getElementById('googleMap'), {
        zoom: 15,
        center: restaurantLocation,
        styles: [
            {
                "featureType": "all",
                "elementType": "geometry",
                "stylers": [{ "color": "#f5f5f5" }]
            },
            {
                "featureType": "poi",
                "elementType": "labels",
                "stylers": [{ "visibility": "off" }]
            }
        ]
    });
    
    // Create marker
    marker = new google.maps.Marker({
        position: restaurantLocation,
        map: map,
        title: 'Feane Restaurant',
        animation: google.maps.Animation.DROP
    });
    
    // Create info window
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div class="map-info-window">
                <h6 class="fw-bold mb-1">Feane Restaurant</h6>
                <p class="mb-1 small">123 Restaurant Street</p>
                <p class="mb-1 small">Nairobi, Kenya</p>
                <a href="https://maps.google.com/?q=123+Restaurant+Street+Nairobi" target="_blank" class="btn btn-sm btn-warning mt-1">
                    Get Directions
                </a>
            </div>
        `
    });
    
    // Add click listener to marker
    marker.addListener('click', function() {
        infoWindow.open(map, marker);
    });
    
    // Open info window by default
    infoWindow.open(map, marker);
    
    // Hide placeholder
    const placeholder = document.querySelector('.map-placeholder');
    if (placeholder) {
        placeholder.style.display = 'none';
    }
}

// Make initMap available globally
window.initMap = initMap;