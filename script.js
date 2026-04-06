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
    initCaseStudyCarousels();   // before lightbox so lightbox picks up carousel imgs
    initImageLightbox();
    initPortfolioSearch();
    initCaseStudyAnimations();
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
        element.style.transform = 'translateY(20px)';
        element.style.transition = `opacity 0.28s ease ${index * 0.05}s, transform 0.28s ease ${index * 0.05}s`;
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
        threshold: 0.05,
        rootMargin: '0px 0px -40px 0px'
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
                const start = window.pageYOffset;
                const distance = offsetTop - start;
                const duration = 420;
                let startTime = null;

                const easeInOut = (t) =>
                    t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

                const step = (timestamp) => {
                    if (!startTime) startTime = timestamp;
                    const progress = Math.min((timestamp - startTime) / duration, 1);
                    window.scrollTo(0, start + distance * easeInOut(progress));
                    if (progress < 1) requestAnimationFrame(step);
                };

                requestAnimationFrame(step);
            }
        });
    });
}

// ===================================
// Image Lightbox (Case Studies)
// ===================================
function initImageLightbox() {
    const images = document.querySelectorAll(
        '.cs-image-placeholder img, .cs-content-full img'
    );

    if (!images.length) return;

    const lightbox = document.createElement('div');
    lightbox.className = 'cs-lightbox';
    lightbox.innerHTML = `
        <button type="button" aria-label="Close image">×</button>
        <img src="" alt="">
    `;
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('img');
    const closeBtn = lightbox.querySelector('button');

    const open = (img) => {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || '';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const close = () => {
        lightbox.classList.remove('active');
        lightboxImg.src = '';
        document.body.style.overflow = '';
    };

    images.forEach((img) => {
        img.addEventListener('click', () => open(img));
    });

    closeBtn.addEventListener('click', close);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) close();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            close();
        }
    });
}

