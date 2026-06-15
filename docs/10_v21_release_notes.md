# FALO Prompt Manager v2.1 Release Notes

本文用途：給 AI、協作者與後續維護者快速理解 v2.1 的發布標記、修訂範圍與檢查重點。

---

## 1. 版本標記

| 欄位 | 內容 |
| --- | --- |
| Version | v2.1 |
| Brand | Falo x Force Cheng |
| Release Date | 2026/6/15 |
| Geo | Taiwan |
| Product Line | FALO Prompt |
| Delivery | PWA (地端中心) & Chrome Extension (衛星外掛) & 專屬自動打包工具 |

公開展示入口：

```text
https://falo-taiwan.github.io/prompt-demo/
https://falo-taiwan.github.io/prompt-demo/index.html
```

根目錄 `index.html` 是正式 PWA 展示版。`packages/local-html/index.html` 與其保持同步。
Chrome 擴充外掛位於 `packages/chrome-extension/` 目錄。

---

## 2. 本版修訂重點

### 2.1 雙向身分握手機制與心跳偵測 (Handshake & Heartbeat)
- **地端 PWA 端**：右上角整合了「🛰️ 衛星外掛：未連線/已連線」狀態徽章與指示燈，當接收到外掛發送的心跳時，動態更新連線分頁資訊。設有 6 秒超時判斷，若外掛側邊欄關閉會自動斷開，恢復未連線狀態。
- **外掛端**：每 5 秒定時發送心跳探測 PING。僅當偵測到目標 PWA 分頁宣告了 `window.__FALO_PWA_METADATA__` 屬性時，才進行握手判定，防範對一般 localhost 的誤判。

### 2.2 多 PWA 分頁切換選單 (1對多)
- 當外掛偵測到多個開啟的真理中心 PWA 分頁時，同步控制區會動態渲染為一個下拉式選單 `<select id="pwaTargetSelector">`，允許使用者一鍵切換要進行拉取/推送的目標分頁。

### 2.3 置頂固定變數面板 (Sticky Variables Panel)
- 外掛側邊欄頂部整合了置頂固定顯示的變數輸入框面板。使用者填入的變數會透過快取機制即時預覽並記憶在 `chrome.storage.local`，卡片內的變數會隨之即時預覽渲染。

### 2.4 五級字型大小調整 (5-Level Font Scaling)
- 側邊欄頂部加入字型調整 +/- 按鈕。支援五級字型大小等級（調整係數從 `--font-scale-factor` 控制），改善高解析度螢幕或長文本的閱讀與操作體驗。

### 2.5 CSV Overwrite 覆寫與變數匯入還原
- 地端 PWA 與外掛支援在導入 JSON 或 CSV 時，自動還原快取變數並覆寫資料庫。
- 動態定義 `window.__FALO_PWA_METADATA__` 機制，依據目前載入的 CSV 範本，即時回傳最新的 sourceName 與 headers 結構。

### 2.6 專屬備份腳本與版本打包工具
- 建立 `backup/backup_prompt_manager.py` Python 備份腳本。
- 一鍵執行會自動將專案（`falo-prompt-manager`）打包為帶時間戳記與版本尾綴的 `.zip` 壓縮檔，並存放於 Git 忽略的 `backup/prompt-manager-backups/` 中，同時自動生成 `changelog_backup.txt` 變更說明檔放入壓縮檔內。

---

## 3. 檔案異動清單

- `index.html` & `packages/local-html/index.html`：整合外掛連線狀態徽章 UI，並定義 PWA Metadata 與雙向通信事件。
- `manifest.webmanifest` & `packages/local-html/manifest.webmanifest`：升級版本號為 `v2.1`，設定發布日期 `2026-06-15`。
- `packages/chrome-extension/manifest.json`：升級版本號至 `2.1.0`。
- `packages/chrome-extension/sidepanel.html` / `.js` / `.css`：整合置頂變數、五級字型縮放、心跳通訊、多 PWA 分頁下拉切換邏輯。
- `scripts/verify_pwa.mjs`：更新斷言版本為 `v2.1`。
- `backup/backup_prompt_manager.py`：新增自動打包備份工具。
- `docs/02_version_map.md`：更新版本地圖。
- `.gitignore`：加入備份壓縮檔排除規則。
