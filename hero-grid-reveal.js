// ===================================
// Hero Grid Reveal — FigJam-style dot grid, wave-field cursor reveal
// ===================================
function initHeroGridReveal() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    if (window.matchMedia('(max-width: 640px)').matches) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'hero-grid-canvas';
    hero.insertBefore(canvas, hero.firstChild);
    const ctx = canvas.getContext('2d');

    const SPACING = 18;
    const DOT_RADIUS_IDLE = 1.3;
    const DOT_RADIUS_REVEAL = 2.1;
    const IDLE_ALPHA = 0.13;
    const REVEAL_ALPHA = 0.85;
    const IDLE_SHADE = 195;
    const REVEAL_SHADE = 130;
    const BASE_RADIUS = 170;
    const EDGE_SOFTNESS = 55;
    const SPRING_STIFFNESS = 0.045;
    const SPRING_DAMPING = 0.86;
    const IDLE_TIMEOUT = 500;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    let width = 0;
    let height = 0;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    let dots = [];
    let rafId = null;
    let isVisible = false;
    let targetX = 0;
    let targetY = 0;
    let centerX = 0;
    let centerY = 0;
    let velX = 0;
    let velY = 0;
    let lastMoveAt = -Infinity;
    let hoverStrength = 0;
    let timeMs = 0;

    function smoothstep(edge0, edge1, x) {
        const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
        return t * t * (3 - 2 * t);
    }

    function fieldRadius(angle, t) {
        return BASE_RADIUS
            + Math.sin(angle * 3 + t * 0.0011) * 35
            + Math.sin(angle * 5 - t * 0.0017) * 20;
    }

    function drawFrame(idleOnly) {
        ctx.clearRect(0, 0, width, height);

        const strength = idleOnly ? 0 : hoverStrength;

        for (let i = 0; i < dots.length; i++) {
            const d = dots[i];
            let edge = 0;
            if (strength > 0.001) {
                const dx = d.x - centerX;
                const dy = d.y - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);
                const r = fieldRadius(angle, timeMs);
                edge = (1 - smoothstep(r - EDGE_SOFTNESS, r + EDGE_SOFTNESS, dist)) * strength;
            }
            const alpha = IDLE_ALPHA + (REVEAL_ALPHA - IDLE_ALPHA) * edge;
            const shade = Math.round(IDLE_SHADE + (REVEAL_SHADE - IDLE_SHADE) * edge);
            const radius = DOT_RADIUS_IDLE + (DOT_RADIUS_REVEAL - DOT_RADIUS_IDLE) * edge;

            ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade}, ${alpha})`;
            ctx.beginPath();
            ctx.arc(d.x, d.y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function resize() {
        const rect = hero.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        dots = [];
        for (let y = SPACING / 2; y < height; y += SPACING) {
            for (let x = SPACING / 2; x < width; x += SPACING) {
                dots.push({ x, y });
            }
        }
        drawFrame(true);
    }

    function step(ts) {
        timeMs = ts;
        const active = ts - lastMoveAt < IDLE_TIMEOUT;
        hoverStrength += ((active ? 1 : 0) - hoverStrength) * 0.12;

        velX += (targetX - centerX) * SPRING_STIFFNESS;
        velY += (targetY - centerY) * SPRING_STIFFNESS;
        velX *= SPRING_DAMPING;
        velY *= SPRING_DAMPING;
        centerX += velX;
        centerY += velY;

        drawFrame(false);

        const settled = hoverStrength < 0.01 && Math.abs(velX) < 0.05 && Math.abs(velY) < 0.05;
        if (!settled) {
            rafId = requestAnimationFrame(step);
        } else {
            hoverStrength = 0;
            drawFrame(true);
            rafId = null;
        }
    }

    function ensureLoop() {
        if (rafId === null && isVisible) rafId = requestAnimationFrame(step);
    }

    function onMouseMove(e) {
        const rect = hero.getBoundingClientRect();
        targetX = e.clientX - rect.left;
        targetY = e.clientY - rect.top;
        lastMoveAt = performance.now();
        ensureLoop();
    }

    resize();

    if (!reduceMotion && canHover) {
        hero.addEventListener('mousemove', onMouseMove);
        hero.addEventListener('mouseleave', () => { lastMoveAt = -Infinity; ensureLoop(); });

        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => { isVisible = entry.isIntersecting; });
            if (isVisible) ensureLoop();
        });
        io.observe(hero);
    }

    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 200);
    }, { passive: true });

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => resize());
    }
    window.addEventListener('load', () => resize(), { once: true });
}
