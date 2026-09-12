"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  Folder,
  FolderOpen,
  Image as ImageIcon,
  Trash2,
  Check,
  Copy,
  Loader2,
  RefreshCw,
  X,
  FileImage,
  Sparkles,
} from "lucide-react";
import type { MediaItem, MediaFolder } from "@/actions/media";

interface MediaFolderPickerProps {
  onSelect?: (url: string) => void;
  selectedUrl?: string;
  defaultFolder?: MediaFolder;
  isModal?: boolean;
  onClose?: () => void;
  targetTitle?: string; // e.g. "เลือกภาพสำหรับ โลโก้ (ธีมมืด)"
}

const FOLDERS: { id: MediaFolder; label: string; desc: string }[] = [
  { id: "logos", label: "โฟลเดอร์โลโก้ (Logos)", desc: "รูปโลโก้สำหรับธีมสว่างและมืด" },
  { id: "banners", label: "โฟลเดอร์แบนเนอร์ (Banners)", desc: "ภาพหัวเว็บ / Banner แนะนำ" },
  { id: "general", label: "คลังภาพทั่วไป (General)", desc: "รูปสปอตและสื่อประกอบอื่นๆ" },
];

export default function MediaFolderPicker({
  onSelect,
  selectedUrl,
  defaultFolder = "logos",
  isModal = false,
  onClose,
  targetTitle,
}: MediaFolderPickerProps) {
  const [currentFolder, setCurrentFolder] = useState<MediaFolder>(defaultFolder);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const notify = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 4000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const loadFiles = async (folderToLoad = currentFolder) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/media?folder=${folderToLoad}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setItems(data.data);
      } else {
        setItems([]);
      }
    } catch {
      notify("ไม่สามารถโหลดรายการรูปภาพได้", true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFiles(currentFolder);
  }, [currentFolder]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so re-selecting same file works
    e.target.value = "";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", currentFolder);

    setIsUploading(true);
    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.data) {
        notify(`อัปโหลดรูป "${file.name}" เรียบร้อยแล้ว`);
        setItems((prev) => [data.data, ...prev]);

        // Auto select if modal
        if (onSelect) {
          onSelect(data.data.url);
        }
      } else {
        notify(data.error || "อัปโหลดไม่สำเร็จ", true);
      }
    } catch {
      notify("เกิดข้อผิดพลาดในการอัปโหลด", true);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (item: MediaItem) => {
    if (!confirm(`ยืนยันการลบไฟล์ "${item.name}" ออกจากโฟลเดอร์หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/admin/media?fileUrl=${encodeURIComponent(item.url)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) => prev.filter((i) => i.url !== item.url));
        notify("ลบไฟล์เรียบร้อยแล้ว");
      } else {
        notify(data.error || "ลบไฟล์ไม่สำเร็จ", true);
      }
    } catch {
      notify("เกิดข้อผิดพลาดในการลบไฟล์", true);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
    notify("คัดลอก URL แล้ว");
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const content = (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-lg text-purple-100 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-purple-400" />
            {targetTitle || "คลังรูปภาพและโฟลเดอร์จัดเก็บ"}
          </h3>
          <p className="text-xs text-purple-300/60 mt-0.5">
            อัปโหลดและเลือกรูปภาพไปใช้งานได้ทันทีโดยไม่ต้องจำ URL
          </p>
        </div>

        {/* Upload Button */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold purple-gradient-btn shadow-lg shadow-purple-900/30 cursor-pointer disabled:opacity-60"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            อัปโหลดเข้า {currentFolder.toUpperCase()}
          </button>

          <button
            type="button"
            onClick={() => loadFiles(currentFolder)}
            disabled={isLoading}
            className="p-2.5 rounded-2xl bg-purple-900/30 hover:bg-purple-600/20 border border-purple-500/20 text-purple-300 transition cursor-pointer"
            title="รีเฟรชโฟลเดอร์"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
          <X className="w-4 h-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Folder Selection Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {FOLDERS.map((folder) => {
          const isActive = currentFolder === folder.id;
          return (
            <button
              key={folder.id}
              type="button"
              onClick={() => setCurrentFolder(folder.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                isActive
                  ? "bg-purple-600/20 border-purple-400/60 shadow-md shadow-purple-950/40"
                  : "bg-purple-950/20 border-purple-500/20 hover:bg-purple-600/10 text-purple-200/70"
              }`}
            >
              <div
                className={`p-2 rounded-xl shrink-0 ${
                  isActive ? "bg-purple-500 text-white" : "bg-purple-900/40 text-purple-300"
                }`}
              >
                {isActive ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-xs font-bold truncate ${
                    isActive ? "text-purple-100" : "text-purple-200"
                  }`}
                >
                  {folder.label}
                </p>
                <p className="text-[10px] text-purple-300/50 line-clamp-1 mt-0.5">
                  {folder.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Media Grid */}
      <div className="rounded-3xl border border-purple-500/20 bg-purple-950/20 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3 text-xs text-purple-300/70">
          <span>
            ไฟล์ในโฟลเดอร์ <strong>uploads/{currentFolder}/</strong> ({items.length} รายการ)
          </span>
          <span className="text-[11px] text-purple-300/40">คลิกที่รูปเพื่อเลือกใช้งาน</span>
        </div>

        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-purple-300/60">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            <span className="text-xs">กำลังสแกนไฟล์ในโฟลเดอร์...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-purple-500/20 rounded-2xl bg-purple-950/10">
            <FileImage className="w-10 h-10 mx-auto text-purple-400/40 mb-2" />
            <p className="text-sm font-semibold text-purple-200/80">
              ยังไม่มีไฟล์ในโฟลเดอร์ {currentFolder}
            </p>
            <p className="text-xs text-purple-300/50 mt-1 max-w-sm mx-auto">
              กดปุ่ม &ldquo;อัปโหลดเข้า {currentFolder.toUpperCase()}&rdquo; ด้านบน
              เพื่อเพิ่มภาพใหม่เข้าสู่ระบบ
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 max-h-[420px] overflow-y-auto pr-1">
            {items.map((item) => {
              const isSelected = selectedUrl === item.url;
              return (
                <div
                  key={item.url}
                  className={`group relative rounded-2xl border transition-all overflow-hidden flex flex-col bg-purple-950/40 ${
                    isSelected
                      ? "border-emerald-400 ring-2 ring-emerald-400/30 shadow-lg"
                      : "border-purple-500/20 hover:border-purple-400/50 hover:bg-purple-900/30"
                  }`}
                >
                  {/* Thumbnail */}
                  <div
                    className="relative aspect-video sm:aspect-square w-full overflow-hidden bg-black/40 flex items-center justify-center cursor-pointer"
                    onClick={() => onSelect && onSelect(item.url)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Active Selected Badge */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-md">
                        <Check className="w-3 h-3" />
                        ใช้อยู่
                      </div>
                    )}
                  </div>

                  {/* Details & Actions */}
                  <div className="p-2.5 flex-1 flex flex-col justify-between gap-2">
                    <div>
                      <p
                        className="text-xs font-medium text-purple-100 truncate"
                        title={item.name}
                      >
                        {item.name}
                      </p>
                      <p className="text-[10px] text-purple-300/50 mt-0.5">
                        {formatSize(item.size)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 pt-1 border-t border-purple-500/15">
                      {onSelect && (
                        <button
                          type="button"
                          onClick={() => onSelect(item.url)}
                          className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-semibold transition cursor-pointer flex items-center justify-center gap-1 ${
                            isSelected
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                              : "purple-gradient-btn text-white"
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                          {isSelected ? "เลือกแล้ว" : "เลือกรูปนี้"}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleCopyUrl(item.url)}
                        className="p-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-600/30 text-purple-300 transition cursor-pointer"
                        title="คัดลอก URL"
                      >
                        {copiedUrl === item.url ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="p-1.5 rounded-xl bg-rose-950/30 hover:bg-rose-600/30 text-rose-300/80 hover:text-rose-300 transition cursor-pointer"
                        title="ลบไฟล์ออกจากเซิร์ฟเวอร์"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto glass-panel rounded-3xl p-6 shadow-2xl border border-purple-500/30">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-purple-900/40 text-purple-300 hover:text-white hover:bg-purple-600/30 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          {content}
        </div>
      </div>
    );
  }

  return content;
}
