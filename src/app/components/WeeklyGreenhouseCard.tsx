import React from 'react';
import { WeeklyReport } from '../../types'; // 多加一個 ../

interface GreenhouseCardProps {
  report: WeeklyReport;
  imageUrl?: string; // 這是之後從另一個對話框校正完後要傳入的圖片
}

export const WeeklyGreenhouseCard: React.FC<GreenhouseCardProps> = ({ report, imageUrl }) => {
  return (
    <div className="w-full max-w-2xl mx-auto bg-[#F9F9F7] min-h-[700px] shadow-sm rounded-sm p-12 flex flex-col items-center justify-between text-[#2D4628] font-sans">
      
      {/* 🌿 60% 留白與植物線條圖區 */}
      <div className="flex-[3] flex items-center justify-center w-full group relative">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={report.plant_name}
            className="max-h-[400px] w-auto object-contain mix-blend-multiply opacity-90 transition-opacity duration-700"
          />
        ) : (
          <div className="w-48 h-48 border border-[#2D4628]/10 rounded-full flex items-center justify-center border-dashed animate-pulse">
            <span className="text-[10px] tracking-widest opacity-30">等候溫室發芽...</span>
          </div>
        )}
      </div>

      {/* 📖 洞察文案區 */}
      <div className="flex-[2] w-full flex flex-col items-center text-center space-y-8 mt-4">
        {/* 標題 (H1)：本週植物名稱（襯線體） */}
        <h1 className="text-4xl sm:text-5xl font-serif tracking-[0.25em] font-light">
          {report.plant_name}
        </h1>

        {/* 摘要 (Body)：英雄之旅文案，加寬字距與行距 */}
        <div className="max-w-md mx-auto">
          <p className="text-[15px] leading-[2.2] tracking-[0.12em] opacity-80 font-light">
            {report.weekly_insight}
          </p>
        </div>

        {/* 轉折點：放在結尾的深刻瞬間 */}
        <div className="pt-6 border-t border-[#2D4628]/5 w-16 mx-auto"></div>
        <p className="text-[12px] italic opacity-50 tracking-wide max-w-sm leading-relaxed">
          {report.turning_point}
        </p>
      </div>

      {/* 📍 數據 (Sub-text)：放在角落，不干擾主視覺 */}
      <div className="w-full mt-12 pt-8 flex justify-between items-end border-t border-[#2D4628]/5">
        <div className="text-[10px] tracking-[0.3em] uppercase opacity-30">
          INNER GREENHOUSE REPORT
        </div>
        <div className="text-[10px] tracking-[0.2em] opacity-30">
          本週進行了 {report.total_diaries_analyzed} 次灌溉
        </div>
      </div>
    </div>
  );
};