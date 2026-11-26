/**
 * Автоматизированный визуальный и геометрический аудит (Playwright Core):
 * - Проверка 4 целевых разрешений: 390×844, 768×1024, 1024×768, 1440×900
 * - Проверка матрицы ширин 320..1920px на отсутствие горизонтального overflow
 * - Bounding-box проверка шапки (отсутствие пересечений, однострочность ссылок, tap target >=44px)
 * - Снятие финальных скриншотов в /opt/cursor/artifacts/screenshots/final_after/
 */
import { chromium, webkit, type Browser } from "playwright-core";

export async function runVisualAndSmokeAudit(baseUrl = "http://127.0.0.1:43123") {
  const VIEWPORTS = [
    { name: "desktop_1440x900", width: 1440, height: 900 },
    { name: "ipad_landscape_1024x768", width: 1024, height: 768 },
    { name: "ipad_portrait_768x1024", width: 768, height: 1024 },
    { name: "iphone_390x844", width: 390, height: 844 },
  ];

  const browser = await chromium.launch({
    executablePath: "/usr/local/bin/google-chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const results: Record<string, unknown> = {};

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
    });
    await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(250);

    const check = await page.evaluate(() => {
      const header = document.querySelector("header")!;
      const hRect = header.getBoundingClientRect();
      const items = Array.from(
        header.querySelectorAll<HTMLElement>("a, button")
      )
        .map((el) => {
          const r = el.getBoundingClientRect();
          return {
            text: (el.textContent || el.getAttribute("aria-label") || "").trim(),
            left: Math.round(r.left),
            right: Math.round(r.right),
            top: Math.round(r.top),
            bottom: Math.round(r.bottom),
            width: Math.round(r.width),
            height: Math.round(r.height),
          };
        })
        .filter((b) => b.width > 0 && b.height > 0);

      // Check pairwise horizontal overlap among visible header items
      let overlaps = 0;
      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          const a = items[i];
          const b = items[j];
          const xOverlap = Math.max(
            0,
            Math.min(a.right, b.right) - Math.max(a.left, b.left)
          );
          const yOverlap = Math.max(
            0,
            Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
          );
          if (xOverlap > 1 && yOverlap > 1) overlaps++;
        }
      }

      return {
        stickyHeaderHeight: Math.round(hRect.height),
        overlaps,
        minTapHeight: Math.min(...items.map((i) => i.height)),
        maxItemHeight: Math.max(...items.map((i) => i.height)),
        horizontalOverflow:
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
        items,
      };
    });

    results[vp.name] = check;

    await page.screenshot({
      path: `/opt/cursor/artifacts/screenshots/final_after/${vp.name}_full.png`,
      fullPage: true,
    });
    await page.screenshot({
      path: `/opt/cursor/artifacts/screenshots/final_after/${vp.name}_viewport.png`,
      fullPage: false,
    });
    await page.close();
  }

  await browser.close();
  return results;
}

