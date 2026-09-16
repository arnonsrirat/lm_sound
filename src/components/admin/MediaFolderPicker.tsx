"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Upload,
  Folder,
  FolderOpen,
  Music,
  Image as ImageIcon,
  Trash2,
  Check,
  Copy,
  Loader2,
  RefreshCw,
  X,
  FileImage,
  Sparkles,
  MoreVertical,
} from "lucide-react";
import { moveMediaAction, type MediaItem, type MediaFolder } from "@/actions/media";

interface MediaFolderPickerProps {
  onSelect?: (url: string) => void;
  onSelectMany?: (urls: string[]) => void;
  selectedUrl?: string;
  selectedUrls?: string[];
  multiSelect?: boolean;
  defaultFolder?: MediaFolder;
  isModal?: boolean;
  onClose?: () => void;
  canManage?: boolean;
  allowedFolder?: MediaFolder;
  targetTitle?: string; // e.g. "เลือกภาพสำหรับ โลโก้ (ธีมมืด)"
}

const FOLDERS: { id: MediaFolder; label: string; desc: string }[] = [
  { id: "logos", label: "โฟลเดอร์โลโก้ (Logos)", desc: "รูปโลโก้สำหรับธีมสว่างและมืด" },
  { id: "banners", label: "โฟลเดอร์แบนเนอร์ (Banners)", desc: "ภาพหัวเว็บ / Banner แนะนำ" },
  { id: "general", label: "คลังภาพทั่วไป (General)", desc: "รูปสปอตและสื่อประกอบอื่นๆ" },
  { id: "audio", label: "คลังเสียงบรรยากาศ (Audio)", desc: "ไฟล์เสียง MP3, WAV, OGG และ M4A" },
];

