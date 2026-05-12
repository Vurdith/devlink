import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createLogger } from "@/server/logger";
import { checkRateLimit } from "@/server/rate-limit";

const logger = createLogger("web-vitals");
const VITALS_RATE_LIMIT = 120;
const VITALS_RATE_WINDOW_SECONDS = 60;
const MAX_VITALS_BODY_BYTES = 4096;
const MAX_METRIC_VALUE = 1_000_000;
const WEB_VITAL_NAMES = new Set(["CLS", "FID", "FCP", "INP", "LCP", "TTFB"]);

type WebVitalMetric = {
  name: string;
  value: number;
  id: string;
  page: string;
};

type LayoutShiftEntry = PerformanceEntry & {
  value: number;
  hadRecentInput?: boolean;
};

export function reportWebVitals(metric: WebVitalMetric): void {
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
  const clsEntries: LayoutShiftEntry[] = [];

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const layoutShiftEntry = entry as LayoutShiftEntry;
      if (!layoutShiftEntry.hadRecentInput) {
        clsValue += layoutShiftEntry.value;
        clsEntries.push(layoutShiftEntry);
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

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function hasOversizedBody(request: NextRequest): boolean {
  const contentLength = request.headers.get("content-length");
  if (!contentLength) return false;

  const parsed = Number.parseInt(contentLength, 10);
  return Number.isFinite(parsed) && parsed > MAX_VITALS_BODY_BYTES;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseWebVitalMetric(body: unknown): WebVitalMetric | null {
  if (!isPlainObject(body)) return null;

  const { name, value, id, page } = body;
  if (
    typeof name !== "string" ||
    !WEB_VITAL_NAMES.has(name) ||
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > MAX_METRIC_VALUE ||
    typeof id !== "string" ||
    id.length < 1 ||
    id.length > 128 ||
    typeof page !== "string" ||
    page.length < 1 ||
    page.length > 2048
  ) {
    return null;
  }

  return { name, value, id, page };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    if (hasOversizedBody(request)) {
      return NextResponse.json({ success: false, error: "Payload too large" }, { status: 413 });
    }

    const rateLimit = await checkRateLimit(
      `web_vitals:${getClientIp(request)}`,
      VITALS_RATE_LIMIT,
      VITALS_RATE_WINDOW_SECONDS
    );

    if (!rateLimit.success) {
      return NextResponse.json({ success: false, error: "Rate limit exceeded" }, { status: 429 });
    }

    const metric = parseWebVitalMetric(await request.json());

    if (!metric) {
      return NextResponse.json({ success: false, error: "Invalid metric" }, { status: 400 });
    }

    const { name, value, id, page } = metric;

    logger.info({ name, value, id, page }, "Web vital received");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
