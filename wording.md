# Wording & Copy List

This file contains all user-facing text for the Inner Compass application.

---

## 1. Main Page (`src/app/page.tsx`)

### Editor View
- **Page Title**: `整理思緒`
- **Page Subtitle**: `在寧靜的空間裡，讓感受自然發芽。`
- **Text Area Placeholder**: `寫下你的想法，讓內在智慧陪你慢慢灌溉...`
- **Save Button (Default)**: `儲存`
- **Save Button (Saving)**: `儲存中`
- **Save Button (Saved)**: `已儲存`
- **Delete Button (Tooltip)**: `刪除`
- **End Editing Button (Tooltip)**: `結束編輯`
- **AI Coach Button (Tooltip)**: `召喚內在智慧`
- **AI Coach Button Sub-tooltip**: `開啟深度對話`

### List View
- **Page Title**: `紀錄軌跡`
- **Empty State**: `這片土壤還很安靜。開始寫下你的第一篇日記吧...`
- **Entry with no content**: `(尚無內容，等待你留下思緒...)`
- **AI Interaction Tag**: `已對話`

### Collections View
- **Page Title**: `收藏`
- **Empty State**: `尚無收藏。當你遇到觸動內心的提問時，點擊書籤將其收藏...`
- **Link to original entry**: `回溯這場對話 →`

### Modals & Pop-ups
- **Unsaved Changes Warning Title**: `尚未儲存`
- **Unsaved Changes Warning Body**: `您有尚未儲存的內容，若現在離開，剛才寫下的文字將會遺失。`
- **Unsaved Changes Confirm Button**: `確定離開`

- **Delete Entry Warning Title**: `確定要刪除嗎？`
- **Delete Entry Warning Body**: `此動作無法復原，這篇日記將會永遠消失。`
- **Delete Entry Confirm Button**: `確認刪除`

- **General Cancel Button**: `取消`

- **Privacy Notice Title**: `這裡是您的專屬避風港`
- **Privacy Notice Body 1**: `Inner Compass 採用**「本地儲存」**。您的思緒與對話僅存放於此裝置的溫室中，外界無法窺探。`
- **Privacy Notice Body 2 (Warning)**: `⚠️ 若您使用公用電腦（如圖書館），請務必使用「無痕模式」，關閉視窗後資料才會自動清除，以免隱私外洩。`
- **Privacy Notice Checkbox**: `我已了解，不再顯示此提示`
- **Privacy Notice Confirm Button**: `開始使用`

- **Feedback Modal Title**: `交流與分享`
- **Feedback Modal Subtitle**: `歡迎分享您的使用感受，與我們一起細心灌溉這個空間。\n也可以留下聯絡方式，或許我們能有更多討論。`
- **Feedback Input Placeholder**: `請輸入您的建議...`
- **Feedback Send Button**: `傳送回饋`
- **Feedback Sending Button**: `發送中...`
- **Feedback Success Message**: `發送成功！謝謝你的回饋。`
- **Feedback Error Message**: `發送失敗，請稍後再試。`

---

## 2. AI Coach Modal (`src/app/components/CoachModal.tsx`)

- **Modal Title**: `內在智慧羅盤`
- **Modal Subtitle**: `今日探索頻寬`
- **Input Placeholder**: `在這裡，與內在的聲音共振...`
- **Usage Limit Reached Message**: `今日的滋養已足夠。給思緒一點留白，讓覺察在土壤裡慢慢發酵。`
- **System Error Prefix**: `(系統訊息)`
- **Default Connection Error**: `抱歉，連線發生未知錯誤。`
- **API Error Format**: `API 請求失敗 ({STATUS_CODE})`

---

## 3. Main Layout (`src/app/components/Layout.tsx`)

- **Nav Item - Write**: `書寫`
- **Nav Item - Journal**: `日記`
- **Nav Item - Collections**: `收藏`
- **Nav Item - Feedback**: `交流`
- **Logo Vertical Text**: `INNER COMPASS`

---

## 4. In-App Browser Banner (`src/app/components/InAppBrowserBanner.tsx`)

- **Banner Text**: `為了獲得完整的體驗，請點擊右上方「...」並選擇「在瀏覽器中開啟」`
- **Close Banner Aria-Label**: `關閉橫幅`
