// ===================================
// Portfolio JavaScript
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initMobileMenu();
    initScrollReveal();
    initSmoothScroll();
    initCursor();
    initPasswordGate();
});

// ===================================
// Navbar Scroll Effect
// ===================================
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

// ===================================
// Mobile Menu
// ===================================
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-menu-links a');

    if (!menuBtn || !mobileMenu) return;

    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// ===================================
// Scroll Reveal Animation
// ===================================
function initScrollReveal() {
    const revealElements = document.querySelectorAll(
        '.section-header, .project-card, .timeline-item, .cta-content'
    );

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const revealPoint = 150;

        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;

            if (elementTop < windowHeight - revealPoint) {
                element.classList.add('revealed');
            }
        });
    };

    // Add initial styles
    revealElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(40px)';
        element.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
    });

    // Create intersection observer for better performance
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    revealElements.forEach(element => {
        observer.observe(element);
    });
}

// ===================================
// Smooth Scroll
// ===================================
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                const offsetTop = target.offsetTop - 100;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===================================
// Custom Cursor (Optional Enhancement)
// ===================================
function initCursor() {
    // Only on desktop
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.innerHTML = '<div class="cursor-dot"></div><div class="cursor-outline"></div>';
    document.body.appendChild(cursor);

    const dot = cursor.querySelector('.cursor-dot');
    const outline = cursor.querySelector('.cursor-outline');

    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;

    // Add cursor styles
    const style = document.createElement('style');
    style.textContent = `
        .custom-cursor {
            pointer-events: none;
            position: fixed;
            top: 0;
            left: 0;
            z-index: 9999;
            mix-blend-mode: difference;
        }
        .cursor-dot {
            position: fixed;
            width: 8px;
            height: 8px;
            background-color: #E8836B;
            border-radius: 50%;
            transform: translate(-50%, -50%);
            transition: transform 0.1s ease;
        }
        .cursor-outline {
            position: fixed;
            width: 40px;
            height: 40px;
            border: 1px solid rgba(232, 131, 107, 0.5);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            transition: transform 0.15s ease, width 0.2s ease, height 0.2s ease;
        }
        .custom-cursor.hover .cursor-dot {
            transform: translate(-50%, -50%) scale(1.5);
        }
        .custom-cursor.hover .cursor-outline {
            width: 60px;
            height: 60px;
            border-color: rgba(232, 131, 107, 0.8);
        }
        @media (pointer: coarse) {
            .custom-cursor { display: none; }
        }
    `;
    document.head.appendChild(style);

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = mouseX + 'px';
        dot.style.top = mouseY + 'px';
    });

    // Smooth outline follow
    function animateOutline() {
        outlineX += (mouseX - outlineX) * 0.15;
        outlineY += (mouseY - outlineY) * 0.15;
        outline.style.left = outlineX + 'px';
        outline.style.top = outlineY + 'px';
        requestAnimationFrame(animateOutline);
    }
    animateOutline();

    // Hover effect on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .project-card');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
}

// ===================================
// Project Card Tilt Effect
// ===================================
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
});

// ===================================
// Page Transition
// ===================================
document.querySelectorAll('a:not([href^="#"]):not([target="_blank"])').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) return;
        
        e.preventDefault();
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            window.location.href = href;
        }, 300);
    });
});

// Fade in on page load
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    requestAnimationFrame(() => {
        document.body.style.opacity = '1';
    });
});

// ===================================
// Password Gate for Case Studies
// ===================================
function initPasswordGate() {
    const PASSWORD = 'Cts-1990';
    const modal = document.getElementById('password-modal');
    const input = document.getElementById('password-input');
    const error = document.getElementById('password-error');
    const submitBtn = document.getElementById('password-submit');
    const cancelBtn = document.getElementById('password-cancel');
    let pendingHref = null;

    if (!modal || !input || !submitBtn || !cancelBtn) return;

    const isSamePage = (href) => {
        if (!href) return true;
        try {
            const url = new URL(href, window.location.origin);
            return url.pathname === window.location.pathname;
        } catch {
            return false;
        }
    };

    const openModal = (href) => {
        pendingHref = href;
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        error.style.display = 'none';
        input.value = '';
        input.focus();
    };

    const closeModal = () => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        pendingHref = null;
    };

    // If the user is already on a protected page and cancels, redirect away
    const dismiss = () => {
        const isCaseStudyPage = location.pathname.includes('case-study-');
        const lockedInPlace = isCaseStudyPage && !pendingHref;
        if (lockedInPlace) {
            window.location.href = 'index.html';
            return;
        }
        closeModal();
    };

    const grantAccess = () => {
        if (pendingHref && !isSamePage(pendingHref)) {
            window.location.href = pendingHref;
        } else {
            closeModal();
        }
    };

    const validate = () => {
        if (input.value === PASSWORD) {
            grantAccess();
        } else {
            error.style.display = 'block';
        }
    };

    // Intercept protected links (always prompt)
    document.querySelectorAll('[data-protected="true"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-target') || link.getAttribute('href');
            openModal(target);
        });
    });

    // Always prompt when landing directly on a case study page
    const isCaseStudyPage = location.pathname.includes('case-study-');
    if (isCaseStudyPage) {
        openModal(null); // no redirect needed, just unlock this view
    }

    submitBtn.addEventListener('click', validate);
    cancelBtn.addEventListener('click', dismiss);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') validate();
        if (e.key === 'Escape') dismiss();
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) dismiss();
    });
}


