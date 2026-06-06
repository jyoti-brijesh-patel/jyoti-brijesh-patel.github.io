document.addEventListener('DOMContentLoaded', () => {
    const defaults = {
        wifeName: 'My Love',
        birthdayDate: '',
        relationshipDate: '',
        musicPath: '',
        heartbeatPath: '',
        loadingQuote: '',
        heroSubtitle: '',
        loveLetter: '',
        birthdayWish: '',
        finalMessage: '',
        finaleSubtitle: '',
        photos: [],
        reasonsLoveYou: [],
        romanticQuotes: [],
        timelineEvents: []
    };

    const settings = {
        ...defaults,
        ...(typeof CONFIG === 'object' ? CONFIG : {})
    };
    settings.photos = Array.isArray(settings.photos) ? settings.photos.filter(Boolean) : [];
    settings.reasonsLoveYou = Array.isArray(settings.reasonsLoveYou) ? settings.reasonsLoveYou : [];
    settings.romanticQuotes = Array.isArray(settings.romanticQuotes) ? settings.romanticQuotes : [];
    settings.timelineEvents = Array.isArray(settings.timelineEvents) ? settings.timelineEvents : [];

    const els = {
        loadingScreen: document.getElementById('loading-screen'),
        loadingPercentage: document.querySelector('.loading-percentage'),
        loadingQuote: document.getElementById('loading-quote'),
        openingScene: document.getElementById('opening-scene'),
        nightSky: document.querySelector('.night-sky'),
        giftBox: document.getElementById('gift-box'),
        mainContent: document.getElementById('main-content'),
        backgroundMusic: document.getElementById('background-music'),
        birthdayLabel: document.getElementById('birthday-label'),
        heroTitle: document.querySelector('.hero-title'),
        heroSubtitle: document.querySelector('.hero-subtitle'),
        beginStoryBtn: document.getElementById('begin-story-btn'),
        timeline: document.querySelector('.timeline'),
        galleryGrid: document.querySelector('.gallery-grid'),
        lightbox: document.getElementById('lightbox'),
        lightboxImg: document.getElementById('lightbox-img'),
        closeLightboxBtn: document.querySelector('.close-btn'),
        envelope: document.querySelector('.envelope-container'),
        letterContent: document.querySelector('.letter-content'),
        flipCardGrid: document.querySelector('.flip-card-grid'),
        glowingHeart: document.getElementById('glowing-heart'),
        heartMessage: document.getElementById('heart-message'),
        blowCandlesBtn: document.getElementById('blow-candles-btn'),
        birthdayWish: document.getElementById('birthday-wish'),
        quote: document.querySelector('.current-quote'),
        finalMessage: document.querySelector('.final-message'),
        grandFinale: document.getElementById('grand-finale'),
        finaleTitle: document.querySelector('.finale-title'),
        finaleSubtitle: document.querySelector('.finale-subtitle'),
        floatingElements: document.getElementById('floating-elements-container')
    };

    let giftOpened = false;
    let mainInitialized = false;
    let musicStarted = false;
    let finalMessageStarted = false;
    let finaleTriggered = false;
    let currentQuoteIndex = 0;
    let lastSparkleAt = 0;
    let lastFocusedElement = null;

    function reduceMotion() {
        return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }

    function delay(ms) {
        return new Promise(resolve => window.setTimeout(resolve, ms));
    }

    function getRandom(min, max) {
        return Math.random() * (max - min) + min;
    }

    function createElement(tag, options = {}) {
        const element = document.createElement(tag);
        const { parent, classNames = [], text = '', attrs = {} } = options;

        if (classNames.length) {
            element.classList.add(...classNames);
        }

        if (text) {
            element.textContent = text;
        }

        Object.entries(attrs).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                element.setAttribute(key, value);
            }
        });

        if (parent) {
            parent.appendChild(element);
        }

        return element;
    }

    function setText(element, text) {
        if (element) {
            element.textContent = text || '';
        }
    }

    function parseLocalDate(value) {
        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
        if (!match) return null;

        const year = Number(match[1]);
        const month = Number(match[2]) - 1;
        const day = Number(match[3]);
        const date = new Date(year, month, day);

        if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
            return null;
        }

        return date;
    }

    function formatBirthdayLabel() {
        const birthday = parseLocalDate(settings.birthdayDate);
        if (!birthday) return 'A Birthday Surprise';

        return `For ${birthday.toLocaleDateString(undefined, {
            month: 'long',
            day: 'numeric'
        })}`;
    }

    function preloadImage(src) {
        return new Promise(resolve => {
            if (!src) {
                resolve();
                return;
            }

            const image = new Image();
            const finish = () => resolve();

            image.onload = finish;
            image.onerror = finish;
            image.src = src;

            if (image.complete) {
                finish();
            }
        });
    }

    function preloadAudio(src) {
        return new Promise(resolve => {
            if (!src) {
                resolve();
                return;
            }

            const audio = new Audio();
            let settled = false;
            const timeoutId = window.setTimeout(finish, 3500);

            function finish() {
                if (settled) return;
                settled = true;
                window.clearTimeout(timeoutId);
                audio.removeEventListener('canplaythrough', finish);
                audio.removeEventListener('loadeddata', finish);
                audio.removeEventListener('error', finish);
                resolve();
            }

            audio.preload = 'auto';
            audio.addEventListener('canplaythrough', finish);
            audio.addEventListener('loadeddata', finish);
            audio.addEventListener('error', finish);
            audio.src = src;
            audio.load();
        });
    }

    async function preloadAssets() {
        setText(els.loadingQuote, settings.loadingQuote);

        if (els.backgroundMusic && settings.musicPath) {
            els.backgroundMusic.src = settings.musicPath;
        }

        const imageAssets = ['images/hero-bg.jpg', ...settings.photos].filter(Boolean);
        const jobs = [
            ...imageAssets.map(src => () => preloadImage(src)),
            () => preloadAudio(settings.musicPath)
        ];

        if (!jobs.length) {
            setText(els.loadingPercentage, '100%');
            showOpeningScene();
            return;
        }

        let completed = 0;
        const updateProgress = () => {
            completed += 1;
            const percent = Math.min(100, Math.round((completed / jobs.length) * 100));
            setText(els.loadingPercentage, `${percent}%`);
        };

        await Promise.all(jobs.map(job => job().then(updateProgress, updateProgress)));
        setText(els.loadingPercentage, '100%');
        await delay(450);
        showOpeningScene();
    }

    function showOpeningScene() {
        if (!els.loadingScreen || !els.openingScene) return;

        els.loadingScreen.classList.add('is-hidden');

        window.setTimeout(() => {
            els.loadingScreen.classList.add('hidden');
            els.openingScene.classList.remove('hidden');
            window.requestAnimationFrame(() => {
                els.openingScene.classList.add('is-visible');
            });
        }, 650);
    }

    function generateStars() {
        if (!els.nightSky) return;

        els.nightSky.replaceChildren();
        const count = reduceMotion() ? 55 : 120;

        for (let index = 0; index < count; index += 1) {
            const star = createElement('span', {
                parent: els.nightSky,
                classNames: ['star']
            });
            const size = getRandom(1, 3);

            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.left = `${getRandom(0, 100)}%`;
            star.style.top = `${getRandom(0, 100)}%`;
            star.style.animationDelay = `${getRandom(0, 6)}s`;
            star.style.animationDuration = `${getRandom(4, 10)}s`;
        }
    }

    function generateNightParticles() {
        if (!els.nightSky || reduceMotion()) return;

        for (let index = 0; index < 28; index += 1) {
            const particle = createElement('span', {
                parent: els.nightSky,
                classNames: ['night-particle']
            });
            const size = getRandom(2, 5);

            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${getRandom(0, 100)}%`;
            particle.style.animationDelay = `${getRandom(0, 12)}s`;
            particle.style.animationDuration = `${getRandom(12, 22)}s`;
            particle.style.setProperty('--x-drift', `${getRandom(-70, 70)}px`);
        }
    }

    function openGift() {
        if (giftOpened || !els.giftBox || !els.openingScene || !els.mainContent) return;

        giftOpened = true;
        els.giftBox.disabled = true;
        els.giftBox.classList.add('opened');

        launchFireworks(12, els.openingScene);
        launchConfetti(70, els.openingScene);
        startMusic();

        window.setTimeout(() => {
            initializeMainExperience();
            els.openingScene.classList.add('fade-out');

            window.setTimeout(() => {
                els.openingScene.classList.add('hidden');
                els.mainContent.classList.remove('hidden');
                document.body.classList.add('story-open');

                window.requestAnimationFrame(() => {
                    els.mainContent.classList.add('visible');
                    setupSectionObserver();
                    updateLoveCounter();
                });
            }, 850);
        }, 1300);
    }

    function startMusic() {
        if (musicStarted || !els.backgroundMusic || !settings.musicPath) return;

        musicStarted = true;
        els.backgroundMusic.volume = 0;
        els.backgroundMusic.play()
            .then(() => fadeAudio(els.backgroundMusic, 0.46, 1800))
            .catch(() => {
                musicStarted = false;
            });
    }

    function fadeAudio(audio, targetVolume, duration) {
        if (!audio) return;

        if (reduceMotion()) {
            audio.volume = targetVolume;
            return;
        }

        const steps = 24;
        const increment = targetVolume / steps;
        let currentStep = 0;

        const id = window.setInterval(() => {
            currentStep += 1;
            audio.volume = Math.min(targetVolume, increment * currentStep);

            if (currentStep >= steps) {
                window.clearInterval(id);
            }
        }, duration / steps);
    }

    function launchFireworks(count, container) {
        if (!container) return;

        const safeCount = reduceMotion() ? Math.min(count, 4) : count;

        for (let index = 0; index < safeCount; index += 1) {
            const firework = createElement('span', {
                parent: container,
                classNames: ['firework']
            });

            firework.style.left = `${getRandom(8, 92)}%`;
            firework.style.top = `${getRandom(12, 78)}%`;
            const fireworkColor = `hsl(${getRandom(0, 360)}, 95%, 72%)`;
            firework.style.color = fireworkColor;
            firework.style.backgroundColor = fireworkColor;
            firework.style.animationDelay = `${getRandom(0, 0.6)}s`;
            firework.addEventListener('animationend', () => firework.remove(), { once: true });
        }
    }

    function launchConfetti(count, container) {
        if (!container) return;

        const safeCount = reduceMotion() ? Math.min(count, 12) : count;

        for (let index = 0; index < safeCount; index += 1) {
            const confetti = createElement('span', {
                parent: container,
                classNames: ['confetti']
            });

            confetti.style.left = `${getRandom(0, 100)}%`;
            confetti.style.backgroundColor = `hsl(${getRandom(0, 360)}, 90%, 68%)`;
            confetti.style.animationDelay = `${getRandom(0, 1.5)}s`;
            confetti.style.animationDuration = `${getRandom(2, 4.8)}s`;
            confetti.addEventListener('animationend', () => confetti.remove(), { once: true });
        }
    }

    function initializeMainExperience() {
        if (mainInitialized) return;
        mainInitialized = true;

        initializeHero();
        populateTimeline();
        populateGallery();
        initializeLoveLetter();
        populateReasons();
        initializeHeart();
        initializeCake();
        initializeQuotes();
        initializeNavigation();
        startFloatingElements();

        window.setInterval(updateLoveCounter, 1000);
        window.addEventListener('scroll', handleFinaleScroll, { passive: true });
    }

    function initializeHero() {
        setText(els.birthdayLabel, formatBirthdayLabel());
        setText(els.heroTitle, `Happy Birthday ${settings.wifeName} ❤️`);
        setText(els.heroSubtitle, settings.heroSubtitle);
    }

    function initializeNavigation() {
        if (!els.beginStoryBtn) return;

        els.beginStoryBtn.addEventListener('click', () => {
            document.getElementById('love-counter-section')?.scrollIntoView({ behavior: 'smooth' });
        });
    }

    function calculateDateParts(startDate, endDate) {
        if (!startDate || endDate < startDate) {
            return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        const cursor = new Date(startDate.getTime());
        let years = 0;
        let months = 0;

        while (true) {
            const next = new Date(cursor.getTime());
            next.setFullYear(next.getFullYear() + 1);
            if (next > endDate) break;
            years += 1;
            cursor.setTime(next.getTime());
        }

        while (true) {
            const next = new Date(cursor.getTime());
            next.setMonth(next.getMonth() + 1);
            if (next > endDate) break;
            months += 1;
            cursor.setTime(next.getTime());
        }

        const remainingMs = endDate.getTime() - cursor.getTime();
        const secondsTotal = Math.floor(remainingMs / 1000);
        const days = Math.floor(secondsTotal / 86400);
        const hours = Math.floor((secondsTotal % 86400) / 3600);
        const minutes = Math.floor((secondsTotal % 3600) / 60);
        const seconds = secondsTotal % 60;

        return { years, months, days, hours, minutes, seconds };
    }

    function updateLoveCounter() {
        const startDate = parseLocalDate(settings.relationshipDate);
        const parts = calculateDateParts(startDate, new Date());

        setText(document.getElementById('years-together'), String(parts.years));
        setText(document.getElementById('months-together'), String(parts.months));
        setText(document.getElementById('days-together'), String(parts.days));
        setText(document.getElementById('hours-together'), String(parts.hours));
        setText(document.getElementById('minutes-together'), String(parts.minutes));
        setText(document.getElementById('seconds-together'), String(parts.seconds));
    }

    function populateTimeline() {
        if (!els.timeline) return;

        els.timeline.replaceChildren();
        createElement('span', {
            parent: els.timeline,
            classNames: ['timeline-line']
        });

        settings.timelineEvents.forEach((event, index) => {
            const item = createElement('article', {
                parent: els.timeline,
                classNames: ['timeline-event'],
                attrs: { style: `--event-index: ${index}` }
            });
            createElement('span', {
                parent: item,
                classNames: ['event-icon'],
                text: event.icon || '❤️',
                attrs: { 'aria-hidden': 'true' }
            });

            const card = createElement('div', {
                parent: item,
                classNames: ['event-card', 'glass-panel']
            });
            createElement('h3', { parent: card, text: event.title || '' });
            createElement('p', { parent: card, text: event.description || '' });
        });
    }

    function populateGallery() {
        if (!els.galleryGrid) return;

        els.galleryGrid.replaceChildren();

        settings.photos.forEach((src, index) => {
            const item = createElement('button', {
                parent: els.galleryGrid,
                classNames: ['gallery-item', 'glass-panel'],
                attrs: {
                    type: 'button',
                    'aria-label': `Open memory photo ${index + 1}`
                }
            });
            const image = createElement('img', {
                parent: item,
                attrs: {
                    src,
                    alt: `Memory photo ${index + 1}`,
                    loading: 'lazy'
                }
            });

            image.addEventListener('error', () => item.classList.add('image-missing'), { once: true });
            item.addEventListener('click', () => openLightbox(src, image.alt));
        });
    }

    function openLightbox(src, altText) {
        if (!els.lightbox || !els.lightboxImg) return;

        lastFocusedElement = document.activeElement;
        els.lightboxImg.src = src;
        els.lightboxImg.alt = altText || 'Selected memory photo';
        els.lightbox.classList.add('active');
        els.lightbox.setAttribute('aria-hidden', 'false');
        els.closeLightboxBtn?.focus();
    }

    function closeLightbox() {
        if (!els.lightbox || !els.lightboxImg) return;

        els.lightbox.classList.remove('active');
        els.lightbox.setAttribute('aria-hidden', 'true');
        els.lightboxImg.src = '';

        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
            lastFocusedElement.focus();
        }
    }

    function initializeLoveLetter() {
        setText(els.letterContent, settings.loveLetter);

        if (!els.envelope) return;

        els.envelope.addEventListener('click', event => {
            if (els.envelope.classList.contains('open') && event.target.closest('.letter')) {
                return;
            }

            const isOpen = els.envelope.classList.toggle('open');
            els.envelope.setAttribute('aria-expanded', String(isOpen));
        });
    }

    function populateReasons() {
        if (!els.flipCardGrid) return;

        els.flipCardGrid.replaceChildren();

        settings.reasonsLoveYou.forEach(reason => {
            const card = createElement('button', {
                parent: els.flipCardGrid,
                classNames: ['flip-card'],
                attrs: { type: 'button' }
            });
            const inner = createElement('span', {
                parent: card,
                classNames: ['flip-card-inner', 'glass-panel']
            });
            const front = createElement('span', {
                parent: inner,
                classNames: ['flip-card-front']
            });
            createElement('span', {
                parent: front,
                classNames: ['flip-card-title'],
                text: reason.title || ''
            });

            const back = createElement('span', {
                parent: inner,
                classNames: ['flip-card-back'],
                text: reason.description || ''
            });

            card.setAttribute('aria-label', `${reason.title || 'Reason'}: ${reason.description || ''}`);
            card.addEventListener('click', () => {
                card.classList.toggle('is-flipped');
            });
        });
    }

    function initializeHeart() {
        if (!els.glowingHeart) return;

        let clickCount = 0;

        els.glowingHeart.addEventListener('click', () => {
            clickCount += 1;
            els.glowingHeart.classList.add('heart-pop');
            window.setTimeout(() => els.glowingHeart.classList.remove('heart-pop'), 220);

            createHeartBurst(els.glowingHeart.parentElement);
            setText(els.heartMessage, `I love you more every day ❤️ x${clickCount}`);
            els.heartMessage?.classList.add('visible');
            window.setTimeout(() => els.heartMessage?.classList.remove('visible'), 2200);
            playSound(settings.heartbeatPath, 0.6);
        });
    }

    function createHeartBurst(container) {
        if (!container) return;

        const count = reduceMotion() ? 4 : 12;

        for (let index = 0; index < count; index += 1) {
            const particle = createElement('span', {
                parent: container,
                classNames: ['heart-particle']
            });

            particle.style.setProperty('--x-offset', `${getRandom(-120, 120)}px`);
            particle.style.setProperty('--y-offset', `${getRandom(-120, 120)}px`);
            particle.style.backgroundColor = `hsl(${getRandom(330, 360)}, 90%, 70%)`;
            particle.addEventListener('animationend', () => particle.remove(), { once: true });
        }
    }

    function playSound(src, volume) {
        if (!src) return;

        const sound = new Audio(src);
        sound.volume = volume;
        sound.play().catch(() => {});
    }

    function initializeCake() {
        if (!els.blowCandlesBtn) return;

        els.blowCandlesBtn.addEventListener('click', () => {
            document.querySelectorAll('.flame').forEach(flame => {
                if (flame.classList.contains('extinguished')) return;

                flame.classList.add('extinguished');
                const smoke = createElement('span', {
                    parent: flame.parentElement,
                    classNames: ['smoke']
                });
                smoke.addEventListener('animationend', () => smoke.remove(), { once: true });
            });

            els.blowCandlesBtn.disabled = true;
            setText(els.birthdayWish, settings.birthdayWish);
            els.birthdayWish?.classList.add('visible');
            launchConfetti(36, document.querySelector('.cake-container'));
        });
    }

    function initializeQuotes() {
        if (!els.quote || !settings.romanticQuotes.length) return;

        setText(els.quote, settings.romanticQuotes[currentQuoteIndex]);
        els.quote.classList.add('active');

        window.setInterval(() => {
            els.quote.classList.remove('active');

            window.setTimeout(() => {
                currentQuoteIndex = (currentQuoteIndex + 1) % settings.romanticQuotes.length;
                setText(els.quote, settings.romanticQuotes[currentQuoteIndex]);
                els.quote.classList.add('active');
            }, reduceMotion() ? 0 : 450);
        }, 7000);
    }

    function startFloatingElements() {
        if (!els.floatingElements || reduceMotion()) return;

        window.setInterval(() => createFloatingElement('heart'), 1200);
        window.setInterval(() => createFloatingElement('petal'), 1700);
        window.setInterval(() => createFloatingElement('sparkle'), 900);

        for (let index = 0; index < 22; index += 1) {
            createFloatingElement(index % 3 === 0 ? 'heart' : index % 3 === 1 ? 'petal' : 'sparkle');
        }
    }

    function createFloatingElement(type) {
        if (!els.floatingElements) return;

        const map = {
            heart: { text: '❤️', className: 'floating-heart', min: 1, max: 2.4 },
            petal: { text: '🌹', className: 'floating-petal', min: 1.1, max: 2.7 },
            sparkle: { text: '✨', className: 'floating-sparkle', min: 0.9, max: 2 }
        };
        const config = map[type] || map.heart;
        const element = createElement('span', {
            parent: els.floatingElements,
            classNames: ['floating-element', config.className],
            text: config.text
        });

        element.style.left = `${getRandom(0, 100)}vw`;
        element.style.fontSize = `${getRandom(config.min, config.max)}rem`;
        element.style.animationDuration = `${getRandom(9, 16)}s`;
        element.style.animationDelay = `${getRandom(0, 3)}s`;
        element.style.setProperty('--x-drift', `${getRandom(-30, 30)}px`);
        element.addEventListener('animationend', () => element.remove(), { once: true });
    }

    function setupSectionObserver() {
        const sections = [...document.querySelectorAll('.section')];
        sections.forEach(section => section.classList.add('fade-in-section'));

        if (!('IntersectionObserver' in window)) {
            sections.forEach(section => section.classList.add('visible'));
            revealFinalMessage();
            return;
        }

        const observer = new IntersectionObserver((entries, instance) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                entry.target.classList.add('visible');

                if (entry.target.id === 'memory-timeline-section') {
                    entry.target.querySelectorAll('.timeline-event').forEach(event => {
                        event.classList.add('visible');
                    });
                }

                if (entry.target.id === 'final-surprise-section') {
                    revealFinalMessage();
                }

                instance.unobserve(entry.target);
            });
        }, {
            root: null,
            rootMargin: '0px 0px -8% 0px',
            threshold: 0.16
        });

        sections.forEach(section => observer.observe(section));
    }

    async function revealFinalMessage() {
        if (finalMessageStarted || !els.finalMessage) return;

        finalMessageStarted = true;
        els.finalMessage.classList.add('visible');
        await typeWriter(els.finalMessage, settings.finalMessage, 36);
    }

    async function typeWriter(element, text, speed) {
        if (!element) return;

        if (reduceMotion()) {
            setText(element, text);
            return;
        }

        element.textContent = '';
        element.classList.add('typing-animation');

        for (let index = 0; index < text.length; index += 1) {
            element.textContent += text.charAt(index);
            await delay(speed);
        }

        element.classList.remove('typing-animation');
    }

    function handleFinaleScroll() {
        if (finaleTriggered) return;

        const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80;
        if (nearBottom) {
            triggerGrandFinale();
        }
    }

    function triggerGrandFinale() {
        if (finaleTriggered || !els.grandFinale) return;

        finaleTriggered = true;
        setText(els.finaleTitle, `Happy Birthday ${settings.wifeName} ❤️`);
        setText(els.finaleSubtitle, settings.finaleSubtitle);
        els.grandFinale.classList.remove('hidden');
        els.grandFinale.setAttribute('aria-hidden', 'false');
        document.body.classList.add('finale-open');

        const burstCount = reduceMotion() ? 10 : 44;
        for (let index = 0; index < burstCount; index += 1) {
            launchFireworks(1, els.grandFinale);
            launchConfetti(1, els.grandFinale);
        }

        if (!reduceMotion()) {
            window.setInterval(() => launchFireworks(1, els.grandFinale), 650);
            window.setInterval(() => launchConfetti(1, els.grandFinale), 360);
        }
    }

    function createCursorSparkle(event) {
        if (reduceMotion()) return;

        const now = performance.now();
        if (now - lastSparkleAt < 55) return;
        lastSparkleAt = now;

        const sparkle = createElement('span', {
            parent: document.body,
            classNames: ['cursor-sparkle']
        });
        const size = getRandom(5, 12);

        sparkle.style.width = `${size}px`;
        sparkle.style.height = `${size}px`;
        sparkle.style.left = `${event.clientX}px`;
        sparkle.style.top = `${event.clientY}px`;
        sparkle.addEventListener('animationend', () => sparkle.remove(), { once: true });
    }

    els.closeLightboxBtn?.addEventListener('click', closeLightbox);
    els.lightbox?.addEventListener('click', event => {
        if (event.target === els.lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && els.lightbox?.classList.contains('active')) {
            closeLightbox();
        }
    });

    document.addEventListener('mousemove', createCursorSparkle);
    els.giftBox?.addEventListener('click', openGift);

    generateStars();
    generateNightParticles();
    preloadAssets();
});
