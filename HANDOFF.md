# FALO Prompt Manager Handoff

## 為什麼有這個專案

這個專案從 Antigravity 產出的 `falo_prompt_hub` 原型接手而來。

原型已經證明一個重要方向：

> Prompt 不應只散落在文件或聊天紀錄裡，而應被整理成可分類、可代入變數、可複製執行、可分發更新的工作流資產。

使用者明確希望由 Codex 接手工程穩定度，保留 Google / Antigravity 擅長的文件與概念產出能力，但讓程式結構、版本邊界與長期維護方式更穩。

## 原始資料夾

原型位置：

`/Users/force/Google_Antigravity/antigravity_start/falo_prompt_hub`

請不要直接改原型資料夾。原型是素材來源與概念記錄。

工程版位置：

`/Users/force/AI-CodeX/falo-prompt-manager`

GitHub Pages 公開展示入口：

`https://falo-taiwan.github.io/prompt-demo/`

根目錄 `index.html` 是正式 Pages / PWA 展示版，不是導向頁。`packages/local-html/index.html` 是工程來源與本地開發版；兩者發布時需同步。

## 核心共識

這是一個獨立主題單元，可穿插到任何 AI 課程。

它不是 Class 02 的附屬頁，而是「Prompt 管理器」主題：

- 本地版
- Chrome 外掛版
- GAS / Google Sheet 同步版

這三個版本都屬於同一個主題，不應各自發展出不同資料格式。

## 優先順序

1. 定義共用 Prompt Card schema
2. 整理清爽風格本地 HTML MVP
3. 將 Chrome 外掛版與 GAS 版視為同一資料模型的不同介面
4. 再逐步補測試、教學文件與課程穿插案例

## 設計語氣

這個專案應該清楚、乾淨、可教學。

避免：

- 過度炫技
- 太重的產品包裝
- 三個版本資料格式分裂
- 把概念直接硬化成企業級平台規格

偏好：

- workflow first
- schema first
- local MVP first
- beginner readable
- engineer maintainable

## 下一位接手者請先讀

1. `README.md`
2. `docs/00_project_positioning.md`
3. `docs/01_prompt_card_schema.md`
4. `docs/03_v03_teaching_concept.md`
5. `docs/04_aiocr_pro01_gemini_reference.md`
6. `docs/06_product_strategy_alignment.md`
7. `docs/05_capability_pack_shell_design.md`
8. `docs/08_v101_release_notes.md`
9. `docs/09_voice_capture_mode_design.md`
10. `packages/shared-schema/capability-pack.schema.json`
11. `packages/local-html/index.html`
12. 根目錄 `index.html`

再決定要接本地版、Chrome 外掛版，或 GAS 同步版。
