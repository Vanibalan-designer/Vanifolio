(function () {
    var productSteps = [
        { label: "Sign up", title: "A clear entry point", body: "No broker required to get started — a company creates an account and moves straight into setup.", type: "image", src: "images/Case study SODA/5.png", alt: "SODA HR Portal sign up screen" },
        { label: "Welcome", title: "Oriented before configuring", body: "New teams land in a guided welcome flow before facing any policy decisions.", type: "image", src: "images/Case study SODA/1.png", alt: "SODA HR Portal welcome onboarding screen" },
        { label: "Add plans", title: "Plans, not paperwork", body: "Adding a benefit plan is a guided flow, not an insurance form re-created on screen.", type: "image", src: "images/Case study SODA/2.png", alt: "SODA HR Portal add plans flow" },
        { label: "Dashboard", title: "Everything in one view", body: "Policies, plans and member groups resolve into a single dashboard HR can scan at a glance.", type: "image", src: "images/Case study SODA/3.png", alt: "SODA HR Portal dashboard overview" },
        { label: "Utilisation", title: "Usage, not just setup", body: "Once live, HR can see how the health plan is actually being used, not just how it was configured.", type: "image", src: "images/Case study SODA/4.png", alt: "SODA HR Portal health plan utilisation view" },
        { label: "Configure", title: "Rules before people", body: "Benefit rules are defined first, so assigning employees afterward is a simple, low-risk step.", type: "image", src: "images/Case study SODA/6.png", alt: "SODA HR Portal configure benefits for a plan" },
        { label: "Plan settings", title: "One policy, unlimited plans", body: "Multiple plans and member groups live inside a single policy instead of one policy per variation.", type: "image", src: "images/Case study SODA/7.png", alt: "SODA HR Portal benefit options and plan settings" }
    ];

    var craftMoments = [
        { title: "Confidence over completion", body: "HR teams feared getting a policy choice wrong more than they feared complexity, so every step confirms explicitly before committing rather than optimising purely for speed.", image: "images/Case study SODA/2.png", alt: "SODA HR Portal add plans flow with guided confirmation" },
        { title: "Policy-first IA", body: "The portal is structured so HR defines benefit policies first, then assigns members — not the other way around.", image: "images/Case study SODA/6.png", alt: "SODA HR Portal configure benefits screen" },
        { title: "One policy, unlimited plans", body: "Companies no longer maintain multiple policies to cover different employee groups — one policy, one price, unlimited plans inside.", image: "images/Case study SODA/7.png", alt: "SODA HR Portal plan settings with multiple member groups" },
        { title: "Self-serve on- and off-boarding", body: "HR teams onboard or deactivate employees directly from the dashboard, with no broker and no waiting.", image: "images/Case study SODA/3.png", alt: "SODA HR Portal dashboard showing employee management" }
    ];

    var journeyBefore = ["Brokers", "Manual setup", "Policy errors", "No self-serve"];
    var journeyAfter = ["Self-serve", "One policy", "Unlimited plans", "Confidence"];
    var entryOptions = ["New company", "Switching from broker", "SME team", "Growing team", "Multiple member groups"];

    function renderJourney(container, items) {
        container.innerHTML = items.map(function (item, index) {
            var connector = index < items.length - 1 ? '<i aria-hidden="true"></i>' : '';
            return '<div class="journey-node journey-node--' + item.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '">' +
                '<span>0' + (index + 1) + '</span><strong>' + item + '</strong>' + connector +
                '</div>';
        }).join('');
        container.setAttribute('aria-label', items.join(' then '));
    }

    function initJourneys() {
        var beforeEl = document.getElementById('journeyBefore');
        var afterEl = document.getElementById('journeyAfter');
        if (!beforeEl || !afterEl) return;

        renderJourney(beforeEl, journeyBefore);
        renderJourney(afterEl, journeyBefore);

        var section = document.getElementById('moveIdentitySection');
        var moved = false;
        var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (reduceMotion) {
            afterEl.classList.add('journey--moved');
            renderJourney(afterEl, journeyAfter);
            return;
        }

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting && !moved) {
                    moved = true;
                    setTimeout(function () {
                        afterEl.classList.add('journey--moved');
                        renderJourney(afterEl, journeyAfter);
                    }, 450);
                }
            });
        }, { threshold: 0.45 });
        io.observe(section);
    }

    function initAdaptiveJourney() {
        var wrap = document.getElementById('entryChoices');
        var label = document.getElementById('entryPathLabel');
        if (!wrap || !label) return;

        wrap.innerHTML = entryOptions.map(function (item, index) {
            return '<button type="button" class="' + (index === 0 ? 'active' : '') + '" data-entry="' + item + '">' + item + '</button>';
        }).join('');

        wrap.addEventListener('click', function (e) {
            var btn = e.target.closest('button[data-entry]');
            if (!btn) return;
            wrap.querySelectorAll('button').forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            label.textContent = btn.dataset.entry;
        });
    }

    function initWalkthrough() {
        var tabsEl = document.getElementById('stepTabs');
        var screenEl = document.getElementById('walkthroughScreen');
        var bodyEl = document.getElementById('walkthroughBody');
        var counterEl = document.getElementById('walkthroughCounter');
        var titleEl = document.getElementById('walkthroughTitle');
        var nextBtn = document.getElementById('walkthroughNext');
        var nextLabel = document.getElementById('walkthroughNextLabel');
        if (!tabsEl || !screenEl) return;

        var step = 0;
        var total = productSteps.length;

        tabsEl.innerHTML = productSteps.map(function (item, index) {
            return '<button type="button" data-step="' + index + '" class="' + (index === 0 ? 'active' : '') + '">' +
                '<span>0' + (index + 1) + '</span>' + item.label +
                '</button>';
        }).join('');

        function render() {
            var current = productSteps[step];

            tabsEl.querySelectorAll('button').forEach(function (btn, index) {
                btn.classList.toggle('active', index === step);
            });

            screenEl.innerHTML = '';
            if (current.type === 'video') {
                var video = document.createElement('video');
                video.src = current.src;
                video.setAttribute('aria-label', current.alt);
                video.autoplay = true;
                video.loop = true;
                video.muted = true;
                video.playsInline = true;
                screenEl.appendChild(video);
            } else {
                var img = document.createElement('img');
                img.src = current.src;
                img.alt = current.alt;
                screenEl.appendChild(img);
            }

            bodyEl.textContent = current.body;
            counterEl.textContent = '0' + (step + 1) + ' / 0' + total;
            titleEl.textContent = current.title;
            nextLabel.textContent = step === total - 1 ? 'Replay' : 'Next state';
        }

        tabsEl.addEventListener('click', function (e) {
            var btn = e.target.closest('button[data-step]');
            if (!btn) return;
            step = parseInt(btn.dataset.step, 10);
            render();
        });

        nextBtn.addEventListener('click', function () {
            step = (step + 1) % total;
            render();
        });

        render();
    }

    function initCraftList() {
        var list = document.getElementById('craftList');
        if (!list) return;

        list.innerHTML = '';

        craftMoments.forEach(function (moment, index) {
            var article = document.createElement('article');

            var mediaWrap = document.createElement('div');
            var browserCase = document.createElement('span');
            browserCase.className = 'browser-case';

            var chrome = document.createElement('span');
            chrome.className = 'browser-chrome';
            chrome.setAttribute('aria-hidden', 'true');
            for (var d = 0; d < 3; d++) {
                var dot = document.createElement('span');
                dot.className = 'browser-dot';
                chrome.appendChild(dot);
            }

            var screen = document.createElement('span');
            screen.className = 'browser-screen';
            var img = document.createElement('img');
            img.src = moment.image;
            img.alt = moment.alt;
            screen.appendChild(img);

            browserCase.appendChild(chrome);
            browserCase.appendChild(screen);
            mediaWrap.appendChild(browserCase);

            var num = document.createElement('span');
            num.textContent = '0' + (index + 1);
            var h3 = document.createElement('h3');
            h3.textContent = moment.title;
            var p = document.createElement('p');
            p.textContent = moment.body;

            article.appendChild(mediaWrap);
            article.appendChild(num);
            article.appendChild(h3);
            article.appendChild(p);
            list.appendChild(article);
        });
    }

    function initSiteNavbar() {
        var navbar = document.querySelector('.navbar');
        if (!navbar) return;

        var siteHeader = document.querySelector('.site-header');
        var syncSiteHeaderHeight = function () {
            if (!siteHeader) return;
            var h = Math.ceil(siteHeader.getBoundingClientRect().height);
            document.documentElement.style.setProperty('--site-header-height', h + 'px');
        };

        syncSiteHeaderHeight();
        window.addEventListener('resize', syncSiteHeaderHeight);
        if (siteHeader && 'ResizeObserver' in window) {
            new ResizeObserver(syncSiteHeaderHeight).observe(siteHeader);
        }

        window.addEventListener('scroll', function () {
            navbar.classList.toggle('scrolled', window.pageYOffset > 50);
            syncSiteHeaderHeight();
        });
    }

    function initSiteMobileMenu() {
        var menuBtn = document.querySelector('.mobile-menu-btn');
        var mobileMenu = document.querySelector('.mobile-menu');
        var mobileLinks = document.querySelectorAll('.mobile-menu-links a');
        if (!menuBtn || !mobileMenu) return;

        menuBtn.addEventListener('click', function () {
            menuBtn.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        mobileLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                menuBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    function initNav() {
        var returnBtn = document.getElementById('returnBtn');
        var goBack = function () {
            if (document.referrer && document.referrer.indexOf(window.location.host) !== -1) {
                window.history.back();
            } else {
                window.location.href = 'index.html#case-studies';
            }
        };
        if (returnBtn) returnBtn.addEventListener('click', goBack);
    }

    document.addEventListener('DOMContentLoaded', function () {
        initSiteNavbar();
        initSiteMobileMenu();
        initJourneys();
        initAdaptiveJourney();
        initWalkthrough();
        initCraftList();
        initNav();
    });
})();
