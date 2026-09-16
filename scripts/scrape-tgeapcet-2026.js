const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const TARGET_URL = "https://tgeapcet.nic.in/";
const OUTPUT_DIR = path.resolve(__dirname, "../data/tgeapcet-2026");
const COLLEGE_SELECTOR = "#MainContent_DropDownList1";
const BRANCH_SELECTOR = "#MainContent_DropDownList2";
const SUBMIT_SELECTOR = "#MainContent_btn_allot";
const RESULTS_SELECTOR = "table.sortable";
const COLLEGE_LINK_SELECTOR = "a[href$='college_allotment.aspx']";

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function toCsv(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  return [
    headers.map(csvEscape).join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n");
}

function safeName(value) {
  return value.replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
}

async function waitForNavigationOrIdle(page) {
  await Promise.race([
    page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 }).catch(() => null),
    new Promise((resolve) => setTimeout(resolve, 1500)),
  ]);
}

async function selectAndWait(page, selector, value) {
  const before = await page.$eval(selector, (el) => el.value);
  if (before === value) return;
  await page.select(selector, value);
  await waitForNavigationOrIdle(page);
}

async function getOptions(page, selector, emptyValues = []) {
  await page.waitForSelector(selector, { timeout: 30000 });
  return page.$$eval(selector, (el, empty) =>
    Array.from(el.options)
      .map((option) => ({ name: option.textContent.trim(), value: option.value }))
      .filter((option) => !empty.includes(option.value) && option.name),
  emptyValues);
}

async function scrapeTable(page) {
  await page.waitForSelector(RESULTS_SELECTOR, { timeout: 30000 });
  return page.$eval(RESULTS_SELECTOR, (table) => {
    const rows = Array.from(table.querySelectorAll("tr"));
    return rows.slice(1).map((row) => {
      const cells = Array.from(row.querySelectorAll("td")).map((cell) => cell.innerText.trim());
      if (cells.length < 8) return null;
      return {
        sno: cells[0],
        hallticketno: cells[1],
        rank: cells[2],
        name: cells[3],
        sex: cells[4],
        caste: cells[5],
        region: cells[6],
        seatcategory: cells[7],
      };
    }).filter(Boolean);
  });
}

async function scrape() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);
  await page.setViewport({ width: 1366, height: 900 });
  await page.goto(TARGET_URL, { waitUntil: "domcontentloaded", timeout: 60000 });

  console.log("Opened TGEAPCET 2026 public portal.");
  await page.waitForSelector(COLLEGE_LINK_SELECTOR, { timeout: 30000 });

  const context = browser.defaultBrowserContext();
  const pagesBefore = await browser.pages();
  await page.click(COLLEGE_LINK_SELECTOR);

  let allotmentPage = page;
  for (let i = 0; i < 20; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const pages = await browser.pages();
    const candidate = pages.find((p) => !pagesBefore.includes(p));
    if (candidate) {
      allotmentPage = candidate;
      break;
    }
  }

  await allotmentPage.bringToFront();
  await allotmentPage.waitForSelector(COLLEGE_SELECTOR, { timeout: 30000 });

  const colleges = await getOptions(allotmentPage, COLLEGE_SELECTOR, [""]);
  console.log(`Found ${colleges.length} college options.`);

  for (const college of colleges) {
    const collegeDir = path.join(OUTPUT_DIR, safeName(`${college.value}_${college.name}`));
    fs.mkdirSync(collegeDir, { recursive: true });
    console.log(`\nCollege: ${college.value} — ${college.name}`);

    try {
      await selectAndWait(allotmentPage, COLLEGE_SELECTOR, college.value);
      const branches = await getOptions(allotmentPage, BRANCH_SELECTOR, ["0", ""]);
      console.log(`Branches: ${branches.length}`);

      for (const branch of branches) {
        try {
          await selectAndWait(allotmentPage, COLLEGE_SELECTOR, college.value);
          await allotmentPage.waitForSelector(BRANCH_SELECTOR, { timeout: 30000 });
          await allotmentPage.select(BRANCH_SELECTOR, branch.value);
          await allotmentPage.click(SUBMIT_SELECTOR);
          await waitForNavigationOrIdle(allotmentPage);

          const records = await scrapeTable(allotmentPage);
          const output = path.join(collegeDir, `${safeName(branch.value)}_${safeName(branch.name)}.csv`);
          if (records.length) {
            fs.writeFileSync(output, toCsv(records), "utf8");
            console.log(`  ✓ ${branch.value} ${branch.name}: ${records.length} rows`);
          } else {
            console.log(`  - ${branch.value} ${branch.name}: no rows`);
          }

          await allotmentPage.goBack({ waitUntil: "domcontentloaded" }).catch(() => null);
          await allotmentPage.waitForSelector(COLLEGE_SELECTOR, { timeout: 30000 });
        } catch (error) {
          console.error(`  ✗ ${branch.value} ${branch.name}: ${error.message}`);
          await allotmentPage.goto("https://tgeapcet.nic.in/college_allotment.aspx", {
            waitUntil: "domcontentloaded",
            timeout: 60000,
          }).catch(() => null);
          if (!(await allotmentPage.$(COLLEGE_SELECTOR))) {
            throw error;
          }
        }
      }
    } catch (error) {
      console.error(`College failed: ${college.value} ${college.name}: ${error.message}`);
    }
  }

  await browser.close();
  console.log(`\nDone. CSV files are in ${OUTPUT_DIR}`);
}

scrape().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
