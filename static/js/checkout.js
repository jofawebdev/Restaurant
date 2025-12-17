// Enhanced client-side form validation
document.addEventListener('DOMContentLoaded', function() {
    const checkoutForm = document.getElementById('checkout-form');
    const phoneInput = document.querySelector('input[name="customer_phone"]');
    const agreeCheckbox = document.getElementById('agree_terms');
    
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            let isValid = true;
            
            // Phone number validation
            if (phoneInput) {
                const phoneValue = phoneInput.value.replace(/\D/g, '');
                if (phoneValue.length < 10) {
                    e.preventDefault();
                    showValidationError('Please enter a valid phone number with at least 10 digits', phoneInput);
                    isValid = false;
                }
            }
            
            // Terms agreement validation
            if (agreeCheckbox && !agreeCheckbox.checked) {
                e.preventDefault();
                showValidationError('Please agree to the terms and conditions to proceed', agreeCheckbox);
                isValid = false;
            }
            
            return isValid;
        });
    }
    
    // Real-time phone number formatting
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                value = value.match(new RegExp('.{1,4}', 'g')).join(' ');
            }
            e.target.value = value;
        });
    }
    
    // Enhanced error display function
    function showValidationError(message, element) {
        // Remove any existing error alerts
        const existingAlert = document.querySelector('.validation-alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        // Create new alert
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger validation-alert alert-dismissible fade show mt-3';
        alertDiv.innerHTML = `
            <i class="fas fa-exclamation-circle me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Insert alert after the form
        checkoutForm.parentNode.insertBefore(alertDiv, checkoutForm.nextSibling);
        
        // Scroll to error
        alertDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Focus on the problematic element
        if (element) {
            element.focus();
            element.classList.add('is-invalid');
            
            // Remove invalid class when user starts typing
            element.addEventListener('input', function() {
                element.classList.remove('is-invalid');
            }, { once: true });
        }
    }
    
    // Add Bootstrap validation styles to form inputs
    const formInputs = checkoutForm.querySelectorAll('input, textarea, select');
    formInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.checkValidity()) {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            } else {
                this.classList.remove('is-valid');
                this.classList.add('is-invalid');
            }
        });
    });
});