import { skeleton, surface } from "@/components/ui/design-system";

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div className={skeleton("h-8 w-48")} />
        <div className={skeleton("mt-2 h-5 w-96 max-w-full")} />
      </div>

      {[1, 2, 3].map((i) => (
        <div key={i} className={surface("panel", "relative overflow-hidden p-6")}>
          <div className="mb-6 flex items-start gap-3">
            <div className={skeleton("h-10 w-10 rounded-xl")} />
            <div className="min-w-0">
              <div className={skeleton("h-5 w-32")} />
              <div className={skeleton("mt-1 h-4 w-64")} />
            </div>
          </div>
          <div className="space-y-4">
            <div className={skeleton("h-11 rounded-xl")} />
            <div className={skeleton("h-11 rounded-xl")} />
            <div className={skeleton("h-11 w-32 rounded-xl")} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default SettingsSkeleton;
