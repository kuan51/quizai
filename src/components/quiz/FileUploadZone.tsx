"use client";

import { useState, useRef, useCallback } from "react";
import { UploadCloud, FileText, Image, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FILE_UPLOAD_LIMITS, IMAGE_MIME_TYPES } from "@/lib/validations";

interface FileUploadZoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxFileSizeBytes?: number;
  maxTotalSizeBytes?: number;
  maxImageFiles?: number;
  acceptedExtensions?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageFile(file: File): boolean {
  return (IMAGE_MIME_TYPES as readonly string[]).includes(file.type);
}

function getFileIcon(file: File) {
  if (isImageFile(file)) return Image;
  return FileText;
}

export function FileUploadZone({
  files,
  onFilesChange,
  maxFiles = FILE_UPLOAD_LIMITS.maxFiles,
  maxFileSizeBytes = FILE_UPLOAD_LIMITS.maxFileSizeBytes,
  maxTotalSizeBytes = FILE_UPLOAD_LIMITS.maxTotalSizeBytes,
  maxImageFiles = FILE_UPLOAD_LIMITS.maxImageFiles,
  acceptedExtensions = FILE_UPLOAD_LIMITS.acceptedExtensions,
}: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragCounterRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const imageCount = files.filter(isImageFile).length;

  const validateAndAddFiles = useCallback(
    (newFiles: FileList | File[]) => {
      setError(null);
      const incoming = Array.from(newFiles);
      const toAdd: File[] = [];

      for (const file of incoming) {
        // Check file count
        if (files.length + toAdd.length >= maxFiles) {
          setError(`Maximum ${maxFiles} files allowed`);
          break;
        }

        // Check file type
        const ext = file.name.toLowerCase().split(".").pop() || "";
        const allowedExts = acceptedExtensions.split(",").map((e) => e.replace(".", ""));
        if (!allowedExts.includes(ext)) {
          setError(
            `"${file.name}" is not a supported file type. Accepted: ${acceptedExtensions}`
          );
          continue;
        }

        // Check per-file size
        if (file.size > maxFileSizeBytes) {
          const maxMB = maxFileSizeBytes / (1024 * 1024);
          setError(`"${file.name}" exceeds ${maxMB} MB limit`);
          continue;
        }

        // Check aggregate size
        const newTotalSize =
          totalSize + toAdd.reduce((s, f) => s + f.size, 0) + file.size;
        if (newTotalSize > maxTotalSizeBytes) {
          const maxMB = maxTotalSizeBytes / (1024 * 1024);
          setError(`Total upload size would exceed ${maxMB} MB`);
          break;
        }

        // Check image count
        if (isImageFile(file)) {
          const newImageCount =
            imageCount + toAdd.filter(isImageFile).length + 1;
          if (newImageCount > maxImageFiles) {
            setError(`Maximum ${maxImageFiles} image files allowed`);
            continue;
          }
        }

        // Check for duplicates (same name + size)
        const isDuplicate = files.some(
          (f) => f.name === file.name && f.size === file.size
        );
        if (isDuplicate) {
          setError(`"${file.name}" has already been added`);
          continue;
        }

        toAdd.push(file);
      }

      if (toAdd.length > 0) {
        onFilesChange([...files, ...toAdd]);
      }
    },
    [
      files,
      onFilesChange,
      maxFiles,
      maxFileSizeBytes,
      maxTotalSizeBytes,
      maxImageFiles,
      acceptedExtensions,
      totalSize,
      imageCount,
    ]
  );

  const handleRemoveFile = useCallback(
    (index: number) => {
      setError(null);
      onFilesChange(files.filter((_, i) => i !== index));
    },
    [files, onFilesChange]
  );

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files);
    }
    // Reset input so the same file can be re-selected
    e.target.value = "";
  };

  return (
    <div>
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "w-full rounded-md border-2 border-dashed",
          "bg-[var(--surface)] dark:bg-stone-900",
          "transition-all duration-200",
          "flex flex-col items-center justify-center gap-3",
          "px-6 py-10",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
          // Idle state
          !isDragOver &&
            !error && [
              "border-stone-300 dark:border-stone-700",
              "text-stone-500 dark:text-stone-400",
              "cursor-pointer",
              "hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-950/30",
            ],
          // Dragover state
          isDragOver && [
            "border-primary-500",
            "bg-primary-50/50 dark:bg-primary-950/30",
            "ring-2 ring-primary-400/30",
            "cursor-copy",
            "text-primary-600 dark:text-primary-400",
          ],
          // Error state
          error &&
            !isDragOver && [
              "border-error",
              "bg-error-light/30",
              "text-error-dark",
              "cursor-pointer",
            ]
        )}
      >
        <UploadCloud
          className={cn(
            "h-10 w-10",
            isDragOver
              ? "text-primary-500"
              : "text-stone-400 dark:text-stone-500"
          )}
        />
        <div className="text-center">
          <p className="text-sm font-medium">
            {isDragOver
              ? "Drop files here"
              : "Drag files here or click to browse"}
          </p>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
            PDF, DOCX, TXT, MD, PNG, JPG (max{" "}
            {maxFileSizeBytes / (1024 * 1024)} MB each)
          </p>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={acceptedExtensions}
        onChange={handleInputChange}
        className="hidden"
        aria-hidden="true"
      />

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-error">{error}</p>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, index) => {
            const Icon = getFileIcon(file);
            return (
              <div
                key={`${file.name}-${file.size}-${index}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5",
                  "rounded-md border",
                  "border-[var(--border)] bg-[var(--surface)]",
                  "transition-all duration-200",
                  "group"
                )}
              >
                <Icon className="h-4 w-4 text-primary-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(index);
                  }}
                  className={cn(
                    "p-1 rounded-md transition-all duration-200",
                    "text-stone-400 hover:text-error hover:bg-error-light",
                    "opacity-0 group-hover:opacity-100 focus:opacity-100"
                  )}
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}

          {/* File counter */}
          <p className="text-sm text-stone-500 dark:text-stone-400">
            <span className="font-mono text-primary-500">{files.length}</span>{" "}
            of <span className="font-mono">{maxFiles}</span> files
            {imageCount > 0 && (
              <span className="ml-2 text-xs">
                ({imageCount}/{maxImageFiles} images)
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
