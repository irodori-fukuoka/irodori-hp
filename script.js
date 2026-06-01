// Initialize Lucide Icons
lucide.createIcons();

// Navigation Function (SPA Routing)
function navigateTo(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });

    // Show target page
    const targetPage = document.getElementById('page-' + pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // Close mobile menu if open
    const navMenu = document.getElementById('nav-menu');
    if (navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
    }

    // Scroll to top
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Mobile Menu Toggle
const menuToggle = document.getElementById('menu-toggle');
const menuClose = document.getElementById('menu-close');
const navMenu = document.getElementById('nav-menu');

if (menuToggle && menuClose && navMenu) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.add('open');
    });

    menuClose.addEventListener('click', () => {
        navMenu.classList.remove('open');
    });
}

// Scroll to Top Function
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Optional: Change header background on scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
    } else {
        header.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
    }
});
