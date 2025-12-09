// This file is used to initialize Sentry on the server.
// It's required by Next.js to properly instrument the application.

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = async (
  error: Error & { digest?: string },
  request: {
    path: string;
    method: string;
    headers: { [key: string]: string };
  },
  context: {
    routerKind: "Pages Router" | "App Router";
    routeType: "render" | "route" | "action" | "middleware";
    routePath: string;
    revalidateReason?: "on-demand" | "stale" | undefined;
  }
) => {
  // Import Sentry dynamically to avoid issues during build
  const Sentry = await import("@sentry/nextjs");

  Sentry.captureException(error, {
    extra: {
      path: request.path,
      method: request.method,
      routerKind: context.routerKind,
      routeType: context.routeType,
      routePath: context.routePath,
    },
  });
};











