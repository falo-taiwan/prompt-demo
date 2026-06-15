# 版本地圖

## 目前版本

### v2.2 發布標記

| 項目 | 內容 |
| --- | --- |
| 版本 | v2.2 |
| 標記 | Falo x Force Cheng |
| 日期 | 2026/6/15 |
| 交付 | PWA 主中心精簡模式、次要欄位視覺過濾隱藏、localStorage 記憶與 Chrome 外掛變數更新修復 |
| 地理標記 | Taiwan |

v2.2 版本實現了 PWA 主中心 Prompt 區域的「精簡模式」（預設）與「完整模式」切換鈕，支援 `localStorage` 記憶與加載狀態，在精簡模式下自動過濾並隱藏次要行政欄位，同時修復了 Chrome 外掛側邊欄切換卡片時置頂變數面板未更新的 Bug。

| 區塊 | 狀態 | 說明 |
| --- | --- | --- |
| `packages/local-html` | v2.2 | 本地 PWA，含精簡模式切換、Warm 主題、雙向握手偵測 |
| `packages/chrome-extension` | v2.2 | Chrome 外掛 (version 2.2.0)，修復切換卡片時置頂變數不更新之缺陷 |
| `packages/shared-schema` | 初版 | Prompt Card schema 文件與 JSON Schema |
| `packages/gas-sync` | 預留 | 尚未實作 |
| `examples` | 初版 | 共用範例資料 |

## 歷史版本

### v2.1 發布標記

| 項目 | 內容 |
| --- | --- |
| 版本 | v2.1 |
| 標記 | Falo x Force Cheng |
| 日期 | 2026/6/15 |
| 交付 | 地端 PWA 與 Chrome 外掛連線同步、置頂變數、字型調整、雙向握手與自動備份打包工具 |
| 地理標記 | Taiwan |

v2.1 版本實現了地端 PWA 與 Chrome 衛星外掛的深度整合與雙向狀態感知，支援多 PWA 分頁連線選擇、字型縮放、置頂變數面板快取、以及專屬打包備份工具。

| 區塊 | 狀態 | 說明 |
| --- | --- | --- |
| `packages/local-html` | v2.1 | 本地 PWA，含 Warm 主題、字型大小調整、衛星外掛連線狀態徽章與雙向握手偵測 |
| `packages/chrome-extension` | v2.1 | Chrome 外掛 (version 2.1.0)，支援字型縮放、置頂變數面板、雙向握手與多 PWA 連線下拉選單 |
| `packages/shared-schema` | 初版 | Prompt Card schema 文件與 JSON Schema |
| `packages/gas-sync` | 預留 | 尚未實作 |
| `examples` | 初版 | 共用範例資料 |

## 歷史版本

### v1.01 發布標記

| 項目 | 內容 |
| --- | --- |
| 版本 | v1.01 |
| 標記 | Falo x Force Cheng |
| 日期 | 2026/6/1 |
| 交付 | Local-first PWA / single-file HTML 主體 |
| 地理標記 | Taiwan |

v1.01 是 Prompt Manager 教材版的第一個公開展示整理版。它保留 v0.3 的產品骨架，但把本地 PWA、編修模式、變數即時預覽、Voice / OCR 入口與 Warm 主題整理成更適合展示與上課的版本。

## v0.3 優先順序

v0.3 屬於 FALO Prompt，不是 FALO Runtime。

優先把 Prompt Manager 做好：

1. Prompt 分類
2. Prompt Card
3. Variable
4. 搜尋
5. Tag
6. Status
7. Workflow Step
8. 匯入 / 匯出 JSON
9. 教材展示感
10. README 說明

每張 Prompt Card 都要能回答：

- 用途是什麼？
- 需要哪些輸入？
- 預期輸出是什麼？
- 人工檢查點在哪裡？
- 它屬於哪個 Workflow / Step？

## 建議演進順序

1. 穩定本地 HTML 版
2. 補上 schema 驗證與範例資料測試
3. 將本地版抽出可重用的資料處理邏輯
4. 建立 Chrome 外掛版最小 MVP
5. 建立 GAS 同步範例與部署手冊
6. Prompt Manager 成熟後，再評估 Capability Pack / Runtime

## 不急著做的事

- 不急著上大型前端框架
- 不急著做帳號登入
- 不急著做後端資料庫
- 不急著產品化成 SaaS
- 不急著做 Capability Pack 匯入啟用 UI
- 不急著做 Runtime / Marketplace / API credits
- 不急著做完整 GAS 派送與授權

先讓它成為一個乾淨、可教、可複製的 Prompt 管理器主題單元。
