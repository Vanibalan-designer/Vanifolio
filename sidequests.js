(function () {
    function initViewportVideos() {
        var videos = document.querySelectorAll('video[data-viewport-play]');
        if (!videos.length || !('IntersectionObserver' in window)) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                var video = entry.target;
                if (entry.isIntersecting) {
                    video.play().catch(function () {});
                } else {
                    video.pause();
                }
            });
        }, { rootMargin: '240px 0px', threshold: 0.08 });

        videos.forEach(function (video) { observer.observe(video); });
    }

    function initWorksiteNav() {
        var btn = document.querySelector('.wsite-menu-btn');
        var menu = document.querySelector('.wsite-mobile-menu');
        if (!btn || !menu) return;
        btn.addEventListener('click', function () {
            var open = menu.classList.toggle('is-open');
            btn.classList.toggle('is-open', open);
            btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        menu.querySelectorAll('a').forEach(function (a) {
            a.addEventListener('click', function () {
                menu.classList.remove('is-open');
                btn.classList.remove('is-open');
                btn.setAttribute('aria-expanded', 'false');
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initViewportVideos();
        initWorksiteNav();
    });
})();
