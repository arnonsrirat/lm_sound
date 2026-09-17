"use client";

import { useEffect, useState } from "react";

export default function SitePreloader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fallback = window.setTimeout(() => setVisible(false), 8500);
    return () => window.clearTimeout(fallback);
  }, []);

  if (!visible) return null;

  return (
    <div className="site-preloader" role="status" aria-live="polite" aria-label="กำลังโหลดเว็บไซต์">
      <div className="site-preloader-overlay" />
      <div className="site-preloader-content">
        <div className="site-preloader-cat-frame">
          <video
            className="site-preloader-cat"
            src="/0917.mp4"
            autoPlay
            muted
            playsInline
            preload="metadata"
            onEnded={() => window.setTimeout(() => setVisible(false), 300)}
            onError={() => setVisible(false)}
          />
        </div>
        <p className="site-preloader-text">กำลังโหลด</p>
        <span className="site-preloader-dots" aria-hidden="true"><i /><i /><i /></span>
      </div>
    </div>
  );
}
