export const HERO_VISIT_KEY = "hero-book-opened";

// Run before the framework bundles so opening works while they are still loading.
export const HERO_VISIT_SCRIPT = `(() => {
  const key = ${JSON.stringify(HERO_VISIT_KEY)};
  const state = document.documentElement.dataset;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reducedMotion.matches || window.location.hash) {
    state.heroBook = "story";
    return;
  }

  state.heroBook = "cover";
  try {
    if (window.sessionStorage.getItem(key) === "1") state.heroBook = "story";
  } catch {}
  if (state.heroBook === "story") return;

  const activityEvents = ["pointerdown", "pointermove", "keydown", "visibilitychange"];
  let intro = null;
  let idleTimer;
  let swipeStart = null;

  function stopWaiting() {
    observer.disconnect();
    window.clearTimeout(idleTimer);
    for (const type of activityEvents) document.removeEventListener(type, resetIdleTimer);
    document.removeEventListener("click", handleClick);
    window.removeEventListener("hashchange", syncIntro);
    removeGestureListeners();
  }

  const openBook = (cover, manual) => {
    if (!cover?.isConnected || state.heroBook !== "cover") return;
    stopWaiting();

    const page = document.querySelector("[data-home-page]");

    try { window.sessionStorage.setItem(key, "1"); } catch {}
    const showStory = () => {
      if (state.heroBook === "story") return;
      const shouldFocus = manual || cover.contains(document.activeElement);
      state.heroBook = "story";
      if (page) {
        page.inert = false;
        if (shouldFocus) window.requestAnimationFrame(() => {
          page.querySelector("#home-hero-title")?.focus({ preventScroll: true });
        });
      }
    };

    if (reducedMotion.matches) {
      showStory();
    } else {
      if (page) page.inert = true;
      cover.addEventListener("animationend", (animation) => {
        if (animation.target === cover) showStory();
      });
      state.heroBook = "opening";
      window.setTimeout(showStory, 2300);
    }
  };

  function resetIdleTimer() {
    window.clearTimeout(idleTimer);
    if (!intro || document.hidden) return;
    idleTimer = window.setTimeout(() => {
      if (!document.hidden) openBook(intro, false);
    }, 2500);
  }

  function handleClick(event) {
    const cover = event.target?.closest?.("[data-hero-open]")?.closest("[data-hero-intro]");
    if (cover) openBook(cover, true);
  }

  function handleWheel(event) {
    if (!intro?.isConnected || document.hidden || !event.deltaY || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    openBook(intro, false);
  }

  function handleTouchStart(event) {
    swipeStart = event.touches.length === 1 ? event.touches[0] : null;
  }

  function handleTouchMove(event) {
    if (!intro?.isConnected || !swipeStart || event.touches.length !== 1 || !event.cancelable) return;
    const touch = event.touches[0];
    if (touch.identifier !== swipeStart.identifier) return;
    const horizontal = Math.abs(touch.clientX - swipeStart.clientX);
    const vertical = Math.abs(touch.clientY - swipeStart.clientY);
    if (vertical < 24 || vertical <= horizontal) return;
    event.preventDefault();
    openBook(intro, false);
  }

  function removeGestureListeners() {
    document.removeEventListener("wheel", handleWheel);
    document.removeEventListener("touchstart", handleTouchStart);
    document.removeEventListener("touchmove", handleTouchMove);
    swipeStart = null;
  }

  function syncIntro() {
    const current = document.querySelector("[data-hero-intro]");
    const hash = window.location.hash;
    if (current && hash) {
      stopWaiting();
      state.heroBook = "story";
      // The router may have attempted to scroll before the home page was visible.
      window.requestAnimationFrame(() => {
        if (window.location.hash === hash) document.getElementById(hash.slice(1))?.scrollIntoView();
      });
      return;
    }

    if (intro === current) return;
    removeGestureListeners();
    intro = current;
    if (intro) {
      document.addEventListener("wheel", handleWheel, { passive: false });
      document.addEventListener("touchstart", handleTouchStart, { passive: true });
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
    }
    resetIdleTimer();
  }

  const observer = new MutationObserver(syncIntro);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  for (const type of activityEvents) document.addEventListener(type, resetIdleTimer, { passive: true });
  document.addEventListener("click", handleClick);
  window.addEventListener("hashchange", syncIntro);
  syncIntro();
})();`;
