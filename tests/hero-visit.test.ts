import { afterEach, describe, expect, it, vi } from "vitest";
import { HERO_VISIT_KEY, HERO_VISIT_SCRIPT } from "@/components/home-page/BookIntro/BookIntro.script";

function loadBook(
  storage: Pick<Storage, "getItem" | "setItem">,
  { reducedMotion = false, hash = "", onHome = true } = {},
) {
  vi.useFakeTimers();
  const state: Record<string, string> = {};
  const heading = { focus: vi.fn() };
  const listeners = new Map<string, (event?: unknown) => void>();
  const page = { inert: false, querySelector: () => heading };
  const intro = { addEventListener: vi.fn(), isConnected: true, contains: () => false };
  const pricing = { scrollIntoView: vi.fn() };
  const location = { hash };
  let currentIntro = onHome ? intro : null;
  let onMutation: () => void;
  const document = {
    documentElement: { dataset: state },
    hidden: false,
    querySelector: (selector: string) => selector === "[data-hero-intro]" ? currentIntro : page,
    getElementById: (id: string) => id === "pricing" ? pricing : null,
    addEventListener: (name: string, listener: (event?: unknown) => void) => listeners.set(name, listener),
    removeEventListener: (name: string) => listeners.delete(name),
  };

  const start = new Function("document", "window", "MutationObserver", HERO_VISIT_SCRIPT);
  start(
    document,
    {
      sessionStorage: storage,
      location,
      matchMedia: () => ({ matches: reducedMotion }),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      setTimeout,
      clearTimeout,
      requestAnimationFrame: (callback: () => void) => setTimeout(callback, 16),
    },
    class {
      constructor(callback: () => void) { onMutation = callback; }
      observe() {}
      disconnect() {}
    },
  );

  return {
    state,
    heading,
    page,
    pricing,
    domReady: () => listeners.get("DOMContentLoaded")?.(),
    navigateHome: (hash: string) => {
      currentIntro = intro;
      location.hash = hash;
      onMutation();
    },
    activity: () => listeners.get("pointermove")?.(),
    setHidden: (hidden: boolean) => {
      document.hidden = hidden;
      listeners.get("visibilitychange")?.();
    },
    finish: () => intro.addEventListener.mock.calls[0][1]({ target: intro }),
    click: () => listeners.get("click")?.({ target: { closest: () => ({ closest: () => intro }) } }),
    wheel: (deltaY: number, ctrlKey = false) => {
      const preventDefault = vi.fn();
      listeners.get("wheel")?.({ deltaY, ctrlKey, preventDefault });
      return preventDefault;
    },
    touch: (type: "touchstart" | "touchmove", ...points: [number, number][]) => {
      const preventDefault = vi.fn();
      const touches = points.map(([clientX, clientY], identifier) => ({ clientX, clientY, identifier }));
      listeners.get(type)?.({ touches, preventDefault, cancelable: true });
      return preventDefault;
    },
  };
}

afterEach(() => vi.useRealTimers());

describe("hero visit", () => {
  it("opens once and skips the cover after a reload", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); },
    };
    const visit = loadBook(storage);

    expect(visit.state.heroBook).toBe("cover");
    visit.click();
    visit.click();
    expect(vi.getTimerCount()).toBe(1);
    expect(visit.state.heroBook).toBe("opening");
    expect(visit.page.inert).toBe(true);
    expect(values.get(HERO_VISIT_KEY)).toBe("1");
    visit.finish();
    vi.advanceTimersByTime(3000);
    expect(visit.state.heroBook).toBe("story");
    expect(visit.page.inert).toBe(false);
    expect(visit.heading.focus).toHaveBeenCalledOnce();
    expect(loadBook(storage).state.heroBook).toBe("story");
  });

  it("opens with a vertical wheel gesture, leaving zoom and later scrolling alone", () => {
    const visit = loadBook({ getItem: () => null, setItem: vi.fn() });
    expect(visit.wheel(100, true)).not.toHaveBeenCalled();
    expect(visit.wheel(0)).not.toHaveBeenCalled();
    expect(visit.state.heroBook).toBe("cover");
    expect(visit.wheel(100)).toHaveBeenCalledOnce();
    expect(visit.state.heroBook).toBe("opening");
    visit.finish();
    expect(visit.wheel(100)).not.toHaveBeenCalled();
    expect(visit.heading.focus).not.toHaveBeenCalled();
  });

  it("opens immediately with reduced motion when storage is unavailable", () => {
    const denied = () => { throw new Error("denied"); };
    const visit = loadBook({ getItem: denied, setItem: denied }, { reducedMotion: true });

    expect(visit.state.heroBook).toBe("story");
    expect(visit.heading.focus).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("skips the cover and restores the scroll target on a client transition to a home anchor", () => {
    const visit = loadBook({ getItem: () => null, setItem: vi.fn() }, { onHome: false });

    visit.navigateHome("#pricing");

    expect(visit.state.heroBook).toBe("story");
    vi.advanceTimersByTime(16);
    expect(visit.pricing.scrollIntoView).toHaveBeenCalledOnce();
    expect(visit.heading.focus).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("restores a directly requested anchor once the document is ready", () => {
    const visit = loadBook(
      { getItem: () => null, setItem: vi.fn() },
      { hash: "#pricing", reducedMotion: true },
    );

    expect(visit.state.heroBook).toBe("story");
    expect(visit.pricing.scrollIntoView).not.toHaveBeenCalled();
    visit.domReady();
    vi.advanceTimersByTime(16);
    expect(visit.pricing.scrollIntoView).toHaveBeenCalledOnce();
    expect(visit.heading.focus).not.toHaveBeenCalled();
  });

  it("opens after 2.5 idle seconds and resets the countdown on activity or tab changes", () => {
    const visit = loadBook({ getItem: () => null, setItem: vi.fn() });
    vi.advanceTimersByTime(2000);
    visit.activity();
    vi.advanceTimersByTime(2000);
    expect(visit.state.heroBook).toBe("cover");
    visit.setHidden(true);
    vi.advanceTimersByTime(5000);
    expect(visit.state.heroBook).toBe("cover");
    visit.setHidden(false);
    vi.advanceTimersByTime(2499);
    expect(visit.state.heroBook).toBe("cover");
    vi.advanceTimersByTime(1);
    expect(visit.state.heroBook).toBe("opening");
    visit.finish();
    expect(visit.heading.focus).not.toHaveBeenCalled();
  });

  it("opens with a one-finger vertical swipe and ignores short, horizontal and multi-touch gestures", () => {
    const visit = loadBook({ getItem: () => null, setItem: vi.fn() });
    visit.touch("touchstart", [100, 200]);
    expect(visit.touch("touchmove", [100, 185])).not.toHaveBeenCalled();
    expect(visit.touch("touchmove", [50, 170])).not.toHaveBeenCalled();
    visit.touch("touchstart", [100, 200], [200, 200]);
    expect(visit.touch("touchmove", [100, 160], [220, 200])).not.toHaveBeenCalled();
    expect(visit.state.heroBook).toBe("cover");

    visit.touch("touchstart", [100, 200]);
    expect(visit.touch("touchmove", [104, 150])).toHaveBeenCalledOnce();
    expect(visit.state.heroBook).toBe("opening");
    visit.finish();
    expect(visit.touch("touchmove", [104, 100])).not.toHaveBeenCalled();
  });
});
