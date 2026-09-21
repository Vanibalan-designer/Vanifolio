(function () {
    var steps = [
        { label: "Circle Button", title: "Pixel-perfect, node by node", body: "Every component references its exact Figma node. The Circle Button docs spell out what makes it different from a standard button — size, shape, indicator states — so engineers don't have to guess.", src: "images/gravity-v2/circle-button.jpg", alt: "Gravity Storybook Circle Button documentation with props table and controls" },
        { label: "Button", title: "Live controls, not static specs", body: "Variant, width, disabled state, platform — every prop is a live control engineers can toggle, with the rendered component and its code updating together.", src: "images/gravity-v2/button.jpg", alt: "Gravity Storybook Button documentation with interactive props table" }
    ];

    function initWalkthrough() {
        var tabsEl = document.getElementById('stepTabs');
        var screenEl = document.getElementById('walkthroughScreen');
        var bodyEl = document.getElementById('walkthroughBody');
        var counterEl = document.getElementById('walkthroughCounter');
        var titleEl = document.getElementById('walkthroughTitle');
        var nextBtn = document.getElementById('walkthroughNext');
        if (!tabsEl || !screenEl) return;

        var step = 0;
        var total = steps.length;

        tabsEl.innerHTML = steps.map(function (item, index) {
            return '<button type="button" data-step="' + index + '" class="' + (index === 0 ? 'active' : '') + '">' +
                '<span>0' + (index + 1) + '</span>' + item.label +
                '</button>';
        }).join('');

        function render() {
            var current = steps[step];
            tabsEl.querySelectorAll('button').forEach(function (btn, index) {
                btn.classList.toggle('active', index === step);
            });
            screenEl.innerHTML = '';
            var img = document.createElement('img');
            img.src = current.src;
            img.alt = current.alt;
            screenEl.appendChild(img);
            bodyEl.textContent = current.body;
            counterEl.textContent = '0' + (step + 1) + ' / 0' + total;
            titleEl.textContent = current.title;
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
        initWalkthrough();
        initNav();
    });
})();
