# Wording & Copy List

This file contains all user-facing text for the Inner Garden application.

---

## 1. Main Page (`src/app/page.tsx`)

### Editor View
- **Page Title**: `整理思緒`
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
- **Entry with no content**: `(尚無內容，等待你留下思緒...)\`
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
- **Privacy Notice Body 1**: `Inner Garden 採用**「本地儲存」**。您的思緒與對話僅存放於此裝置的溫室中，外界無法窺探。`
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

- **Modal Title**: `內在智慧`
- **Initial Greeting (System Message)**: `(系統訊息) 我是你的內在智慧，準備好後，點擊下方按鈕，我會閱讀你的文字，並提出第一個問題。`
- **Initial Greeting Button**: `準備好了，開始對話`
- **Loading Message**: `正在分析你的想法...`
- **Input Placeholder (Default)**: `輸入你的回應...`
- **Input Placeholder (Limit Reached)**: `今天的對話額度已用完`
- **Send Button (Tooltip)**: `送出`
- **Bookmark Button (Tooltip)**: `收藏這個提問`
- **Usage Counter Text**: `今日對話額度: {remaining}/{total}`
- **Close Button (Tooltip)**: `結束對話`
- **Limit Reached Title**: `今天的對話結束了`
- **Limit Reached Body**: `我們今天已經聊了很多，讓這些想法沉澱一下吧。明天我們再繼續探索。`
- **Limit Reached Confirm Button**: `好的，明天見`

---

## 3. Weekly Report Card (`src/app/page.tsx`)

- **Card Title**: `內在溫室週報`
- **Turning Point Sub-title**: `轉折點`
- **Image Placeholder**: `植物正在發芽中...`

---

## 4. Metadata (`src/app/layout.tsx`)

- **Site Title**: `Inner Garden - 你的內在花園`
- **Site Description**: `一個讓你整理思緒、與內在智慧對話的數位花園。`
