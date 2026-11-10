const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUTPUT_DIR = path.join(__dirname, "screenshots");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const TABS = [
  { id: "dashboard", name: "1_live_feed.png" },
  { id: "incident", name: "2_incidents.png" },
  { id: "approvals", name: "3_approvals.png" },
  { id: "robustness", name: "4_robustness.png" },
  { id: "benchmark", name: "5_benchmark.png" },
  { id: "architecture", name: "6_architecture.png" },
  { id: "audit", name: "7_audit_trail.png" }
];

async function captureAll() {
  console.log("Launching Chrome at:", CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 850, deviceScaleFactor: 1 });

  for (const tab of TABS) {
    const url = `http://localhost:3000/#${tab.id}`;
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    // Wait until loading spinner disappears and main content table/view renders
    try {
      await page.waitForSelector('table, .react-flow, textarea', { timeout: 15000 });
    } catch (e) {
      console.log("Wait selector timeout, proceeding with current view...");
    }
    await new Promise(r => setTimeout(r, 1000));

    const outputPath = path.join(OUTPUT_DIR, tab.name);
    await page.screenshot({ path: outputPath, fullPage: false });
    console.log(`Saved screenshot to ${outputPath}`);
  }

  await browser.close();
  console.log("All screenshots captured successfully!");
}

captureAll().catch(err => {
  console.error("Screenshot error:", err);
  process.exit(1);
});
