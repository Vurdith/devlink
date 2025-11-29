import * as Sentry from "@sentry/nextjs";

interface TelemetryTags {
  [key: string]: string | number | boolean | undefined;
}

type TelemetrySink = (entry: {
  name: string;
  value: number;
  tags?: TelemetryTags;
}) => void;

const sinks: TelemetrySink[] = [];

// Console sink for development
function logSink(entry: { name: string; value: number; tags?: TelemetryTags }) {
  if (process.env.NODE_ENV === "test") {
    return;
  }
  // eslint-disable-next-line no-console
  console.info("[telemetry]", entry.name, entry.value, entry.tags ?? {});
}

// Sentry sink for production monitoring
function sentrySink(entry: { name: string; value: number; tags?: TelemetryTags }) {
  try {
    // Send as Sentry measurement
    Sentry.setMeasurement(entry.name, entry.value, "none");
    
    // Add as breadcrumb for context
    Sentry.addBreadcrumb({
      category: "telemetry",
      message: entry.name,
      level: "info",
      data: {
        value: entry.value,
        ...entry.tags,
      },
    });
  } catch {
    // Silently fail if Sentry not initialized
  }
}

sinks.push(logSink);
sinks.push(sentrySink);

export const telemetry = {
  addSink(sink: TelemetrySink) {
    sinks.push(sink);
  },
  timing(name: string, valueMs: number, tags?: TelemetryTags) {
    emit({ name: `timing.${name}`, value: valueMs, tags: { ...tags, unit: "ms" } });
  },
  histogram(name: string, value: number, tags?: TelemetryTags) {
    emit({ name: `histogram.${name}`, value, tags });
  },
  increment(name: string, delta = 1, tags?: TelemetryTags) {
    emit({ name: `counter.${name}`, value: delta, tags });
  },
  gauge(name: string, value: number, tags?: TelemetryTags) {
    emit({ name: `gauge.${name}`, value, tags });
  },
};

function emit(entry: { name: string; value: number; tags?: TelemetryTags }) {
  for (const sink of sinks) {
    try {
      sink(entry);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("[telemetry] sink error", error);
    }
  }
}

