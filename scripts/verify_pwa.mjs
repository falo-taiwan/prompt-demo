import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const appDirs = [
  path.join(root, "packages", "local-html"),
  root
];
const examplePath = path.join(root, "examples", "prompt_database_template.json");

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function assertIncludes(text, needle, label) {
  assert.ok(text.includes(needle), `${label} should include ${needle}`);
}

for (const appDir of appDirs) {
  const label = path.relative(root, appDir) || "root";
  const indexPath = path.join(appDir, "index.html");
  const manifestPath = path.join(appDir, "manifest.webmanifest");
  const swPath = path.join(appDir, "service-worker.js");
  const xlsxPath = path.join(appDir, "xlsx.full.min.js");
  const iconPath = path.join(appDir, "icon.svg");

  assert.ok(fs.existsSync(indexPath), `${label}/index.html should exist`);
  assert.ok(fs.existsSync(manifestPath), `${label}/manifest.webmanifest should exist`);
  assert.ok(fs.existsSync(swPath), `${label}/service-worker.js should exist`);
  assert.ok(fs.existsSync(xlsxPath), `${label}/xlsx.full.min.js should exist`);
  assert.ok(fs.existsSync(iconPath), `${label}/icon.svg should exist`);

  const index = read(indexPath);
  const manifest = JSON.parse(read(manifestPath));
  assert.equal(manifest.name, "FALO Prompt Manager v2.1");
  assert.equal(manifest.version, "v2.1");
  assert.equal(manifest.author, "Falo x Force Cheng");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "./index.html");

  for (const token of [
    "manifest.webmanifest",
    "service-worker.js",
    "installButton",
    "exportButton",
    "backupButton",
    "themeSelect",
    "voiceButton",
    "Voice_Text",
    "OCR 資料轉換",
    "openOcrWorkbenchButton",
    "https://falo-taiwan.github.io/ai-ocr-demo/",
    "Gemini OCR 影像策略檢查",
    "navigator.serviceWorker",
    "beforeinstallprompt"
  ]) {
    assertIncludes(index, token, `${label}/index.html`);
  }

  const scripts = [...index.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
  assert.equal(scripts.length, 1, `${label}/index.html should keep a single inline app script`);
  for (const script of scripts) {
    new Function(script);
  }

  const sw = read(swPath);
  assertIncludes(sw, "CACHE_NAME", `${label}/service worker`);
  assertIncludes(sw, "install", `${label}/service worker`);
  assertIncludes(sw, "fetch", `${label}/service worker`);
}

const example = JSON.parse(read(examplePath));
const serializedExample = JSON.stringify(example);

for (const category of [
  "OCR 資料轉換",
  "Voice 口述輸入",
  "JSON Connect 匯入整理",
  "Gemini OCR 影像策略檢查"
]) {
  assertIncludes(serializedExample, category, "example prompt database");
}

console.log("pwa-verification-ok");
