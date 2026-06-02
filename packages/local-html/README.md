# Local HTML MVP

這是 FALO Prompt Manager 的本地版 MVP。

## 版本備註

- 版本：v1.01
- 標記：Falo x Force Cheng
- 發布日期：2026/6/1
- 形式：local-first PWA / single-file HTML 主體

本版已在 `index.html` 補上 SEO metadata、geo metadata、程式版次常數、可見版本備註與隱藏浮水印。service worker cache 也更新為 v1.01，避免 PWA 抓到舊版。

## 目標

- 單頁 HTML / PWA，可用瀏覽器開啟，也可透過 localhost 安裝
- 不依賴外部 CDN
- 內建範例 Prompt Card
- 可匯入 JSON prompt database
- 支援變數即時代入
- 一鍵複製完整 Prompt
- 匯出與一鍵備份 JSON
- Light / Dark / Warm 皮膚
- Web Speech API 輕量語音輸入，輸出到 `[Voice_Text]`
- OCR / Gemini Cloud API 預留欄位，主線仍是外部工具輸出 JSON 再匯入
- OCR 影像策略參考 WebP 768、PNG standard、不放大小圖；匯出只保留 metadata，不保存圖片 bytes

## 開啟方式

工程來源直接開啟：

`index.html`

或用本地靜態伺服器預覽：

```bash
python3 -m http.server 4173
```

再開啟：

`http://localhost:4173/packages/local-html/index.html`

GitHub Pages 發布版會同步到 repo 根目錄：

`https://falo-taiwan.github.io/prompt-demo/`

發布版根目錄不是導向頁，而是可直接安裝的 PWA 主頁。

## 匯入資料

可以匯入：

`../../examples/prompt_database_template.json`

目前支援兩種資料格式：

1. 新版 schema：category array
2. 舊版原型：object key 作為 category title
3. v0.3 匯出格式：`promptCategories` + `prompts`
4. Input Material JSON：`type: "inputMaterial"`

Excel 匯入（全覆蓋）與匯出功能已由本機 SheetJS 實現；GAS 雲端同步會在後續版本補上。

## PWA 測試

PWA 安裝與 service worker 需要 `localhost` 或 HTTPS。

```bash
python3 -m http.server 4173
```

再開啟：

`http://localhost:4173/packages/local-html/index.html`

---

## OCR 入口

本專案不再維護本機 `ocr.html`。OCR 已改為外部獨立工具，由 Prompt Manager 主頁提供入口：

`https://falo-taiwan.github.io/ai-ocr-demo/`

主頁只保留「開啟 OCR 工作台」按鈕與說明文字。影像處理、OCR Prompt、API key、模板匯入匯出與結果複製等能力，交由外部 OCR 工具處理。
