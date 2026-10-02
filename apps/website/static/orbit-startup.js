// Parser-blocking, public-only startup: preserve reload position before first paint.
// Keep scene formulas aligned with scrollTiming.ts; no auth or private API access.

// Restoring a document is not a user-requested smooth scroll.
if (location.pathname === '/stand-orbit' || location.pathname.startsWith('/stand-orbit/')) {
  document.documentElement.setAttribute('data-orbit-restoring', '');
  const cancelRestore = function () {
    document.documentElement.removeAttribute('data-orbit-restore-y');
    document.documentElement.removeAttribute('data-orbit-restore-x');
    document.documentElement.style.removeProperty('--orbit-restore-height');
  };
  for (const event of ['wheel', 'touchstart', 'pointerdown', 'keydown']) {
    addEventListener(event, cancelRestore, { passive: true, once: true });
  }
  addEventListener('pagehide', function () {
    try {
      sessionStorage.setItem(
        'orbit-reload-position',
        JSON.stringify({
          url: location.href,
          x: scrollX,
          y: scrollY,
          time: Date.now(),
        }),
      );
    } catch (_) {
      /* Storage is optional; native restoration remains available. */
    }
  });
  // Fail open if JavaScript hydration is unavailable.
  setTimeout(function () {
    document.documentElement.removeAttribute('data-orbit-restoring');
    cancelRestore();
  }, 5000);
}

