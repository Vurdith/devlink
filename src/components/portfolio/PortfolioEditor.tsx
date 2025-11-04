
"use client";

import { useState, useCallback, useMemo, memo } from "react";
import { Button } from "@/components/ui/Button";

interface PortfolioEditorProps {
  onClose: () => void;
  onSave: (item: any) => void;
  existingItem?: any;
  userId: string;
}

// Memoized list item components for better performance
const MediaUrlItem = memo(({ url, idx, onRemove }: { url: string; idx: number; onRemove: (idx: number) => void }) => (
  <div className="flex items-center gap-3 p-3 bg-[var(--muted)]/20 rounded-md group hover:bg-[var(--muted)]/30 transition-colors">
    <span className="text-xs text-[var(--muted-foreground)] truncate flex-1">{url}</span>
    <button
      type="button"
      onClick={() => onRemove(idx)}
      className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors opacity-0 group-hover:opacity-100"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M18 6L6 18M6 6l12 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  </div>
));

const LinkItem = memo(({ link, idx, onRemove }: { link: string; idx: number; onRemove: (idx: number) => void }) => (
  <div className="flex items-center gap-3 p-3 bg-[var(--muted)]/20 rounded-md group hover:bg-[var(--muted)]/30 transition-colors">
    <span className="text-xs text-[var(--muted-foreground)] truncate flex-1">{link}</span>
    <button
      type="button"
      onClick={() => onRemove(idx)}
      className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors opacity-0 group-hover:opacity-100"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M18 6L6 18M6 6l12 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  </div>
));

const TagItem = memo(({ tag, idx, onRemove }: { tag: string; idx: number; onRemove: (idx: number) => void }) => (
  <div className="flex items-center gap-2 px-3 py-2 bg-[var(--accent)]/20 text-[var(--accent)] rounded-full border border-[var(--accent)]/30 group hover:border-[var(--accent)] transition-all">
    <span className="text-xs font-medium">#{tag}</span>
    <button
      type="button"
      onClick={() => onRemove(idx)}
      className="p-0.5 text-[var(--accent)] hover:bg-[var(--accent)]/30 rounded transition-colors opacity-0 group-hover:opacity-100"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M18 6L6 18M6 6l12 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  </div>
));

const MediaPreview = memo(({ url, idx, onRemove }: { url: string; idx: number; onRemove: (idx: number) => void }) => (
  <div className="relative group">
    <div className="aspect-square rounded-md overflow-hidden bg-[var(--muted)]/20 flex items-center justify-center">
      <img
        src={url}
        alt={`Preview ${idx + 1}`}
        className="w-full h-full object-cover"
        loading="lazy"
        onError={(e) => {
          const img = e.target as HTMLImageElement;
          img.style.display = "none";
        }}
      />
    </div>
    <button
      type="button"
      onClick={() => onRemove(idx)}
      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M18 6L6 18M6 6l12 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  </div>
));

