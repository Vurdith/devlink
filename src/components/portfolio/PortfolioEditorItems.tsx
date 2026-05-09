import { memo } from "react";
import { Tooltip } from "@/components/ui/BaseModal";
import { cn } from "@/lib/cn";
import { ui } from "@/components/ui/design-system";

interface IndexedItemProps {
  idx: number;
  onRemove: (idx: number) => void;
}

export const MediaUrlItem = memo(function MediaUrlItem({ url, idx, onRemove }: IndexedItemProps & { url: string }) {
  return (
    <div className="group flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.035] px-2.5 py-1.5 transition-colors hover:bg-white/[0.055]">
      <span className="text-[11px] text-white/50 truncate flex-1">{url}</span>
      <RemoveButton label="Remove media" onClick={() => onRemove(idx)} size={12} />
    </div>
  );
});

export const LinkItem = memo(function LinkItem({ link, idx, onRemove }: IndexedItemProps & { link: string }) {
  return (
    <div className="group flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.035] px-2.5 py-1.5 transition-colors hover:bg-white/[0.055]">
      <span className="text-[11px] text-white/50 truncate flex-1">{link}</span>
      <RemoveButton label="Remove link" onClick={() => onRemove(idx)} size={12} />
    </div>
  );
});

export const TagItem = memo(function TagItem({ tag, idx, onRemove }: IndexedItemProps & { tag: string }) {
  return (
    <div className="group flex items-center gap-1 rounded-lg border border-[rgba(var(--color-accent-2-rgb),0.22)] bg-[rgba(var(--color-accent-2-rgb),0.10)] px-2 py-1 text-[var(--color-accent-2)] transition-colors hover:border-[rgba(var(--color-accent-2-rgb),0.36)]">
      <span className="text-[10px] font-medium">#{tag}</span>
      <RemoveButton label="Remove tag" onClick={() => onRemove(idx)} size={10} rounded />
    </div>
  );
});

export const MediaPreview = memo(function MediaPreview({ url, idx, onRemove }: IndexedItemProps & { url: string }) {
  return (
    <div className="relative group">
      <div className="aspect-square overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.035]">
        <img
          src={url}
          alt={`Preview ${idx + 1}`}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(event) => {
            (event.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
      <Tooltip content="Remove">
        <button
          type="button"
          onClick={() => onRemove(idx)}
          className={cn("absolute right-1 top-1 p-1 opacity-0 group-hover:opacity-100", ui.control.icon)}
        >
          <CloseIcon size={10} strokeWidth={2.5} />
        </button>
      </Tooltip>
    </div>
  );
});

function RemoveButton({ label, onClick, size, rounded = false }: { label: string; onClick: () => void; size: number; rounded?: boolean }) {
  return (
    <Tooltip content={label}>
      <button
        type="button"
        onClick={onClick}
        className={[
          "p-0.5 text-[var(--color-accent-2)] opacity-0 transition-colors hover:bg-[rgba(var(--color-accent-2-rgb),0.12)] group-hover:opacity-100",
          rounded ? "rounded-full" : "rounded",
        ].join(" ")}
      >
        <CloseIcon size={size} strokeWidth={rounded ? 2.5 : 2} />
      </button>
    </Tooltip>
  );
}

function CloseIcon({ size, strokeWidth }: { size: number; strokeWidth: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}
