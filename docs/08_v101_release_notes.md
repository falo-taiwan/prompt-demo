# FALO Prompt Manager v1.01 Release Notes

本文用途：給 AI、協作者與後續維護者快速理解 v1.01 的發布標記、修訂範圍與檢查重點。

---

## 1. 版本標記

| 欄位 | 內容 |
| --- | --- |
| Version | v1.01 |
| Brand | Falo x Force Cheng |
| Release Date | 2026/6/1 |
| Geo | Taiwan |
| Product Line | FALO Prompt |
| Delivery | Local-first PWA / single-file HTML main app |

公開展示入口：

```text
https://falo-taiwan.github.io/prompt-demo/
https://falo-taiwan.github.io/prompt-demo/index.html
```

根目錄 `index.html` 是正式 Pages / PWA 展示版，不再是 redirect。`packages/local-html/index.html` 保留為工程來源。

一句話：

> FALO Prompt Manager v1.01 是一個可教學、可展示、可安裝的 Prompt Asset Management PWA。

---

## 2. 本版修訂重點

### 2.1 程式層

- `index.html` 補上 `APP_RELEASE` 常數。
- `manifest.webmanifest` 補上 v1.01、author 與 release date。
- `service-worker.js` cache name 更新為 `falo-prompt-manager-v101-20260601-release`。
- 編修模式中，文字區下方加入「即時預覽」，顯示變數代入後結果。

### 2.2 備註層

- 主畫面品牌區顯示 `v1.01 · Falo x Force Cheng · 2026/6/1`。
- PWA 狀態卡顯示版本備註。
- README、local README、version map 新增 v1.01 說明。

### 2.3 隱藏浮水印

`index.html` 內含隱藏浮水印：

```text
FALO Prompt Manager v1.01 | Falo x Force Cheng | 2026/6/1 | Taiwan | Prompt Asset Management PWA
```

用途不是安全防拷，而是讓公開 HTML 在被 AI、搜尋或人工檢查時，能留下明確版本與品牌來源。

### 2.4 SEO / Geo

`index.html` 已補上：

- `description`
- `author`
- `keywords`
- `version`
- `release-date`
- `geo.region`
- `geo.placename`
- `geo.position`
- `ICBM`
- Open Graph / Twitter basic metadata

---

## 3. UI 與教學性調整

### 3.1 編修模式

閱讀模式維持乾淨。

使用者點「編輯」後，才會看到可修改欄位。文字框下方會顯示即時預覽，讓新手清楚理解：

- 上方是 Prompt 模板文字
- 下方是變數代入後的實際文字

這對教學很重要，因為它能把「Prompt 是可管理資產」變成看得見的互動。

### 3.2 Voice / OCR 視覺區隔

- Voice：藍紫色系，代表口述、語音輸入、想法轉文字。
- OCR：暖橘色系，代表圖片、紙本、手寫資料轉換。

兩者都是資料入口，但不是同一種任務，所以在右側工具區使用不同配色。

### 3.3 Warm 主題

第三種主題由 `Teaching` 改為 `Warm`。

Warm 走馬卡龍暖色系，適合課堂展示、投影、學員初次接觸工具時使用。

---

## 4. 與 v0.3 文件的關係

`docs/03_v03_teaching_concept.md/html` 仍保留為概念對齊稿。

v1.01 不是推翻 v0.3，而是把 v0.3 的方向整理成更完整的公開展示版本：

- v0.3：產品骨架與教材概念
- v1.01：可安裝、可展示、可發布的 PWA 版本

---

## 5. 發布檢查

發布前應確認：

1. `index.html` script syntax 可解析。
2. PWA 檢查通過。
3. JSON 檔案可解析。
4. 編修模式即時預覽可運作。
5. Voice / OCR 右側工具卡配色正確。
6. README / docs / local README 版本資訊一致。
7. zip 備份已放入 `backup/`。
8. GitHub repo 已推送到 `falo-taiwan/prompt-demo`。

---

## 6. 不在本版處理

- 不做完整後端。
- 不做授權系統。
- 不做 Runtime marketplace。
- 不把 OCR API 直接塞回 Prompt Manager。
- 不把 Capability Pack 變成 v1.01 主功能。

本版目標仍是：

> 先把 Prompt 做成產品；Runtime 留在藍圖。
