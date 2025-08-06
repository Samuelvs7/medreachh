// DOM Elements
const loginBtn = document.querySelector('.btn-login');
const registerBtn = document.querySelector('.btn-register');
const requestBtn = document.querySelector('.btn-primary');
const volunteerBtn = document.querySelector('.btn-secondary');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Adjust for fixed header
                    behavior: 'smooth'
                });
            }
        });
    });

    // Button click handlers
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            window.location.href = '/auth/login.html';
        });
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            window.location.href = '/auth/register.html';
        });
    }

    if (requestBtn) {
        requestBtn.addEventListener('click', () => {
            alert('Medicine request form will be implemented next!');
            // Will be implemented with medicine request form
        });
    }

    if (volunteerBtn) {
        volunteerBtn.addEventListener('click', () => {
            alert('Volunteer registration will be implemented next!');
            // Will be implemented with volunteer registration
        });
    }

    // Add animation on scroll for steps
    const animateOnScroll = () => {
        const steps = document.querySelectorAll('.step');
        steps.forEach(step => {
            const stepPosition = step.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;

            if (stepPosition < screenPosition) {
                step.style.opacity = '1';
                step.style.transform = 'translateY(0)';
            }
        });
    };

    // Initial animation check
    animateOnScroll();

    // Add scroll event listener for animations
    window.addEventListener('scroll', animateOnScroll);
});

// Form validation function (will be used in future forms)
function validateForm(formData) {
    // Will be implemented with form validation logic
    return true;
}
