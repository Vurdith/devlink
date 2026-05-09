import { capitalizeCategory } from "./portfolio-display-utils";
import type { PortfolioItem } from "@/types/api";

interface LinkedSkill {
  id: string;
  name: string;
  category: string;
  icon?: string | null;
}

interface PortfolioItemContentProps {
  item: PortfolioItem;
  isOwner: boolean;
  links: string[];
  tags: string[];
  linkedSkills?: LinkedSkill[];
  onEdit: () => void;
  onDelete: () => void;
  onTagClick: (tag: string) => void;
}

function getLinkMeta(link: string) {
  if (link.toLowerCase().includes("github")) {
    return {
      label: "GitHub",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 4.338 9.63 10.334 10.811.601.11.821-.258.821-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.44-1.305.806-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .322.218.694.825.576 10.001-1.186 14.336-5.51 14.336-10.81 0-6.627-5.374-12-12-12z" />
        </svg>
      ),
    };
  }

  return {
    label: "View Project",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
      </svg>
    ),
  };
}

export function PortfolioItemContent({
  item,
  isOwner,
  links,
  tags,
  linkedSkills,
  onEdit,
  onDelete,
  onTagClick,
}: PortfolioItemContentProps) {
  return (
    <div className="p-4 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {item.category && (
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-2)]">
              {capitalizeCategory(item.category)}
            </p>
          )}
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-semibold tracking-tight text-white sm:text-2xl font-[var(--font-space-grotesk)]">{item.title}</h3>
            {item.category && (
              <span className="h-px w-10 bg-[rgba(var(--color-accent-2-rgb),0.35)]" />
            )}
          </div>
        </div>

        {isOwner && (
          <div className="flex gap-2 shrink-0">
            <button onClick={onEdit} className="p-2 text-white/45 rounded-lg hover:bg-white/[0.055] hover:text-white transition-all border border-transparent hover:border-white/[0.1]" title="Edit">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button onClick={onDelete} className="p-2 text-white/45 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20" title="Delete">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {item.description && <p className="mb-5 max-w-3xl text-sm leading-relaxed text-white/66 sm:text-base">{item.description}</p>}

      <div className="mt-5 flex flex-col justify-between gap-5 border-t border-white/[0.07] pt-5 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              className="text-xs font-medium text-white/45 transition-colors hover:text-[var(--color-accent-2)]"
            >
              #{tag}
            </button>
          ))}

          {linkedSkills?.map((skill) => (
            <span key={skill.id} className="border-l border-[rgba(var(--color-accent-2-rgb),0.24)] pl-3 text-xs font-semibold text-[var(--color-accent-2)]">
              {skill.name}
            </span>
          ))}
        </div>

        {links.length > 0 && (
          <div className="flex items-center gap-3 shrink-0">
            {links.map((link, index) => {
              const meta = getLinkMeta(link);

              return (
                <a key={index} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border border-white/[0.10] bg-white/[0.055] px-4 py-2 text-sm font-semibold text-white transition-all hover:border-white/[0.16] hover:bg-white/[0.085] active:scale-95">
                  {meta.icon}
                  {meta.label}
                </a>
              );
            })}
          </div>
        )}
      </div>

      {!item.isPublic && (
        <div className="mt-4 text-[10px] uppercase tracking-widest text-white/30 flex items-center gap-1.5">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
          </svg>
          Private Item
        </div>
      )}
    </div>
  );
}
