import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const url = process.env.FALO_PROMPT_URL || "http://127.0.0.1:4174/packages/local-html/index.html?verify=variable-search-ui";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1300 } });

try {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    localStorage.clear();
    for (const key of await caches.keys()) await caches.delete(key);
  });
  await page.reload({ waitUntil: "networkidle" });

  await page.getByRole("button", { name: /02_RFP/ }).click();
  await page.getByRole("button", { name: "使用此卡" }).first().click();

  await assertVisibleText("[data-variable-filter='page']", "本頁變數");
  await assertVisibleText("[data-variable-filter='all']", "全部變數");
  await assertVisibleText("[data-variable-filter='issues']", "問題變數");

  const variableSearch = page.locator("#variableSearchInput");
  await variableSearch.fill("RFP");
  await assertVisibleText("#variableFields", "[RFP_Path]");
  assert.equal(await page.locator("#variableFields label", { hasText: "[Client]" }).count(), 0);

  await page.getByRole("button", { name: "編輯" }).first().click();
  const promptInput = page.locator('textarea[data-draft-field="promptText"]').first();
  await promptInput.scrollIntoViewIfNeeded();
  await promptInput.click();
  await promptInput.press("Meta+End");
  await promptInput.type(" [PM]");
  await variableSearch.fill("");
  await assertVisibleText("#variableFields", "[PM]");

  await page.locator("#refreshVariablesButton").click();
  await assertVisibleText("#variableHint", "已重新掃描");

  await variableSearch.fill("");
  await page.locator("#newVariableToggleButton").click();
  await page.locator("#newVariableNameInput").fill("Workshop_Topic");
  await page.locator("#newVariableValueInput").fill("模型菜教材");
  await page.locator("#addVariableButton").click();

  await page.locator("[data-variable-filter='all']").click();
  await variableSearch.fill("Workshop");
  await assertVisibleText("#variableFields", "[Workshop_Topic]");
  assert.equal(await page.locator("#var-Workshop_Topic").inputValue(), "模型菜教材");

  await page.locator("[data-variable-filter='issues']").click();
  await assertVisibleText("#variableHint", "問題變數");

  await page.locator("#promptSearchScopeAll").click();
  await page.locator("#searchInput").fill("模型菜概念說明");
  await assertVisibleText("#cardGrid", "模型菜概念說明");
  await assertVisibleText("#cardGrid", "01_基礎 Prompt 管理");

  await page.locator("#promptSearchScopeCategory").click();
  assert.equal(await page.locator("#cardGrid", { hasText: "模型菜概念說明" }).count(), 0);

  console.log("variable-search-ui-ok");
} finally {
  await browser.close();
}

async function assertVisibleText(selector, text) {
  await page.locator(selector).filter({ hasText: text }).first().waitFor({ state: "visible", timeout: 5000 });
}