export function PortfolioEditor({
  onClose,
  onSave,
  existingItem,
  userId,
}: PortfolioEditorProps) {
  const [title, setTitle] = useState(existingItem?.title || "");
  const [description, setDescription] = useState(
    existingItem?.description || ""
  );
  const [category, setCategory] = useState(existingItem?.category || "");
  const [links, setLinks] = useState(existingItem?.links ? existingItem.links.split(",").map((l: string) => l.trim()) : []);
  const [mediaUrls, setMediaUrls] = useState(existingItem?.mediaUrls ? existingItem.mediaUrls.split(",").map((m: string) => m.trim()) : []);
  const [tags, setTags] = useState(existingItem?.tags ? existingItem.tags.split(",").map((t: string) => t.trim()) : []);
  const [isPublic, setIsPublic] = useState(existingItem?.isPublic ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mediaInputMethod, setMediaInputMethod] = useState<"url" | "upload">("url");
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [newMediaUrl, setNewMediaUrl] = useState("");
  const [newLink, setNewLink] = useState("");
  const [newTag, setNewTag] = useState("");

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
    if (newMediaUrl.trim()) {
      setMediaUrls((prev: string[]) => [...prev, newMediaUrl.trim()]);
      setNewMediaUrl("");
    }
  }, [newMediaUrl]);

  const removeMediaUrl = useCallback((index: number) => {
    setMediaUrls((prev: string[]) => prev.filter((_: string, i: number) => i !== index));
  }, []);

  const addLink = useCallback(() => {
    if (newLink.trim()) {
      setLinks((prev: string[]) => [...prev, newLink.trim()]);
      setNewLink("");
    }
  }, [newLink]);

  const removeLink = useCallback((index: number) => {
    setLinks((prev: string[]) => prev.filter((_: string, i: number) => i !== index));
  }, []);

  const addTag = useCallback(() => {
    if (newTag.trim()) {
      setTags((prev: string[]) => [...prev, newTag.trim()]);
      setNewTag("");
    }
  }, [newTag]);

  const removeTag = useCallback((index: number) => {
    setTags((prev: string[]) => prev.filter((_: string, i: number) => i !== index));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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
          category,
          links: links.join(", "),
          mediaUrls: mediaUrls.join(", "),
          tags: tags.join(", "),
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
  }, [title, description, category, links, mediaUrls, tags, isPublic, existingItem, onSave]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[var(--card)] border border-purple-500/20 rounded-[var(--radius)] p-8 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold">
            {existingItem ? "Edit Portfolio Item" : "Add Portfolio Item"}
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-[var(--foreground)]">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Project title or achievement"
              className="w-full px-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-md text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-[var(--foreground)]">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 px-4 py-2 bg-[var(--input)] border-2 border-[var(--accent)]/40 rounded-md text-[var(--foreground)] font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] hover:border-[var(--accent)]/60 transition-all cursor-pointer"
            >
              <option value="" className="bg-[var(--card)]">Select a category</option>
              <option value="project" className="bg-[var(--card)]">Project</option>
              <option value="achievement" className="bg-[var(--card)]">Achievement</option>
              <option value="publication" className="bg-[var(--card)]">Publication</option>
              <option value="design" className="bg-[var(--card)]">Design</option>
              <option value="development" className="bg-[var(--card)]">Development</option>
              <option value="writing" className="bg-[var(--card)]">Writing</option>
              <option value="other" className="bg-[var(--card)]">Other</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-[var(--foreground)]">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us more about this item..."
              rows={5}
              className="w-full px-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-md text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 resize-none"
            />
          </div>

          {/* Media Section */}
          <div className="pt-2">
            <label className="block text-sm font-semibold mb-4 text-[var(--foreground)]">Media</label>
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setMediaInputMethod("url")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mediaInputMethod === "url"
                    ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                    : "bg-[var(--muted)]/30 text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50"
                }`}
              >
                Paste URLs
              </button>
              <button
                type="button"
                onClick={() => setMediaInputMethod("upload")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mediaInputMethod === "upload"
                    ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                    : "bg-[var(--muted)]/30 text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50"
                }`}
              >
                Upload Files
              </button>
            </div>

            {mediaInputMethod === "url" ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMediaUrl}
                    onChange={(e) => setNewMediaUrl(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addMediaUrl();
                      }
                    }}
                    placeholder="Paste image/video URL and press Enter"
                    className="flex-1 px-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-md text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                  />
                  <button
                    type="button"
                    onClick={addMediaUrl}
                    className="px-4 py-3 bg-[var(--accent)]/20 text-[var(--accent)] hover:bg-[var(--accent)]/30 rounded-md transition-colors font-medium"
                  >
                    Add
                  </button>
                </div>

                {/* Media URL List */}
                {mediaUrls.length > 0 && (
                  <div className="space-y-2 mt-4 max-h-48 overflow-y-auto">
                    {mediaUrls.map((url: string, idx: number) => (
                      <MediaUrlItem
                        key={idx}
                        url={url}
                        idx={idx}
                        onRemove={removeMediaUrl}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`flex items-center justify-center w-full px-4 py-8 border-2 border-dashed rounded-md cursor-pointer transition-colors ${
                    dragActive
                      ? "border-[var(--accent)] bg-[var(--accent)]/10"
                      : "border-[var(--border)] hover:bg-[var(--muted)]/20"
                  }`}
                >
                  <label className="text-center w-full cursor-pointer">
                    <div>
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="mx-auto mb-3 text-[var(--muted-foreground)]"
                      >
                        <path
                          d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="text-sm font-medium">
                        {uploadingMedia ? "Uploading..." : "Drag & drop or click to upload"}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">
                        PNG, JPG, GIF, MP4 up to 50MB
                      </p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleMediaUpload}
                      disabled={uploadingMedia}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Image Previews */}
                {mediaUrls.length > 0 && (
                  <div className="grid grid-cols-4 gap-3 mt-4">
                    {mediaUrls.map((url: string, idx: number) => (
                      <MediaPreview
                        key={idx}
                        url={url}
                        idx={idx}
                        onRemove={removeMediaUrl}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Links */}
          <div className="pt-2">
            <label className="block text-sm font-semibold mb-3 text-[var(--foreground)]">Links</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addLink();
                  }
                }}
                placeholder="Paste URL and press Enter"
                className="flex-1 px-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-md text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
              />
              <button
                type="button"
                onClick={addLink}
                className="px-4 py-3 bg-[var(--accent)]/20 text-[var(--accent)] hover:bg-[var(--accent)]/30 rounded-md transition-colors font-medium"
              >
                Add
              </button>
            </div>

            {/* Links List */}
            {links.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {links.map((link: string, idx: number) => (
                  <LinkItem
                    key={idx}
                    link={link}
                    idx={idx}
                    onRemove={removeLink}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="pt-2">
            <label className="block text-sm font-semibold mb-3 text-[var(--foreground)]">Tags</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value.toLowerCase())}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Type tag and press Enter"
                className="flex-1 px-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-md text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-3 bg-[var(--accent)]/20 text-[var(--accent)] hover:bg-[var(--accent)]/30 rounded-md transition-colors font-medium"
              >
                Add
              </button>
            </div>

            {/* Tags List */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: string, idx: number) => (
                  <TagItem
                    key={idx}
                    tag={tag}
                    idx={idx}
                    onRemove={removeTag}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Public Toggle */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer accent-[var(--accent)]"
            />
            <label htmlFor="isPublic" className="text-sm font-medium cursor-pointer">
              Make this item public
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-6 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 text-sm rounded-md border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition-colors font-medium"
            >
              Cancel
            </button>
            <Button type="submit" disabled={loading || uploadingMedia}>
              {loading ? "Saving..." : existingItem ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
