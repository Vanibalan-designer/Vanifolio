(function () {
    var tracks = [
        {
            key: "oms",
            tab: "Order Fulfillment · OMS",
            problemEyebrow: "The problem OMS solves",
            problemTitle: "An order that lives in nobody's system",
            problemBody: "Every order was a nine-step manual relay — email, PDF, printouts, Plato, a shared Excel file — with no digital record between payment and delivery. The patient app knew it was paid for. The PFC floor knew it physically happened. Inventory only found out once a human decided to tell it.",
            evidenceImage: "images/medquest-v2/oms-workstation.jpg",
            evidenceAlt: "A PFC workstation with monitor, laptop and the TSC label printer three roles shared mid-relay",
            evidenceCaption: "The floor OMS replaces: one shared workstation, three roles, one printer.",
            redesignEyebrow: "What changed",
            redesignTitle: "One state machine, one shared moment of truth",
            redesignBody: "OMS models the order as five happy-path states plus one escape hatch, Pending Clarification, that every exception routes through. A Checker validating a packed order is the one instant OMS and IMS agree.",
            artifactImage: "images/medquest-v2/oms-dashboard.png",
            artifactAlt: "OMS orders overview dashboard showing pending packing, pending checking and clarification counts",
            artifactCaption: "Orders overview — what used to live in a shared Excel file.",
            stats: [
                { value: "9→1", label: "manual steps collapsed into one pipeline" },
                { value: "10→1", label: "clicks per address label" },
                { value: "30 min", label: "to first trial-run halt · 23 Jul 2026" },
                { value: "Live", label: "rolled out at the PFC post-trial fixes" }
            ]
        },
        {
            key: "ims",
            tab: "Inventory Management · IMS",
            problemEyebrow: "The problem IMS solves",
            problemTitle: "A warehouse run from one person's memory",
            problemBody: "One config admin reviews the week's clinical usage every Friday, then opens AP1 and repeats the same edit eight times — once per pharmacy — because nothing points back to a single source.",
            evidenceImage: "images/medquest-v2/ims-field-observation.jpg",
            evidenceAlt: "Research board from shadowing sessions at Marina Health warehouse, AP1 and Plato, with observation notes",
            evidenceCaption: "Shadowing the Friday cycle: Marina Health warehouse, AP1, and Plato, mid-use.",
            redesignEyebrow: "What changed",
            redesignTitle: "One record, referenced everywhere",
            redesignBody: "IMS's entire premise: one ITEM_MASTER record per drug, referenced — never copied — by every pharmacy, pricing scheme and prescribing surface. Edit once, and Provider Web, the patient app, Plato and OMS all read the same truth.",
            artifactImage: "images/medquest-v2/ims-item-master.png",
            artifactAlt: "IMS Item Master list showing SKU ID, product name, formulary status and PFC stock",
            artifactCaption: "Item Master — the flagship module, 90% designed.",
            stats: [
                { value: "13", label: "locations on one hub-and-spoke network" },
                { value: "400+", label: "SKUs currently living in one person's head" },
                { value: "8→1", label: "edits to change one drug's price" },
                { value: "Q3 2026", label: "Phase 1 · in engineering build" }
            ]
        }
    ];

    function renderPanel(panel, track) {
        panel.innerHTML =
            '<div class="track-block">' +
                '<div>' +
                    '<p class="eyebrow">' + track.problemEyebrow + '</p>' +
                    '<h3>' + track.problemTitle + '</h3>' +
                    '<p>' + track.problemBody + '</p>' +
                '</div>' +
                '<figure class="evidence-photo">' +
                    '<img src="' + track.evidenceImage + '" alt="' + track.evidenceAlt + '">' +
                    '<figcaption>' + track.evidenceCaption + '</figcaption>' +
                '</figure>' +
            '</div>' +
            '<div class="track-block">' +
                '<div>' +
                    '<p class="eyebrow">' + track.redesignEyebrow + '</p>' +
                    '<h3>' + track.redesignTitle + '</h3>' +
                    '<p>' + track.redesignBody + '</p>' +
                '</div>' +
                '<span class="browser-case">' +
                    '<span class="browser-chrome" aria-hidden="true"><span class="browser-dot"></span><span class="browser-dot"></span><span class="browser-dot"></span></span>' +
                    '<span class="browser-screen"><img src="' + track.artifactImage + '" alt="' + track.artifactAlt + '"></span>' +
                '</span>' +
            '</div>' +
            '<div class="track-stats">' +
                track.stats.map(function (s) {
                    return '<div><strong>' + s.value + '</strong><span>' + s.label + '</span></div>';
                }).join('') +
            '</div>';
    }

    function initTracks() {
        var toggle = document.getElementById('trackToggle');
        var panel = document.getElementById('trackPanel');
        if (!toggle || !panel) return;

        var active = 0;

        toggle.innerHTML = tracks.map(function (t, i) {
            return '<button type="button" class="' + (i === 0 ? 'active' : '') + '" data-track="' + t.key + '">' + t.tab + '</button>';
        }).join('');

        function setActive(key) {
            var index = tracks.findIndex(function (t) { return t.key === key; });
            if (index === -1) return;
            active = index;
            toggle.querySelectorAll('button').forEach(function (btn) {
                btn.classList.toggle('active', btn.dataset.track === key);
            });
            renderPanel(panel, tracks[index]);
        }

        toggle.addEventListener('click', function (e) {
            var btn = e.target.closest('button[data-track]');
            if (!btn) return;
            setActive(btn.dataset.track);
        });

        document.querySelectorAll('[data-enter-track]').forEach(function (link) {
            link.addEventListener('click', function () {
                setActive(link.dataset.enterTrack);
            });
        });

        setActive(tracks[active].key);
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
        initTracks();
        initNav();
    });
})();
