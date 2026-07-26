"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function AreaChart({
  data,
  height = 160,
  className,
  labels,
}: {
  data: number[];
  height?: number;
  className?: string;
  labels?: string[];
}) {
  const width = 600;
  const max = Math.max(...data, 1) * 1.15;
  const step = data.length > 1 ? width / (data.length - 1) : width;
  const points = data.map((v, i) => [i * step, height - (v / max) * (height - 18) - 6] as const);
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <div className={cn("w-full", className)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10f28c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#10f28c" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="areaStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#10f28c" />
            <stop offset="100%" stopColor="#4ce4ff" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1="0"
            x2={width}
            y1={height * f}
            y2={height * f}
            stroke="rgba(120,220,255,0.08)"
            strokeWidth="1"
          />
        ))}
        <path d={area} fill="url(#areaFill)" />
        <path
          d={line}
          fill="none"
          stroke="url(#areaStroke)"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="animate-draw"
        />
        {points.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="#04140d" stroke="#10f28c" strokeWidth="2" />
        ))}
      </svg>
      {labels ? (
        <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wider text-slate-500">
          {labels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function BarChart({
  data,
  labels,
  height = 150,
}: {
  data: number[];
  labels?: string[];
  height?: number;
}) {
  const max = Math.max(...data, 1);
  return (
    <div>
      <div className="flex items-end gap-1.5 sm:gap-2" style={{ height }}>
        {data.map((v, i) => (
          <div key={i} className="group relative flex flex-1 flex-col justify-end">
            <div
              className="bar-grow w-full rounded-t-md bg-gradient-to-t from-aqua-500/35 via-neon-500/70 to-neon-400 shadow-[0_0_18px_-4px_rgba(16,242,140,0.9)]"
              style={{ height: `${Math.max(4, (v / max) * 100)}%`, animationDelay: `${i * 45}ms` }}
            />
            <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 rounded bg-ink-800 px-1.5 py-0.5 text-[10px] text-neon-300 opacity-0 ring-1 ring-white/10 transition-opacity group-hover:opacity-100">
              {v.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      {labels ? (
        <div className="mt-2 flex gap-1.5 sm:gap-2">
          {labels.map((l, i) => (
            <span key={i} className="flex-1 text-center text-[9px] uppercase text-slate-500">
              {l}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function Donut({
  segments,
  size = 150,
}: {
  segments: Array<{ label: string; value: number; color: string }>;
  size?: number;
}) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const r = 54;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <svg width={size} height={size} viewBox="0 0 140 140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="16" />
        {segments.map((s) => {
          const len = (s.value / total) * c;
          const el = (
            <circle
              key={s.label}
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              style={{ transition: "stroke-dasharray 1s ease" }}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <ul className="space-y-2 text-xs">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-slate-300">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            <span className="min-w-24">{s.label}</span>
            <span className="font-semibold text-white">{((s.value / total) * 100).toFixed(0)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CountUp({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1600,
  className,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || started.current) return;
        started.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setDisplay(value * eased);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration]);

  const text = useMemo(
    () =>
      display.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }),
    [display, decimals],
  );

  return (
    <span ref={ref} className={className}>
      {prefix}
      {text}
      {suffix}
    </span>
  );
}

export function LiveHashTicker() {
  const [values, setValues] = useState<number[]>(() =>
    Array.from({ length: 28 }, (_, i) => 40 + Math.sin(i / 2) * 18 + 20),
  );
  useEffect(() => {
    const id = setInterval(() => {
      setValues((prev) => [...prev.slice(1), 30 + Math.random() * 60]);
    }, 900);
    return () => clearInterval(id);
  }, []);
  return <BarChart data={values} height={90} />;
}
