// Free Trial Form Handler
// ==============================================

// API endpoint configuration
// const BASE_URL = 'http://localhost:3006/api';
const BASE_URL = 'https://backend.2moresteps.com/api';

// Phone number formatting utilities
const isNumericInput = (event) => {
    const key = event.keyCode;
    return ((key >= 48 && key <= 57) || (key >= 96 && key <= 105));
};

const isModifierKey = (event) => {
    const key = event.keyCode;
    return (event.shiftKey === true || key === 35 || key === 36) ||
        (key === 8 || key === 9 || key === 13 || key === 46) ||
        (key > 36 && key < 41) ||
        ((event.ctrlKey === true || event.metaKey === true) &&
            (key === 65 || key === 67 || key === 86 || key === 88 || key === 90));
};

const enforceFormat = (event) => {
    if (!isNumericInput(event) && !isModifierKey(event)) {
        event.preventDefault();
    }
};

const formatToPhone = (event) => {
    if (isModifierKey(event)) { return; }

    const input = event.target.value.replace(/\D/g, '').substring(0, 10);
    const areaCode = input.substring(0, 3);
    const middle = input.substring(3, 6);
    const last = input.substring(6, 10);

    if (input.length > 6) { event.target.value = `(${areaCode}) ${middle} - ${last}`; }
    else if (input.length > 3) { event.target.value = `(${areaCode}) ${middle}`; }
    else if (input.length > 0) { event.target.value = `(${areaCode}`; }
};

// Campus location mapping
const CAMPUS_MAPPING = {
    'Irvine': 'Irvine',
    'Diamond-bar': 'Diamond-bar',
    'Arcadia': 'Arcadia',
    'West-lafayette': 'West-lafayette',
    'San-diego': 'San-diego',
    'Redmond': 'Redmond',
    'Bothell': 'Bothell',
    'Factoria': 'Factoria',
    'Online': 'Online'
};

// Organization ID mapping
const ORGANIZATION_MAPPING = {
    'Redmond': '6684406b10707d0014fb7369',
    'San-diego': '66bf6a0dcdae5300148e3a2c',
    'Arcadia': '6390e0c5476933001554f8c7',
    'Diamond-bar': '64c442a403253a0013048f3a',
    'Bothell': '67e0298d64033c0015ce31bb',
    'Factoria': '67ae3ed6b172e100156401d5',
    'West-lafayette': '65663f2986db9b0013c43c9a',
    'Irvine': '5b2423bbc0991500145353f4',
    'Online': '5b2423bbc0991500145353f4'
};

// Show success page by switching sections
const showSuccessPage = (message) => {
    // Hide form section
    const formSection = document.getElementById('formSection');
    const successSection = document.getElementById('successSection');
    
    if (formSection && successSection) {
        formSection.style.display = 'none';
        successSection.style.display = 'block';
        
        // Update success message if provided
        if (message) {
            const successMessageElement = document.getElementById('successMessage');
            if (successMessageElement) {
                successMessageElement.textContent = message;
            }
        }
        
        // Add event listeners for buttons
        setupSuccessPageButtons();
        
        // Scroll to top to show the success page
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// Setup event listeners for success page buttons
const setupSuccessPageButtons = () => {
    const submitAnotherBtn = document.getElementById('submitAnotherBtn');
    const goHomeBtn = document.getElementById('goHomeBtn');
    
    if (submitAnotherBtn) {
        submitAnotherBtn.addEventListener('click', () => {
            // Reload the page to show the form again
            window.location.reload();
        });
    }
    
    if (goHomeBtn) {
        goHomeBtn.addEventListener('click', () => {
            // Navigate to homepage - adjust the URL as needed
            window.location.href = '/';
        });
    }
};

// Display error messages
const showMessage = (message, type = 'error') => {
    const messagesDiv = document.querySelector('.messages');
    
    messagesDiv.innerHTML = `
        <div class="alert alert-danger alert-dismissible text-center" role="alert" 
             style="border: 2px solid #dc3545; 
                    border-radius: 10px; 
                    padding: 20px; 
                    margin: 20px 0; 
                    font-size: 1.1rem; 
                    box-shadow: 0 4px 15px rgba(220, 53, 69, 0.2);">
            ${message}
            <button type="button" class="btn-close" aria-label="Close">&times;</button>
        </div>
    `;

    // Add close functionality
    const closeBtn = messagesDiv.querySelector('.btn-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            const alert = messagesDiv.querySelector('.alert');
            if (alert) {
                alert.remove();
            }
        });
    }

    // Auto-hide after 5 seconds
    setTimeout(() => {
        const alert = messagesDiv.querySelector('.alert');
        if (alert) {
            alert.style.transition = 'opacity 0.5s ease-out';
            alert.style.opacity = '0';
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.remove();
                }
            }, 500);
        }
    }, 5000);

    // Scroll to the message to ensure it's visible
    messagesDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

