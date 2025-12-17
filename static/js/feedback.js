/**
 * Feedback Form JavaScript
 * Handles form validation, submission, and user interactions
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize feedback form functionality
    initFeedbackForm();
    
    // Initialize testimonial interactions
    initTestimonials();
    
    // Initialize file upload preview
    initFileUploadPreview();
});

/**
 * Initialize the main feedback form functionality
 */
function initFeedbackForm() {
    const feedbackForm = document.getElementById('feedbackForm');
    const submitButton = document.getElementById('submitButton');
    const ratingSelect = document.getElementById('ratingSelect');
    
    if (!feedbackForm) return;
    
    // Add real-time validation as user types
    addRealTimeValidation(feedbackForm);
    
    // Handle form submission
    feedbackForm.addEventListener('submit', function(event) {
        if (!validateForm(feedbackForm)) {
            event.preventDefault();
            showFormErrors(feedbackForm);
            return;
        }
        
        // Show loading state on submit button
        showLoadingState(submitButton, true);
        
        // Form is valid, allow submission to proceed
        // The loading state will be removed when page reloads or redirects
    });
    
    // Enhanced rating selection experience
    if (ratingSelect) {
        ratingSelect.addEventListener('change', function() {
            updateRatingDisplay(this.value);
        });
        
        // Initialize rating display if there's a preselected value
        if (ratingSelect.value) {
            updateRatingDisplay(ratingSelect.value);
        }
    }
    
    // Add input event listeners for real-time validation
    const requiredFields = feedbackForm.querySelectorAll('[required]');
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
        case 'email':
            isValid = validateEmail(field.value);
            break;
        case 'file':
            isValid = validateFile(field);
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
    
    // Textarea validation
    if (field.tagName === 'TEXTAREA' && field.hasAttribute('required')) {
        isValid = field.value.trim() !== '';
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
 * Validate email format
 */
function validateEmail(email) {
    if (!email) return true; // Email is optional
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate uploaded file
 */
function validateFile(fileInput) {
    if (!fileInput.files.length) return true; // File is optional
    
    const file = fileInput.files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    // Check file type
    if (!allowedTypes.includes(file.type)) {
        return false;
    }
    
    // Check file size
    if (file.size > maxSize) {
        return false;
    }
    
    return true;
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
 * Update visual rating display based on selected value
 */
function updateRatingDisplay(ratingValue) {
    const ratingDisplay = document.getElementById('ratingDisplay');
    
    // Create rating display if it doesn't exist
    if (!ratingDisplay) {
        const ratingContainer = document.getElementById('ratingSelect').parentNode;
        const displayElement = document.createElement('div');
        displayElement.id = 'ratingDisplay';
        displayElement.className = 'mt-2 p-3 bg-light rounded';
        displayElement.style.display = 'none';
        ratingContainer.appendChild(displayElement);
    }
    
    const displayElement = document.getElementById('ratingDisplay');
    
    if (ratingValue) {
        const ratings = {
            '1': { text: 'Poor', class: 'text-danger' },
            '2': { text: 'Fair', class: 'text-warning' },
            '3': { text: 'Good', class: 'text-info' },
            '4': { text: 'Very Good', class: 'text-primary' },
            '5': { text: 'Excellent', class: 'text-success' }
        };
        
        const rating = ratings[ratingValue];
        const stars = '★'.repeat(ratingValue) + '☆'.repeat(5 - ratingValue);
        
        displayElement.innerHTML = `
            <strong class="${rating.class}">${stars}</strong>
            <span class="ms-2 ${rating.class}">${rating.text}</span>
        `;
        displayElement.style.display = 'block';
    } else {
        displayElement.style.display = 'none';
    }
}

/**
 * Show/hide loading state on submit button
 */
function showLoadingState(button, isLoading) {
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner me-2"></i>Submitting...';
    } else {
        button.classList.remove('loading');
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Submit Feedback';
    }
}

/**
 * Initialize testimonial interactions
 */
function initTestimonials() {
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    
    testimonialCards.forEach(card => {
        card.addEventListener('click', function() {
            // Add visual feedback when card is clicked
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

/**
 * Initialize file upload preview functionality
 */
function initFileUploadPreview() {
    const fileInput = document.getElementById('feedbackImage');
    
    if (!fileInput) return;
    
    fileInput.addEventListener('change', function() {
        const file = this.files[0];
        
        if (file) {
            // Validate file before showing preview
            if (!validateFile(this)) {
                showToast('Please select a valid image file (JPG, PNG, GIF) under 5MB.', 'error');
                this.value = ''; // Clear invalid file
                return;
            }
            
            showFilePreview(file);
        } else {
            hideFilePreview();
        }
    });
}

/**
 * Show preview of selected file
 */
function showFilePreview(file) {
    // Remove existing preview
    hideFilePreview();
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        // Create preview container
        const previewContainer = document.createElement('div');
        previewContainer.className = 'file-preview-container';
        previewContainer.innerHTML = `
            <p class="mb-2"><strong>Image Preview:</strong></p>
            <img src="${e.target.result}" alt="Preview" class="file-preview img-fluid">
            <p class="mt-2 small text-muted">${file.name} (${(file.size / 1024).toFixed(1)} KB)</p>
        `;
        
        // Insert after file input
        const fileInput = document.getElementById('feedbackImage');
        fileInput.parentNode.appendChild(previewContainer);
    };
    
    reader.readAsDataURL(file);
}

/**
 * Hide file preview
 */
function hideFilePreview() {
    const existingPreview = document.querySelector('.file-preview-container');
    if (existingPreview) {
        existingPreview.remove();
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
                    ${message}
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
 * Utility function to format file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}