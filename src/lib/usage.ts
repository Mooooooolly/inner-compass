import { UsageData } from "@/types";

const USAGE_KEY = 'inner_compass_usage';

// 輔助函式：取得今天的 YYYY-MM-DD 格式日期字串
const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

// 取得目前的用量數據，並自動處理跨日重置
export const getUsageData = (): UsageData => {
  if (typeof window === 'undefined') {
    return { lastUpdateDate: getTodayDateString(), totalDailyCount: 0 };
  }

  const storedValue = localStorage.getItem(USAGE_KEY);
  const today = getTodayDateString();

  let data: UsageData;

  if (storedValue) {
    try {
      data = JSON.parse(storedValue);
      // 檢查是否為新的一天，如果是就重置計數
      if (data.lastUpdateDate !== today) {
        data.lastUpdateDate = today;
        data.totalDailyCount = 0;
      }
    } catch (e) {
      // 如果解析失敗，則建立新的預設值
      data = { lastUpdateDate: today, totalDailyCount: 0 };
    }
  } else {
    // 如果沒有儲存過，則建立新的預設值
    data = { lastUpdateDate: today, totalDailyCount: 0 };
  }

  // 將（可能已更新的）資料存回 localStorage
  localStorage.setItem(USAGE_KEY, JSON.stringify(data));
  return data;
};

// 增加當日的對話次數
export const incrementUsageCount = (): UsageData => {
  if (typeof window === 'undefined') {
     return { lastUpdateDate: getTodayDateString(), totalDailyCount: 0 };
  }
  
  const data = getUsageData(); // getUsageData 已經包含重置邏輯
  
  data.totalDailyCount += 1;
  localStorage.setItem(USAGE_KEY, JSON.stringify(data));
  
  return data;
};
