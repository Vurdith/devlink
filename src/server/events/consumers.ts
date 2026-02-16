import { subscribeEvent } from "@/lib/events/bus";
import { indexSearchDocumentWithRust } from "@/server/services/hotpath-client";

let registered = false;

export function registerEventConsumers() {
  if (registered) return;
  registered = true;

  subscribeEvent("post.created", async ({ payload }) => {
    await indexSearchDocumentWithRust({
      entity: "post",
      entityId: payload.postId,
    });
  });

  subscribeEvent("profile.updated", async ({ payload }) => {
    await indexSearchDocumentWithRust({
      entity: "user",
      entityId: payload.userId,
    });
  });
}
