import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { createLogger } from "@/server/logger";

let sdk: NodeSDK | null = null;
const logger = createLogger("otel");

export async function initializeOpenTelemetry() {
  if (sdk || process.env.OTEL_ENABLED !== "true") return;

  const traceExporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
    headers: process.env.OTEL_EXPORTER_OTLP_HEADERS
      ? Object.fromEntries(
          process.env.OTEL_EXPORTER_OTLP_HEADERS.split(",").map((entry) => {
            const [k, v] = entry.split("=");
            return [k.trim(), (v ?? "").trim()];
          })
        )
      : undefined,
  });

  sdk = new NodeSDK({
    traceExporter,
    instrumentations: [getNodeAutoInstrumentations()],
  });

  await sdk.start();
  logger.debug("OpenTelemetry initialized");
}

export async function shutdownOpenTelemetry() {
  if (!sdk) return;
  await sdk.shutdown();
  sdk = null;
}