// ===================================
// Portfolio Chatbot (Client-side FAQ)
// ===================================
function initPortfolioSearch() {
    if (document.querySelector('.chatbot-widget')) return;

    const knowledge = [
        {
            id: 'about',
            title: 'About Vani',
            keywords: ['background', 'about', 'bio', 'summary', 'who are you'],
            answer:
                `I'm Vani Balasundaram, a Senior Product Designer focused on clear, human-centered product experiences.`
        },
        {
            id: 'availability',
            title: 'Availability',
            keywords: ['availability', 'open', 'role', 'hire', 'work'],
            answer:
                `I'm open to the right opportunities. You can reach me via the contact page or the email link in the footer.`
        },
        {
            id: 'identity-first-onboarding',
            title: 'Case Study 1 — Doctor Anywhere onboarding',
            keywords: ['case study 1', 'doctor anywhere', 'onboarding', 'identity-first', 'singpass'],
            answer:
                `Case Study 1 covers identity-first onboarding at Doctor Anywhere, consolidating flows and improving data accuracy for B2C/B2B users while meeting MOH compliance.`
        },
        {
            id: 'soda-hr-portal',
            title: 'Case Study 3 — SODA HR Portal',
            keywords: ['case study 3', 'soda', 'hr portal', 'benefits portal', 'sme', 'tpa'],
            answer:
                `Case Study 3 highlights the SODA HR Portal, a self-serve benefits platform for SME owners and HR teams to set up plans and manage employees without intermediaries.`
        },
        {
            id: 'process',
            title: 'Design process',
            keywords: ['process', 'approach', 'methods', 'framework'],
            answer:
                `I focus on clarifying the problem, mapping user flows, prototyping quickly, and iterating with product, engineering, and compliance partners.`
        },
        {
            id: 'contact',
            title: 'Contact',
            keywords: ['contact', 'email', 'reach', 'message'],
            answer:
                `You can contact me through the Contact page or via the email link in the footer.`
        }
    ];

    const widget = document.createElement('div');
    widget.className = 'chatbot-widget';
    widget.innerHTML = `
        <button class="chatbot-toggle" aria-expanded="false" aria-controls="chatbot-panel">
            Ask me ✨
        </button>
        <div class="chatbot-panel" id="chatbot-panel" role="dialog" aria-label="Portfolio search">
            <div class="chatbot-header">
                <span>Portfolio Search <span class="chatbot-ai-badge">AI</span> <span class="chatbot-sparkle">✦</span></span>
                <button class="chatbot-close" aria-label="Close search">×</button>
            </div>
            <form class="chatbot-input" autocomplete="off">
                <input type="text" placeholder="Search projects, outcomes, or availability…" aria-label="AI search input">
                <button type="submit">Search ✨</button>
            </form>
            <div class="chatbot-suggestions">
                <span>Try:</span>
                <button data-prompt="Doctor Anywhere onboarding">Doctor Anywhere onboarding</button>
                <button data-prompt="Direct Apply">Direct Apply</button>
                <button data-prompt="Availability">Availability</button>
            </div>
            <div class="chatbot-results" aria-live="polite"></div>
        </div>
    `;

    document.body.appendChild(widget);

    const toggle = widget.querySelector('.chatbot-toggle');
    const panel = widget.querySelector('.chatbot-panel');
    const closeBtn = widget.querySelector('.chatbot-close');
    const results = widget.querySelector('.chatbot-results');
    const form = widget.querySelector('.chatbot-input');
    const input = form.querySelector('input');
    const quickButtons = widget.querySelectorAll('.chatbot-suggestions button');

    const scoreMatch = (query, item) => {
        let score = 0;
        item.keywords.forEach(keyword => {
            if (query.includes(keyword)) score += 2;
        });
        if (query.includes(item.title.toLowerCase())) score += 3;
        return score;
    };

    const contextualAnswer = (item) => {
        const currentPage = window.location.pathname.replace('/', '') || 'index.html';
        const context =
            currentPage.includes('identity-first-onboarding') ? 'You are currently viewing Case Study 1.' :
            currentPage.includes('soda-hr-portal') ? 'You are currently viewing Case Study 3.' :
            currentPage.includes('case-study') ? 'You are viewing a case study.' :
            'You are on the portfolio home page.';
        return `${item.answer} ${context}`;
    };

    const renderResults = (query) => {
        const q = query.toLowerCase();
        const ranked = knowledge
            .map(item => ({ item, score: scoreMatch(q, item) }))
            .filter(entry => entry.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);

        results.innerHTML = '';

        if (!ranked.length) {
            results.innerHTML = `
                <div class="chatbot-result">
                    <h4>No exact match</h4>
                    <p>Try “Doctor Anywhere onboarding”, “Direct Apply”, or “Availability”.</p>
                </div>
            `;
            knowledge.slice(0, 3).forEach(item => {
                const card = document.createElement('div');
                card.className = 'chatbot-result';
                const target = item.id === 'identity-first-onboarding' ? 'identity-first-onboarding.html' :
                    item.id === 'soda-hr-portal' ? 'soda-hr-portal.html' :
                    item.id === 'contact' ? 'contact.html' :
                    item.id === 'about' ? 'about.html' : '';
                if (target) {
                    card.dataset.target = target;
                    card.setAttribute('role', 'button');
                    card.setAttribute('tabindex', '0');
                }
                card.innerHTML = `
                    <h4>${item.title}</h4>
                    <p>${contextualAnswer(item)}</p>
                `;
                results.appendChild(card);
            });
            return;
        }

        ranked.forEach(({ item }) => {
            const card = document.createElement('div');
            card.className = 'chatbot-result';
            const target = item.id === 'identity-first-onboarding' ? 'identity-first-onboarding.html' :
                item.id === 'soda-hr-portal' ? 'soda-hr-portal.html' :
                item.id === 'contact' ? 'contact.html' :
                item.id === 'about' ? 'about.html' : '';
            if (target) {
                card.dataset.target = target;
                card.setAttribute('role', 'button');
                card.setAttribute('tabindex', '0');
            }
            card.innerHTML = `
                <h4>${item.title}</h4>
                <p>${contextualAnswer(item)}</p>
            `;
            results.appendChild(card);
        });
    };

    results.addEventListener('click', (e) => {
        const card = e.target.closest('.chatbot-result');
        if (!card || !card.dataset.target) return;
        window.location.href = card.dataset.target;
    });

    results.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        const card = e.target.closest('.chatbot-result');
        if (!card || !card.dataset.target) return;
        window.location.href = card.dataset.target;
    });

    const showPanel = () => {
        panel.classList.add('active');
        toggle.setAttribute('aria-expanded', 'true');
    };

    const hidePanel = () => {
        panel.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        renderResults(text);
        showPanel();
        input.value = '';
    });

    quickButtons.forEach(button => {
        button.addEventListener('click', () => {
            const text = button.dataset.prompt;
            renderResults(text);
            showPanel();
        });
    });

    toggle.addEventListener('click', () => {
        if (panel.classList.contains('active')) {
            hidePanel();
        } else {
            showPanel();
            input.focus();
            if (!results.children.length) {
                renderResults('Doctor Anywhere onboarding');
            }
        }
    });

    closeBtn.addEventListener('click', hidePanel);

    document.addEventListener('click', (e) => {
        if (!widget.contains(e.target)) hidePanel();
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
        document.body.style.transition = 'opacity 0.15s ease';
        
        setTimeout(() => {
            window.location.href = href;
        }, 150);
    });
});

// Fade in on page load
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.2s ease';
    requestAnimationFrame(() => {
        document.body.style.opacity = '1';
    });
});

