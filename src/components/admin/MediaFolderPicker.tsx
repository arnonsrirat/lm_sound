"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  ChevronDown,
} from "lucide-react";
import { moveMediaAction, type MediaItem, type MediaFolder } from "@/actions/media";
import { getOptimizedImageUrl } from "@/lib/media-url";

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
  { id: "audio", label: "คลังเสียงบรรยากาศ (Audio)", desc: "ไฟล์เสียง MP3, WAV, OGG, M4A และ WebM" },
  { id: "relaxation", label: "อัลบั้มเพลงผ่อนคลาย (Relaxation)", desc: "เพลงที่เลือกแสดงให้ผู้ใช้ฟังและให้คะแนน" },
];

type UploadBatchStatus = {
  total: number;
  completed: number;
  failed: number;
  active: number;
  progress: number;
  currentFile: string;
  phase: "uploading" | "processing" | "success" | "error";
  message: string;
};

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
  const [uploadStatus, setUploadStatus] = useState<UploadBatchStatus | null>(null);
  const [retryUploads, setRetryUploads] = useState<File[]>([]);
  const [lastUploadMeta, setLastUploadMeta] = useState({ note: "", timeTag: "" });
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
  // null = ค่าเริ่มต้นเปิดเฉพาะกลุ่มวันที่ล่าสุด ส่วน Set ใช้เก็บกลุ่มที่ผู้ใช้กางเอง
  const [expandedAlbumDates, setExpandedAlbumDates] = useState<Set<string> | null>(null);

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
    void fetch("/api/uploads/status", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setDriveReady(Boolean(data.success && data.data?.configured)))
      .catch(() => setDriveReady(false));
  }, []);

  const prepareImageForUpload = async (file: File) => {
    if (!file.type.startsWith("image/") || ["image/svg+xml", "image/gif"].includes(file.type) || typeof createImageBitmap === "undefined") return file;
    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
      if (!blob || blob.size >= file.size * 0.92) return file;
      return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, { type: "image/webp", lastModified: file.lastModified });
    } catch {
      return file;
    }
  };

  // พยายามแปลงเสียงขนาดใหญ่เป็น Opus/WebM บนเครื่องผู้ใช้ก่อนส่งไป R2
  // ถ้า browser หรือ codec ไม่รองรับ จะคืนไฟล์เดิมเพื่อไม่ให้การอัปโหลดล้มเหลว
  const prepareAudioForUpload = async (file: File) => {
    if (!file.type.startsWith("audio/") || file.size <= 10 * 1024 * 1024 || typeof window === "undefined") return file;
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass || typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) return file;
    let context: AudioContext | null = null;
    try {
      context = new AudioContextClass();
      const buffer = await context.decodeAudioData(await file.arrayBuffer());
      const destination = context.createMediaStreamDestination();
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(destination);
      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(destination.stream, { mimeType: "audio/webm;codecs=opus", audioBitsPerSecond: 96000 });
      const recording = new Promise<Blob>((resolve, reject) => {
        recorder.ondataavailable = (event) => { if (event.data.size > 0) chunks.push(event.data); };
        recorder.onerror = () => reject(new Error("AUDIO_COMPRESS_FAILED"));
        recorder.onstop = () => resolve(new Blob(chunks, { type: "audio/webm" }));
      });
      recorder.start(250);
      source.start();
      source.onended = () => recorder.stop();
      const compressed = await recording;
      if (compressed.size >= file.size * 0.92) return file;
      return new File([compressed], `${file.name.replace(/\.[^.]+$/, "")}.webm`, { type: "audio/webm", lastModified: file.lastModified });
    } catch {
      return file;
    } finally {
      await context?.close().catch(() => undefined);
    }
  };

  const prepareFileForUpload = async (file: File) => file.type.startsWith("audio/") ? prepareAudioForUpload(file) : prepareImageForUpload(file);

  const putToR2 = (uploadUrl: string, file: File, onProgress: (loaded: number) => void) => new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", uploadUrl);
    request.timeout = 120000;
    request.setRequestHeader("Content-Type", file.type);
    request.upload.onprogress = (event) => { if (event.lengthComputable) onProgress(event.loaded); };
    request.onerror = () => reject(new Error("NETWORK_ERROR"));
    request.ontimeout = () => reject(new Error("UPLOAD_TIMEOUT"));
    request.onabort = () => reject(new Error("UPLOAD_ABORTED"));
    request.onload = () => request.status >= 200 && request.status < 300 ? resolve() : reject(new Error(`R2_UPLOAD_${request.status}`));
    request.send(file);
  });

  const uploadFile = async (file: File, note = "", timeTag = "", onProgress?: (progress: number, phase: "uploading" | "processing") => void) => {
    try {
      const preparedFile = await prepareFileForUpload(file);
      const startResponse = await fetch("/api/uploads/presign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileName: file.name, folder: currentFolder, contentType: preparedFile.type, size: preparedFile.size }) });
      const startData = await startResponse.json() as { success?: boolean; data?: { uploadUrl: string; fileKey: string; uploadToken: string }; error?: string };
      if (!startResponse.ok || !startData.success || !startData.data) throw new Error(startData.error || "เริ่มอัปโหลดไม่สำเร็จ");
      let lastError: unknown;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          await putToR2(startData.data.uploadUrl, preparedFile, (loaded) => onProgress?.(Math.max(2, Math.min(99, Math.round((loaded / preparedFile.size) * 100))), "uploading"));
          lastError = null;
          break;
        } catch (error) {
          lastError = error;
          if (attempt < 2) await new Promise((resolve) => window.setTimeout(resolve, 600 * (attempt + 1)));
        }
      }
      if (lastError) throw lastError;
      const completeResponse = await fetch("/api/uploads/complete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileKey: startData.data.fileKey, originalName: file.name, contentType: preparedFile.type, size: preparedFile.size, folder: currentFolder, note, timeTag, uploadToken: startData.data.uploadToken }) });
      const completeData = await completeResponse.json() as { success?: boolean; data?: MediaItem; error?: string };
      if (!completeResponse.ok || !completeData.success || !completeData.data) throw new Error(completeData.error || "ยืนยันไฟล์ไม่สำเร็จ");
      onProgress?.(100, "processing");
      const uploadedItem = completeData.data;
      if (uploadedItem) {
        setItems((previous) => [uploadedItem, ...previous.filter((item) => item.url !== uploadedItem.url)]);
        if (onSelect && !multiSelect) onSelect(uploadedItem.url);
        if (multiSelect) setGallerySelection((previous) => previous.includes(uploadedItem.url) ? previous : [...previous, uploadedItem.url]);
      }
      return true;
    } catch {
      return false;
    }
  };

  const uploadFiles = async (files: File[], note = "", timeTag = "") => {
    if (files.length === 0) return;
    setIsUploading(true);
    setRetryUploads([]);
    setLastUploadMeta({ note, timeTag });
    const progressByFile = new Array(files.length).fill(0);
    const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;
    const concurrency = Math.min(isMobile ? 2 : 3, files.length);
    let cursor = 0;
    let succeeded = 0;
    let failed = 0;
    const messageFor = (completed: number, done = false, hasErrors = false) => {
      if (done) return hasErrors ? "เกือบเสร็จแล้ว เหลือบางไฟล์ให้ลองใหม่ได้" : "เสร็จแล้ว! ไฟล์ทั้งหมดพร้อมใช้งาน";
      if (completed === 0) return "กำลังเริ่มจัดคิวไฟล์ ไม่ต้องกดซ้ำครับ";
      if (completed / files.length < 0.3) return "เริ่มไปได้ดี กำลังทยอยส่งไฟล์ชุดแรก...";
      if (completed / files.length < 0.75) return "ไปได้ดีครับ ระบบกำลังอัปโหลดต่อให้อัตโนมัติ...";
      if (completed < files.length) return "ใกล้เสร็จแล้ว กำลังตรวจสอบไฟล์ที่เหลือ...";
      return "กำลังตรวจสอบไฟล์ชุดสุดท้าย...";
    };
    const updateProgress = (index: number, fileName: string, progress: number, phase: UploadBatchStatus["phase"]) => {
      progressByFile[index] = progress;
      const overallProgress = Math.min(100, Math.round(progressByFile.reduce((sum, value) => sum + value, 0) / files.length));
      setUploadStatus((previous) => previous ? { ...previous, progress: overallProgress, currentFile: fileName, phase, message: previous.message } : previous);
    };
    const worker = async () => {
      while (true) {
        const index = cursor++;
        if (index >= files.length) return;
        const file = files[index];
        setUploadStatus((previous) => previous ? { ...previous, active: previous.active + 1, currentFile: file.name } : previous);
        let uploaded = false;
        let lastProgressUpdate = 0;
        for (let attempt = 0; attempt < 3 && !uploaded; attempt += 1) {
          uploaded = await uploadFile(file, note, timeTag, (progress, phase) => {
            const now = Date.now();
            if (progress !== 100 && progress < progressByFile[index] + 4 && now - lastProgressUpdate < 120) return;
            lastProgressUpdate = now;
            updateProgress(index, file.name, progress, phase);
          });
          if (!uploaded && attempt < 2) await new Promise((resolve) => window.setTimeout(resolve, 500 * (attempt + 1)));
        }
        if (uploaded) {
          succeeded += 1;
          progressByFile[index] = 100;
        } else {
          failed += 1;
          setRetryUploads((previous) => [...previous, file]);
        }
        setUploadStatus((previous) => previous ? {
          ...previous,
          completed: previous.completed + 1,
          failed: previous.failed + (uploaded ? 0 : 1),
          active: Math.max(0, previous.active - 1),
          progress: Math.min(100, Math.round(progressByFile.reduce((sum, value) => sum + value, 0) / files.length)),
          currentFile: file.name,
          message: messageFor(previous.completed + 1),
        } : previous);
      }
    };
    try {
      setUploadStatus({ total: files.length, completed: 0, failed: 0, active: 0, progress: 0, currentFile: files[0].name, phase: "uploading", message: messageFor(0) });
      await Promise.all(Array.from({ length: concurrency }, () => worker()));
      const hasErrors = failed > 0;
      setUploadStatus((previous) => previous ? { ...previous, completed: files.length, failed, active: 0, progress: 100, phase: hasErrors ? "error" : "success", message: messageFor(files.length, true, hasErrors) } : previous);
      if (succeeded > 0) notify(`อัปโหลดสำเร็จ ${succeeded}/${files.length} ไฟล์${hasErrors ? " — ไฟล์ที่พลาดจะลองใหม่ได้" : ""}`);
      if (failed > 0) notify(`มี ${failed} ไฟล์อัปโหลดไม่สำเร็จ กดลองใหม่จากแถบสถานะได้`, true);
      await loadFiles(currentFolder);
    } finally {
      setIsUploading(false);
    }
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

  const albumGroups = useMemo(() => {
    const groups: Array<{ key: string; label: string; items: MediaItem[] }> = [];
    for (const item of items) {
      const date = new Date(item.updatedAt);
      const label = date.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
      const existing = groups.find((group) => group.key === label);
      if (existing) existing.items.push(item);
      else groups.push({ key: label, label, items: [item] });
    }
    return groups;
  }, [items]);

  const toggleAlbumDate = (key: string) => {
    setExpandedAlbumDates((current) => {
      const next = current ? new Set(current) : new Set(albumGroups.slice(0, 1).map((group) => group.key));
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const content = (
    <div className="space-y-6">
      {/* Header Info */}
      {driveReady === false && (
        <div className="rounded-2xl border border-amber-400/35 bg-amber-500/10 p-3 text-xs text-amber-100 flex items-center justify-between gap-3">
          <span>ยังไม่ได้ตั้งค่า Cloudflare R2 — กรุณาเพิ่มค่า R2 ใน production environment ก่อนอัปโหลด</span>
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
            accept={currentFolder === "audio" || currentFolder === "relaxation" ? "audio/mpeg,audio/wav,audio/ogg,audio/mp4" : "image/png,image/jpeg,image/webp,image/svg+xml,image/gif"}
             multiple
             className="hidden"
          />}
          {canManage && <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || driveReady === false}
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
          className={`pointer-events-none fixed right-4 top-4 z-[1300] w-[min(26rem,calc(100vw-2rem))] rounded-2xl border p-4 shadow-2xl backdrop-blur-xl transition-all ${
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
              <span className="truncate">{uploadStatus.message}</span>
            </div>
            <span className="shrink-0 tabular-nums">{uploadStatus.completed}/{uploadStatus.total}</span>
          </div>
          <div className="mt-1 truncate text-[11px] text-purple-100/70">กำลังทำงาน: {uploadStatus.currentFile}</div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/25">
            <div
              className={`h-full rounded-full transition-all duration-300 ${uploadStatus.phase === "error" ? "bg-rose-400" : uploadStatus.phase === "success" ? "bg-emerald-400" : "bg-cyan-400"}`}
              style={{ width: `${uploadStatus.progress}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-purple-100/70">
            <span>{uploadStatus.progress}% · ทำต่อได้ตามปกติ</span>
            <span>{uploadStatus.active > 0 ? `กำลังส่ง ${uploadStatus.active} ไฟล์` : "ตรวจสอบคิวแล้ว"}</span>
          </div>
          {uploadStatus.phase === "error" && retryUploads.length > 0 && (
            <button
              type="button"
              className="pointer-events-auto mt-3 w-full rounded-xl border border-rose-300/40 bg-rose-400/10 px-3 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-400/20"
              onClick={() => {
                const files = retryUploads;
                setRetryUploads([]);
                setUploadStatus(null);
                void uploadFiles(files, lastUploadMeta.note, lastUploadMeta.timeTag);
              }}
            >
              ลองใหม่เฉพาะ {retryUploads.length} ไฟล์ที่ไม่สำเร็จ
            </button>
          )}
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
          <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
            {albumGroups.map((group, groupIndex) => {
              const isExpanded = expandedAlbumDates === null ? groupIndex === 0 : expandedAlbumDates.has(group.key);
              return (
                <section key={group.key} className="overflow-hidden rounded-2xl border border-purple-500/15 bg-purple-950/10">
                  <button
                    type="button"
                    onClick={() => toggleAlbumDate(group.key)}
                    className="flex w-full items-center justify-between gap-3 border-b border-purple-500/15 px-3 py-2.5 text-left transition hover:bg-purple-900/25"
                    aria-expanded={isExpanded}
                  >
                    <span className="text-xs font-bold text-cyan-200">อัลบั้มวันที่ {group.label} <span className="font-normal text-purple-300/60">({group.items.length} รายการ)</span></span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-cyan-300 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </button>
                  {isExpanded && <div className="grid grid-cols-3 gap-2.5 p-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {group.items.map((item) => {
              const isSelected = multiSelect ? gallerySelection.includes(item.url) : selectedUrl === item.url;
              return (
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
                    {currentFolder === "audio" || currentFolder === "relaxation" ? (
                      <Music className="w-10 h-10 text-purple-300" />
                    ) : (
                      <img
                        src={getOptimizedImageUrl(item.url)}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
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
                      {item.folder === "relaxation" && canManage && <button type="button" onClick={async () => { const response = await fetch("/api/admin/media", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileUrl: item.url, note: item.note, timeTag: item.timeTag, isPublished: !item.isPublished }) }); const data = await response.json(); if (data.success) { setItems((previous) => previous.map((entry) => entry.url === item.url ? data.data : entry)); notify(data.data.isPublished ? "เผยแพร่เพลงแล้ว" : "ซ่อนเพลงแล้ว"); } }} className="mt-1 w-full rounded-lg border border-fuchsia-400/30 px-1 py-1 text-[10px] text-fuchsia-200">{item.isPublished ? "✓ แสดงในคลัง" : "ซ่อนอยู่ · กดเพื่อแสดง"}</button>}
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
              );
            })}
                  </div>}
                </section>
              );
            })}
          </div>
        )}
      </div>

      {pendingUpload && <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/70 p-4"><div className="w-full max-w-md rounded-2xl border border-cyan-400/35 bg-[#160b2b] p-5"><h4 className="font-bold text-cyan-100">เตรียมอัปโหลด {pendingUploads.length} ไฟล์</h4><p className="mt-1 truncate text-xs text-purple-200/70">{pendingUploads.map((file) => file.name).join(", ")}</p><input autoFocus value={uploadNote} onChange={(event) => setUploadNote(event.target.value)} maxLength={160} placeholder="โน้ต เช่น ภาพโซนอ่านหนังสือ" className="mt-4 w-full rounded-xl border border-purple-500/30 bg-purple-950/40 px-3 py-2.5 text-sm text-purple-100 outline-none focus:border-cyan-300" /><select value={uploadTimeTag} onChange={(event) => setUploadTimeTag(event.target.value)} className="mt-3 w-full rounded-xl border border-purple-500/30 bg-purple-950/40 px-3 py-2.5 text-sm text-purple-100 outline-none focus:border-cyan-300"><option value="">ไม่ระบุช่วงเวลา</option><option value="morning">เช้า</option><option value="afternoon">กลางวัน</option><option value="evening">เย็น</option><option value="night">กลางคืน</option><option value="all_day">ทั้งวัน</option></select><div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={() => { const files = pendingUploads; setPendingUpload(null); setPendingUploads([]); void uploadFiles(files, "", uploadTimeTag); }} className="rounded-xl border border-purple-500/30 px-3 py-2 text-xs text-purple-200 hover:bg-purple-900/30">ข้ามโน้ต</button><button type="button" onClick={() => { const files = pendingUploads; const note = uploadNote; const tag = uploadTimeTag; setPendingUpload(null); setPendingUploads([]); void uploadFiles(files, note, tag); }} className="rounded-xl bg-cyan-400 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300">อัปโหลดไฟล์</button></div></div></div>}

      {menuFor && <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/70 p-4" onClick={() => setMenuFor(null)}><div className="w-full max-w-xs rounded-2xl border border-purple-400/35 bg-[#160b2b] p-3 shadow-2xl" onClick={(event) => event.stopPropagation()}><p className="truncate px-3 py-2 text-xs font-semibold text-purple-100">{menuFor.name}</p><button type="button" onClick={() => { setMoveFor(menuFor); setMenuFor(null); }} className="w-full rounded-xl px-3 py-3 text-left text-sm text-purple-100 hover:bg-purple-700/25">ย้ายไปยังโฟลเดอร์</button><button type="button" onClick={() => { handleCopyUrl(menuFor.url); setMenuFor(null); }} className="w-full rounded-xl px-3 py-3 text-left text-sm text-purple-100 hover:bg-purple-700/25">คัดลอก URL</button><button type="button" onClick={() => { setEditingNote(menuFor.note || ""); setNoteFor(menuFor); setMenuFor(null); }} className="w-full rounded-xl px-3 py-3 text-left text-sm text-purple-100 hover:bg-purple-700/25">แก้ไขชื่อโน้ต</button><button type="button" onClick={() => setMenuFor(null)} className="w-full rounded-xl px-3 py-2 text-left text-xs text-purple-300 hover:bg-purple-900/30">ยกเลิก</button></div></div>}

      {noteFor && <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/70 p-4"><div className="w-full max-w-md rounded-2xl border border-cyan-400/35 bg-[#160b2b] p-5"><h4 className="font-bold text-cyan-100">แก้ไขชื่อโน้ต</h4><p className="mt-1 text-xs text-purple-200/70">ชื่อไฟล์จริงจะไม่ถูกเปลี่ยน</p><input autoFocus value={editingNote} onChange={(event) => setEditingNote(event.target.value)} maxLength={160} placeholder="ตั้งชื่อที่จำง่าย เช่น รูปหน้าแรก" className="mt-4 w-full rounded-xl border border-purple-500/30 bg-purple-950/40 px-3 py-2.5 text-sm text-purple-100 outline-none focus:border-cyan-300" /><div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={() => setNoteFor(null)} className="rounded-xl px-3 py-2 text-xs text-purple-300 hover:bg-purple-900/30">ยกเลิก</button><button type="button" onClick={() => void saveNote()} className="rounded-xl bg-cyan-400 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300">บันทึกโน้ต</button></div></div></div>}

      {previewFor && <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/80 p-4" onClick={() => setPreviewFor(null)}><div className="w-full max-w-3xl rounded-2xl border border-purple-400/35 bg-[#160b2b] p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="mb-3 flex items-center justify-between gap-3"><div className="min-w-0"><h4 className="truncate font-bold text-purple-100">{previewFor.note || previewFor.name}</h4><p className="truncate text-xs text-purple-300/60">{previewFor.name}</p></div><button type="button" onClick={() => setPreviewFor(null)} className="rounded-xl p-2 text-purple-300 hover:bg-purple-900/40"><X className="h-5 w-5" /></button></div>{previewFor.folder === "audio" || previewFor.folder === "relaxation" ? <audio controls autoPlay src={previewFor.url} className="w-full" /> : <img src={previewFor.url} alt={previewFor.note || previewFor.name} className="max-h-[70vh] w-full rounded-xl object-contain" />}</div></div>}

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