window.initializeOrbitDocument = function () {
  // The full SSR layout exists here, before the first paint and framework hydration.
  if (document.documentElement.hasAttribute('data-orbit-restoring')) {
    try {
      var navigation = performance.getEntriesByType('navigation')[0];
      var saved = JSON.parse(sessionStorage.getItem('orbit-reload-position') || 'null');
      if (
        navigation &&
        navigation.type === 'reload' &&
        saved &&
        saved.url === location.href &&
        Date.now() - saved.time < 60000 &&
        Number.isFinite(saved.y) &&
        Number.isFinite(saved.x)
      ) {
        // Keep the SSR scroll range while hydration briefly replaces font styles.
        // The guard expires after initialization and never constrains normal scrolling.
        document.documentElement.style.setProperty(
          '--orbit-restore-height',
          document.documentElement.scrollHeight + 'px',
        );
        scrollTo({ left: saved.x, top: saved.y, behavior: 'instant' });
        document.documentElement.setAttribute('data-orbit-restore-y', String(scrollY));
        document.documentElement.setAttribute('data-orbit-restore-x', String(scrollX));
      }
    } catch (_) {
      /* Fall back to SvelteKit/browser scroll restoration. */
    }
    var orbitRoot = document.querySelector('.orbit-home, .orbit-company');
    var orbitHero = orbitRoot && orbitRoot.querySelector('.orbit-intro');
    if (orbitHero && orbitRoot.classList.contains('orbit-home')) {
      // Same distance-based arrival as compactNavProgress; no first-paint flash on reload.
      var navDistance = Math.max(100, Math.min(180, innerHeight * .18));
      var navStart = Math.max(100, orbitHero.getBoundingClientRect().bottom + scrollY - navDistance);
      var navProgress = Math.max(0, Math.min(1, (scrollY - navStart) / navDistance));
      var navPinned = scrollY >= navStart;
      orbitRoot.classList.toggle('nav-pinned', navPinned);
      orbitRoot.classList.remove('nav-hidden');
      orbitRoot.style.setProperty('--nav-progress', String(navProgress));
      var orbitHeader = orbitRoot.querySelector('.stand-header');
      if (orbitHeader && navPinned && navProgress <= 0) {
        orbitHeader.inert = true;
        orbitHeader.setAttribute('aria-hidden', 'true');
      }
    }
    if (orbitRoot && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Pre-paint equivalents of scrollTiming.ts; hydration continues from this pose.
      // No timers, image measurements or changes to the document's layout.
      var clampOrbit = function (n) {
        return Math.max(0, Math.min(1, n));
      };
      var chapterOrbit = function (n, a, b) {
        return clampOrbit((n - a) / (b - a));
      };
      orbitRoot.classList.add('motion-on');
      orbitRoot.querySelectorAll('[data-scene]').forEach(function (scene) {
        var bounds = scene.getBoundingClientRect();
        if (bounds.bottom < -50 || bounds.top > innerHeight + 50) return;
        var pin = scene.querySelector(':scope > [data-pin]');
        var sticky = pin && getComputedStyle(pin).position === 'sticky';
        var range = sticky ? bounds.height - pin.offsetHeight : 0;
        var progress =
          range > 1
            ? clampOrbit(((parseFloat(getComputedStyle(pin).top) || 0) - bounds.top) / range)
            : 0;
        var heroStage = scene.hasAttribute('data-scroll-hero')
          ? scene.querySelector(':scope > [data-hero-stage]')
          : null;
        if (heroStage) {
          // Equivalent to heroScrollProgress: natural scrolling, no sticky range.
          var heroBounds = heroStage.getBoundingClientRect();
          var heroHeight = heroBounds.height;
          // Stable wide-hero track; preserve the existing tablet/mobile frame.
          var accentRange = Math.max(0, bounds.height - heroHeight);
          var accentPinTop = Math.max(0, (innerHeight - heroHeight) / 2);
          var accentTop = bounds.top + (innerWidth > 1050 ? scrollY : 0);
          var accentTravel = Math.min(accentRange, Math.max(0, accentPinTop - accentTop));
          scene.style.setProperty('--accent-stage-shift', (bounds.top + accentTravel - heroBounds.top) + 'px');
          scene.style.setProperty('--accent-progress', accentRange > 1
            ? clampOrbit((accentPinTop - accentTop) / accentRange) : 0);
          var documentTop = bounds.top + scrollY;
          var resting = clampOrbit(
            (Math.max(0, (innerHeight - heroHeight) / 2) - documentTop) /
              Math.max(1, innerHeight * 0.04),
          );
          var travel = Math.max(1, Math.min(heroHeight * 0.75, innerHeight * 0.6));
          progress = resting + (1 - resting) * clampOrbit((documentTop - bounds.top) / travel);
        }
        scene.style.setProperty('--p', progress);
        scene.style.setProperty(
          '--through',
          clampOrbit((innerHeight - bounds.top) / Math.max(1, innerHeight + bounds.height)),
        );
        scene.style.setProperty(
          '--enter',
          clampOrbit((innerHeight * 0.82 - bounds.top) / Math.max(1, innerHeight * 0.52)),
        );
        scene.style.setProperty('--stage-a', chapterOrbit(progress, 0, 0.88));
        scene.style.setProperty('--stage-b', chapterOrbit(progress, 0.1, 1));
        if (scene.hasAttribute('data-approach')) {
          var target = scene.querySelector('[data-approach-target]');
          var rect = target ? target.getBoundingClientRect() : bounds;
          var denominator = Math.max(1, innerHeight * 0.44 + rect.height / 2);
          var approach = clampOrbit((innerHeight * 0.94 - rect.top) / denominator);
          scene.style.setProperty('--approach', approach);
          scene.style.setProperty(
            '--scan',
            clampOrbit(
              (innerHeight * 0.94 -
                rect.top -
                innerHeight * (Number(scene.dataset.scanDelay) || 0)) /
                denominator,
            ),
          );
          scene.style.setProperty('--reveal-a', chapterOrbit(approach, 0.06, 0.58));
          scene.style.setProperty('--reveal-b', chapterOrbit(approach, 0.28, 0.83));
          scene.style.setProperty('--reveal-c', chapterOrbit(approach, 0.5, 1));
        }
      });
      orbitRoot.style.setProperty(
        '--reading',
        clampOrbit(scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)),
      );
    }
  }
};
