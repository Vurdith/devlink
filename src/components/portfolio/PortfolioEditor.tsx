
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
  <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white/5 rounded-lg group hover:bg-white/10 transition-colors">
    <span className="text-[11px] text-white/50 truncate flex-1">{url}</span>
    <button
      type="button"
      onClick={() => onRemove(idx)}
      className="p-0.5 text-red-400 hover:bg-red-500/20 rounded transition-colors opacity-0 group-hover:opacity-100"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  </div>
));

const LinkItem = memo(({ link, idx, onRemove }: { link: string; idx: number; onRemove: (idx: number) => void }) => (
  <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white/5 rounded-lg group hover:bg-white/10 transition-colors">
    <span className="text-[11px] text-white/50 truncate flex-1">{link}</span>
    <button
      type="button"
      onClick={() => onRemove(idx)}
      className="p-0.5 text-red-400 hover:bg-red-500/20 rounded transition-colors opacity-0 group-hover:opacity-100"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  </div>
));

const TagItem = memo(({ tag, idx, onRemove }: { tag: string; idx: number; onRemove: (idx: number) => void }) => (
  <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/15 text-purple-400 rounded-full border border-purple-500/30 group hover:border-purple-500/50 transition-all">
    <span className="text-[10px] font-medium">#{tag}</span>
    <button
      type="button"
      onClick={() => onRemove(idx)}
      className="p-0.5 text-purple-400 hover:bg-purple-500/30 rounded-full transition-colors opacity-0 group-hover:opacity-100"
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </button>
  </div>
));

const MediaPreview = memo(({ url, idx, onRemove }: { url: string; idx: number; onRemove: (idx: number) => void }) => (
  <div className="relative group">
    <div className="aspect-square rounded-lg overflow-hidden bg-white/5">
      <img
        src={url}
        alt={`Preview ${idx + 1}`}
        className="w-full h-full object-cover"
        loading="lazy"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
    </div>
    <button
      type="button"
      onClick={() => onRemove(idx)}
      className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0d0d12] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl shadow-black/50 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">
            {existingItem ? "Edit Portfolio Item" : "Add Portfolio Item"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Form - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium mb-1.5 text-white/70">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Project title"
              className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium mb-1.5 text-white/70">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Project, Design, Development"
              className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium mb-1.5 text-white/70">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about this item..."
              rows={3}
              className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
            />
          </div>

          {/* Media Section */}
          <div>
            <label className="block text-xs font-medium mb-2 text-white/70">Media</label>
            <div className="flex gap-1.5 mb-3">
              <button
                type="button"
                onClick={() => setMediaInputMethod("url")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  mediaInputMethod === "url"
                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                    : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
                }`}
              >
                URL
              </button>
              <button
                type="button"
                onClick={() => setMediaInputMethod("upload")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  mediaInputMethod === "upload"
                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                    : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
                }`}
              >
                Upload
              </button>
            </div>

            {mediaInputMethod === "url" ? (
              <div className="space-y-2">
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
                    placeholder="Paste image URL"
                    className="flex-1 px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={addMediaUrl}
                    className="px-3 py-2 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg transition-colors text-xs font-medium"
                  >
                    Add
                  </button>
                </div>
                {mediaUrls.length > 0 && (
                  <div className="space-y-1.5 max-h-24 overflow-y-auto">
                    {mediaUrls.map((url: string, idx: number) => (
                      <MediaUrlItem key={idx} url={url} idx={idx} onRemove={removeMediaUrl} />
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
                  className={`flex items-center justify-center w-full px-3 py-4 border border-dashed rounded-lg cursor-pointer transition-colors ${
                    dragActive
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-white/20 hover:bg-white/5"
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
                      <MediaPreview key={idx} url={url} idx={idx} onRemove={removeMediaUrl} />
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
                type="text"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                onKeyPress={(e) => { if (e.key === "Enter") { e.preventDefault(); addLink(); } }}
                placeholder="Paste URL"
                className="flex-1 px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
              <button type="button" onClick={addLink} className="px-3 py-2 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg transition-colors text-xs font-medium">
                Add
              </button>
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
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value.toLowerCase())}
                onKeyPress={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="Type tag"
                className="flex-1 px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
              <button type="button" onClick={addTag} className="px-3 py-2 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg transition-colors text-xs font-medium">
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag: string, idx: number) => (
                  <TagItem key={idx} tag={tag} idx={idx} onRemove={removeTag} />
                ))}
              </div>
            )}
          </div>

          {/* Public Toggle */}
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer accent-purple-500"
            />
            <label htmlFor="isPublic" className="text-xs font-medium cursor-pointer text-white/70">
              Make public
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
              {error}
            </div>
          )}
        </form>

        {/* Footer Actions */}
        <div className="flex gap-2 justify-end px-5 py-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs rounded-lg border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || uploadingMedia}
            className="px-4 py-2 text-xs rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all font-medium disabled:opacity-50"
          >
            {loading ? "Saving..." : existingItem ? "Update" : "Add Item"}
          </button>
        </div>
      </div>
    </div>
  );
}
