import { UsageData } from '@/types';

const USAGE_KEY = 'inner_garden_usage'; // Corrected from inner_compass_usage

export const getUsageData = (): UsageData => {
  if (typeof window === 'undefined') {
    return { lastUpdateDate: '', totalDailyCount: 0, sessionCounts: {} };
  }

  try {
    const storedUsage = localStorage.getItem(USAGE_KEY);
    const today = new Date().toISOString().split('T')[0];

    if (storedUsage) {
      const usage: UsageData = JSON.parse(storedUsage);
      // Reset daily count if the date has changed
      if (usage.lastUpdateDate !== today) {
        const newUsage = { ...usage, lastUpdateDate: today, totalDailyCount: 0 };
        localStorage.setItem(USAGE_KEY, JSON.stringify(newUsage));
        return newUsage;
      }
      return usage;
    }

    // Initialize if no usage data exists
    const initialUsage: UsageData = { 
      lastUpdateDate: today, 
      totalDailyCount: 0, 
      sessionCounts: {} 
    };
    localStorage.setItem(USAGE_KEY, JSON.stringify(initialUsage));
    return initialUsage;

  } catch (error) {
    console.error("Failed to parse usage data from localStorage", error);
    // On error, return default structure to prevent app crash
    return { lastUpdateDate: new Date().toISOString().split('T')[0], totalDailyCount: 0, sessionCounts: {} };
  }
};

export const incrementUsageCount = (): UsageData => {
  const currentUsage = getUsageData();
  const today = new Date().toISOString().split('T')[0];

  const newUsage: UsageData = {
    ...currentUsage,
    lastUpdateDate: today, // Ensure date is current
    totalDailyCount: (currentUsage.lastUpdateDate === today ? currentUsage.totalDailyCount : 0) + 1,
  };

  localStorage.setItem(USAGE_KEY, JSON.stringify(newUsage));
  return newUsage;
};