// Create account function
const createAccount = async (accountData) => {
    try {
        console.log('Creating account...');

        const response = await fetch(`${BASE_URL}/Account`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(accountData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Account created successfully');
            return result;
        } else {
            const errorText = await response.text();
            console.error('Account creation failed:', response.status, errorText);

            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.error?.message || errorJson.message || `Account creation failed: ${response.status}`);
            } catch (parseError) {
                throw new Error(`Account creation failed: ${response.status} ${errorText}`);
            }
        }
    } catch (error) {
        console.error('Account creation error:', error);
        throw error;
    }
};

// Create trial class function
const createTrialClass = async (trialData) => {
    try {
        console.log('Creating trial class...');

        if (!trialData.accountId) {
            throw new Error('accountId is required for trial class creation');
        }

        const response = await fetch(`${BASE_URL}/TrialClasses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(trialData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Trial class created successfully');
            return result;
        } else {
            const errorText = await response.text();
            console.error('Trial class creation failed:', response.status, errorText);

            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.error?.message || errorJson.message || `Trial class creation failed: ${response.status}`);
            } catch (parseError) {
                throw new Error(`Trial class creation failed: ${response.status} ${errorText}`);
            }
        }
    } catch (error) {
        console.error('Trial class creation error:', error);
        throw error;
    }
};

// Main form submission function
const submitFormData = async (formData) => {
    try {
        console.log('Starting form submission...');

        // Step 1: Create Account
        const nameParts = formData.studentName.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ').trim() : '';
        const username = formData.studentName.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * (999 - 100 + 1) + 100);

        // Handle referral details
        let referralName = formData.referral;
        if (formData.referral === 'Sales' && formData.salesUsername) {
            referralName = `${formData.referral}: ${formData.salesUsername}`;
        } else if (formData.referral === 'Others' && formData.otherReferral) {
            referralName = `${formData.referral}: ${formData.otherReferral}`;
        }

        const accountData = {
            email2: formData.email,
            phone2: formData.phone,
            username: username,
            firstName: firstName,
            lastName: lastName || 'Student',
            password: '123',
            dateOfBirth: new Date().toISOString(),
            grade: formData.grade,
            referralName: referralName,
            preferedLanguage: 'English'
        };

        const accountResult = await createAccount(accountData);

        if (!accountResult.id) {
            throw new Error('Account creation succeeded but no ID returned');
        }

        // Wait for database sync
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 2: Create Trial Class
        const campusLocation = CAMPUS_MAPPING[formData.campus] || formData.campus;
        const organizationId = ORGANIZATION_MAPPING[formData.campus] || ORGANIZATION_MAPPING['Irvine'];

        const trialData = {
            availability: formData.availability,
            comment: "",
            location: campusLocation,
            signupTime: new Date().toISOString(),
            accountId: accountResult.id,
            organizationId: organizationId
        };

        const trialResult = await createTrialClass(trialData);

        console.log('Form submission completed successfully');
        return {
            success: true,
            account: accountResult,
            trial: trialResult
        };

    } catch (error) {
        console.error('Form submission failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Form initialization and event handlers
const initializeFreeTrialForm = () => {
    console.log('Initializing free trial form...');

    const form = document.getElementById('form');
    const submitButton = document.getElementById('trialButton');
    const inputElement = document.getElementById('phoneNumber');

    if (!form || !submitButton) {
        console.error('Critical elements not found!');
        return;
    }

    const handleSubmit = async function (e) {
        if (e) e.preventDefault();

        const spinner = document.getElementById('formSpinner');

        // Clear previous messages
        document.querySelector('.messages').innerHTML = '';

        // Show loading state
        spinner.style.display = 'inline-flex';
        submitButton.disabled = true;
        const originalText = submitButton.textContent;
        
        // Get localized submitting text from data attribute
        const submittingText = form.dataset.submittingText || 'Submitting...';
        submitButton.textContent = submittingText;

        // Validate form
        let isValid = true;
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('error');
                input.classList.remove('valid');
                isValid = false;
            } else {
                input.classList.remove('error');
                input.classList.add('valid');
            }
        });

        // Email validation
        const emailInput = document.getElementById('emailAddress');
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailInput.value && !emailPattern.test(emailInput.value)) {
            emailInput.classList.add('error');
            emailInput.classList.remove('valid');
            isValid = false;
        }

        // Phone validation
        const phoneInput = document.getElementById('phoneNumber');
        const phonePattern = /^\(\d{3}\)\s\d{3}\s-\s\d{4}$/;
        if (phoneInput.value && !phonePattern.test(phoneInput.value)) {
            phoneInput.classList.add('error');
            phoneInput.classList.remove('valid');
            isValid = false;
        }

        if (!isValid) {
            spinner.style.display = 'none';
            submitButton.disabled = false;
            submitButton.textContent = originalText;
            const validationMessage = form.dataset.validationErrorMessage;
            showMessage(validationMessage, 'error');
            return;
        }

        // Collect form data
        const formData = {
            studentName: document.getElementById('studentName').value.trim(),
            grade: document.getElementById('studentGrade').value.trim(),
            email: document.getElementById('emailAddress').value.trim(),
            phone: document.getElementById('phoneNumber').value.trim(),
            campus: document.getElementById('campus').value,
            referral: document.getElementById('referral').value,
            availability: document.getElementById('availability').value.trim(),
            salesUsername: document.getElementById('salesUsername').value.trim(),
            otherReferral: document.getElementById('otherReferral').value.trim()
        };

        try {
            const result = await submitFormData(formData);

            if (result.success) {
                // Show success page using existing HTML
                const successMessage = form.dataset.successMessage;
                showSuccessPage(successMessage);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Form submission failed:', error);
            const errorMessage = form.dataset.errorMessage;
            showMessage(error.message || errorMessage, 'error');
        } finally {
            // Reset loading state
            spinner.style.display = 'none';
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    };

    // Event listeners
    submitButton.addEventListener('click', handleSubmit);
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        handleSubmit(e);
    });

    // Phone number formatting
    if (inputElement) {
        inputElement.addEventListener('keydown', enforceFormat);
        inputElement.addEventListener('keyup', formatToPhone);
    }

    // Show/hide referral details
    document.getElementById('referral').addEventListener('change', function () {
        const salesDetails = document.getElementById('salesDetails');
        const otherDetails = document.getElementById('otherDetails');

        salesDetails.style.display = 'none';
        otherDetails.style.display = 'none';

        if (this.value === 'Sales') {
            salesDetails.style.display = 'block';
            document.getElementById('salesUsername').required = true;
        } else if (this.value === 'Others') {
            otherDetails.style.display = 'block';
            document.getElementById('otherReferral').required = true;
        } else {
            document.getElementById('salesUsername').required = false;
            document.getElementById('otherReferral').required = false;
        }
    });

    // Form validation feedback
    const inputs = document.querySelectorAll('.form-control');
    inputs.forEach(input => {
        input.addEventListener('blur', function () {
            if (this.required && !this.value.trim()) {
                this.classList.add('error');
                this.classList.remove('valid');
            } else if (this.value.trim()) {
                this.classList.remove('error');
                this.classList.add('valid');
            }
        });

        input.addEventListener('input', function () {
            if (this.classList.contains('error') && this.value.trim()) {
                this.classList.remove('error');
                this.classList.add('valid');
            }
        });
    });

    // Email validation
    const emailInput = document.getElementById('emailAddress');
    emailInput.addEventListener('input', function () {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (this.value && !emailPattern.test(this.value)) {
            this.classList.add('error');
            this.classList.remove('valid');
        } else if (this.value) {
            this.classList.remove('error');
            this.classList.add('valid');
        }
    });

    // Phone validation
    const phoneInput = document.getElementById('phoneNumber');
    phoneInput.addEventListener('input', function () {
        const phonePattern = /^\(\d{3}\)\s\d{3}\s-\s\d{4}$/;
        if (this.value && !phonePattern.test(this.value)) {
            this.classList.add('error');
            this.classList.remove('valid');
        } else if (this.value) {
            this.classList.remove('error');
            this.classList.add('valid');
        }
    });

    console.log('Form initialization completed');
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeFreeTrialForm); 