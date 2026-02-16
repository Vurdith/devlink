import { createEventEnvelope, type EventPayloadMap, type EventTopic } from "@/lib/events/contracts";

type EventHandler<T extends EventTopic> = (event: {
  id: string;
  topic: T;
  occurredAt: string;
  version: "v1";
  payload: EventPayloadMap[T];
}) => void | Promise<void>;

class InMemoryEventBus {
  private handlers = new Map<EventTopic, Set<EventHandler<EventTopic>>>();

  subscribe<T extends EventTopic>(topic: T, handler: EventHandler<T>) {
    const current = this.handlers.get(topic) ?? new Set<EventHandler<EventTopic>>();
    current.add(handler as EventHandler<EventTopic>);
    this.handlers.set(topic, current);
    return () => current.delete(handler as EventHandler<EventTopic>);
  }

  async publish<T extends EventTopic>(topic: T, payload: EventPayloadMap[T]) {
    const event = createEventEnvelope(topic, payload);
    const handlers = this.handlers.get(topic);
    if (!handlers || handlers.size === 0) return event;

    await Promise.all(
      [...handlers].map(async (handler) => {
        try {
          await handler(event as never);
        } catch (error) {
          console.error("[EventBus] handler failed:", error);
        }
      })
    );

    return event;
  }
}

const inMemoryEventBus = new InMemoryEventBus();

async function publishToRemote<T extends EventTopic>(topic: T, payload: EventPayloadMap[T]) {
  const endpoint = process.env.EVENT_BUS_HTTP_ENDPOINT;
  if (!endpoint) return null;

  const token = process.env.EVENT_BUS_HTTP_TOKEN;
  const event = createEventEnvelope(topic, payload);
  await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(event),
    cache: "no-store",
  });

  return event;
}

export async function publishEvent<T extends EventTopic>(topic: T, payload: EventPayloadMap[T]) {
  try {
    if (process.env.EVENT_BUS_MODE === "http" && process.env.EVENT_BUS_HTTP_ENDPOINT) {
      return await publishToRemote(topic, payload);
    }
  } catch (error) {
    console.error("[EventBus] remote publish failed, falling back to in-memory:", error);
  }

  return inMemoryEventBus.publish(topic, payload);
}

export function subscribeEvent<T extends EventTopic>(topic: T, handler: EventHandler<T>) {
  return inMemoryEventBus.subscribe(topic, handler);
}
