import { UsageData } from '@/types';

const DAILY_LIMIT = 7; // 對話次數上限改為 7

/**
 * 取得當前的用量數據
 * 若是新的一天，會自動重置
 */
export const getUsageData = (): UsageData => {
  if (typeof window === 'undefined') {
    return { lastUpdateDate: '', totalDailyCount: 0, sessionCounts: {} };
  }

  const savedData = localStorage.getItem('inner_compass_usage');
  const today = new Date().toISOString().split('T')[0];
  
  if (savedData) {
    try {
      const data: UsageData = JSON.parse(savedData);
      // 如果是新的一天，重置數據
      if (data.lastUpdateDate !== today) {
        console.log("🌞 新的一天，重置對話額度。");
        return {
          lastUpdateDate: today,
          totalDailyCount: 0,
          sessionCounts: {},
        };
      }
      return data;
    } catch (e) {
      console.error("讀取用量數據失敗", e);
      // 若解析失敗，返回初始值
      return { lastUpdateDate: today, totalDailyCount: 0, sessionCounts: {} };
    }
  }

  // 沒有歷史資料，返回初始值
  return { lastUpdateDate: today, totalDailyCount: 0, sessionCounts: {} };
};

/**
 * 增加對話次數並儲存
 * @param diaryId - 可選，若提供則會增加該篇日記的對話次數
 */
export const incrementUsageCount = (): UsageData => {
  const currentData = getUsageData();
  const today = new Date().toISOString().split('T')[0];

  // 再次檢查日期，以防跨日
  if (currentData.lastUpdateDate !== today) {
    const newData: UsageData = { 
      lastUpdateDate: today, 
      totalDailyCount: 1, 
      sessionCounts: {} 
    };
    localStorage.setItem('inner_compass_usage', JSON.stringify(newData));
    return newData;
  }

  const newTotal = currentData.totalDailyCount + 1;

  const newData: UsageData = {
    ...currentData,
    totalDailyCount: newTotal,
  };

  if (newTotal >= DAILY_LIMIT) {
    console.warn(`今日 ${DAILY_LIMIT} 次對話額度已用完。`);
  }

  localStorage.setItem('inner_compass_usage', JSON.stringify(newData));
  return newData;
};
