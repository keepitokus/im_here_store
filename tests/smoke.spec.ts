import { chromium } from "playwright-core";

export async function runSmokeRouteAudit(baseUrl = "http://127.0.0.1:43123") {
  const browser = await chromium.launch({
    executablePath: "/usr/local/bin/google-chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  const bodyText = await page.evaluate(() => document.body.innerText);

  const checks = {
    hasLoveStory: bodyText.includes("Наша история") && bodyText.includes("4 990 ₽"),
    hasMotherThanks:
      bodyText.includes("Мама, спасибо") && bodyText.includes("5 990 ₽"),
    hasYourDay: bodyText.includes("Твой день") && bodyText.includes("5 990 ₽"),
    hasFirstYear:
      bodyText.includes("Мой первый год") && bodyText.includes("990 ₽/год"),
    consoleErrors,
  };

  await browser.close();
  return checks;
}
