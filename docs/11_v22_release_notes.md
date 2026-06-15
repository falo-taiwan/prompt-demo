# FALO Prompt Manager v2.2 Release Notes

本文用途：給 AI、協作者與後續維護者快速理解 v2.2 的發布標記、修訂範圍與檢查重點。

---

## 1. 版本標記

| 欄位 | 內容 |
| --- | --- |
| Version | v2.2 |
| Brand | Falo x Force Cheng |
| Release Date | 2026/6/15 |
| Geo | Taiwan |
| Product Line | FALO Prompt |
| Delivery | PWA (地端中心) 精簡模式 & Chrome Extension (衛星外掛) 變數修復 |

公開展示入口：

```text
https://falo-taiwan.github.io/prompt-demo/
https://falo-taiwan.github.io/prompt-demo/index.html
```

根目錄 `index.html` 是正式 PWA 展示版。`packages/local-html/index.html` 與其保持同步。
Chrome 擴充外掛位於 `packages/chrome-extension/` 目錄。

---

## 2. 本版修訂重點

### 2.1 PWA 主中心 Prompt 區域「精簡模式」與「完整模式」切換鈕 (Compact/Full Mode Switcher)
- **視覺過濾與隱藏 (Metadata Wiping)**：
  - 於 PWA 頂部動作列加入模式切換的 Segmented Control，預設為「精簡模式」（Compact Mode），並自動將狀態持久化至 localStorage。
  - 在精簡模式下，卡片檢視與編輯器中非核心的行政與次要欄位（如用途說明、標籤、預期輸出、人工檢查點、目標 AI、版本、狀態）皆會自動隱藏，讓使用者能專注於一鍵複製 Prompt，而編輯與 CRUD 功能仍完整可用。
  - 切換至「完整模式」後，所有欄位即重新完整呈現。
- **編輯狀態的安全機制 (Edit Safety)**：
  - 在精簡模式下編輯卡片並點擊保存，只會更新使用者看得到的「標題」與「Prompt 內容」，而其他隱藏欄位的值會原封不動、安全地保留在資料庫中，不會遺失。

### 2.2 外掛側邊欄切換卡片變數更新修復 (Bug Fix for Variable Panel Syncing)
- **即時變數更新**：
  - 修復了 Chrome 外掛側邊欄在切換/點選不同卡片時，置頂變數面板內容沒有跟著更新的缺陷。
  - 在 `renderAccordion()` 尾端加入 `updateFixedVariablesPanel()` 呼叫，確保不論何時切換卡片或重新整理，變數區域皆能即時與當前展開的卡片內容同步。

---

## 3. 檔案異動清單

- `index.html` & `packages/local-html/index.html`：新增 `#uiModeSelector` 模式切換按鈕，支援 CSS 過濾規則、實作 `localStorage` 持久化，並在渲染卡片和編輯時加入 `.admin-only` 類別過濾。
- `manifest.webmanifest` & `packages/local-html/manifest.webmanifest`：升級版本號為 `v2.2`，設定發布日期 `2026-06-15`。
- `packages/chrome-extension/manifest.json`：升級版本號至 `2.2.0`。
- `packages/chrome-extension/sidepanel.html`：更新版本顯示為 `v2.2`。
- `packages/chrome-extension/sidepanel.js`：於 `renderAccordion()` 結尾呼叫 `updateFixedVariablesPanel()` 修復切換卡片時變數不更新之 bug。
- `scripts/verify_pwa.mjs`：更新斷言版本為 `v2.2`。
- `backup/backup_prompt_manager.py`：更新打包檔名版本為 `v2.2`，並更新壓縮檔內的 changelog。
- `docs/02_version_map.md`：更新版本地圖。
