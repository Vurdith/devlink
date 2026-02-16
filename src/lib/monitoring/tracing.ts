import * as Sentry from "@sentry/nextjs";

export function getTraceHeaders(requestHeaders?: Headers) {
  const traceId = requestHeaders?.get("x-request-id") ?? crypto.randomUUID();
  const correlationId = requestHeaders?.get("x-correlation-id") ?? traceId;
  return {
    traceId,
    correlationId,
  };
}

export function startServerSpan<T>(name: string, op: string, fn: () => Promise<T>): Promise<T> {
  return Sentry.startSpan(
    {
      name,
      op,
      attributes: { component: "devlink-api" },
    },
    fn
  );
}

export function captureTracingError(error: unknown, context: Record<string, unknown>) {
  Sentry.captureException(error, {
    tags: { layer: "api" },
    extra: context,
  });
}