// ===================================
// Case Study Carousels
// Converts every .cs-visuals with 2+ slides
// into an Apple-style swipeable carousel
// ===================================
function initCaseStudyCarousels() {
    document.querySelectorAll('.cs-visuals').forEach(visuals => {
        const slides = Array.from(visuals.querySelectorAll('.cs-visual'));
        if (slides.length < 2) return; // single image — leave as-is

        // ── Build carousel DOM ──────────────────────────────────────────
        const wrap  = document.createElement('div');
        wrap.className = 'cs-carousel-wrap';

        const carousel = document.createElement('div');
        carousel.className = 'cs-carousel';
        carousel.setAttribute('role', 'region');
        carousel.setAttribute('aria-label', 'Image carousel');

        const track = document.createElement('div');
        track.className = 'cs-carousel-track';

        const counter = document.createElement('div');
        counter.className = 'cs-carousel-counter';

        // Turn each .cs-visual into a carousel slide (no captions)
        slides.forEach(visual => {
            const slide = document.createElement('div');
            slide.className = 'cs-carousel-slide';

            const img = visual.querySelector('img');
            if (img) slide.appendChild(img.cloneNode(true));

            track.appendChild(slide);
        });

        // Prev / next buttons (go into nav bar, not carousel overlay)
        const btnPrev = document.createElement('button');
        btnPrev.className = 'cs-carousel-btn prev';
        btnPrev.setAttribute('aria-label', 'Previous image');
        btnPrev.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>`;

        const btnNext = document.createElement('button');
        btnNext.className = 'cs-carousel-btn next';
        btnNext.setAttribute('aria-label', 'Next image');
        btnNext.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>`;

        carousel.appendChild(track);
        carousel.appendChild(counter);
        wrap.appendChild(carousel);

        // Nav bar: [<prev]  [dots]  [next>]
        const nav = document.createElement('div');
        nav.className = 'cs-carousel-nav';

        const dotGroup = document.createElement('div');
        dotGroup.className = 'cs-carousel-dots';

        const dots = slides.map((_, i) => {
            const d = document.createElement('button');
            d.className = 'cs-carousel-dot' + (i === 0 ? ' active' : '');
            d.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dotGroup.appendChild(d);
            return d;
        });

        nav.appendChild(btnPrev);
        nav.appendChild(dotGroup);
        nav.appendChild(btnNext);
        wrap.appendChild(nav);

        // Replace original .cs-visuals with the carousel
        visuals.replaceWith(wrap);

        // ── State & helpers ─────────────────────────────────────────────
        let current = 0;
        const total = slides.length;

        const goTo = (idx) => {
            current = (idx + total) % total;
            track.style.transform = `translateX(-${current * 100}%)`;
            dots.forEach((d, i) => d.classList.toggle('active', i === current));
            counter.textContent = `${current + 1} / ${total}`;
            // Only disable at edges when user is manually navigating
            btnPrev.disabled = false;
            btnNext.disabled = false;
        };

        goTo(0);

        // ── Auto-play (loops every 4 s, pauses on hover) ────────────────
        const AUTOPLAY_MS = 4000;
        let autoTimer = null;

        const startAuto = () => {
            stopAuto();
            autoTimer = setInterval(() => {
                goTo((current + 1) % total);
            }, AUTOPLAY_MS);
        };

        const stopAuto = () => {
            if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
        };

        startAuto();
        wrap.addEventListener('mouseenter', stopAuto);
        wrap.addEventListener('mouseleave', startAuto);

        // ── Button events ───────────────────────────────────────────────
        btnPrev.addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
        btnNext.addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });
        dots.forEach((d, i) => d.addEventListener('click', () => { stopAuto(); goTo(i); startAuto(); }));

        // ── Keyboard (when carousel is focused) ─────────────────────────
        carousel.setAttribute('tabindex', '0');
        carousel.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft')  { e.preventDefault(); stopAuto(); goTo(current - 1); startAuto(); }
            if (e.key === 'ArrowRight') { e.preventDefault(); stopAuto(); goTo(current + 1); startAuto(); }
        });

        // ── Touch / swipe support ───────────────────────────────────────
        let touchStartX = 0;
        let touchDeltaX = 0;

        carousel.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
            touchDeltaX = 0;
            stopAuto();
        }, { passive: true });

        carousel.addEventListener('touchmove', e => {
            touchDeltaX = e.touches[0].clientX - touchStartX;
            // Live drag feedback
            const offset = -(current * 100) + (touchDeltaX / carousel.offsetWidth) * 100;
            track.style.transition = 'none';
            track.style.transform = `translateX(${offset}%)`;
        }, { passive: true });

        carousel.addEventListener('touchend', () => {
            track.style.transition = '';
            if (touchDeltaX < -50)      goTo(current + 1);
            else if (touchDeltaX > 50)  goTo(current - 1);
            else                         goTo(current); // snap back
            startAuto();
        });
    });
}

