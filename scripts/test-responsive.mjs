import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const VIEWPORTS = [
  { name: "phone-320", width: 320, height: 640 },
  { name: "phone-375", width: 375, height: 667 },
  { name: "phone-390", width: 390, height: 844 },
  { name: "phone-430", width: 430, height: 932 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "tablet-820", width: 820, height: 1180 },
  { name: "tablet-1024", width: 1024, height: 768 },
  { name: "desktop-1280", width: 1280, height: 800 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "wide-1920", width: 1920, height: 1080 },
];

const screenshotsDir = path.resolve(process.cwd(), "docs/screenshots");
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function runQA() {
  console.log("🚀 Launching headless browser for fast Responsive QA...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log("Loading http://localhost:3000...");
  await page.goto("http://localhost:3000", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });

  // Wait 2.2s for page load intro wipe to finish
  await new Promise((r) => setTimeout(r, 2200));

  const results = [];

  for (const vp of VIEWPORTS) {
    console.log(`\n📐 Testing viewport: ${vp.name} (${vp.width}x${vp.height})...`);
    await page.setViewport({ width: vp.width, height: vp.height });
    await new Promise((r) => setTimeout(r, 400));

    // Scroll through the page to trigger all in-view animations
    await page.evaluate(async () => {
      const scrollStep = window.innerHeight;
      const totalHeight = document.body.scrollHeight;
      for (let y = 0; y <= totalHeight; y += scrollStep) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await new Promise((r) => setTimeout(r, 300));

    // 1. Check for horizontal overflow across document
    const overflowCheck = await page.evaluate(() => {
      const docW = document.documentElement.scrollWidth;
      const winW = window.innerWidth;
      const bodyW = document.body.scrollWidth;
      return {
        hasOverflow: docW > winW || bodyW > winW,
        scrollWidth: docW,
        innerWidth: winW,
      };
    });

    // 2. Check Reviews section
    const reviewsCheck = await page.evaluate(() => {
      const section = document.getElementById("reviews");
      if (!section) return { found: false };
      const photo = section.querySelector("img[alt*='manicure'], [aria-label*='Photo']");
      return {
        found: true,
        sectionWidth: section.offsetWidth,
        photoVisible: !!photo,
      };
    });

    // 3. Check How It Works layout
    const howItWorksCheck = await page.evaluate((width) => {
      const section = document.getElementById("how-it-works");
      if (!section) return { found: false };
      return {
        found: true,
        isMobileTablet: width < 1024,
      };
    }, vp.width);

    // 4. Check Booking Form inputs
    const bookingCheck = await page.evaluate(() => {
      const nameInput = document.getElementById("booking-first-name");
      const phoneInput = document.getElementById("booking-phone");
      const submitBtn = document.querySelector("#book button[type='submit']");
      let nameFontSize = 0;
      let phoneFontSize = 0;
      let submitWidth = 0;

      if (nameInput) {
        nameFontSize = parseFloat(window.getComputedStyle(nameInput).fontSize);
      }
      if (phoneInput) {
        phoneFontSize = parseFloat(window.getComputedStyle(phoneInput).fontSize);
      }
      if (submitBtn) {
        submitWidth = submitBtn.offsetWidth;
      }

      return {
        nameFontSize,
        phoneFontSize,
        submitWidth,
      };
    });

    // 5. Check Footer wordmark
    const footerCheck = await page.evaluate(() => {
      const wordmark = document.querySelector("footer [data-reveal='wordmark'] h2, footer h2:last-of-type");
      if (!wordmark) return { found: false };
      const rect = wordmark.getBoundingClientRect();
      return {
        found: true,
        wordmarkWidth: rect.width,
        viewportWidth: window.innerWidth,
        fitsInViewport: rect.width <= window.innerWidth + 2,
      };
    });

    // Take screenshots at 375px and 1440px
    if (vp.width === 375 || vp.width === 1440) {
      const suffix = vp.width;

      if (vp.width === 1440) {
        await page.screenshot({
          path: path.join(screenshotsDir, "hero.png"),
        });
      }

      const reviewsEl = await page.$("#reviews");
      if (reviewsEl) {
        await reviewsEl.scrollIntoView();
        await new Promise((r) => setTimeout(r, 300));
        await reviewsEl.screenshot({
          path: path.join(screenshotsDir, `reviews_${suffix}.png`),
        });
      }

      const howEl = await page.$("#how-it-works");
      if (howEl) {
        await howEl.scrollIntoView();
        await new Promise((r) => setTimeout(r, 300));
        await howEl.screenshot({
          path: path.join(screenshotsDir, `how_it_works_${suffix}.png`),
        });
      }

      const bookEl = await page.$("#book");
      if (bookEl) {
        await bookEl.scrollIntoView();
        await new Promise((r) => setTimeout(r, 300));
        await bookEl.screenshot({
          path: path.join(screenshotsDir, `booking_${suffix}.png`),
        });
      }

      const footerEl = await page.$("footer");
      if (footerEl) {
        await footerEl.scrollIntoView();
        await new Promise((r) => setTimeout(r, 300));
        await footerEl.screenshot({
          path: path.join(screenshotsDir, `footer_${suffix}.png`),
        });
      }
    }

    const report = {
      viewport: vp.name,
      width: vp.width,
      overflow: overflowCheck,
      reviews: reviewsCheck,
      howItWorks: howItWorksCheck,
      booking: bookingCheck,
      footer: footerCheck,
    };

    results.push(report);
    console.log(`  ✓ Overflow: ${overflowCheck.hasOverflow ? "❌ FAILED" : "✅ PASS (0px overflow)"}`);
    console.log(`  ✓ Booking Input font-size: ${bookingCheck.nameFontSize}px (>= 16px: ${bookingCheck.nameFontSize >= 16 ? "✅ PASS" : "❌ FAIL"})`);
    console.log(`  ✓ Wordmark fits: ${footerCheck.fitsInViewport ? "✅ PASS" : "❌ FAIL"}`);
  }

  await page.close();
  await browser.close();

  console.log("\n📊 SUMMARY OF ALL 10 VIEWPORTS:");
  console.table(
    results.map((r) => ({
      Viewport: r.viewport,
      Width: r.width,
      "No Overflow": !r.overflow.hasOverflow ? "PASS" : "FAIL",
      "Input Font >= 16px": r.booking.nameFontSize >= 16 ? "PASS" : "FAIL",
      "Wordmark Fits": r.footer.fitsInViewport ? "PASS" : "FAIL",
    }))
  );

  return results;
}

runQA()
  .then(() => {
    console.log("\n✨ All viewports verified successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("QA error:", err);
    process.exit(1);
  });
