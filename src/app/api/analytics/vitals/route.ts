import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function reportWebVitals(metric: {
  name: string;
  value: number;
  id: string;
  page: string;
}): void {
  if (process.env.NODE_ENV === "production") {
    fetch("/api/analytics/vitals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(metric),
    }).catch(() => {});
  }
}

export function getCLS(onReport: (metric: { name: string; value: number; id: string }) => void): void {
  if (typeof window === "undefined") return;
  
  let clsValue = 0;
  const clsEntries: PerformanceEntry[] = [];

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!(entry as PerformanceEntry & { hadRecentInput?: boolean }).hadRecentInput) {
        clsValue += entry.startTime;
        clsEntries.push(entry);
      }
    }
    onReport({ name: "CLS", value: clsValue, id: "cls" });
  });

  try {
    observer.observe({ type: "layout-shift", buffered: true });
  } catch {}
}

export function getFID(onReport: (metric: { name: string; value: number; id: string }) => void): void {
  if (typeof window === "undefined") return;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      onReport({
        name: "FID",
        value: (entry as PerformanceEntry & { processingStart: number }).processingStart - entry.startTime,
        id: "fid",
      });
    }
  });

  try {
    observer.observe({ type: "first-input", buffered: true });
  } catch {}
}

export function getLCP(onReport: (metric: { name: string; value: number; id: string }) => void): void {
  if (typeof window === "undefined") return;

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    if (lastEntry) {
      onReport({ name: "LCP", value: lastEntry.startTime, id: "lcp" });
    }
  });

  try {
    observer.observe({ type: "largest-contentful-paint", buffered: true });
  } catch {}
}

export function getTTFB(onReport: (metric: { name: string; value: number; id: string }) => void): void {
  if (typeof window === "undefined") return;

  const timing = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
  if (timing) {
    onReport({ name: "TTFB", value: timing.responseStart - timing.requestStart, id: "ttfb" });
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ message: "Web Vitals endpoint" });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { name, value, id, page } = body;

    console.log(`[Web Vitals] ${name}: ${value}ms (${id}) on ${page}`);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
