# FALO Prompt Manager

FALO Prompt Manager 是一個跨課程可重複使用的 Prompt 管理器主題單元。

## 版本備註

- 版本：v1.01
- 標記：Falo x Force Cheng
- 發布日期：2026/6/1
- 定位：Prompt Asset Management PWA teaching release
- 地理標記：Taiwan

v1.01 將本地版收斂成可教、可展示、可安裝的 PWA：卡片編修採閱讀 / 編輯分離，文字區提供變數代入即時預覽，Voice 與 OCR 入口以不同配色區隔，第三種主題改為 Warm 馬卡龍色系。

它不是某一堂課的附屬範例，而是用來教初學者理解：

- Prompt 可以被整理成可管理的知識資產
- Prompt 可以分類、標籤化、版本化
- Prompt 可以透過變數代入，變成可重複使用的工作流指令
- Prompt 管理器可以同時有本地版、Chrome 外掛版、GAS 雲同步版
- 不同版本應該共用同一個資料模型，而不是各自長出不同格式

## 專案定位

一句話：

> Prompt 管理器是 AI Workflow 的指令資產管理層。

它位在三個角色之間：

1. **使用者**：需要快速找到可用 Prompt，並套入任務變數。
2. **管理者 / 教學者**：需要維護 Prompt 分類、版本、狀態與教學說明。
3. **AI Agent / Workflow**：需要收到結構清楚、上下文完整、可執行的指令。

在 FALO 產品線中，本專案屬於 **FALO Prompt**，也就是 Prompt Asset Layer。

它不是 FALO Book 的教材庫，也不是 FALO Runtime 的能力執行平台。

| 產品線 | 核心 | 目的 |
| --- | --- | --- |
| FALO Book | Knowledge | 讓使用者理解 |
| FALO Prompt | Skill | 讓使用者快速套用與共創 |
| FALO Runtime | Execution | 讓事情真正發生 |

## 版本規劃

| 版本 | 目標 | 適合教學重點 |
| --- | --- | --- |
| 本地 HTML 版 | 單檔開啟、JSON 插卡、離線使用 | Prompt 卡片化、變數代入、資料結構 |
| Chrome 外掛版 | 在瀏覽器工作流中隨手取用 Prompt | 工作流嵌入、跨網站使用、側邊欄工具 |
| GAS 同步版 | Google Sheet 管理，Apps Script 分發 | 團隊維護、集中派發、非工程師可管理 |

## 目前狀態

目前先建立工程版骨架與清爽風格的本地 HTML / PWA 教材版 MVP。

原始 Antigravity 原型保留在：

`/Users/force/Google_Antigravity/antigravity_start/falo_prompt_hub`

本專案不直接修改原型資料夾。原型視為概念來源與素材參考，工程版在這裡逐步收斂。

## 資料模型優先

三個版本都應優先遵守共用 Prompt Card schema。

核心資料形狀：

```json
{
  "category": "01_標前需求預判",
  "items": [
    {
      "id": "rfp-checklist",
      "title": "讀取外部 RFP 自動預判 Checklist",
      "description": "說明這張 Prompt 卡的用途與預期輸出。",
      "promptText": "請閱讀 [RFP_Path] 並整理重點。",
      "tags": ["RFP", "合規"],
      "status": "stable"
    }
  ]
}
```

## 使用方式

GitHub Pages 展示版：

`https://falo-taiwan.github.io/prompt-demo/`

或明確開啟：

`https://falo-taiwan.github.io/prompt-demo/index.html`

工程來源可直接開啟：

`packages/local-html/index.html`

發布到 GitHub Pages 時，根目錄 `index.html`、`manifest.webmanifest`、`service-worker.js`、`icon.svg`、`xlsx.full.min.js` 會同步為可直接安裝的 PWA 展示版，不再使用 redirect。

它會載入內建範例，也可以匯入 `examples/prompt_database_template.json`。

目前 v1.01 已採 local-first PWA 方向：

- 可透過 `manifest.webmanifest` 安裝
- 透過 `service-worker.js` 快取本地工具
- 支援離線開啟核心介面
- 支援匯入、匯出與一鍵備份 JSON
- 支援 Light / Dark / Warm 皮膚
- 支援 Web Speech API 輕量語音輸入，輸出到 `[Voice_Text]`
- 預留 Gemini Cloud API OCR 欄位，但不在本版燒 token
- OCR 影像策略參考 `AI_Teach_Classroom/gemini35-ocr` 與 `aiocr-pro01`：WebP 768 trial、PNG standard、不放大小圖、只保存 metadata

## Capability Pack 藍圖

Capability Pack / 功能卡概念保留，但不主導 v0.3。

目前優先把 Prompt Manager 做好：

- Prompt 分類
- Prompt Card
- Variable
- 搜尋
- Tag
- Status
- Workflow Step
- 匯入 / 匯出 JSON
- 教材展示感

Capability Pack 先只保留在：

- docs
- schema
- roadmap

等 Prompt Manager 成熟後，再往 FALO Runtime 演進。

未來 GitHub 公開版可以是：

- 教學展示殼
- PWA Shell
- Prompt Manager 基礎框架
- 功能卡槽展示
- 離線功能包匯入容器
- 未來 GAS 租用服務前端

一句話：

> 殼公開，卡分級；離線先匯入，線上接 GAS。

但這是 Runtime 藍圖，不是 v0.3 的主線。

## 重要文件

- `docs/03_v03_teaching_concept.md`：v0.3 教材版概念稿
- `docs/04_aiocr_pro01_gemini_reference.md`：Gemini OCR 模型路由、影像策略、資料保存邊界參考
- `docs/05_capability_pack_shell_design.md`：Runtime 階段的公開 Shell / Capability Pack 藍圖
- `docs/06_product_strategy_alignment.md`：FALO Book / Prompt / Runtime 產品線對齊
- `docs/08_v101_release_notes.md`：v1.01 版本備註、SEO / geo / hidden watermark 與發布檢查
- `docs/09_voice_capture_mode_design.md`：語音插入模式、右側捕捉說明與教學說法
- `packages/shared-schema/capability-pack.schema.json`：Capability Pack 預留 JSON Schema

## 專案原則

- 先穩定資料模型，再擴充介面
- 先做本地版 MVP，再拆 Chrome 與 GAS
- 教學語言要清楚，不過早產品化
- 功能要能被初學者看懂，也要能被工程版長期維護
- Prompt 管理器不是 Prompt 範例庫，而是工作流資產管理層
- PWA 是下載與離線載體，FALO 模型菜是內容與方法論
