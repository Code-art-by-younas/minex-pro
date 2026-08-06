// src/components/AdBanner.tsx
"use client";

export function AdBanner() {
  return (
    <div className="my-4 p-2 rounded-lg bg-slate-800/50 border border-white/5 flex justify-center">
      {/* ✅ AADS Ad Unit #2450786 */}
      <div id="frame" style={{ width: "100%", margin: "auto", position: "relative", zIndex: 99998 }}>
        <iframe
          data-aa="2450786"
          src="//acceptable.a-ads.com/2450786/?size=Adaptive"
          style={{ border: 0, padding: 0, width: "70%", height: "auto", overflow: "hidden", display: "block", margin: "auto" }}
        />
      </div>
    </div>
  );
}