export default function MediaFolderPicker({
  onSelect,
  onSelectMany,
  selectedUrl,
  selectedUrls = [],
  multiSelect = false,
  defaultFolder = "logos",
  isModal = false,
  onClose,
  targetTitle,
  canManage = true,
  allowedFolder,
}: MediaFolderPickerProps) {
  const [currentFolder, setCurrentFolder] = useState<MediaFolder>(defaultFolder);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    fileName: string;
    progress: number;
    phase: "uploading" | "processing" | "success" | "error";
  } | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [moveFor, setMoveFor] = useState<MediaItem | null>(null);
  const [draggedItem, setDraggedItem] = useState<MediaItem | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<MediaFolder | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [deleteFor, setDeleteFor] = useState<MediaItem | null>(null);
  const [driveReady, setDriveReady] = useState<boolean | null>(null);
  const [pendingUpload, setPendingUpload] = useState<File | null>(null);
  const [pendingUploads, setPendingUploads] = useState<File[]>([]);
  const [uploadNote, setUploadNote] = useState("");
  const [uploadTimeTag, setUploadTimeTag] = useState("");
  const [gallerySelection, setGallerySelection] = useState<string[]>(selectedUrls);
  const [menuFor, setMenuFor] = useState<MediaItem | null>(null);
  const [previewFor, setPreviewFor] = useState<MediaItem | null>(null);
  const [noteFor, setNoteFor] = useState<MediaItem | null>(null);
  const [editingNote, setEditingNote] = useState("");

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

  const loadFiles = useCallback(async (folderToLoad: MediaFolder = currentFolder) => {
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
  }, [currentFolder]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadFiles(currentFolder), 0);
    return () => window.clearTimeout(timer);
  }, [currentFolder, loadFiles]);

  useEffect(() => {
    void fetch("/api/admin/google-drive/status", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setDriveReady(Boolean(data.success && data.data?.configured && data.data?.connected)))
      .catch(() => setDriveReady(false));
  }, []);

  const uploadFile = async (file: File, note = "", timeTag = "") => {

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", currentFolder);
    formData.append("note", note);
    formData.append("timeTag", timeTag);

    setIsUploading(true);
    setUploadStatus({ fileName: file.name, progress: 2, phase: "uploading" });
    try {
      const data = await new Promise<{
        success?: boolean;
        data?: MediaItem;
        error?: string;
      }>((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open("POST", "/api/admin/media");
        request.responseType = "json";
        request.upload.onprogress = (event) => {
          if (!event.lengthComputable) return;
          const progress = Math.max(2, Math.min(100, Math.round((event.loaded / event.total) * 100)));
          setUploadStatus({ fileName: file.name, progress, phase: progress === 100 ? "processing" : "uploading" });
        };
        request.onerror = () => reject(new Error("NETWORK_ERROR"));
        request.onload = () => {
          const response = request.response || (() => {
            try { return JSON.parse(request.responseText); } catch { return null; }
          })();
          if (request.status >= 200 && request.status < 300 && response) resolve(response);
          else reject(new Error(response?.error || "UPLOAD_FAILED"));
        };
        request.send(formData);
      });
      const uploadedItem = data.data;
      if (data.success && uploadedItem) {
        notify(`อัปโหลดรูป "${file.name}" เรียบร้อยแล้ว`);
        setItems((prev) => [uploadedItem, ...prev]);
        setUploadStatus({ fileName: file.name, progress: 100, phase: "success" });
        window.setTimeout(() => setUploadStatus(null), 3500);

        // Auto select if modal
        if (onSelect && !multiSelect) {
          onSelect(uploadedItem.url);
        } else if (multiSelect) {
          setGallerySelection((previous) => previous.includes(uploadedItem.url) ? previous : [...previous, uploadedItem.url]);
        }
      } else {
        setUploadStatus({ fileName: file.name, progress: 100, phase: "error" });
        window.setTimeout(() => setUploadStatus(null), 5000);
        notify(data.error || "อัปโหลดไม่สำเร็จ", true);
      }
    } catch {
      setUploadStatus({ fileName: file.name, progress: 100, phase: "error" });
      window.setTimeout(() => setUploadStatus(null), 5000);
      notify("เกิดข้อผิดพลาดในการอัปโหลด", true);
    } finally {
      setIsUploading(false);
    }
  };

  const uploadFiles = async (files: File[], note = "", timeTag = "") => {
    for (const file of files) await uploadFile(file, note, timeTag);
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (files.length === 0) return;
    setUploadNote("");
    setUploadTimeTag("");
    setPendingUploads(files);
    setPendingUpload(files[0]);
  };

  const toggleGallerySelection = (url: string) => {
    setGallerySelection((previous) => previous.includes(url) ? previous.filter((item) => item !== url) : [...previous, url]);
  };

  const saveNote = async () => {
    if (!noteFor) return;
    const response = await fetch("/api/admin/media", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl: noteFor.url, note: editingNote, timeTag: noteFor.timeTag ?? null }),
    });
    const data = await response.json();
    if (data.success && data.data) {
      setItems((previous) => previous.map((item) => item.url === noteFor.url ? data.data : item));
      notify("บันทึกโน้ตเรียบร้อยแล้ว");
      setNoteFor(null);
    } else {
      notify(data.error || "บันทึกโน้ตไม่สำเร็จ", true);
    }
  };

  const handleDelete = async (item: MediaItem) => {
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

  const moveItem = async (item: MediaItem, target: MediaFolder) => {
    setIsMoving(true);
    try {
      const result = await moveMediaAction(item.url, target);
      if (!result.success || !result.data) { notify(result.error || "ย้ายไฟล์ไม่สำเร็จ", true); return; }
      setItems((prev) => prev.filter((current) => current.url !== item.url));
      setMoveFor(null);
      notify("ย้ายไฟล์เรียบร้อยแล้ว");
    } finally {
      setIsMoving(false);
      setDragOverFolder(null);
      setDraggedItem(null);
    }
  };

  const handleMove = async (target: MediaFolder) => {
    if (!moveFor) return;
    await moveItem(moveFor, target);
  };

  const handleDropToFolder = (target: MediaFolder) => {
    if (!draggedItem || draggedItem.folder === target) return;
    void moveItem(draggedItem, target);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const content = (
    <div className="space-y-6">
      {/* Header Info */}
      {driveReady === false && (
        <div className="rounded-2xl border border-amber-400/35 bg-amber-500/10 p-3 text-xs text-amber-100 flex items-center justify-between gap-3">
          <span>ยังไม่ได้เชื่อมต่อ Google Drive — กรุณาเชื่อมต่อก่อนอัปโหลดหรือจัดการไฟล์</span>
          {!isModal && <a href="/api/admin/google-drive/connect" className="shrink-0 font-bold text-amber-200 underline">เชื่อมต่อ</a>}
        </div>
      )}
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
          {canManage && <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelected}
            accept={currentFolder === "audio" ? "audio/mpeg,audio/wav,audio/ogg,audio/mp4" : "image/png,image/jpeg,image/webp,image/svg+xml,image/gif"}
             multiple
             className="hidden"
          />}
          {canManage && <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || driveReady !== true}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold purple-gradient-btn shadow-lg shadow-purple-900/30 cursor-pointer disabled:opacity-60"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            อัปโหลดเข้า {currentFolder.toUpperCase()}
          </button>}

          <button
            type="button"
            onClick={() => loadFiles(currentFolder)}
            disabled={isLoading}
            className="p-2.5 rounded-2xl bg-purple-900/30 hover:bg-purple-600/20 border border-purple-500/20 text-purple-300 transition cursor-pointer"
            title="รีเฟรชโฟลเดอร์"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          {multiSelect && onSelectMany && (
            <button type="button" onClick={() => { onSelectMany(gallerySelection); onClose?.(); }} disabled={gallerySelection.length === 0} className="rounded-2xl bg-emerald-400 px-4 py-2.5 text-xs font-bold text-slate-950 disabled:opacity-50">
              ยืนยัน {gallerySelection.length} รูป
            </button>
          )}
        </div>
      </div>

      {uploadStatus && (
        <div
          role="status"
          aria-live="polite"
          className={`pointer-events-none fixed right-4 top-4 z-[1300] w-[min(24rem,calc(100vw-2rem))] rounded-2xl border p-4 shadow-2xl backdrop-blur-xl transition-all ${
            uploadStatus.phase === "success"
              ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
              : uploadStatus.phase === "error"
                ? "border-rose-400/40 bg-rose-500/10 text-rose-100"
                : "border-cyan-400/40 bg-cyan-500/10 text-cyan-50"
          }`}
        >
          <div className="flex items-center justify-between gap-3 text-xs font-semibold">
            <div className="flex min-w-0 items-center gap-2">
              {uploadStatus.phase === "success" ? <Check className="h-4 w-4 shrink-0" /> : uploadStatus.phase === "error" ? <X className="h-4 w-4 shrink-0" /> : <Loader2 className="h-4 w-4 shrink-0 animate-spin" />}
              <span className="truncate">
                {uploadStatus.phase === "success"
                  ? "อัปโหลดเรียบร้อย"
                  : uploadStatus.phase === "error"
                    ? "อัปโหลดไม่สำเร็จ"
                    : uploadStatus.phase === "processing"
                      ? "กำลังบันทึกไฟล์ลง Google Drive..."
                      : "กำลังอัปโหลดไฟล์..."}
                {" "}{uploadStatus.fileName}
              </span>
            </div>
            <span className="shrink-0 tabular-nums">{uploadStatus.progress}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/25">
            <div
              className={`h-full rounded-full transition-all duration-300 ${uploadStatus.phase === "error" ? "bg-rose-400" : uploadStatus.phase === "success" ? "bg-emerald-400" : "bg-cyan-400"}`}
              style={{ width: `${uploadStatus.progress}%` }}
            />
          </div>
        </div>
      )}

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
      {draggedItem && (
        <div className="rounded-2xl border border-cyan-400/40 bg-cyan-400/10 px-4 py-3 text-xs font-semibold text-cyan-100 flex items-center gap-2">
          <Sparkles className="h-4 w-4 animate-pulse" />
          กำลังย้าย “{draggedItem.name}” — ลากไปวางบนโฟลเดอร์ปลายทาง หรือเลือกปลายทางจากเมนูไฟล์
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(allowedFolder ? FOLDERS.filter((folder) => folder.id === allowedFolder) : FOLDERS).map((folder) => {
          const isActive = currentFolder === folder.id;
          return (
            <button
              key={folder.id}
              type="button"
              onClick={() => setCurrentFolder(folder.id)}
              onDragOver={(event) => { event.preventDefault(); if (draggedItem && draggedItem.folder !== folder.id) setDragOverFolder(folder.id); }}
              onDragLeave={() => setDragOverFolder(null)}
              onDrop={(event) => { event.preventDefault(); handleDropToFolder(folder.id); }}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                dragOverFolder === folder.id
                  ? "bg-cyan-400/20 border-cyan-300 ring-2 ring-cyan-300/40 scale-[1.02]"
                  : isActive
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
            <span className="text-[11px] text-purple-300/40">{multiSelect ? "เลือกได้หลายรูป แล้วกดยืนยัน" : "คลิกที่รูปเพื่อเลือกใช้งาน"}</span>
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
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5 max-h-[520px] overflow-y-auto pr-1">
            {items.map((item, index) => {
              const isSelected = multiSelect ? gallerySelection.includes(item.url) : selectedUrl === item.url;
              const albumDate = new Date(item.updatedAt).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
              const previousDate = index > 0 ? new Date(items[index - 1].updatedAt).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" }) : null;
              return (
                <React.Fragment key={item.url}>
                {albumDate !== previousDate && <div className="col-span-full border-b border-purple-500/20 pb-2 pt-2 text-xs font-bold text-cyan-200">อัลบั้มวันที่ {albumDate}</div>}
                <div
                  key={item.url}
                  draggable={canManage}
                  onDragStart={() => setDraggedItem(item)}
                  onDragEnd={() => { setDraggedItem(null); setDragOverFolder(null); }}
                  className={`group relative rounded-2xl border transition-all overflow-hidden flex flex-col bg-purple-950/40 ${
                    isSelected
                      ? "border-emerald-400 ring-2 ring-emerald-400/30 shadow-lg"
                      : "border-purple-500/20 hover:border-purple-400/50 hover:bg-purple-900/30"
                  }`}
                >
                  {/* Thumbnail */}
                  <div
                    className="relative aspect-square w-full overflow-hidden bg-black/40 flex items-center justify-center cursor-zoom-in"
                    onClick={() => setPreviewFor(item)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {currentFolder === "audio" ? (
                      <Music className="w-10 h-10 text-purple-300" />
                    ) : (
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}

                    {/* Active Selected Badge */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-md">
                        <Check className="w-3 h-3" />
                        ใช้อยู่
                      </div>
                    )}
                  </div>

                  {/* Details & Actions */}
                  <div className="p-2 flex-1 flex flex-col justify-between gap-1.5">
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
                      <p className="text-[10px] text-purple-300/50 mt-0.5">อัลบั้ม {new Date(item.updatedAt).toLocaleDateString("th-TH")}</p>
                      {item.timeTag && <p className="mt-1 text-[10px] text-fuchsia-200/80">ช่วงเวลา: {item.timeTag}</p>}
                      {item.note && <p className="mt-1 line-clamp-1 text-[10px] text-cyan-200/75" title={item.note}>{item.note}</p>}
                    </div>

                    <div className="flex items-center gap-1 pt-1 border-t border-purple-500/15">
                      {canManage && <button type="button" onClick={() => setMenuFor(item)} className="p-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-600/30 text-purple-300 transition cursor-pointer" title="ตัวเลือกไฟล์"><MoreVertical className="w-3.5 h-3.5" /></button>}
                      {onSelect && (
                        <button
                          type="button"
                          onClick={() => multiSelect ? toggleGallerySelection(item.url) : onSelect(item.url)}
                          className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-semibold transition cursor-pointer flex items-center justify-center gap-1 ${
                            isSelected
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                              : "purple-gradient-btn text-white"
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                            {isSelected ? "เลือกแล้ว" : multiSelect ? "เพิ่มรูปนี้" : "เลือกรูปนี้"}
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

                      {canManage && <button
                        type="button"
                        onClick={() => setDeleteFor(item)}
                        className="p-1.5 rounded-xl bg-rose-950/30 hover:bg-rose-600/30 text-rose-300/80 hover:text-rose-300 transition cursor-pointer"
                        title="ลบไฟล์ออกจากเซิร์ฟเวอร์"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>}
                    </div>
                  </div>
                </div>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {pendingUpload && <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/70 p-4"><div className="w-full max-w-md rounded-2xl border border-cyan-400/35 bg-[#160b2b] p-5"><h4 className="font-bold text-cyan-100">เตรียมอัปโหลด {pendingUploads.length} ไฟล์</h4><p className="mt-1 truncate text-xs text-purple-200/70">{pendingUploads.map((file) => file.name).join(", ")}</p><input autoFocus value={uploadNote} onChange={(event) => setUploadNote(event.target.value)} maxLength={160} placeholder="โน้ต เช่น ภาพโซนอ่านหนังสือ" className="mt-4 w-full rounded-xl border border-purple-500/30 bg-purple-950/40 px-3 py-2.5 text-sm text-purple-100 outline-none focus:border-cyan-300" /><select value={uploadTimeTag} onChange={(event) => setUploadTimeTag(event.target.value)} className="mt-3 w-full rounded-xl border border-purple-500/30 bg-purple-950/40 px-3 py-2.5 text-sm text-purple-100 outline-none focus:border-cyan-300"><option value="">ไม่ระบุช่วงเวลา</option><option value="morning">เช้า</option><option value="afternoon">กลางวัน</option><option value="evening">เย็น</option><option value="night">กลางคืน</option><option value="all_day">ทั้งวัน</option></select><div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={() => { const files = pendingUploads; setPendingUpload(null); setPendingUploads([]); void uploadFiles(files, "", uploadTimeTag); }} className="rounded-xl border border-purple-500/30 px-3 py-2 text-xs text-purple-200 hover:bg-purple-900/30">ข้ามโน้ต</button><button type="button" onClick={() => { const files = pendingUploads; const note = uploadNote; const tag = uploadTimeTag; setPendingUpload(null); setPendingUploads([]); void uploadFiles(files, note, tag); }} className="rounded-xl bg-cyan-400 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300">อัปโหลดไฟล์</button></div></div></div>}

      {menuFor && <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/70 p-4" onClick={() => setMenuFor(null)}><div className="w-full max-w-xs rounded-2xl border border-purple-400/35 bg-[#160b2b] p-3 shadow-2xl" onClick={(event) => event.stopPropagation()}><p className="truncate px-3 py-2 text-xs font-semibold text-purple-100">{menuFor.name}</p><button type="button" onClick={() => { setMoveFor(menuFor); setMenuFor(null); }} className="w-full rounded-xl px-3 py-3 text-left text-sm text-purple-100 hover:bg-purple-700/25">ย้ายไปยังโฟลเดอร์</button><button type="button" onClick={() => { handleCopyUrl(menuFor.url); setMenuFor(null); }} className="w-full rounded-xl px-3 py-3 text-left text-sm text-purple-100 hover:bg-purple-700/25">คัดลอก URL</button><button type="button" onClick={() => { setEditingNote(menuFor.note || ""); setNoteFor(menuFor); setMenuFor(null); }} className="w-full rounded-xl px-3 py-3 text-left text-sm text-purple-100 hover:bg-purple-700/25">แก้ไขชื่อโน้ต</button><button type="button" onClick={() => setMenuFor(null)} className="w-full rounded-xl px-3 py-2 text-left text-xs text-purple-300 hover:bg-purple-900/30">ยกเลิก</button></div></div>}

      {noteFor && <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/70 p-4"><div className="w-full max-w-md rounded-2xl border border-cyan-400/35 bg-[#160b2b] p-5"><h4 className="font-bold text-cyan-100">แก้ไขชื่อโน้ต</h4><p className="mt-1 text-xs text-purple-200/70">ชื่อไฟล์จริงจะไม่ถูกเปลี่ยน</p><input autoFocus value={editingNote} onChange={(event) => setEditingNote(event.target.value)} maxLength={160} placeholder="ตั้งชื่อที่จำง่าย เช่น รูปหน้าแรก" className="mt-4 w-full rounded-xl border border-purple-500/30 bg-purple-950/40 px-3 py-2.5 text-sm text-purple-100 outline-none focus:border-cyan-300" /><div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={() => setNoteFor(null)} className="rounded-xl px-3 py-2 text-xs text-purple-300 hover:bg-purple-900/30">ยกเลิก</button><button type="button" onClick={() => void saveNote()} className="rounded-xl bg-cyan-400 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300">บันทึกโน้ต</button></div></div></div>}

      {previewFor && <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/80 p-4" onClick={() => setPreviewFor(null)}><div className="w-full max-w-3xl rounded-2xl border border-purple-400/35 bg-[#160b2b] p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="mb-3 flex items-center justify-between gap-3"><div className="min-w-0"><h4 className="truncate font-bold text-purple-100">{previewFor.note || previewFor.name}</h4><p className="truncate text-xs text-purple-300/60">{previewFor.name}</p></div><button type="button" onClick={() => setPreviewFor(null)} className="rounded-xl p-2 text-purple-300 hover:bg-purple-900/40"><X className="h-5 w-5" /></button></div>{previewFor.folder === "audio" ? <audio controls autoPlay src={previewFor.url} className="w-full" /> : <img src={previewFor.url} alt={previewFor.note || previewFor.name} className="max-h-[70vh] w-full rounded-xl object-contain" />}</div></div>}

      {deleteFor && <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/70 p-4"><div className="w-full max-w-sm rounded-2xl border border-rose-400/30 bg-[#160b2b] p-5 text-center"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/15 text-rose-300"><Trash2 className="h-5 w-5" /></div><h4 className="font-bold text-purple-100">ยืนยันการลบไฟล์</h4><p className="mt-2 break-all text-xs text-purple-200/70">“{deleteFor.name}” จะถูกลบออกจากคลัง</p><div className="mt-5 grid grid-cols-2 gap-2"><button type="button" onClick={() => setDeleteFor(null)} className="rounded-xl px-3 py-2 text-xs text-purple-300 hover:bg-purple-900/30 cursor-pointer">ยกเลิก</button><button type="button" onClick={() => { const item = deleteFor; setDeleteFor(null); void handleDelete(item); }} className="rounded-xl bg-rose-500 px-3 py-2 text-xs font-bold text-white hover:bg-rose-400 cursor-pointer">ลบไฟล์</button></div></div></div>}

      {moveFor && <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/70 p-4" onClick={() => !isMoving && setMoveFor(null)}><div className="w-full max-w-sm rounded-2xl border border-cyan-400/35 bg-[#160b2b] p-5" onClick={(event) => event.stopPropagation()}><div className="flex items-center gap-2 text-cyan-200"><FolderOpen className="h-5 w-5" /><h4 className="font-semibold">ย้ายไฟล์ไปโฟลเดอร์</h4></div><p className="mt-2 truncate text-xs text-purple-200/70">กำลังเลือกปลายทางให้ “{moveFor.name}”</p><div className="mt-4 grid grid-cols-2 gap-2">{FOLDERS.filter((folder) => folder.id !== moveFor.folder).map((folder) => <button key={folder.id} type="button" disabled={isMoving} onClick={() => void handleMove(folder.id)} className="rounded-xl border border-purple-500/25 bg-purple-900/30 px-3 py-2 text-left text-xs text-purple-100 hover:bg-cyan-500/20 hover:border-cyan-300/50 cursor-pointer disabled:opacity-50">{isMoving ? "กำลังย้าย…" : folder.label}</button>)}</div><button type="button" disabled={isMoving} onClick={() => setMoveFor(null)} className="mt-4 w-full rounded-xl px-3 py-2 text-xs text-purple-300 hover:bg-purple-900/30 cursor-pointer disabled:opacity-50">ยกเลิก</button></div></div>}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
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