// ===================================
// Case Study Scroll Animations
// ===================================
function initCaseStudyAnimations() {
    // Only run on case study pages
    if (!document.querySelector('.cs-hero')) return;

    // ── Helper: stagger siblings in a grid parent ──────────────────────
    const applyStagger = (elements, baseDelay = 0, step = 90) => {
        elements.forEach((el, i) => {
            el.style.transitionDelay = `${baseDelay + i * step}ms`;
        });
    };

    // ── 1. Image blocks — scale + fade ──────────────────────────────────
    document.querySelectorAll('.cs-visual, .cs-image-placeholder.is-wide').forEach(el => {
        el.classList.add('cs-anim-img');
    });

    // ── 2. Smaller image placeholders (non-hero) ────────────────────────
    document.querySelectorAll('.cs-image-placeholder:not(.is-wide)').forEach(el => {
        el.classList.add('cs-anim-img');
    });

    // ── 3. Snapshot cards — staggered ──────────────────────────────────
    const snapshotCards = document.querySelectorAll('.cs-snapshot-card');
    snapshotCards.forEach(el => el.classList.add('cs-anim'));
    applyStagger(snapshotCards, 0, 80);

    // ── 4. Metrics — staggered pop ─────────────────────────────────────
    const metrics = document.querySelectorAll('.cs-metric');
    metrics.forEach(el => el.classList.add('cs-anim'));
    applyStagger(metrics, 0, 70);

    // ── 5. Section headers ──────────────────────────────────────────────
    document.querySelectorAll('.cs-section-header').forEach(el => {
        el.classList.add('cs-anim');
    });

    // ── 6. Result / insight / learning cards — staggered per row ────────
    ['cs-result-card', 'cs-insight-card', 'cs-learning-card'].forEach(cls => {
        const groups = {};
        document.querySelectorAll(`.${cls}`).forEach(el => {
            const parent = el.parentElement;
            if (!groups[parent]) groups[parent] = [];
            groups[parent].push(el);
        });
        Object.values(groups).forEach(group => {
            group.forEach(el => el.classList.add('cs-anim'));
            applyStagger(group, 0, 80);
        });
    });

    // ── 7. Feature blocks — alternating left / right ────────────────────
    document.querySelectorAll('.cs-feature').forEach(feature => {
        const content = feature.querySelector('.cs-feature-content');
        const image   = feature.querySelector('.cs-feature-image');
        const isReverse = feature.classList.contains('cs-feature-reverse');

        if (content) content.classList.add(isReverse ? 'cs-anim-right' : 'cs-anim-left');
        if (image)   image.classList.add(isReverse ? 'cs-anim-left' : 'cs-anim-right');
    });

    // ── 8. Sidebar cards ─────────────────────────────────────────────────
    document.querySelectorAll('.cs-sidebar-card').forEach((el, i) => {
        el.classList.add('cs-anim');
        el.style.transitionDelay = `${i * 80}ms`;
    });

    // ── 9. Content paragraphs inside sections ───────────────────────────
    document.querySelectorAll('.cs-content-main, .cs-content-full').forEach(el => {
        el.classList.add('cs-anim');
    });

    // ── 10. Testimonial block ────────────────────────────────────────────
    document.querySelectorAll('.cs-testimonial').forEach(el => {
        el.classList.add('cs-anim-img'); // scale-fade for the quote card
    });

    // ── Intersection Observer ────────────────────────────────────────────
    const allAnimated = document.querySelectorAll(
        '.cs-anim, .cs-anim-img, .cs-anim-left, .cs-anim-right'
    );

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const el = entry.target;
            el.classList.add('is-visible');

            // Pop animation for metric values
            if (el.classList.contains('cs-metric')) {
                const val = el.querySelector('.cs-metric-value');
                if (val) {
                    setTimeout(() => val.classList.add('is-popped'), 120);
                }
            }

            observer.unobserve(el);
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -60px 0px'
    });

    allAnimated.forEach(el => observer.observe(el));
}

// ===================================
// Password Gate for Case Studies
// ===================================
function initPasswordGate() {
    // Password gate disabled for now (keep case studies open)
    return;
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

    const requirePassword = () => {
        error.textContent = 'Password required to view this page.';
        error.style.display = 'block';
        input.focus();
    };

    // If the user is already on a protected page and cancels, redirect away
    const dismiss = () => {
        const isCaseStudyPage = location.pathname.includes('case-study-');
        const lockedInPlace = isCaseStudyPage && !pendingHref;
        if (lockedInPlace) {
            // Stay on the modal; do not allow dismiss without password
            requirePassword();
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


