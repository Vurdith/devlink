interface TelemetryTags {
  [key: string]: string | number | boolean | undefined;
}

type TelemetrySink = (entry: {
  name: string;
  value: number;
  tags?: TelemetryTags;
}) => void;

const sinks: TelemetrySink[] = [];

function logSink(entry: { name: string; value: number; tags?: TelemetryTags }) {
  if (process.env.NODE_ENV === "test") {
    return;
  }
  // eslint-disable-next-line no-console
  console.info("[telemetry]", entry.name, entry.value, entry.tags ?? {});
}

sinks.push(logSink);

export const telemetry = {
  addSink(sink: TelemetrySink) {
    sinks.push(sink);
  },
  timing(name: string, valueMs: number, tags?: TelemetryTags) {
    emit({ name, value: valueMs, tags });
  },
  histogram(name: string, value: number, tags?: TelemetryTags) {
    emit({ name, value, tags });
  },
  increment(name: string, delta = 1, tags?: TelemetryTags) {
    emit({ name, value: delta, tags });
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

