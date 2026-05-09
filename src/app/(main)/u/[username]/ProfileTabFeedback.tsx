import type { TabType } from "./profile-types";
import { skeleton, surface } from "@/components/ui/design-system";
import { FeedbackState } from "@/components/ui/FeedbackState";

export function ProfileTabLoadingSkeleton() {
  return (
    <div className="space-y-3">
      <div className={surface("empty", "p-4")}>
        <div className={skeleton("h-3 w-28")} />
        <div className={skeleton("mt-3 h-4 w-2/3")} />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className={surface("panelMuted", "relative overflow-hidden p-4")}>
          <div className="flex items-start gap-3">
            <div className={skeleton("h-10 w-10 rounded-full")} />
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <div className={skeleton("h-4 w-24")} />
                <div className={skeleton("h-4 w-16")} />
              </div>
              <div className={skeleton("h-4 w-full")} />
              <div className={skeleton("h-4 w-3/4")} />
              <div className="flex gap-4 mt-3">
                <div className={skeleton("h-4 w-12")} />
                <div className={skeleton("h-4 w-12")} />
                <div className={skeleton("h-4 w-12")} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfileTabError({ activeTab, error }: { activeTab: TabType; error: string }) {
  return (
    <FeedbackState
      tone="danger"
      title={`Failed to load ${activeTab}`}
      description={error}
      className="mb-4 py-10"
      icon={
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      }
    />
  );
}
