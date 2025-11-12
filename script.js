/* Sri Krishna Temple - Interactivity and enhancements */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Edit only this config to update map location and "NEW" badge window.
  const templeConfig = {
    // Example: 'Sri Krishna Temple, Malleswaram, Bengaluru'
    mapsQuery: 'Shree Santana Gopala Krishna Swamy Temple, Kalmane, Sagara, Shivamogga, Karnataka 577401',
    // Days from the announcement date to show the NEW badge
    newBadgeDays: 14
  };

  document.addEventListener('DOMContentLoaded', () => {
    // Mobile nav toggle
    const toggle = $('#menuToggle');
    const nav = $('#primaryNav');
    if (toggle && nav) {
      toggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(isOpen));
      });

      // Close menu on link click for small screens
      nav.addEventListener('click', (e) => {
        const t = e.target;
        if (t && t.tagName === 'A' && window.matchMedia('(max-width: 760px)').matches) {
          nav.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Announcements: auto-show "NEW" badge for recent posts
    const today = new Date();
    $$('.announce').forEach((card) => {
      const dateStr = card.getAttribute('data-date');
      const badge = card.querySelector('.badge-new');
      if (!dateStr || !badge) return;

      const dt = new Date(dateStr + 'T00:00:00');
      const diffDays = Math.floor((today - dt) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= templeConfig.newBadgeDays) {
        badge.hidden = false;
        badge.textContent = 'NEW';
      }
    });

    // Footer year
    const yearEl = $('#year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    // Language switch prompt (top banner suggestion)
    (() => {
      const currentLang = (document.documentElement.lang || '').toLowerCase();
      const navLang = (navigator.language || '').toLowerCase();
      const key = `langPromptDismissed_${currentLang}`;

      // Only show once per language unless user clears storage
      if (localStorage.getItem(key) === '1') return;

      // Determine target and label using existing nav links
      let targetHref = '';
      let label = '';
      let switchBtnText = '';
      let dismissText = '';

      if (currentLang === 'kn') {
        const enLink = document.querySelector('nav a[lang="en"]');
        targetHref = (enLink && enLink.getAttribute('href')) || 'index-en.html';
        label = 'View this site in English?';
        switchBtnText = 'Switch to English';
        dismissText = 'ಬೇಡ';
      } else {
        const knLink = document.querySelector('nav a[lang="kn"]');
        targetHref = (knLink && knLink.getAttribute('href')) || 'index.html';
        label = 'ಈ ಸೈಟ್ ಅನ್ನು ಕನ್ನಡದಲ್ಲಿ ನೋಡಲಿಚ್ಛಿಸುವಿರಾ?';
        switchBtnText = 'ಕನ್ನಡಕ್ಕೆ ಬದಲಿಸಿ';
        dismissText = 'Dismiss';
      }

      // Optionally bias to show when browser language mismatches current page
      const prefersEn = navLang.startsWith('en');
      const prefersKn = navLang.startsWith('kn');
      const mismatch =
        (currentLang === 'kn' && prefersEn) ||
        (currentLang.startsWith('en') && prefersKn);
      // We no longer gate by "seen"; show as long as not dismissed.
      void mismatch;

      const bar = document.createElement('div');
      bar.className = 'lang-prompt';
      bar.setAttribute('role', 'region');
      bar.setAttribute('aria-label', 'Language switch suggestion');
      // Sit below sticky header (approx 64px)
      bar.style.cssText = 'position: sticky; top: 64px; z-index: 25; background: linear-gradient(180deg,#0f162e,#0b1227); border-bottom:1px solid var(--border); padding:.5rem .75rem; box-shadow: var(--shadow-1);';

      const inner = document.createElement('div');
      inner.style.cssText = 'max-width: var(--container); margin: 0 auto; display:flex; align-items:center; justify-content: space-between; gap:.75rem;';

      const text = document.createElement('span');
      text.textContent = label;
      text.style.cssText = 'color:#cfe0ff; font-weight:600;';

      const actions = document.createElement('div');
      actions.style.cssText = 'display:flex; gap:.5rem;';

      const switchBtn = document.createElement('a');
      switchBtn.href = targetHref;
      switchBtn.className = 'btn btn-light';
      switchBtn.style.cssText = 'padding:.4rem .7rem;';
      switchBtn.textContent = switchBtnText;

      const dismissBtn = document.createElement('button');
      dismissBtn.type = 'button';
      dismissBtn.className = 'btn btn-outline';
      dismissBtn.style.cssText = 'padding:.4rem .7rem;';
      dismissBtn.textContent = dismissText;
      dismissBtn.addEventListener('click', () => {
        localStorage.setItem(key, '1');
        bar.remove();
      });

      actions.appendChild(switchBtn);
      actions.appendChild(dismissBtn);
      inner.appendChild(text);
      inner.appendChild(actions);
      bar.appendChild(inner);

      const header = document.querySelector('.site-header');
      if (header) header.insertAdjacentElement('afterend', bar);
    })();

    // Anti-inspect deterrents (cannot fully prevent inspection)
    // 1) Disable right-click context menu
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    // 2) Block common DevTools shortcuts (F12, Ctrl/Cmd+Shift+I/J/C, Ctrl/Cmd+U)
    document.addEventListener('keydown', (e) => {
      const key = (e.key || '').toLowerCase();
      const isBlocked =
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (key === 'i' || key === 'j' || key === 'c')) ||
        (e.metaKey && e.altKey && (key === 'i' || key === 'j' || key === 'c')) ||
        (e.ctrlKey && key === 'u') ||
        (e.metaKey && key === 'u');
      if (isBlocked) {
        e.preventDefault();
        e.stopPropagation();
      }
    });

    // 3) Simple devtools open heuristic (best-effort only)
    let devtoolsWarningShown = false;
    const checkDevtools = () => {
      const threshold = 160;
      const widthDiff = Math.abs(window.outerWidth - window.innerWidth);
      const heightDiff = Math.abs(window.outerHeight - window.innerHeight);
      if ((widthDiff > threshold || heightDiff > threshold) && !devtoolsWarningShown) {
        devtoolsWarningShown = true;
        console.warn('Developer tools detected. Site functionality may be limited.');
      }
    };
    setInterval(checkDevtools, 1500);

    // Map: keep iframe and link in sync with config
    try {
      if (templeConfig.mapsQuery) {
        const q = encodeURIComponent(templeConfig.mapsQuery);

        const mapFrame = document.querySelector('iframe[title="Temple Location Map"]');
        if (mapFrame) {
          mapFrame.src = `https://www.google.com/maps?q=${q}&t=k&output=embed`;
        }

        const mapsLink = document.querySelector('a[href*="https://www.google.com/maps/search/"]');
        if (mapsLink) {
          mapsLink.href = `https://www.google.com/maps/search/?api=1&q=${q}`;
        }
      }
    } catch (err) {
      // Silent fallback
      console.warn('Map update skipped:', err);
    }

    // Shloka ticker: duplicate content for seamless scroll and set speed dynamically
    const track = $('#shlokaTrack');
    if (track && !track.dataset.cloned) {
      // Measure base width BEFORE cloning
      const baseWidth = track.scrollWidth;

      // Clone all items once to make the track 2x for seamless loop
      const clones = Array.from(track.children).map((n) => n.cloneNode(true));
      clones.forEach((n) => track.appendChild(n));
      track.dataset.cloned = '1';

      // Set animation duration based on content width (approx 60px/sec), min 20s for readability
      const pxPerSec = 60;
      const durationSec = Math.max(20, Math.round(baseWidth / pxPerSec));
      track.style.setProperty('--ticker-duration', durationSec + 's');
    }

    // Shloka banner rotator (one full banner visible; rotate every 7s)
    const rotator = $('#shlokaRotator');
    if (rotator) {
      const cards = $$('.shloka-card', rotator);
      if (cards.length) {
        let idx = 0;
        const setActive = (n) => {
          cards[idx].classList.remove('active');
          idx = (n + cards.length) % cards.length;
          cards[idx].classList.add('active');
        };

        // ensure only the first is active initially
        cards.forEach((c, i) => c.classList.toggle('active', i === 0));

        let timerId;
        const intervalMs = 7000;
        const start = () => {
          stop();
          timerId = setInterval(() => setActive(idx + 1), intervalMs);
        };
        const stop = () => { if (timerId) { clearInterval(timerId); timerId = null; } };

        // Pause on hover/focus; resume on leave/blur
        rotator.addEventListener('mouseenter', stop);
        rotator.addEventListener('focusin', stop);
        rotator.addEventListener('mouseleave', start);
        rotator.addEventListener('focusout', start);

        // Respect tab visibility (pause when hidden)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop(); else start();
    });

    // Prev/Next controls
    const prevBtn = $('#shlokaPrev');
    const nextBtn = $('#shlokaNext');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => { stop(); setActive(idx - 1); start(); });
      prevBtn.addEventListener('mouseenter', stop);
      prevBtn.addEventListener('mouseleave', start);
      prevBtn.addEventListener('focusin', stop);
      prevBtn.addEventListener('focusout', start);
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => { stop(); setActive(idx + 1); start(); });
      nextBtn.addEventListener('mouseenter', stop);
      nextBtn.addEventListener('mouseleave', start);
      nextBtn.addEventListener('focusin', stop);
      nextBtn.addEventListener('focusout', start);
    }

    start();
      }
    }
  });
})();
