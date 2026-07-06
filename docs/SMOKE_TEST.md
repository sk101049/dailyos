# DailyOS Beta Smoke Test

Issue #53 之後，未來改版或串接 Provider 前先跑這份檢查表。

## Build

- [ ] 執行 `npm run build`。
- [ ] 確認 build output 包含 `/dashboard`、`/director`、`/workflow`、`/content`、`/character`、`/voice`、`/video`、`/render-queue`、`/assets`、`/publishing`。

## Guided Demo Flow

依序用 AI 導演的示範案例建立預覽，確認每個案例都能帶入 prompt 與分類：

- [ ] AI 工具介紹
- [ ] 保險知識
- [ ] 房地產知識
- [ ] 健康小知識
- [ ] 旅遊推薦

## Core App Flow

- [ ] 開啟儀表板，確認「今天先看這三件事」與「本週創作計畫」可讀。
- [ ] 開啟 AI 導演，輸入自然語句並產生可編輯預覽。
- [ ] 開啟流程編排，調整節點順序、切換啟用狀態、儲存流程模板。
- [ ] 在 AI 製作人建立本週創作計畫，確認專案、AI 導演草稿、生成佇列草稿都維持待審核。
- [ ] 開啟內容工作室，儲存一份腳本到腳本庫。
- [ ] 開啟人物模板與配音頁，各建立一筆本機資產。
- [ ] 回到內容工作室建立分鏡。
- [ ] 開啟影片工作室，確認腳本、人物、配音、分鏡可以組成製作包。
- [ ] 選擇 Gemini / Veo，匯出 `production-package.json`、`project-manifest.json`、`gemini-prompt-package.md`、`render-command.md`。
- [ ] 選擇 OpenMontage，匯出 `openmontage-props.json`。
- [ ] 開啟生成佇列，確認 Gemini 與 OpenMontage 工作可依服務分組。
- [ ] 開啟素材庫與發布中心，確認空狀態或本機資料都能正常顯示。

## LocalStorage Keys

- 腳本庫：`dailyos-script-library`
- 人物模板：`dailyos-character-library`
- 配音：`dailyos-voice-library`
- 分鏡：`dailyos-storyboard-v2`
- 製作包：`dailyos-video-packages`
- 流程模板：`dailyos-workflow-templates`
- 本週創作計畫：`dailyos-weekly-production-plan`
- AI 導演草稿：`dailyos-ai-director-drafts`
- 生成佇列：`dailyos-render-queue`
- 發布中心：`dailyos-publishing-center`

## Out Of Scope

- 自動生成影片
- 自動下載影片
- 背景 worker
- 雲端同步
- 登入
- 資料庫寫入
