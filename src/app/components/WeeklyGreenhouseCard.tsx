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
    <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 hover:shadow-md transition-all mb-8">
      <h2 className="text-2xl font-serif-tc font-bold text-stone-900 mb-4 flex items-center">
        <Sparkles className="w-6 h-6 text-yellow-500 mr-2" />
        內在溫室週報
      </h2>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          {report.image_url && (
            <img src={report.image_url} alt={report.plant_name} className="rounded-lg object-cover w-full h-full" />
          )}
        </div>
        <div className="md:w-2/3">
          <h3 className="text-xl font-serif-tc font-bold text-stone-800 mb-2">{report.plant_name}</h3>
          <p className="text-stone-600 font-serif-tc text-sm leading-relaxed mb-4">{report.weekly_insight}</p>
          <div className="bg-stone-50 p-4 rounded-lg border border-stone-100">
            <p className="text-sm font-serif-tc text-stone-700 font-bold mb-1">轉折點</p>
            <p className="text-sm font-serif-tc text-stone-500">{report.turning_point}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
