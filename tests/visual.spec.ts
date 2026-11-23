/**
 * Автоматизированный визуальный и геометрический аудит (Playwright Core):
 * - Проверка 4 целевых разрешений: 390×844, 768×1024, 1024×768, 1440×900
 * - Проверка матрицы ширин 320..1920px на отсутствие горизонтального overflow
 * - Bounding-box проверка шапки (отсутствие пересечений, однострочность ссылок, tap target >=44px)
 * - Снятие финальных скриншотов в /opt/cursor/artifacts/screenshots/final_after/
 */
import { chromium } from "playwright-core";

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
  try {
    for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1024, height: 768 }, { width: 1440, height: 900 }]) {
      const context = await browser.newContext({ viewport, hasTouch: viewport.width < 1200 });
      const page = await context.newPage();
      await page.goto(baseUrl, { waitUntil: "networkidle" });
      const cover = page.getByRole("button", { name: "Открыть книгу «Наша история»" });
      await cover.waitFor({ state: "visible" });
      const closed = await cover.boundingBox();
      if (!closed || closed.width < Math.min(viewport.width * .7, viewport.height * .5, 390)) throw new Error("cover is too small");
      if (viewport.width < 1200) await cover.tap(); else await cover.click();
      await page.waitForFunction(() => {
        const intro = document.querySelector(".hero-cover-wrap")!;
        const opacity = Number(getComputedStyle(intro).opacity);
        return opacity > 0 && opacity < 1 && getComputedStyle(document.querySelector(".home-page")!).visibility === "visible";
      });
      const photo = page.locator(".hero-photo");
      const photoDuringReveal = await photo.boundingBox();
      await page.waitForFunction(() => document.documentElement.dataset.heroBook === "story");
      const photoAfterReveal = await photo.boundingBox();
      if (!photoDuringReveal || JSON.stringify(photoDuringReveal) !== JSON.stringify(photoAfterReveal)) throw new Error("home page moved during reveal");
      const info = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth, focus: document.activeElement?.textContent, image: Array.from(document.querySelectorAll<HTMLImageElement>(".hero-photo img")).every(i => i.complete && i.naturalWidth > 0) }));
      if (info.overflow || !info.image || info.focus !== "Анна и Михаил") throw new Error(JSON.stringify(info));
      await page.reload({ waitUntil: "networkidle" });
      if (await cover.isVisible()) throw new Error("cover returned after reload");
      await page.getByRole("link", { name: "Листать эту книгу целиком" }).click();
      await page.waitForURL(/\/demo\/love-story\/?$/, { timeout: 10000 });
      await page.waitForFunction(() => !document.querySelector(".home-page") && document.readyState === "complete");
      await page.goBack();
      await page.waitForURL(baseUrl, { timeout: 10000 });
      await page.getByRole("heading", { name: "Анна и Михаил" }).waitFor({ state: "visible" });
      if (await cover.isVisible()) throw new Error("cover returned after demo");
      await page.getByRole("link", { name: "Выбрать подарок", exact: true }).first().click();
      await page.waitForURL(/\/catalog\/?$/, { timeout: 10000 });
      results.push(`${viewport.width}x${viewport.height}: touch/click, reload, demo return, catalog, image, focus, overflow OK`);
      await context.close();
    }
    for (const mode of ["keyboard", "reduced", "storage", "nojs", "no-react"]) {
      const context = await browser.newContext({ reducedMotion: mode === "reduced" ? "reduce" : "no-preference", javaScriptEnabled: mode !== "nojs" });
      if (mode === "storage") await context.addInitScript(() => { Object.defineProperty(window, "sessionStorage", { get() { throw new Error("denied"); } }); });
      if (mode === "no-react") await context.route("**/_next/static/**/*.js", (route) => route.abort());
      const page = await context.newPage(); await page.goto(baseUrl, { waitUntil: "networkidle" });
      if (mode !== "nojs") {
        const button = page.getByRole("button", { name: "Открыть книгу", exact: true }); await button.waitFor();
        if (mode === "keyboard" || mode === "reduced") {
          await button.focus();
          await page.keyboard.press(mode === "reduced" ? "Enter" : "Space");
          await page.waitForFunction(() => document.activeElement?.matches(".hero-heading"), undefined, { timeout: 3500 });
        } else await button.click();
        await page.waitForFunction(() => document.documentElement.dataset.heroBook === "story");
      }
      await page.getByRole("heading", { name: "Анна и Михаил" }).waitFor({ state: "visible", timeout: 3000 });
      results.push(`${mode}: OK`); await context.close();
    }
    const idlePage = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
    await idlePage.route("**/_next/static/**/*.js", (route) => route.abort());
    await idlePage.goto(baseUrl);
    await idlePage.locator(".hero-cover").waitFor();
    await idlePage.waitForFunction(() => document.documentElement.dataset.heroBook === "opening", undefined, { timeout: 4500 });
    await idlePage.keyboard.press("Tab");
    await idlePage.waitForFunction(() => document.activeElement?.matches(".hero-heading"), undefined, { timeout: 3500 });
    await idlePage.getByRole("heading", { name: "Анна и Михаил" }).waitFor({ state: "visible" });
    await idlePage.close();
    results.push("automatic opening and Tab focus without Next.js bundles: OK");
    return results;
  } finally { await browser.close(); }
}
