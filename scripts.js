// Debounce utility to limit how often a handler runs during rapid events
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
};

// Basic email shape check (server-side validation still happens at Web3Forms)
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};


const navLinks = document.querySelectorAll('nav ul li a');
const sections = document.querySelectorAll('main section');

const highlightActiveSection = () => {
    let current = '';
    sections.forEach((section) => {
        const sectionTop = section.offsetTop - 60; // Adjust for sticky header
        const sectionHeight = section.offsetHeight;
        if (
            window.scrollY >= sectionTop &&
            window.scrollY < sectionTop + sectionHeight
        ) {
            current = section.getAttribute('id');
        }
    });
    navLinks.forEach((link) => {
        link.classList.remove('active');
        if (current && link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
};

window.addEventListener('scroll', debounce(highlightActiveSection, 100));
highlightActiveSection(); // Set correct state on initial load


const form = document.getElementById('contact-form');
const feedback = document.getElementById('form-feedback');

if (form && feedback) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = form.elements['name'].value.trim();
        const email = form.elements['email'].value.trim();
        const message = form.elements['message'].value.trim();

        feedback.style.display = 'block';

        if (!name || !email || !message) {
            feedback.textContent = 'Please fill out all fields.';
            feedback.style.color = 'red';
            return;
        }

        if (!validateEmail(email)) {
            feedback.textContent = 'Please enter a valid email address.';
            feedback.style.color = 'red';
            return;
        }

        const button = form.querySelector('button[type="submit"]');
        const originalLabel = button.textContent;

        button.disabled = true;
        button.textContent = 'Sending...';
        feedback.textContent = 'Sending...';
        feedback.style.color = '';

        try {
            const res = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: new FormData(form)
            });

            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || 'Submission failed');
            }

            feedback.textContent = 'Thank you for your message! I will get back to you shortly.';
            feedback.style.color = 'green';
            form.reset();
        } catch (err) {
            console.error('Contact form error:', err);
            feedback.textContent = 'Sorry, something went wrong. Please reach me on LinkedIn instead.';
            feedback.style.color = 'red';
        } finally {
            button.disabled = false;
            button.textContent = originalLabel;
        }
    });
}


const hamburgerMenu = document.getElementById('hamburger-menu');
const navLinksContainer = document.getElementById('nav-links');

if (hamburgerMenu && navLinksContainer) {
    hamburgerMenu.addEventListener('click', () => {
        const isOpen = navLinksContainer.classList.toggle('show');
        hamburgerMenu.setAttribute('aria-expanded', String(isOpen));
    });

    // Close the menu after tapping a link on mobile
    navLinksContainer.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            navLinksContainer.classList.remove('show');
            hamburgerMenu.setAttribute('aria-expanded', 'false');
        });
    });
}
