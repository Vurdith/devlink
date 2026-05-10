"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { BaseModal, Tooltip } from "@/components/ui/BaseModal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { surface, ui } from "@/components/ui/design-system";
import type { PortfolioItem } from "@/types/api";
import { LinkItem, MediaPreview, MediaUrlItem, TagItem } from "./PortfolioEditorItems";
import { extractPortfolioSkillIds, parsePortfolioListField } from "./portfolio-editor-utils";

const editorFieldClass = ui.control.field;
const editorTextareaClass = cn(ui.control.field, "resize-none");
const addButtonClass = cn("rounded-lg px-3 py-2 text-xs font-semibold transition-all", ui.control.gradient);
const segmentButtonClass = "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors";

interface PortfolioEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: PortfolioItem) => void;
  existingItem?: PortfolioItem | null;
  userId?: string;
  userSkills?: Array<{
    skillId: string;
    isPrimary?: boolean;
    skill: { id: string; name: string; category: string };
  }>;
}

export function PortfolioEditor({
  isOpen,
  onClose,
  onSave,
  existingItem,
  userSkills = [],
}: PortfolioEditorProps) {
  // Use refs for main form fields to avoid re-renders on every keystroke
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  
  // Only use state for dynamic arrays and UI state
  const [links, setLinks] = useState(() => parsePortfolioListField(existingItem?.links));
  const [mediaUrls, setMediaUrls] = useState(() => parsePortfolioListField(existingItem?.mediaUrls));
  const [tags, setTags] = useState(() => parsePortfolioListField(existingItem?.tags));
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>(() => extractPortfolioSkillIds(existingItem));
  const [skillSearch, setSkillSearch] = useState("");
  const [isPublic, setIsPublic] = useState(existingItem?.isPublic ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mediaInputMethod, setMediaInputMethod] = useState<"url" | "upload">("url");
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  // Use refs for small input fields to avoid re-renders
  const newMediaUrlRef = useRef<HTMLInputElement>(null);
  const newLinkRef = useRef<HTMLInputElement>(null);
  const newTagRef = useRef<HTMLInputElement>(null);

  // Re-hydrate the modal every time it opens or the item changes.
  // Without this, the initial useState/defaultValue only applies on first mount.
  useEffect(() => {
    if (!isOpen) return;

    const item = existingItem ?? null;

    // refs (uncontrolled inputs) need manual sync
    if (titleRef.current) titleRef.current.value = item?.title ?? "";
    if (descriptionRef.current) descriptionRef.current.value = item?.description ?? "";

    setLinks(parsePortfolioListField(item?.links));
    setMediaUrls(parsePortfolioListField(item?.mediaUrls));
    setTags(parsePortfolioListField(item?.tags).map((t) => t.toLowerCase()));
    setSelectedSkillIds(extractPortfolioSkillIds(item));
    setIsPublic(item?.isPublic ?? true);

    // reset transient UI bits
    setSkillSearch("");
    setError("");
    setMediaInputMethod("url");
    setDragActive(false);
  }, [isOpen, existingItem]);

  // Memoized callback functions to prevent re-creation on every render
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const uploadFiles = useCallback(async (files: FileList) => {
    setUploadingMedia(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          throw new Error(`Failed to upload ${files[i].name}`);
        }
        const data = await response.json();
        urls.push(data.url);
      }
      setMediaUrls((prev: string[]) => [...prev, ...urls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload media");
    } finally {
      setUploadingMedia(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (!files) return;
    await uploadFiles(files);
  }, [uploadFiles]);

  const handleMediaUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    await uploadFiles(files);
  }, [uploadFiles]);

  const addMediaUrl = useCallback(() => {
    const value = newMediaUrlRef.current?.value.trim();
    if (value) {
      setMediaUrls((prev: string[]) => [...prev, value]);
      if (newMediaUrlRef.current) newMediaUrlRef.current.value = "";
    }
  }, []);

  const removeMediaUrl = useCallback((index: number) => {
    setMediaUrls((prev: string[]) => prev.filter((_: string, i: number) => i !== index));
  }, []);

  const addLink = useCallback(() => {
    const value = newLinkRef.current?.value.trim();
    if (value) {
      setLinks((prev: string[]) => [...prev, value]);
      if (newLinkRef.current) newLinkRef.current.value = "";
    }
  }, []);

  const removeLink = useCallback((index: number) => {
    setLinks((prev: string[]) => prev.filter((_: string, i: number) => i !== index));
  }, []);

  const addTag = useCallback(() => {
    const value = newTagRef.current?.value.trim().toLowerCase();
    if (value) {
      setTags((prev: string[]) => [...prev, value]);
      if (newTagRef.current) newTagRef.current.value = "";
    }
  }, []);

  const removeTag = useCallback((index: number) => {
    setTags((prev: string[]) => prev.filter((_: string, i: number) => i !== index));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Get values from refs
    const title = titleRef.current?.value.trim() || "";
    const description = descriptionRef.current?.value.trim() || "";

    if (!title) {
      setError("Title is required");
      setLoading(false);
      return;
    }

    try {
      const method = existingItem ? "PUT" : "POST";
      const endpoint = existingItem
        ? `/api/portfolio/${existingItem.id}`
        : "/api/portfolio";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          links: links.join(", "),
          mediaUrls: mediaUrls.join(", "),
          tags: tags.join(", "),
          skillIds: selectedSkillIds,
          isPublic,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save portfolio item");
      }

      const data = await response.json();
      onSave(data.portfolioItem);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [links, mediaUrls, tags, selectedSkillIds, isPublic, existingItem, onSave]);

  const footer = (
    <div className="flex gap-3 justify-end">
      <Button variant="ghost" onClick={onClose} size="sm">
        Cancel
      </Button>
      <Button
        onClick={handleSubmit}
        disabled={loading || uploadingMedia}
        isLoading={loading}
        size="sm"
      >
        {existingItem ? "Update" : "Add Item"}
      </Button>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={existingItem ? "Edit Portfolio Item" : "Add Portfolio Item"}
      size="lg"
      footer={footer}
      contentClassName="px-5 py-4"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-medium mb-1.5 text-white/70">Title *</label>
          <input
            ref={titleRef}
            type="text"
            defaultValue={existingItem?.title || ""}
            placeholder="Project title"
            className={editorFieldClass}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium mb-1.5 text-white/70">Description</label>
          <textarea
            ref={descriptionRef}
            defaultValue={existingItem?.description || ""}
            placeholder="Tell us about this item..."
            rows={3}
            className={editorTextareaClass}
          />
        </div>

        {/* Media Section */}
        <div>
          <label className="block text-xs font-medium mb-2 text-white/70">Media</label>
          <div className="flex gap-1.5 mb-3">
            <Tooltip content="Add media via URL">
              <button
                type="button"
                onClick={() => setMediaInputMethod("url")}
                className={cn(segmentButtonClass,
                  mediaInputMethod === "url"
                    ? ui.active.cyanStrong
                    : "border-white/[0.08] bg-white/[0.025] text-white/50 hover:bg-white/[0.055] hover:text-white/80"
                )}
              >
                URL
              </button>
            </Tooltip>
            <Tooltip content="Upload files from device">
              <button
                type="button"
                onClick={() => setMediaInputMethod("upload")}
                className={cn(segmentButtonClass,
                  mediaInputMethod === "upload"
                    ? ui.active.cyanStrong
                    : "border-white/[0.08] bg-white/[0.025] text-white/50 hover:bg-white/[0.055] hover:text-white/80"
                )}
              >
                Upload
              </button>
            </Tooltip>
          </div>

          {mediaInputMethod === "url" ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  ref={newMediaUrlRef}
                  type="text"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addMediaUrl();
                    }
                  }}
                  placeholder="Paste image URL"
                  className={editorFieldClass}
                />
                <Tooltip content="Add URL">
                  <button
                    type="button"
                    onClick={addMediaUrl}
                    className={addButtonClass}
                  >
                    Add
                  </button>
                </Tooltip>
              </div>
              {mediaUrls.length > 0 && (
                <div className="space-y-1.5 max-h-24 overflow-y-auto">
                  {mediaUrls.map((url: string, idx: number) => (
                    <MediaUrlItem key={url} url={url} idx={idx} onRemove={removeMediaUrl} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`flex w-full cursor-pointer items-center justify-center rounded-lg border border-dashed px-3 py-4 transition-colors ${
                  dragActive
                    ? "border-[rgba(var(--color-accent-2-rgb),0.42)] bg-[rgba(var(--color-accent-2-rgb),0.10)]"
                    : "border-white/[0.14] bg-white/[0.025] hover:bg-white/[0.045]"
                }`}
              >
                <label className="text-center w-full cursor-pointer">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mx-auto mb-2 text-white/40">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-xs text-white/50">
                    {uploadingMedia ? "Uploading..." : "Drop files or click to upload"}
                  </p>
                  <input type="file" multiple accept="image/*,video/*" onChange={handleMediaUpload} disabled={uploadingMedia} className="hidden" />
                </label>
              </div>
              {mediaUrls.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {mediaUrls.map((url: string, idx: number) => (
                    <MediaPreview key={url} url={url} idx={idx} onRemove={removeMediaUrl} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Links */}
        <div>
          <label className="block text-xs font-medium mb-1.5 text-white/70">Links</label>
          <div className="flex gap-2 mb-2">
            <input
              ref={newLinkRef}
              type="text"
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLink(); } }}
              placeholder="Paste URL"
              className={editorFieldClass}
            />
            <Tooltip content="Add link">
              <button type="button" onClick={addLink} className={addButtonClass}>
                Add
              </button>
            </Tooltip>
          </div>
          {links.length > 0 && (
            <div className="space-y-1.5 max-h-20 overflow-y-auto">
              {links.map((link: string, idx: number) => (
                <LinkItem key={idx} link={link} idx={idx} onRemove={removeLink} />
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-medium mb-1.5 text-white/70">Tags</label>
          <div className="flex gap-2 mb-2">
            <input
              ref={newTagRef}
              type="text"
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
              placeholder="Type tag"
              className={editorFieldClass}
            />
            <Tooltip content="Add tag">
              <button type="button" onClick={addTag} className={addButtonClass}>
                Add
              </button>
            </Tooltip>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag: string, idx: number) => (
                <TagItem key={idx} tag={tag} idx={idx} onRemove={removeTag} />
              ))}
            </div>
          )}
        </div>

        {/* Skills */}
        {userSkills.length > 0 && (
          <div>
            <label className="block text-xs font-medium mb-1.5 text-white/70">
              Link to your skills
              <span className="text-white/40 font-normal"> (optional)</span>
            </label>
            <input
              type="text"
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              placeholder="Search your skills..."
              className={cn(editorFieldClass, "mb-2")}
            />
            <div className={surface("panelMuted", "max-h-40 overflow-y-auto rounded-lg")}>
              {userSkills
                .filter((us) => us.skill.name.toLowerCase().includes(skillSearch.toLowerCase()))
                .map((us) => {
                  const checked = selectedSkillIds.includes(us.skillId);
                  return (
                    <label
                      key={us.skillId}
                      className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/[0.045]"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setSelectedSkillIds((prev) =>
                            checked ? prev.filter((id) => id !== us.skillId) : [...prev, us.skillId]
                          );
                        }}
                        className="w-4 h-4 rounded cursor-pointer accent-[var(--color-accent)]"
                      />
                      <span className="flex-1">{us.skill.name}</span>
                      {us.isPrimary && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(var(--color-accent-2-rgb),0.12)] text-[var(--color-accent-2)] border border-[rgba(var(--color-accent-2-rgb),0.20)]">
                          Primary
                        </span>
                      )}
                    </label>
                  );
                })}
              {userSkills.filter((us) => us.skill.name.toLowerCase().includes(skillSearch.toLowerCase())).length === 0 && (
                <div className="px-3 py-3 text-xs text-white/40">No matching skills.</div>
              )}
            </div>
            {selectedSkillIds.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selectedSkillIds
                  .map((id) => userSkills.find((us) => us.skillId === id)?.skill?.name)
                  .filter(Boolean)
                  .map((name) => (
                    <span
                      key={name as string}
                      className="rounded-lg border border-white/[0.08] bg-white/[0.035] px-2 py-1 text-[10px] text-white/60"
                    >
                      {name}
                    </span>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Public Toggle */}
        <div className="flex items-center gap-2.5">
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="w-4 h-4 rounded cursor-pointer accent-[var(--color-accent)]"
          />
          <Tooltip content="When enabled, this item will be visible on your public profile">
            <label htmlFor="isPublic" className="text-xs font-medium cursor-pointer text-white/70">
              Make public
            </label>
          </Tooltip>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 rounded-lg text-[var(--color-accent)] text-xs">
            {error}
          </div>
        )}
      </form>
    </BaseModal>
  );
}
