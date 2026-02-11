"use client";

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const InAppBrowserBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isFacebook = userAgent.includes("FBAN") || userAgent.includes("FBAV");
    const isInstagram = userAgent.includes("Instagram");

    if (isFacebook || isInstagram) {
      setShowBanner(true);
    }
  }, []);

  if (!showBanner) {
    return null;
  }

  return (
    <div className="bg-amber-100 border-b border-amber-200 text-amber-800 text-sm p-4 text-center relative">
      <p>
        為了獲得完整的日記體驗與自動儲存功能，請點擊右上方 ... 並選擇「在瀏覽器中開啟」
      </p>
      <button
        onClick={() => setShowBanner(false)}
        className="absolute top-1/2 right-4 -translate-y-1/2 text-amber-600 hover:text-amber-800"
        aria-label="關閉橫幅"
      >
        <X size={20} />
      </button>
    </div>
  );
};

export default InAppBrowserBanner;
