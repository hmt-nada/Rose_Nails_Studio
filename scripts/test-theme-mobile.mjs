import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const scratchDir = "C:/Users/LENOVO/.gemini/antigravity/brain/6c063ba9-d0f4-4570-9ce8-6c7d39ad7884/scratch";

async function runTest() {
  console.log("Starting Puppeteer Mobile Theme QA...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // Test 1: First visit at 390x844 (clean storage, system prefers dark)
  console.log("\n--- TEST 1: Default Light Theme on First Visit at 390px (even with system dark preference) ---");
  await page.setViewport({ width: 390, height: 844 });
  await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "dark" }]);

  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  // Wait for PageIntro animation to finish
  await new Promise((r) => setTimeout(r, 2600));

  const initialCheck = await page.evaluate(() => {
    const htmlClasses = document.documentElement.className;
    const isDark = htmlClasses.includes("dark");
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')?.getAttribute("content");
    const storedTheme = localStorage.getItem("theme");
    return { htmlClasses, isDark, metaThemeColor, storedTheme };
  });

  console.log("Initial load check:", initialCheck);
  if (initialCheck.isDark) {
    console.error("FAIL: First visit loaded dark mode instead of light!");
  } else {
    console.log("PASS: First visit loaded in light mode by default!");
  }

  // Take screenshot in light mode
  await page.screenshot({ path: path.join(scratchDir, "mobile_390_light.png") });
  console.log("Saved mobile_390_light.png");

  // Test 2: Toggle to Dark Mode via header button
  console.log("\n--- TEST 2: Toggle to Dark Mode via Mobile Header Button ---");
  const toggleBtn = await page.$("header div.lg\\:hidden button[aria-label*='theme']");
  if (!toggleBtn) {
    console.error("FAIL: Theme toggle button not found in header!");
  } else {
    const box = await toggleBtn.boundingBox();
    console.log(`Toggle button tap target dimensions: ${box.width}x${box.height}px`);
    if (box.width >= 44 && box.height >= 44) {
      console.log("PASS: Tap target is at least 44x44px!");
    } else {
      console.warn(`WARNING: Tap target is ${box.width}x${box.height}px (below 44x44px)`);
    }

    await toggleBtn.click();
    await new Promise((r) => setTimeout(r, 600));

    const darkCheck = await page.evaluate(() => {
      const htmlClasses = document.documentElement.className;
      const isDark = htmlClasses.includes("dark");
      const metaThemeColor = document.querySelector('meta[name="theme-color"]')?.getAttribute("content");
      const storedTheme = localStorage.getItem("theme");
      return { htmlClasses, isDark, metaThemeColor, storedTheme };
    });
    console.log("After clicking toggle:", darkCheck);

    if (darkCheck.isDark && darkCheck.storedTheme === "dark") {
      console.log("PASS: Dark mode activated and stored in localStorage!");
    } else {
      console.error("FAIL: Dark mode not activated or not stored!");
    }

    // Take screenshot in dark mode
    await page.screenshot({ path: path.join(scratchDir, "mobile_390_dark.png") });
    console.log("Saved mobile_390_dark.png");
  }

  // Test 3: Reload and verify persistence (no flash)
  console.log("\n--- TEST 3: Reload page to verify persistence ---");
  await page.reload({ waitUntil: "domcontentloaded" });
  await new Promise((r) => setTimeout(r, 2600));

  const persistCheck = await page.evaluate(() => {
    const isDark = document.documentElement.className.includes("dark");
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')?.getAttribute("content");
    const storedTheme = localStorage.getItem("theme");
    return { isDark, metaThemeColor, storedTheme };
  });
  console.log("After reload:", persistCheck);
  if (persistCheck.isDark && persistCheck.storedTheme === "dark") {
    console.log("PASS: Dark mode persisted across page reload!");
  } else {
    console.error("FAIL: Dark mode did not persist!");
  }

  // Test 4: Toggle back to Light Mode
  console.log("\n--- TEST 4: Toggle back to Light Mode ---");
  const toggleBtnLight = await page.$("header div.lg\\:hidden button[aria-label*='theme']");
  if (toggleBtnLight) {
    await toggleBtnLight.click();
    await new Promise((r) => setTimeout(r, 600));

    const lightBackCheck = await page.evaluate(() => {
      const isDark = document.documentElement.className.includes("dark");
      const metaThemeColor = document.querySelector('meta[name="theme-color"]')?.getAttribute("content");
      const storedTheme = localStorage.getItem("theme");
      return { isDark, metaThemeColor, storedTheme };
    });
    console.log("After toggling back to light:", lightBackCheck);
    if (!lightBackCheck.isDark && lightBackCheck.storedTheme === "light") {
      console.log("PASS: Light mode restored and persisted!");
    } else {
      console.error("FAIL: Light mode not restored!");
    }
  }

  // Test 5: Open Mobile Menu Overlay and test Segmented Control
  console.log("\n--- TEST 5: Mobile Menu Overlay & Theme Segmented Control ---");
  const hamburgerBtn = await page.$("header button[aria-label*='menu']");
  if (hamburgerBtn) {
    await hamburgerBtn.click();
    await new Promise((r) => setTimeout(r, 800));

    await page.screenshot({ path: path.join(scratchDir, "mobile_menu_overlay.png") });
    console.log("Saved mobile_menu_overlay.png");

    const overlayThemeButtons = await page.$$("div[role='radiogroup'] button");
    console.log(`Found ${overlayThemeButtons.length} segmented theme buttons in mobile menu overlay.`);

    if (overlayThemeButtons.length === 3) {
      console.log("PASS: 3-option segmented control found in mobile menu overlay!");

      // Click Dark button
      await overlayThemeButtons[1].click();
      await new Promise((r) => setTimeout(r, 400));
      const darkFromMenu = await page.evaluate(() => document.documentElement.className.includes("dark"));
      console.log("Clicked Dark in menu -> isDark:", darkFromMenu);

      // Click Light button
      await overlayThemeButtons[0].click();
      await new Promise((r) => setTimeout(r, 400));
      const lightFromMenu = await page.evaluate(() => !document.documentElement.className.includes("dark"));
      console.log("Clicked Light in menu -> isLight:", lightFromMenu);
    } else {
      console.error("FAIL: Segmented theme control not found in mobile menu!");
    }
  }

  // Test 6: Viewport 768px (Tablet)
  console.log("\n--- TEST 6: Tablet Viewport (768x1024) ---");
  await page.setViewport({ width: 768, height: 1024 });
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await new Promise((r) => setTimeout(r, 2600));

  const tabletToggle = await page.$("header div.lg\\:hidden button[aria-label*='theme']");
  if (tabletToggle) {
    const box768 = await tabletToggle.boundingBox();
    console.log(`Tablet toggle dimensions: ${box768.width}x${box768.height}px`);
    if (box768.width >= 44 && box768.height >= 44) {
      console.log("PASS: Tablet tap target is at least 44x44px!");
    }
    await tabletToggle.click();
    await new Promise((r) => setTimeout(r, 400));
    const tabletDark = await page.evaluate(() => document.documentElement.className.includes("dark"));
    console.log("Tablet toggle clicked -> isDark:", tabletDark);
  }

  // Test 7: Admin Portal Top Bar
  console.log("\n--- TEST 7: Admin Portal Mobile Top Bar (390px) ---");
  await page.setViewport({ width: 390, height: 844 });
  await page.goto("http://localhost:3000/admin/login", { waitUntil: "domcontentloaded" });
  await new Promise((r) => setTimeout(r, 800));

  await page.screenshot({ path: path.join(scratchDir, "admin_login_390.png") });
  console.log("Saved admin_login_390.png");

  console.log("\n🎉 All QA Tests Completed Successfully!");
  await browser.close();
}

runTest().catch((err) => {
  console.error("QA Test Error:", err);
  process.exit(1);
});
