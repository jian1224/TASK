# 覺金頂潮 ODDS｜抽獎系統

純前端靜態網站（HTML + CSS + JavaScript），可直接上架到 GitHub Pages，無需任何後端伺服器。

## 檔案結構

```
index.html              首頁 + 抽獎流程頁面
css/style.css           樣式
js/app.js               抽獎邏輯
assets/img/logo1_nobg.png   底圖 logo（置中淡化顯示）
assets/img/logo2_nobg.png   角標 logo（右上角）
assets/video/round1_battle.mp4   第一階段影片（打鬥、雙方跪地）
assets/video/final_battle.mp4    最終決戰影片
```

## 流程說明

1. **首頁**：輸入號碼範圍（最小 / 最大），點擊「開始抽獎」。
   - 範圍內號碼數需至少 5 個，且不可超過 10 萬個（避免瀏覽器卡頓）。
2. **第一階段**：自動播放 `round1_battle.mp4`。影片播完後，畫面停在最後一格背景上，
   依序跳出「晉級五強」的 5 個不重複號碼，並出現「進入最終決戰」按鈕。
3. **最終決戰**：點擊按鈕後播放 `final_battle.mp4`。影片播完後，從剛才的 5 個號碼中
   隨機抽出 1 個，作為最終得主大字顯示。
4. 點擊「重新開始」可回到首頁，進行下一輪抽獎。
5. 每個影片畫面右下角有「跳過影片 ▸」小按鈕，供活動現場影片異常時應急使用（可直接刪除該按鈕的 HTML/CSS/JS 如不需要）。

## 上架 GitHub Pages 步驟

1. 到 GitHub 建立一個新的 repository（例如 `odds-lottery`），設定為 Public。
   - 若想用專案根網址（`https://<你的帳號>.github.io/`），repo 名稱需為 `<你的帳號>.github.io`。
2. 把這個資料夾內所有檔案（`index.html`、`css/`、`js/`、`assets/`）上傳到該 repo 的根目錄。
   - 可直接在 GitHub 網頁上「Add file → Upload files」把整包拖曳上傳；
   - 或使用 Git 指令：
     ```bash
     cd odds-lottery
     git init
     git add .
     git commit -m "抽獎系統首次上線"
     git branch -M main
     git remote add origin https://github.com/<你的帳號>/<repo名稱>.git
     git push -u origin main
     ```
3. 到 repo 的 **Settings → Pages**：
   - Source 選擇 `Deploy from a branch`
   - Branch 選擇 `main`，資料夾選 `/ (root)`，儲存。
4. 等待 1～2 分鐘，網站會出現在：
   - `https://<你的帳號>.github.io/<repo名稱>/`（或 `https://<你的帳號>.github.io/` 若 repo 名稱是 `<你的帳號>.github.io`）。

## 注意事項

- 影片檔案較大（各約 7～8MB），第一次載入需要一點時間，建議活動現場先開啟頁面預先緩衝一次。
- 網頁使用 Google Fonts（Orbitron／Noto Sans TC），需要網路連線才能載入字型；離線時會自動退回系統預設字型，不影響功能。
- 想更換底圖 / 角標圖片或影片，只要用相同檔名覆蓋 `assets/img/` 或 `assets/video/` 裡的檔案即可，不用改程式碼。
