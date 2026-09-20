// ===================================
// Sticker Playground — draggable embroidered patches, tilt/sheen/elevation
// ===================================
function initStickerPlayground() {
    const playground = document.getElementById('stickerPlayground');
    const laptop = playground && playground.querySelector('.sticker-laptop');
    if (!playground || !laptop) return;

    const cue = document.getElementById('stickerDiscoveryCue');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const STICKERS = [
        { key: 'figma', file: 'images/stickers/figma.png', alt: 'Embroidered Figma patch', width: 64, compactWidth: 46, rot: -6, side: 'mac', left: 0.06, top: 0.08 },
        { key: 'headphones', file: 'images/stickers/headphones.png', alt: 'Embroidered headphones patch', width: 84, compactWidth: 58, rot: 4, side: 'mac', left: 0.64, top: 0.04 },
        { key: 'travel', file: 'images/stickers/travel.png', alt: 'Embroidered travel patch', width: 84, compactWidth: 58, rot: 5, side: 'mac', left: 0.76, top: 0.42 },
        { key: 'cooking', file: 'images/stickers/cooking.png', alt: 'Embroidered cooking patch', width: 88, compactWidth: 60, rot: -4, side: 'mac', left: 0.58, top: 0.68 },
        { key: 'beach', file: 'images/stickers/beach.png', alt: 'Embroidered beach patch', width: 84, compactWidth: 58, rot: -3, side: 'mac', left: 0.08, top: 0.68 },
        { key: 'ai', file: 'images/stickers/ai.png', alt: 'Embroidered AI patch representing OpenAI and Claude', width: 84, compactWidth: 58, rot: -5, side: 'mac', left: 0.02, top: 0.36 },
        { key: 'kolam', file: 'images/stickers/kolam.png', alt: 'Embroidered Sikku Kolam patch', width: 68, compactWidth: 50, rot: 0, side: 'ground', left: 0.40 },
    ];

    const COMPACT_QUERY = window.matchMedia('(max-width: 640px)');

    const SHADOW_REST = { y: 1, blur: 2, alpha: 0.25 };
    const SHADOW_LIFT = { y: 20, blur: 22, alpha: 0.30 };
    const MAX_TILT = 24;
    const TILT_SENSITIVITY = 0.9;
    const TILT_LERP = 0.38;
    const LIFT_LERP = 0.22;

    let zCounter = 10;
    let hasInteracted = false;

    function restTransform(rot) {
        return `perspective(700px) rotate(${rot}deg) rotateX(0deg) rotateY(0deg) scale(1)`;
    }

    function shadowString(t) {
        const y = SHADOW_REST.y + (SHADOW_LIFT.y - SHADOW_REST.y) * t;
        const blur = SHADOW_REST.blur + (SHADOW_LIFT.blur - SHADOW_REST.blur) * t;
        const alpha = SHADOW_REST.alpha + (SHADOW_LIFT.alpha - SHADOW_REST.alpha) * t;
        return `0 ${y.toFixed(1)}px ${blur.toFixed(1)}px rgba(17, 24, 39, ${alpha.toFixed(2)})`;
    }

    const entries = STICKERS.map((s) => {
        const entrance = document.createElement('div');
        entrance.className = 'sticker-entrance';

        const el = document.createElement('div');
        el.className = 'playground-sticker';
        el.style.setProperty('--rest-transform', `rotate(${s.rot}deg)`);
        el.style.transform = restTransform(s.rot);

        const img = document.createElement('img');
        img.src = s.file;
        img.alt = s.alt;
        img.draggable = false;
        img.style.setProperty('--sticker-shadow', shadowString(0));

        const sheen = document.createElement('span');
        sheen.className = 'sticker-sheen';
        sheen.style.setProperty('--sticker-image', `url("${s.file}")`);

        el.appendChild(img);
        el.appendChild(sheen);
        entrance.appendChild(el);
        playground.appendChild(entrance);

        return { config: s, entrance, el, img, sheen };
    });

    function placeAll() {
        const compact = COMPACT_QUERY.matches;
        const rect = playground.getBoundingClientRect();
        const laptopRect = laptop.getBoundingClientRect();
        const laptopX = laptopRect.left - rect.left;
        const laptopY = laptopRect.top - rect.top;

        entries.forEach(({ config, entrance, el }) => {
            const targetWidth = compact ? config.compactWidth : config.width;
            el.style.width = targetWidth + 'px';

            const elRect = el.getBoundingClientRect();
            const w = elRect.width || targetWidth;
            const h = elRect.height || targetWidth;

            let left;
            let top;
            if (config.side === 'mac') {
                left = laptopX + config.left * laptopRect.width;
                top = laptopY + config.top * laptopRect.height;
            } else {
                left = config.left * rect.width;
                top = laptopY + laptopRect.height + 18;
            }

            const maxLeft = Math.max(-w * 0.15, rect.width - w * 0.85);
            const maxTop = Math.max(-h * 0.15, rect.height - h * 0.85);
            left = Math.min(maxLeft, Math.max(-w * 0.15, left));
            top = Math.min(maxTop, Math.max(-h * 0.15, top));
            entrance.style.left = left + 'px';
            entrance.style.top = top + 'px';
        });
    }

    function dismissCue() {
        if (!cue || cue.classList.contains('is-hidden')) return;
        cue.classList.add('is-hidden');
        try { sessionStorage.setItem('stickerCueSeen', '1'); } catch (e) { /* ignore */ }
    }

    try {
        if (cue && sessionStorage.getItem('stickerCueSeen') === '1') {
            cue.classList.add('is-hidden');
        }
    } catch (e) { /* ignore */ }

    function attachDrag(config, el, img, sheen) {
        let dragging = false;
        let startClientX = 0;
        let startClientY = 0;
        let baseLeft = 0;
        let baseTop = 0;
        let lastX = 0;
        let lastY = 0;
        let lastT = 0;
        let tiltX = 0;
        let tiltY = 0;
        let targetTiltX = 0;
        let targetTiltY = 0;
        let liftProgress = 0;
        let rafId = null;

        function frame() {
            tiltX += (targetTiltX - tiltX) * TILT_LERP;
            tiltY += (targetTiltY - tiltY) * TILT_LERP;
            const liftTarget = dragging ? 1 : 0;
            liftProgress += (liftTarget - liftProgress) * LIFT_LERP;

            el.style.transform = `perspective(700px) rotate(${config.rot}deg) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale(${(1 + liftProgress * 0.1).toFixed(3)})`;
            img.style.setProperty('--sticker-shadow', shadowString(liftProgress));
            const sheenStrength = Math.min(1, (Math.abs(tiltX) + Math.abs(tiltY)) / 16);
            sheen.style.setProperty('--sheen-opacity', String(sheenStrength * 0.9));
            sheen.style.setProperty('--sheen-x', (50 - tiltY * 1.4).toFixed(1) + '%');
            sheen.style.setProperty('--sheen-y', (50 + tiltX * 1.4).toFixed(1) + '%');

            const settled = !dragging
                && Math.abs(tiltX) < 0.05 && Math.abs(tiltY) < 0.05
                && liftProgress < 0.01;

            if (!settled) {
                rafId = requestAnimationFrame(frame);
            } else {
                tiltX = 0;
                tiltY = 0;
                liftProgress = 0;
                el.style.transform = restTransform(config.rot);
                img.style.setProperty('--sticker-shadow', shadowString(0));
                sheen.style.setProperty('--sheen-opacity', '0');
                rafId = null;
            }
        }

        function ensureLoop() {
            if (rafId === null) rafId = requestAnimationFrame(frame);
        }

        el.addEventListener('pointerdown', (e) => {
            el.setPointerCapture(e.pointerId);
            dragging = true;
            hasInteracted = true;
            dismissCue();
            el.classList.add('is-dragging');
            el.style.zIndex = String(zCounter++);

            const entrance = el.parentElement;
            baseLeft = parseFloat(entrance.style.left) || 0;
            baseTop = parseFloat(entrance.style.top) || 0;
            startClientX = e.clientX;
            startClientY = e.clientY;
            lastX = e.clientX;
            lastY = e.clientY;
            lastT = performance.now();

            if (!reduceMotion) {
                const elRect = el.getBoundingClientRect();
                const originX = ((e.clientX - elRect.left) / elRect.width) * 100;
                const originY = ((e.clientY - elRect.top) / elRect.height) * 100;
                el.style.transformOrigin = `${originX.toFixed(1)}% ${originY.toFixed(1)}%`;
            }

            ensureLoop();
        });

        el.addEventListener('pointermove', (e) => {
            if (!dragging) return;

            const pgRect = playground.getBoundingClientRect();
            const elRect = el.getBoundingClientRect();
            const dx = e.clientX - startClientX;
            const dy = e.clientY - startClientY;
            const pad = Math.min(elRect.width, elRect.height) * 0.4;
            const maxLeft = pgRect.width - elRect.width + pad;
            const maxTop = pgRect.height - elRect.height + pad;
            const newLeft = Math.min(maxLeft, Math.max(-pad, baseLeft + dx));
            const newTop = Math.min(maxTop, Math.max(-pad, baseTop + dy));

            const entrance = el.parentElement;
            entrance.style.left = newLeft + 'px';
            entrance.style.top = newTop + 'px';

            if (!reduceMotion) {
                const now = performance.now();
                const dt = Math.max(8, now - lastT);
                const vx = ((e.clientX - lastX) / dt) * 16;
                const vy = ((e.clientY - lastY) / dt) * 16;
                targetTiltY = Math.max(-MAX_TILT, Math.min(MAX_TILT, vx * TILT_SENSITIVITY));
                targetTiltX = Math.max(-MAX_TILT, Math.min(MAX_TILT, -vy * TILT_SENSITIVITY));
                lastX = e.clientX;
                lastY = e.clientY;
                lastT = now;
            }
        });

        function release(e) {
            if (!dragging) return;
            dragging = false;
            el.releasePointerCapture(e.pointerId);
            el.classList.remove('is-dragging');
            targetTiltX = 0;
            targetTiltY = 0;
            ensureLoop();
        }

        el.addEventListener('pointerup', release);
        el.addEventListener('pointercancel', release);
    }

    entries.forEach(({ config, el, img, sheen }) => attachDrag(config, el, img, sheen));

    placeAll();

    function runEntrance() {
        if (reduceMotion) {
            laptop.classList.add('is-visible');
            entries.forEach(({ entrance }) => entrance.classList.add('is-visible'));
            return;
        }

        laptop.classList.add('is-visible');
        entries.forEach(({ entrance }, i) => {
            setTimeout(() => entrance.classList.add('is-visible'), 300 + i * 70);
        });

        const wiggleDelay = 300 + entries.length * 70 + 400;
        setTimeout(() => {
            if (hasInteracted) return;
            const groundEntry = entries.find((entry) => entry.config.side === 'ground') || entries[0];
            const target = groundEntry.el;
            target.classList.add('sticker-wiggle');
            target.addEventListener('animationend', () => target.classList.remove('sticker-wiggle'), { once: true });
        }, wiggleDelay);
    }

    const io = new IntersectionObserver((observed) => {
        observed.forEach((entry) => {
            if (!entry.isIntersecting) return;
            io.unobserve(playground);
            runEntrance();
        });
    }, { threshold: 0.2 });
    io.observe(playground);

    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(placeAll, 200);
    }, { passive: true });
}
