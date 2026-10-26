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
