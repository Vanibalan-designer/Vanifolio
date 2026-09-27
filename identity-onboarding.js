(function () {
    var productSteps = [
        { label: "Start", title: "A clear invitation", body: "People understand why identity is needed before they begin.", type: "image", src: "images/identity-v2/start-singpass.png", alt: "Singpass identity verification start screen" },
        { label: "Verify coverage", title: "Coverage recognised automatically", body: "The system matches verified identity to the right benefits without the person doing anything extra.", type: "video", src: "images/identity-v2/verify-coverage.mp4", alt: "User coverage recognised after Singpass verification" },
        { label: "Confirm", title: "Confidence, made visible", body: "Retrieved details are shown plainly so people can confirm rather than re-type.", type: "image", src: "images/identity-v2/confirm-singpass.jpg", alt: "Singpass confirm details screen" },
        { label: "Verify ID", title: "A second layer of trust", body: "Government ID is captured to back up what Singpass returned, so the record is airtight.", type: "video", src: "images/identity-v2/verify-id.mp4", alt: "ID document capture screen" },
        { label: "It's really you", title: "Verification without a surveillance feeling", body: "A quick selfie frames identity as reassurance, not suspicion.", type: "video", src: "images/identity-v2/selfie-adults.mp4", rate: 0.65, alt: "Selfie liveness check screen" },
        { label: "Review once again", title: "Nothing overlooked", body: "People check their own details one last time before anything is finalised.", type: "image", src: "images/identity-v2/review-details.png", alt: "Review personal details screen" },
        { label: "Success", title: "Ready for care", body: "A verified identity opens straight into the first consultation, benefits already attached.", type: "image", src: "images/identity-v2/success-consultation.jpg", alt: "First telehealth consultation after verification" }
    ];

    var craftMoments = [
        { title: "Progress without uncertainty", body: "Each step names what is happening now and what will happen next, so verification feels finite.", type: "video", src: "images/identity-v2/progress-loading.mp4", alt: "Account setup progress indicator" },
        { title: "Coverage lands ready to use", body: "The right home experience and benefits appear immediately after verification, with nothing left for the person to configure.", type: "video", src: "images/identity-v2/coverage-lands.mp4", alt: "Coverage recognised and home screen ready after verification" },
        { title: "Verification without a surveillance feeling", body: "Plain guidance and a clear capture-to-upload sequence frame the selfie as reassurance, not suspicion — for a dependent as much as an adult.", type: "video", src: "images/identity-v2/selfie-dependents-capture.mp4", rate: 0.65, alt: "Friendly selfie verification for a dependent, from capture through upload" },
        { title: "Complexity stays behind the interface", body: "Multiple linked coverages resolve into one clear choice instead of surfacing the account complexity behind them.", type: "image", src: "images/identity-v2/multipolicy.jpg", alt: "Choose coverage screen with multiple linked policies" },
        { title: "One identity, the whole family", body: "Linked dependents surface as a simple list to choose from, instead of repeating identity verification for every family member.", type: "video", src: "images/identity-v2/who-is-seeing-doctor.mp4", alt: "Choosing which linked dependent is seeing the doctor" }
    ];

    var journeyBefore = ["Account", "Coverage", "Consultation", "Identity"];
    var journeyAfter = ["Identity", "Account", "Coverage", "Care"];
    var entryOptions = ["Singpass", "Manual verification", "B2B", "B2C", "Existing account", "New account"];

    function renderJourney(container, items) {
        container.innerHTML = items.map(function (item, index) {
            var connector = index < items.length - 1 ? '<i aria-hidden="true"></i>' : '';
            return '<div class="journey-node journey-node--' + item.toLowerCase() + '">' +
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
        var counterEl = document.getElementById('walkthroughCounter');
        var titleEl = document.getElementById('walkthroughTitle');
        var stepBodyEl = document.getElementById('walkthroughStepBody');
        var ringEl = document.getElementById('walkthroughRing');
        var prevBtn = document.getElementById('walkthroughPrev');
        var nextBtn = document.getElementById('walkthroughNext');
        if (!tabsEl || !screenEl || !ringEl) return;

        var AUTOPLAY_MS = 5000;
        var step = 0;
        var total = productSteps.length;
        var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var autoplayAbort = null;
        var preloaded = {};

        tabsEl.innerHTML = productSteps.map(function (item, index) {
            return '<button type="button" data-step="' + index + '" class="' + (index === 0 ? 'active' : '') + '">' +
                '<span>0' + (index + 1) + '</span>' + item.label +
                '</button>';
        }).join('');

        function preloadStep(index) {
            var item = productSteps[index];
            if (!item || preloaded[item.src]) return;
            preloaded[item.src] = true;
            if (item.type === 'video') {
                var v = document.createElement('video');
                v.preload = 'auto';
                v.muted = true;
                v.src = item.src;
            } else {
                var img = new Image();
                img.src = item.src;
            }
        }

        function render() {
            var current = productSteps[step];

            tabsEl.querySelectorAll('button').forEach(function (btn, index) {
                btn.classList.toggle('active', index === step);
            });

            screenEl.innerHTML = '';
            if (current.type === 'video') {
                var video = document.createElement('video');
                video.setAttribute('aria-label', current.alt);
                video.autoplay = true;
                video.loop = true;
                video.muted = true;
                video.playsInline = true;
                if (current.rate) {
                    video.playbackRate = current.rate;
                    video.addEventListener('loadedmetadata', function () { video.playbackRate = current.rate; });
                }
                video.src = current.src;
                screenEl.appendChild(video);
            } else {
                var img = document.createElement('img');
                img.src = current.src;
                img.alt = current.alt;
                screenEl.appendChild(img);
            }

            counterEl.textContent = '0' + (step + 1) + ' / 0' + total;
            titleEl.textContent = current.title;
            stepBodyEl.textContent = current.body;

            preloadStep((step + 1) % total);
        }

        function armAutoplay() {
            ringEl.classList.remove('is-counting');
            if (reduceMotion) return;
            if (autoplayAbort) autoplayAbort.abort();

            // force the ring animation to restart from zero even on the same element
            void ringEl.offsetWidth;
            ringEl.classList.add('is-counting');

            autoplayAbort = new AbortController();
            var fill = ringEl.querySelector('.id-ring-fill');
            fill.addEventListener('animationend', function () {
                goToStep((step + 1) % total);
            }, { once: true, signal: autoplayAbort.signal });
        }

        function goToStep(index) {
            step = index;
            render();
            armAutoplay();
        }

        tabsEl.addEventListener('click', function (e) {
            var btn = e.target.closest('button[data-step]');
            if (!btn) return;
            goToStep(parseInt(btn.dataset.step, 10));
        });

        nextBtn.addEventListener('click', function () {
            goToStep((step + 1) % total);
        });

        prevBtn.addEventListener('click', function () {
            goToStep((step - 1 + total) % total);
        });

        goToStep(0);
    }

    function initCraftList() {
        var list = document.getElementById('craftList');
        if (!list) return;

        list.innerHTML = '';

        craftMoments.forEach(function (moment, index) {
            var article = document.createElement('article');

            var mediaWrap = document.createElement('div');
            var phoneCase = document.createElement('span');
            phoneCase.className = 'phone-case';

            var island = document.createElement('span');
            island.className = 'phone-island';
            island.setAttribute('aria-hidden', 'true');

            var screen = document.createElement('span');
            screen.className = 'phone-screen';

            var media;
            if (moment.type === 'video') {
                media = document.createElement('video');
                media.setAttribute('aria-label', moment.alt);
                media.autoplay = true;
                media.loop = true;
                media.muted = true;
                media.playsInline = true;
                if (moment.rate) {
                    media.playbackRate = moment.rate;
                    media.addEventListener('loadedmetadata', function () { media.playbackRate = moment.rate; });
                }
                media.src = moment.src;
            } else {
                media = document.createElement('img');
                media.src = moment.src;
                media.alt = moment.alt;
            }
            screen.appendChild(media);

            var btnOne = document.createElement('span');
            btnOne.className = 'phone-button phone-button--one';
            btnOne.setAttribute('aria-hidden', 'true');
            var btnTwo = document.createElement('span');
            btnTwo.className = 'phone-button phone-button--two';
            btnTwo.setAttribute('aria-hidden', 'true');

            phoneCase.appendChild(island);
            phoneCase.appendChild(screen);
            phoneCase.appendChild(btnOne);
            phoneCase.appendChild(btnTwo);
            mediaWrap.appendChild(phoneCase);

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
        var backBtn = document.getElementById('backBtn');
        var returnBtn = document.getElementById('returnBtn');
        var goBack = function () {
            if (document.referrer && document.referrer.indexOf(window.location.host) !== -1) {
                window.history.back();
            } else {
                window.location.href = 'index.html#case-studies';
            }
        };
        if (backBtn) backBtn.addEventListener('click', goBack);
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