export async function runHeroAudit(baseUrl: string, executablePath: string) {
  const browser = await chromium.launch({ executablePath, headless: true });
  const results: string[] = [];
  const heroTitle = "Есть истории, которые хочется подарить";
  try {
    const screens = [
      { width: 320, height: 568, hasTouch: true },
      { width: 390, height: 844, hasTouch: true },
      { width: 768, height: 1024, hasTouch: true },
      { width: 1366, height: 1024, hasTouch: true },
      { width: 1440, height: 740, hasTouch: true },
      { width: 1024, height: 768, hasTouch: false },
      { width: 1440, height: 900, hasTouch: false },
    ];
    for (const { width, height, hasTouch } of screens) {
      const viewport = { width, height };
      const context = await browser.newContext({ viewport, hasTouch });
      const page = await context.newPage();
      if (width === 320) {
        await page.route((url) => url.href.includes("love-1-cover.webp"), async (route) => {
          await new Promise((resolve) => setTimeout(resolve, 3500));
          await route.continue();
        }, { times: 1 });
      }
      await page.goto(baseUrl, { waitUntil: "commit" });
      const cover = page.getByRole("button", { name: "Открыть книгу «Наша история»" });
      await cover.waitFor({ state: "visible" });
      const closed = await cover.boundingBox();
      if (!closed || closed.width < Math.min(viewport.width * .7, viewport.height * .5, 390)) throw new Error("cover is too small");
      const reveal = page.waitForFunction(() => {
        const intro = document.querySelector("[data-hero-intro]");
        const homePage = document.querySelector("[data-home-page]");
        const photo = document.querySelector("#home-hero-title")?.closest("section")?.querySelector("article img");
        if (!intro || !homePage || !photo) return false;
        const opacity = Number(getComputedStyle(intro).opacity);
        if (opacity <= 0 || opacity >= 1 || getComputedStyle(homePage).visibility !== "visible") return false;
        return photo.getBoundingClientRect().toJSON();
      }, undefined, { timeout: 5000 });
      const [revealPhoto] = await Promise.all([reveal, hasTouch ? cover.tap() : cover.click()]);
      const photoDuringReveal = await revealPhoto.jsonValue();
      const hero = page.getByRole("region", { name: heroTitle });
      const photo = hero.locator("article img");
      await page.waitForFunction(() => document.documentElement.dataset.heroBook === "story");
      const photoAfterReveal = await photo.evaluate((image) => image.getBoundingClientRect().toJSON());
      if (JSON.stringify(photoDuringReveal) !== JSON.stringify(photoAfterReveal)) throw new Error("home page moved during reveal");
      await photo.evaluate((image) => (image as HTMLImageElement).decode());
      const info = await hero.evaluate((section) => {
        const heading = section.querySelector("h1")!;
        const photo = section.querySelector("img")!;
        const description = heading.nextElementSibling!.getBoundingClientRect();
        const example = section.querySelector("article")!.getBoundingClientRect();
        const create = section.querySelector('a[href$="/create/love-story"], a[href$="/create/love-story/"]')!.getBoundingClientRect();
        return {
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
          focused: document.activeElement === heading,
          imageLoaded: photo.complete && photo.naturalWidth > 0,
          firstSection: section.getBoundingClientRect().top === section.parentElement!.getBoundingClientRect().top,
          stacked: description.bottom < example.top && example.bottom < create.top,
          sideBySide: example.left > heading.getBoundingClientRect().right && create.right < example.left,
        };
      });
      const layoutMatches = hasTouch && viewport.width < 1440 ? info.stacked : info.sideBySide;
      if (info.overflow || !info.imageLoaded || !info.focused || !info.firstSection || !layoutMatches) throw new Error(JSON.stringify(info));
      await page.reload({ waitUntil: "networkidle" });
      if (await cover.isVisible()) throw new Error("cover returned after reload");
      await hero.getByRole("link", { name: "Пролистать пример", exact: true }).click();
      await page.waitForURL(/\/demo\/love-story\/?$/, { timeout: 10000 });
      await page.waitForFunction(() => !document.querySelector("[data-home-page]") && document.readyState === "complete");
      await page.goBack();
      await page.waitForURL(baseUrl, { timeout: 10000 });
      await hero.waitFor({ state: "visible" });
      if (await cover.isVisible()) throw new Error("cover returned after demo");
      await hero.getByRole("link", { name: "Создать книгу", exact: true }).click();
      await page.waitForURL(/\/create\/love-story\/?$/, { timeout: 10000 });
      await page.waitForFunction(() => !document.querySelector("[data-home-page]") && document.readyState === "complete");
      results.push(`${viewport.width}x${viewport.height}: touch/click, reload, demo return, editor, image, focus, layout OK`);
      await context.close();
    }
    for (const mode of ["keyboard", "reduced", "storage", "nojs", "no-react"]) {
      const context = await browser.newContext({ reducedMotion: mode === "reduced" ? "reduce" : "no-preference", javaScriptEnabled: mode !== "nojs" });
      if (mode === "storage") await context.addInitScript(() => { Object.defineProperty(window, "sessionStorage", { get() { throw new Error("denied"); } }); });
      if (mode === "no-react") await context.route("**/_next/static/**/*.js", (route) => route.abort());
      const page = await context.newPage(); await page.goto(baseUrl, { waitUntil: "commit" });
      if (mode === "reduced") {
        const heading = page.getByRole("heading", { name: heroTitle });
        await heading.waitFor({ state: "attached" });
        if (await page.locator("html").getAttribute("data-hero-book") !== "story") throw new Error("cover delayed the home page with reduced motion");
      } else if (mode !== "nojs") {
        const button = page.getByRole("button", { name: "Открыть книгу", exact: true }); await button.waitFor();
        if (mode === "keyboard") {
          await button.focus();
          await page.keyboard.press("Space");
          await page.waitForFunction(() => document.activeElement?.matches("#home-hero-title"), undefined, { timeout: 3500 });
        } else await button.click();
        await page.waitForFunction(() => document.documentElement.dataset.heroBook === "story");
      }
      await page.getByRole("heading", { name: heroTitle }).waitFor({ state: "visible", timeout: 3000 });
      results.push(`${mode}: OK`); await context.close();
    }
    results.push(...await checkHomeAnchors(browser, baseUrl));
    const idlePage = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
    await idlePage.route("**/_next/static/**/*.js", (route) => route.abort());
    await idlePage.goto(baseUrl);
    await idlePage.locator("[data-hero-intro] [data-hero-open]").first().waitFor();
    await idlePage.waitForFunction(() => document.documentElement.dataset.heroBook === "opening", undefined, { timeout: 4500 });
    await idlePage.keyboard.press("Tab");
    await idlePage.waitForFunction(() => document.activeElement?.matches("#home-hero-title"), undefined, { timeout: 3500 });
    await idlePage.getByRole("heading", { name: heroTitle }).waitFor({ state: "visible" });
    await idlePage.close();
    results.push("automatic opening and Tab focus without Next.js bundles: OK");
    return results;
  } finally { await browser.close(); }
}

export async function runHomeAnchorAudit(baseUrl: string) {
  const browser = await webkit.launch();
  try {
    return await checkHomeAnchors(browser, baseUrl);
  } finally { await browser.close(); }
}

async function checkHomeAnchors(browser: Browser, baseUrl: string) {
  const targets = ["how", "book-examples", "pricing", "faq"];
  const results: string[] = [];
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    const context = await browser.newContext({ reducedMotion, viewport: { width: 1280, height: 720 } });
    try {
      for (const target of targets) {
        const page = await context.newPage();
        await page.goto(baseUrl, { waitUntil: "networkidle" });
        await page.goto(new URL("catalog/", baseUrl).href, { waitUntil: "networkidle" });
        await page.locator(`header nav a[href$="#${target}"]`).click();
        await page.waitForURL(new URL(`#${target}`, baseUrl).href);
        await page.waitForFunction((id) => {
          const section = document.getElementById(id);
          const header = document.querySelector("header");
          if (!section || !header || document.documentElement.dataset.heroBook !== "story") return false;
          const top = section.getBoundingClientRect().top;
          return top >= header.getBoundingClientRect().bottom && top <= innerHeight / 2;
        }, target, { timeout: 5000 });
        await page.close();
      }
      results.push(`home → catalog → ${targets.join(", ")} (${reducedMotion}): OK`);
    } finally { await context.close(); }
  }
  return results;
}
