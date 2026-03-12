'use client';

import React from 'react';
import { WeeklyReport } from '@/types';
import { Sparkles } from 'lucide-react';

interface WeeklyGreenhouseCardProps {
  report: WeeklyReport;
}

export const WeeklyGreenhouseCard: React.FC<WeeklyGreenhouseCardProps> = ({ report }) => {
  if (!report) return null;

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-stone-200/50 hover:shadow-md transition-all mb-8">
      <h2 className="text-2xl font-serif-tc font-bold text-stone-800 mb-4 flex items-center">
        <Sparkles className="w-6 h-6 text-yellow-500 mr-3" />
        內在溫室週報
      </h2>
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
        {/* Local Plant Image */}
        <div className="w-full md:w-1/3 flex-shrink-0">
          {report.image_url && (
            <img 
              src={report.image_url} 
              alt={report.plant_name} 
              className="rounded-lg object-contain w-full h-auto max-h-64 md:max-h-full bg-stone-50/80 p-2 border border-stone-200/50"
            />
          )}
        </div>
        {/* Text Content */}
        <div className="w-full md:w-2/3 flex flex-col justify-center">
          <h3 className="text-3xl font-serif font-semibold text-stone-800 mb-3">{report.plant_name}</h3>
          <p className="text-stone-600 font-serif-tc text-base leading-relaxed">{report.weekly_insight}</p>
        </div>
      </div>
    </div>
  );
};
