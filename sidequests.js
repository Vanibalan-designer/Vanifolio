(function () {
    var PORTAL_PATH = 'images/sidequest/window-to-somewhere/';
    var PORTAL_FRAMES = [
        '01-window-closed.png', '07-zoom-3.png'
    ];
    var DEBUG_PORTAL = false;

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function mix(from, to, amount) {
        return from + (to - from) * amount;
    }

    function smoothstep(start, end, value) {
        var t = clamp((value - start) / (end - start), 0, 1);
        return t * t * (3 - 2 * t);
    }

    function easeOutCubic(value) {
        return 1 - Math.pow(1 - clamp(value, 0, 1), 3);
    }

    function initViewportVideos() {
        var videos = document.querySelectorAll('video[data-viewport-play]');
        if (!videos.length || !('IntersectionObserver' in window)) return;
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                var video = entry.target;
                if (entry.isIntersecting) video.play().catch(function () {});
                else video.pause();
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
        menu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                menu.classList.remove('is-open');
                btn.classList.remove('is-open');
                btn.setAttribute('aria-expanded', 'false');
            });
        });
    }

    function preloadFrames() {
        return Promise.all(PORTAL_FRAMES.map(function (name) {
            return new Promise(function (resolve) {
                var image = new Image();
                var settled = false;
                function finish(result) {
                    if (settled) return;
                    settled = true;
                    resolve(result);
                }
                image.onload = function () {
                    if (!image.decode) return finish(true);
                    image.decode().then(function () { finish(true); }).catch(function () { finish(true); });
                };
                image.onerror = function () { finish(false); };
                image.src = PORTAL_PATH + name;
                if (image.complete) finish(image.naturalWidth > 0);
            });
        })).then(function (results) {
            return results.every(Boolean);
        });
    }

    function initWindowPortal() {
        var card = document.querySelector('.sq-window-portal');
        if (!card) return;

        var page = document.querySelector('.sq-page');
        var windowObject = card.querySelector('.sq-window-object');
        var openScene = card.querySelector('.sq-window-open');
        var closedScene = card.querySelector('.sq-window-closed-frame');
        var leftDoor = card.querySelector('.portal-window-door-left');
        var rightDoor = card.querySelector('.portal-window-door-right');
        var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var coarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches;
        var transitionSceneConfig = [
            { position: '50% 50%', scale: 1, x: 0, y: 0 }
        ];

        var state = 'idle';
        var portalProgress = 0;
        var targetPortalProgress = 0;
        var springVelocity = 0;
        var velocityImpulse = 0;
        var pointerDistance = Infinity;
        var pointerSpeed = 0;
        var rawPointer = { x: 0, y: 0, ready: false };
        var smoothPointer = { x: 0, y: 0 };
        var previousPointer = { x: 0, y: 0, time: 0 };
        var anchor = { x: 0, y: 0 };
        var cardRect = null;
        var windowRect = null;
        var assetsReady = false;
        var autoRequested = false;
        var overlay = null;
        var overlayImages = [];
        var overlayStartRect = null;
        var overlayStartProgress = 0.65;
        var commitTime = 0;
        var routed = false;
        var lastFrameTime = performance.now();
        var debug = null;

        if (DEBUG_PORTAL) {
            debug = document.createElement('pre');
            debug.className = 'sq-portal-debug';
            document.body.appendChild(debug);
        }

        preloadFrames().then(function (ready) {
            assetsReady = ready;
        });

        function cacheGeometry() {
            cardRect = card.getBoundingClientRect();
            windowRect = windowObject.getBoundingClientRect();
            anchor.x = windowRect.left + windowRect.width / 2;
            anchor.y = windowRect.top + windowRect.height / 2;
        }

        function mapDistanceToProgress(distance) {
            if (distance >= 500) return 0;
            if (distance >= 280) return mix(0, 0.25, smoothstep(0, 1, (500 - distance) / 220));
            if (distance >= 120) return mix(0.25, 0.55, smoothstep(0, 1, (280 - distance) / 160));
            if (distance >= 75) return mix(0.55, 0.68, smoothstep(0, 1, (120 - distance) / 45));
            return 0.72;
        }

        function updatePointerTarget() {
            if (state === 'committed' || state === 'transitioning' || !rawPointer.ready || coarsePointer || autoRequested) return;
            smoothPointer.x += (rawPointer.x - smoothPointer.x) * 0.24;
            smoothPointer.y += (rawPointer.y - smoothPointer.y) * 0.24;
            var dx = smoothPointer.x - anchor.x;
            var dy = smoothPointer.y - anchor.y;
            pointerDistance = Math.sqrt(dx * dx + dy * dy);
            targetPortalProgress = mapDistanceToProgress(pointerDistance);
            if (!assetsReady) targetPortalProgress = Math.min(targetPortalProgress, 0.63);
            state = targetPortalProgress > 0.001 ? 'tracking' : 'idle';
        }

        function onPointerMove(event) {
            if (coarsePointer || state === 'committed' || state === 'transitioning') return;
            var now = performance.now();
            if (!rawPointer.ready) {
                rawPointer.x = smoothPointer.x = previousPointer.x = event.clientX;
                rawPointer.y = smoothPointer.y = previousPointer.y = event.clientY;
                rawPointer.ready = true;
                previousPointer.time = now;
                return;
            }
            var movementX = event.clientX - previousPointer.x;
            var movementY = event.clientY - previousPointer.y;
            var movement = Math.sqrt(movementX * movementX + movementY * movementY);
            if (movement < 2.5) return;
            var deltaTime = Math.max(8, now - previousPointer.time);
            pointerSpeed = movement / deltaTime * 1000;
            var oldDistance = Math.sqrt(Math.pow(previousPointer.x - anchor.x, 2) + Math.pow(previousPointer.y - anchor.y, 2));
            var newDistance = Math.sqrt(Math.pow(event.clientX - anchor.x, 2) + Math.pow(event.clientY - anchor.y, 2));
            if (newDistance < oldDistance) velocityImpulse = Math.min(0.08, (oldDistance - newDistance) * 0.0015 + pointerSpeed * 0.00001);
            rawPointer.x = event.clientX;
            rawPointer.y = event.clientY;
            previousPointer.x = event.clientX;
            previousPointer.y = event.clientY;
            previousPointer.time = now;
        }

        function onPointerLeave() {
            if (state === 'committed' || state === 'transitioning' || autoRequested) return;
            rawPointer.ready = false;
            targetPortalProgress = 0;
            state = 'idle';
        }

        function renderOpening(progress) {
            var openAmount = smoothstep(0.04, 0.62, progress);
            var revealDoors = smoothstep(0.02, 0.12, progress);
            var hingeAngle = easeOutCubic(openAmount) * 78;
            closedScene.style.opacity = (1 - revealDoors).toFixed(4);
            openScene.style.opacity = '1';
            leftDoor.style.opacity = revealDoors.toFixed(4);
            rightDoor.style.opacity = revealDoors.toFixed(4);
            leftDoor.style.transform = 'rotateY(' + (-hingeAngle).toFixed(3) + 'deg)';
            rightDoor.style.transform = 'rotateY(' + hingeAngle.toFixed(3) + 'deg)';
            card.style.setProperty('--window-progress', progress.toFixed(4));

            var parallaxIn = smoothstep(0.55, 0.59, progress);
            var parallaxOut = 1 - smoothstep(0.64, 0.68, progress);
            var parallaxAmount = parallaxIn * parallaxOut;
            var nx = rawPointer.ready ? clamp((smoothPointer.x - anchor.x) / Math.max(1, windowRect.width / 2), -1, 1) : 0;
            var ny = rawPointer.ready ? clamp((smoothPointer.y - anchor.y) / Math.max(1, windowRect.height / 2), -1, 1) : 0;
            card.style.setProperty('--window-shift-x', (nx * 4 * parallaxAmount).toFixed(2) + 'px');
            card.style.setProperty('--window-shift-y', (ny * 3 * parallaxAmount).toFixed(2) + 'px');
        }

        function createTransitionLayer() {
            cacheGeometry();
            overlayStartRect = {
                left: windowRect.left,
                top: windowRect.top,
                width: windowRect.width,
                height: windowRect.height
            };
            overlayStartProgress = portalProgress;
            overlay = document.createElement('div');
            overlay.className = 'sq-portal-transition';
            overlay.style.left = overlayStartRect.left + 'px';
            overlay.style.top = overlayStartRect.top + 'px';
            overlay.style.width = overlayStartRect.width + 'px';
            overlay.style.height = overlayStartRect.height + 'px';
            overlay.style.borderRadius = '22px';
            PORTAL_FRAMES.slice(1).forEach(function (name, index) {
                var image = document.createElement('img');
                var config = transitionSceneConfig[index];
                image.src = PORTAL_PATH + name;
                image.alt = '';
                image.style.objectPosition = config.position;
                overlay.appendChild(image);
            });
            document.body.appendChild(overlay);
            overlayImages = Array.prototype.slice.call(overlay.querySelectorAll('img'));
            windowObject.style.opacity = '0';
            document.body.classList.add('portal-transitioning');
        }

        function commitPortal() {
            if (!assetsReady || state === 'committed' || state === 'transitioning') return;
            state = 'committed';
            targetPortalProgress = 1;
            commitTime = performance.now();
            createTransitionLayer();
            state = 'transitioning';
        }

        function renderTransition(progress) {
            var expansion;
            if (reduceMotion) expansion = 1;
            else expansion = easeOutCubic((progress - overlayStartProgress) / Math.max(0.01, 0.85 - overlayStartProgress));
            overlay.style.left = mix(overlayStartRect.left, 0, expansion) + 'px';
            overlay.style.top = mix(overlayStartRect.top, 0, expansion) + 'px';
            overlay.style.width = mix(overlayStartRect.width, window.innerWidth, expansion) + 'px';
            overlay.style.height = mix(overlayStartRect.height, window.innerHeight, expansion) + 'px';
            overlay.style.borderRadius = mix(22, 0, expansion) + 'px';

            var cameraPush = easeOutCubic((progress - overlayStartProgress) / Math.max(0.01, 0.96 - overlayStartProgress));
            var heroConfig = transitionSceneConfig[0];
            overlayImages[0].style.transform = 'translate3d(' + heroConfig.x + 'px,' + heroConfig.y + 'px,0) scale(' + mix(1.12, 1, cameraPush).toFixed(5) + ')';
            overlayImages[0].style.opacity = '1';
            overlayImages[0].style.clipPath = 'none';
            overlay.style.filter = 'none';

            var recede = reduceMotion ? 1 : smoothstep(overlayStartProgress, 0.85, progress);
            page.style.opacity = (1 - recede).toFixed(4);
            page.style.transform = 'scale(' + mix(1, 0.985, recede).toFixed(5) + ')';
        }

        function requestAutomaticJourney() {
            if (state === 'committed' || state === 'transitioning') return;
            autoRequested = true;
            if (reduceMotion) portalProgress = 0.55;
            targetPortalProgress = 0.68;
            state = 'tracking';
        }

        function onTap() {
            if (!coarsePointer) return;
            requestAutomaticJourney();
        }

        function onKeyDown(event) {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            requestAutomaticJourney();
        }

        function updateDebug() {
            if (!debug) return;
            var keyframe = portalProgress < 0.04 ? 'closed' : portalProgress < 0.62 ? 'hinge opening' : portalProgress < 0.90 ? 'camera push' : 'camera settle';
            debug.textContent = 'portal ' + portalProgress.toFixed(3) + '\ntarget ' + targetPortalProgress.toFixed(3) + '\ndistance ' + (isFinite(pointerDistance) ? pointerDistance.toFixed(1) : '—') + '\nvelocity ' + pointerSpeed.toFixed(1) + '\nkeyframe ' + keyframe + '\nstate ' + state;
        }

        function frame(now) {
            var deltaTime = clamp((now - lastFrameTime) / 1000, 1 / 120, 1 / 30);
            lastFrameTime = now;
            if (state !== 'committed' && state !== 'transitioning') updatePointerTarget();

            if (state === 'transitioning' && reduceMotion) {
                portalProgress = Math.min(1, overlayStartProgress + ((now - commitTime) / 430) * (1 - overlayStartProgress));
            } else {
                var committed = state === 'committed' || state === 'transitioning';
                var stiffness = committed ? 18 : 84;
                var damping = committed ? 8.7 : 18.2;
                var mass = 1;
                if (!committed && velocityImpulse > 0) {
                    springVelocity += velocityImpulse;
                    velocityImpulse = 0;
                }
                var acceleration = (stiffness * (targetPortalProgress - portalProgress) - damping * springVelocity) / mass;
                springVelocity += acceleration * deltaTime;
                portalProgress = clamp(portalProgress + springVelocity * deltaTime, 0, 1);
            }

            renderOpening(Math.min(portalProgress, 0.65));

            if ((autoRequested || targetPortalProgress >= 0.64) && portalProgress >= 0.62 && assetsReady && state !== 'transitioning') commitPortal();
            if (overlay) renderTransition(portalProgress);

            if (overlay && portalProgress >= 0.995 && !routed) {
                routed = true;
                state = 'arrived';
                overlayImages.forEach(function (image, index) { image.style.opacity = index === overlayImages.length - 1 ? '1' : '0'; });
                sessionStorage.setItem('windowPortalArrival', '1');
                window.location.assign('sidequest-window-to-somewhere.html');
                return;
            }

            updateDebug();
            requestAnimationFrame(frame);
        }

        cacheGeometry();
        document.addEventListener('pointermove', onPointerMove, { passive: true });
        document.documentElement.addEventListener('pointerleave', onPointerLeave, { passive: true });
        window.addEventListener('resize', cacheGeometry, { passive: true });
        window.addEventListener('scroll', cacheGeometry, { passive: true });
        card.addEventListener('click', onTap);
        card.addEventListener('keydown', onKeyDown);
        requestAnimationFrame(frame);
    }

    function initWindowPortalReturn() {
        var returnLinks = Array.prototype.slice.call(document.querySelectorAll('[data-portal-return]'));
        if (!returnLinks.length) return;

        var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var returning = false;
        var assetsPromise = preloadFrames();
        var frameConfig = [
            { fit: 'contain', position: '50% 50%', scale: 1 },
            { fit: 'cover', position: '50% 50%', scale: 1 }
        ];

        function targetRect() {
            var height = Math.min(window.innerHeight * 0.57, 560);
            var width = height * (1122 / 1402);
            if (width > window.innerWidth * 0.84) {
                width = window.innerWidth * 0.84;
                height = width * (1402 / 1122);
            }
            return {
                left: (window.innerWidth - width) / 2,
                top: (window.innerHeight - height) / 2,
                width: width,
                height: height
            };
        }

        function createReturnLayer() {
            var overlay = document.createElement('div');
            var stage = document.createElement('div');
            overlay.className = 'ws-portal-return';
            stage.className = 'ws-portal-return-stage';
            stage.style.left = '0px';
            stage.style.top = '0px';
            stage.style.width = window.innerWidth + 'px';
            stage.style.height = window.innerHeight + 'px';
            PORTAL_FRAMES.forEach(function (name, index) {
                var image = document.createElement('img');
                var config = frameConfig[index];
                image.src = PORTAL_PATH + name;
                image.alt = '';
                image.style.objectFit = config.fit;
                image.style.objectPosition = config.position;
                image.style.transform = 'scale(' + config.scale + ')';
                image.style.zIndex = index === 0 ? '4' : index === 1 ? '1' : '2';
                image.style.opacity = index === PORTAL_FRAMES.length - 1 ? '1' : '0';
                stage.appendChild(image);
            });
            var fixedFrame = document.createElement('div');
            fixedFrame.className = 'portal-window-fixed-frame';
            ['top', 'bottom', 'left', 'right'].forEach(function (side) {
                var frameStrip = document.createElement('img');
                frameStrip.className = 'portal-frame-strip portal-frame-' + side;
                frameStrip.src = PORTAL_PATH + PORTAL_FRAMES[0];
                frameStrip.alt = '';
                fixedFrame.appendChild(frameStrip);
            });
            stage.appendChild(fixedFrame);
            ['left', 'right'].forEach(function (side) {
                var door = document.createElement('div');
                var doorImage = document.createElement('img');
                door.className = 'portal-window-door portal-window-door-' + side;
                door.style.opacity = '0';
                doorImage.src = PORTAL_PATH + PORTAL_FRAMES[0];
                doorImage.alt = '';
                door.appendChild(doorImage);
                stage.appendChild(door);
            });
            overlay.appendChild(stage);
            document.body.appendChild(overlay);
            return {
                overlay: overlay,
                stage: stage,
                images: Array.prototype.slice.call(stage.querySelectorAll(':scope > img')),
                fixedFrame: fixedFrame,
                leftDoor: stage.querySelector('.portal-window-door-left'),
                rightDoor: stage.querySelector('.portal-window-door-right')
            };
        }

        function runReturn(destination) {
            var layer = createReturnLayer();
            var rect = targetRect();
            var start = performance.now();
            var lastFrame = start;
            var springPosition = 0;
            var springVelocity = 0;
            document.body.classList.add('portal-returning');
            returnLinks.forEach(function (link) { link.setAttribute('aria-busy', 'true'); });

            function frame(now) {
                var deltaTime = clamp((now - lastFrame) / 1000, 1 / 120, 1 / 30);
                var acceleration = (30 * (1 - springPosition) - 11 * springVelocity) / 1;
                lastFrame = now;
                springVelocity += acceleration * deltaTime;
                springPosition += springVelocity * deltaTime;
                var progress = clamp(springPosition, 0, 1);
                var collapse = easeOutCubic(smoothstep(0.02, 0.64, progress));
                var closeAmount = smoothstep(0.30, 0.95, progress);
                var doorAngle = easeOutCubic(1 - closeAmount) * 78;
                var showDoors = smoothstep(0.28, 0.42, progress);
                var finish = smoothstep(0.88, 0.99, progress);
                var frameReveal = smoothstep(0.18, 0.40, progress);

                layer.images[1].style.opacity = '1';
                layer.images[1].style.transform = 'scale(' + mix(1, 1.12, collapse).toFixed(5) + ')';
                layer.images[0].style.opacity = finish.toFixed(4);
                layer.fixedFrame.style.opacity = frameReveal.toFixed(4);
                layer.leftDoor.style.opacity = (showDoors * (1 - finish)).toFixed(4);
                layer.rightDoor.style.opacity = (showDoors * (1 - finish)).toFixed(4);
                layer.leftDoor.style.transform = 'rotateY(' + (-doorAngle).toFixed(3) + 'deg)';
                layer.rightDoor.style.transform = 'rotateY(' + doorAngle.toFixed(3) + 'deg)';
                layer.stage.style.filter = 'none';

                layer.stage.style.left = mix(0, rect.left, collapse) + 'px';
                layer.stage.style.top = mix(0, rect.top, collapse) + 'px';
                layer.stage.style.width = mix(window.innerWidth, rect.width, collapse) + 'px';
                layer.stage.style.height = mix(window.innerHeight, rect.height, collapse) + 'px';
                layer.stage.style.borderRadius = mix(0, 22, collapse) + 'px';

                if ((Math.abs(1 - springPosition) > 0.001 || Math.abs(springVelocity) > 0.01) && now - start < 2400) {
                    requestAnimationFrame(frame);
                    return;
                }
                sessionStorage.setItem('windowPortalReturn', '1');
                window.location.assign(destination);
            }

            requestAnimationFrame(frame);
        }

        returnLinks.forEach(function (link) {
            link.addEventListener('click', function (event) {
                if (returning) {
                    event.preventDefault();
                    return;
                }
                if (reduceMotion) return;
                event.preventDefault();
                returning = true;
                var destination = link.href;
                assetsPromise.then(function () { runReturn(destination); });
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initViewportVideos();
        initWorksiteNav();
        initWindowPortal();
        initWindowPortalReturn();
    });
})();
