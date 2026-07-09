/**
 * CMS content renderer — loads case study content from JSON files
 * so text and images can be updated without editing HTML.
 */
(function () {
    const SNAPSHOT_ICONS = {
        info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>',
        user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
        music: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
        activity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>'
    };

    function imageSrc(image) {
        if (!image || !image.src) return '';
        const bust = image.cacheBust ? `?v=${image.cacheBust}` : '';
        return `${image.src}${bust}`;
    }

    function renderImageFigure(image) {
        const src = imageSrc(image);
        const scrollClass = image.scroll ? ' cs-pego-embed-scroll' : '';
        const zoomClass = image.zoom ? ' cs-pego-zoom-img' : '';
        const wideClass = image.wide ? ' cs-pego-wide-img' : '';
        return `
            <figure class="cs-pego-embed-container${scrollClass}${zoomClass}${wideClass}">
                <img src="${src}" alt="${image.alt || ''}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="cs-pego-embed-fallback">IMG SRC: <code>${image.src}</code></div>
            </figure>`;
    }

    function renderVisualRows(rows) {
        return rows.map(row => {
            const figures = row.images.map(img => renderImageFigure(img)).join('');
            return `<div class="cs-pego-row cs-pego-row-${row.layout === 'row-two' ? 'two' : 'single'}">${figures}</div>`;
        }).join('');
    }

    function renderVisualsBlock(block) {
        const rowsHtml = renderVisualRows(block.rows || []);
        const trackClass = block.scrollTrack ? ' cs-pego-scroll-track' : '';
        const leadClass = block.wrapperClass === 'cs-pego-problem-visuals' ? ' cs-pego-scroll-track-lead' : '';
        const inner = block.scrollTrack || block.wrapperClass === 'cs-pego-problem-visuals'
            ? `<div class="cs-pego-scroll-track${leadClass}">${rowsHtml}</div>`
            : rowsHtml;

        if (block.sectionId || block.sectionClass) {
            return `
                <section id="${block.sectionId || ''}" class="cs-pego-section${block.sectionClass ? ` ${block.sectionClass}` : ''}">
                    <div class="cs-pego-scroll-track">${rowsHtml}</div>
                </section>`;
        }

        if (block.wrapperClass) {
            const className = block.wrapperClass === 'cs-pego-problem-visuals'
                ? block.wrapperClass
                : `cs-pego-visuals ${block.wrapperClass}`;
            return `<div class="${className}">${inner}</div>`;
        }

        return `<div class="cs-pego-visuals${block.wrapperClass ? ` ${block.wrapperClass}` : ''}">${inner}</div>`;
    }

    function renderPegoSection(block) {
        let html = `
            <section id="${block.id || ''}" class="cs-pego-section${block.id === 'problem' ? ' cs-pego-problem-section' : ''}">
                <h2 class="cs-pego-section-title">${block.title}</h2>
                <div class="cs-pego-prose cs-content-full">${block.body || ''}</div>`;

        if (block.children) {
            html += block.children.map(child => renderBlock(child)).join('');
        }

        if (block.visuals) {
            html += renderVisualsBlock(block.visuals);
        }

        if (block.bodyAfter) {
            html += `<div class="cs-pego-prose cs-content-full">${block.bodyAfter}</div>`;
        }

        html += '</section>';
        return html;
    }

    function renderBlock(block) {
        switch (block.type) {
            case 'section':
                return renderPegoSection(block);
            case 'visuals':
                return renderVisualsBlock(block);
            case 'pullquote':
                return `<blockquote class="cs-pego-pullquote"><p>${block.text}</p></blockquote>`;
            case 'closing':
                return `
                    <section class="cs-pego-section cs-pego-closing">
                        <div class="cs-pego-prose cs-content-full">
                            ${block.body || ''}
                            ${block.signoff ? `<p class="cs-pego-signoff">${block.signoff}</p>` : ''}
                        </div>
                    </section>`;
            default:
                return '';
        }
    }

    function renderSnapshot(snapshot) {
        const cards = snapshot.cards.map(card => `
            <div class="cs-snapshot-card${card.outcome ? ' is-outcome' : ''}">
                <p class="cs-snapshot-card-label">
                    ${SNAPSHOT_ICONS[card.icon] || ''}
                    ${card.label}
                </p>
                <p class="cs-snapshot-card-title">${card.title}</p>
                <p class="cs-snapshot-card-body">${card.body}</p>
                ${card.pills ? `<div class="cs-snapshot-skills">${card.pills.map(p => `<span class="cs-snapshot-pill">${p}</span>`).join('')}</div>` : ''}
            </div>`).join('');

        return `
            <section class="cs-snapshot" aria-label="At a glance">
                <div class="cs-snapshot-inner">
                    <p class="cs-snapshot-label">${snapshot.label}</p>
                    <div class="cs-snapshot-grid">${cards}</div>
                </div>
            </section>`;
    }

    function renderMetrics(metrics, extraClass) {
        const items = metrics.map(m => `
            <div class="cs-metric">
                <span class="cs-metric-value">${m.value}</span>
                <span class="cs-metric-label">${m.label}</span>
            </div>`).join('');

        return `
            <section class="cs-metrics${extraClass ? ` ${extraClass}` : ''}" aria-label="Outcomes at a glance">
                <div class="cs-container">
                    <div class="cs-metrics-grid">${items}</div>
                </div>
            </section>`;
    }

    function renderPegoCaseStudy(data) {
        const leadParagraphs = data.lead.map(p => `<p>${p}</p>`).join('');
        const tagSource = data.tags || (data.eyebrow ? data.eyebrow.split(' · ') : []);
        const tagPills = tagSource.map(t => `<span class="cs-pego-hero-tag">${t.trim()}</span>`).join('');
        const metaGridHtml = (data.meta || []).map(item => `
                            <div class="cs-pego-meta-item">
                                <dt>${item.label}</dt>
                                <dd>${item.value}</dd>
                            </div>`).join('');

        let bodyHtml = '';
        let inFirstBody = true;
        const blocks = data.blocks || [];

        blocks.forEach((block, index) => {
            if (inFirstBody && block.id === 'solution') {
                bodyHtml += '</div><div class="cs-pego-body">';
                inFirstBody = false;
            }
            if (index === 0) {
                bodyHtml += '<div class="cs-pego-body">';
            }
            bodyHtml += renderBlock(block);
        });
        bodyHtml += '</div>';

        return `
            <article class="cs-pego-article">
                <header class="cs-pego-hero cs-hero">
                    <div class="cs-pego-hero-inner">
                        <a href="index.html#case-studies" class="cs-back-link cs-pego-back">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M19 12H5M12 19l-7-7 7-7"/>
                            </svg>
                            Back to Work
                        </a>
                        <div class="cs-pego-hero-tags">${tagPills}</div>
                        <h1 class="cs-pego-title">${data.title}</h1>
                        <div class="cs-pego-lead">${leadParagraphs}</div>
                        <dl class="cs-pego-hero-meta-grid">${metaGridHtml}</dl>
                        ${data.heroCta ? `<a class="cs-pego-hero-cta" href="${data.heroCta.href}" target="_blank" rel="noopener noreferrer">${data.heroCta.label}<svg class="cs-pego-cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>` : ''}
                    </div>
                </header>
                ${data.heroImage ? `<div class="cs-pego-hero-visual"><img src="${imageSrc(data.heroImage)}" alt="${data.heroImage.alt || ''}"></div>` : ''}
                ${data.snapshot ? renderSnapshot(data.snapshot) : ''}
                ${renderMetrics(data.metrics, 'cs-pego-metrics')}
                ${bodyHtml}
            </article>
            ${renderNextProject(data.nextProject, true)}`;
    }

    function renderClassicVisuals(images) {
        const slides = images.map(img => `
            <div class="cs-visual">
                <img src="${img.src}" alt="${img.alt || ''}">
            </div>`).join('');
        return `<div class="cs-visuals">${slides}</div>`;
    }

    function renderClassicBlock(block) {
        const altClass = block.alt ? ' cs-section-alt' : '';

        if (block.type === 'cta') {
            return `
                <section class="cs-section">
                    <div class="cs-container" style="text-align: center;">
                        <h2 style="margin-bottom: var(--space-lg);">${block.title}</h2>
                        <p style="max-width: 600px; margin: 0 auto var(--space-xl); color: var(--color-gray-700);">${block.body}</p>
                        <a href="${block.button.href}" target="_blank" rel="noopener" class="btn btn-primary btn-large">
                            ${block.button.label}
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px;">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                            </svg>
                        </a>
                    </div>
                </section>`;
        }

        if (block.variant === 'content-grid') {
            const main = block.main;
            const paragraphs = main.paragraphs.map(p => `<p>${p}</p>`).join('');
            const subparagraphs = (main.subparagraphs || []).map(p => `<p>${p}</p>`).join('');
            const sidebarItems = block.sidebar.items.map(i => `<li>${i}</li>`).join('');
            return `
                <section class="cs-section${altClass}">
                    <div class="cs-container">
                        <div class="cs-section-header">
                            <span class="cs-section-number">${block.number}</span>
                            <h2>${block.title}</h2>
                        </div>
                        <div class="cs-content-grid">
                            <div class="cs-content-main">
                                <h3>${main.heading}</h3>
                                ${paragraphs}
                                ${main.subheading ? `<h3>${main.subheading}</h3>` : ''}
                                ${subparagraphs}
                            </div>
                            <div class="cs-content-sidebar">
                                <div class="cs-sidebar-card">
                                    <h4>${block.sidebar.title}</h4>
                                    <ul>${sidebarItems}</ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>`;
        }

        if (block.variant === 'insights') {
            const cards = block.insights.map(i => `
                <div class="cs-insight-card">
                    <div class="cs-insight-icon">${i.icon}</div>
                    <h4>${i.title}</h4>
                    <p>${i.body}</p>
                </div>`).join('');
            return `
                <section class="cs-section${altClass}">
                    <div class="cs-container">
                        <div class="cs-section-header">
                            <span class="cs-section-number">${block.number}</span>
                            <h2>${block.title}</h2>
                        </div>
                        <div class="cs-insights-grid">${cards}</div>
                    </div>
                </section>`;
        }

        if (block.variant === 'process') {
            const features = block.features.map(f => `
                <div class="cs-feature${f.reverse ? ' cs-feature-reverse' : ''}">
                    <div class="cs-feature-content">
                        <h3>${f.title}</h3>
                        <p>${f.body}</p>
                        <ul class="cs-feature-list">${f.list.map(li => `<li>${li}</li>`).join('')}</ul>
                    </div>
                </div>`).join('');
            return `
                <section class="cs-section${altClass}">
                    <div class="cs-container">
                        <div class="cs-section-header">
                            <span class="cs-section-number">${block.number}</span>
                            <h2>${block.title}</h2>
                        </div>
                        <div class="cs-content-full">
                            <h3>${block.intro.heading}</h3>
                            <p>${block.intro.body}</p>
                        </div>
                        ${features}
                    </div>
                    <div class="cs-container" style="padding-top: var(--space-xl);">
                        ${renderClassicVisuals(block.visuals)}
                    </div>
                </section>`;
        }

        if (block.variant === 'solution') {
            const cards = block.cards.map(c => `
                <div class="cs-learning-card">
                    <h4>${c.title}</h4>
                    <p>${c.body}</p>
                </div>`).join('');
            return `
                <section class="cs-section${altClass}">
                    <div class="cs-container">
                        <div class="cs-section-header">
                            <span class="cs-section-number">${block.number}</span>
                            <h2>${block.title}</h2>
                        </div>
                        <div class="cs-content-full">
                            <h3>${block.intro.heading}</h3>
                            <p>${block.intro.body}</p>
                        </div>
                        <div class="cs-visuals" style="margin-top: var(--space-xl);">
                            ${block.visuals.map(img => `
                                <div class="cs-visual">
                                    <img src="${img.src}" alt="${img.alt || ''}">
                                </div>`).join('')}
                        </div>
                        <div class="cs-learnings-grid" style="margin-top: var(--space-xl);">${cards}</div>
                        <div class="cs-image-block">
                            <img src="${block.imageBlock.src}" alt="${block.imageBlock.alt || ''}" style="width:100%; display:block; border-radius: var(--radius-lg);">
                        </div>
                    </div>
                </section>`;
        }

        if (block.variant === 'impact') {
            const results = block.results.map(r => `
                <div class="cs-result-card">
                    <span class="cs-result-value">${r.value}</span>
                    <span class="cs-result-label">${r.label}</span>
                    <p>${r.body}</p>
                </div>`).join('');
            return `
                <section class="cs-section${altClass}">
                    <div class="cs-container">
                        <div class="cs-section-header">
                            <span class="cs-section-number">${block.number}</span>
                            <h2>${block.title}</h2>
                        </div>
                        <div class="cs-results-grid">${results}</div>
                        <div class="cs-testimonial">
                            <blockquote>${block.testimonial.quote}</blockquote>
                            <cite>
                                <strong>${block.testimonial.cite}</strong>
                                <span>${block.testimonial.subcite}</span>
                            </cite>
                        </div>
                    </div>
                </section>`;
        }

        if (block.variant === 'learnings') {
            const cards = block.cards.map(c => `
                <div class="cs-learning-card">
                    <h4>${c.title}</h4>
                    <p>${c.body}</p>
                </div>`).join('');
            return `
                <section class="cs-section${altClass}">
                    <div class="cs-container">
                        <div class="cs-section-header">
                            <span class="cs-section-number">${block.number}</span>
                            <h2>${block.title}</h2>
                        </div>
                        <div class="cs-learnings-grid">${cards}</div>
                    </div>
                </section>`;
        }

        return '';
    }

    function renderClassicCaseStudy(data) {
        const hero = data.hero;
        const metaItems = hero.meta.map(item => `
            <div class="cs-meta-item">
                <span class="cs-meta-label">${item.label}</span>
                <span class="cs-meta-value">${item.value}</span>
            </div>`).join('');
        const tags = hero.tags.map(t => `<span class="tag">${t}</span>`).join('');

        return `
            <section class="cs-hero">
                <div class="cs-hero-container">
                    <a href="index.html#case-studies" class="cs-back-link">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                        Back to Work
                    </a>
                    <div class="cs-hero-content">
                        <div class="cs-tags">${tags}</div>
                        <h1>${hero.title}</h1>
                        <p class="cs-hero-description">${hero.description}</p>
                        <div class="cs-meta">${metaItems}</div>
                        <div style="margin-top: var(--space-xl);">
                            <a href="${hero.cta.href}" target="_blank" rel="noopener" class="btn btn-primary">
                                ${hero.cta.label}
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </section>
            <section class="cs-hero-image">
                <div class="cs-image-container">
                    <img src="${data.heroImage.src}" alt="${data.heroImage.alt || ''}" style="width:100%; display:block; border-radius: var(--radius-lg);">
                </div>
            </section>
            ${renderMetrics(data.metrics)}
            <div class="cs-container" style="padding-top: var(--space-2xl); padding-bottom: 0;">
                <div class="cs-visual" style="border-radius: var(--radius-xl); overflow: hidden; box-shadow: var(--shadow-visual);">
                    <img src="${data.heroVisual.src}" alt="${data.heroVisual.alt || ''}" style="width:100%; display:block;">
                </div>
            </div>
            ${(data.blocks || []).map(renderClassicBlock).join('')}
            ${renderNextProject(data.nextProject, false)}`;
    }

    function renderNextProject(next, pegoStyle) {
        if (!next) return '';
        const sectionClass = pegoStyle ? 'cs-next-project cs-pego-next' : 'cs-next-project';
        return `
            <section class="${sectionClass}">
                <div class="cs-container">
                    <span class="cs-next-label">Next project</span>
                    <a href="${next.href}" class="cs-next-link">
                        <h2>${next.title}</h2>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </a>
                </div>
            </section>`;
    }

    function renderProjectCard(project) {
        const featured = project.featured ? ' featured' : '';
        const metricsHtml = project.metrics ? `
            <div class="project-metrics">
                ${project.metrics.map(m => `
                    <div class="metric">
                        <span class="metric-value">${m.value}</span>
                        <span class="metric-label">${m.label}</span>
                    </div>`).join('')}
            </div>` : '';
        const tags = project.tags.map(t => `<span class="tag">${t}</span>`).join('');
        const thumbClass = project.featured ? ' class="project-thumb"' : '';
        const thumbStyle = project.featured ? '' : ' style="width:100%; height:100%; object-fit:contain; background:#fff; display:block;"';

        return `
            <a href="${project.href}" class="project-card${featured}">
                <div class="project-image">
                    <img${thumbClass} src="${project.thumbnail.src}" alt="${project.thumbnail.alt}"${thumbStyle}>
                    ${project.featured ? '<div class="project-overlay"></div>' : ''}
                </div>
                <div class="project-content">
                    <div class="project-tags">${tags}</div>
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-description">${project.description}</p>
                    ${metricsHtml}
                    <span class="project-link"${project.protected ? ` data-protected="true" data-target="${project.href}"` : ''}>
                        Read Case Study
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </span>
                </div>
            </a>`;
    }

    async function fetchJson(path) {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Failed to load ${path}`);
        return response.json();
    }

    async function renderCaseStudyPage(slug) {
        const root = document.getElementById('cms-case-study');
        if (!root) return;

        try {
            const data = await fetchJson(`content/case-studies/${slug}.json`);
            document.title = data.pageTitle;

            if (data.bodyClass) {
                document.body.classList.add(data.bodyClass);
            }

            root.innerHTML = data.layout === 'classic'
                ? renderClassicCaseStudy(data)
                : renderPegoCaseStudy(data);

            document.dispatchEvent(new CustomEvent('cms:content-loaded'));
        } catch (err) {
            console.error('CMS render error:', err);
            root.innerHTML = '<p class="cms-error">Unable to load case study content. Please refresh the page.</p>';
        }
    }

    async function renderCaseStudyIndex() {
        const grid = document.getElementById('cms-projects-grid');
        if (!grid) return;

        try {
            const index = await fetchJson('content/case-studies/index.json');
            grid.innerHTML = index.caseStudies.map(renderProjectCard).join('');
            window.__cmsCaseStudies = index.caseStudies;
            document.dispatchEvent(new CustomEvent('cms:index-loaded'));
        } catch (err) {
            console.error('CMS index error:', err);
        }
    }

    async function loadChatbotKnowledge() {
        try {
            const [base, index] = await Promise.all([
                fetchJson('content/chatbot/knowledge-base.json'),
                fetchJson('content/case-studies/index.json')
            ]);

            const caseStudyEntries = index.caseStudies
                .filter(cs => cs.chatbot)
                .map(cs => ({
                    id: cs.id,
                    title: cs.chatbot.title,
                    keywords: cs.chatbot.keywords,
                    answer: cs.chatbot.answer,
                    href: cs.href
                }));

            window.__cmsKnowledge = [...base, ...caseStudyEntries];
            document.dispatchEvent(new CustomEvent('cms:knowledge-loaded'));
        } catch (err) {
            console.error('CMS knowledge error:', err);
            window.__cmsKnowledge = null;
        }
    }

    function init() {
        const slug = document.body.dataset.cmsCaseStudy;
        if (slug) {
            renderCaseStudyPage(slug);
        }
        renderCaseStudyIndex();
        loadChatbotKnowledge();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
