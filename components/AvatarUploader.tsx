// components/AvatarUploader.tsx
"use client";

import React, { useCallback, useRef, useState } from "react";

interface AvatarUploaderProps {
  initialUrl?: string | null;
  onChange?: (base64: string, filename: string, contentType: string) => Promise<void> | void;
  size?: number;
}

export default function AvatarUploader({ initialUrl = null, onChange, size = 128 }: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(initialUrl);

  const handleFile = useCallback(async (file: File) => {
    const img = document.createElement("img");
    const url = URL.createObjectURL(file);
    img.src = url;
    await new Promise((res) => { img.onload = res; });
    // center crop square
    const minSide = Math.min(img.width, img.height);
    const sx = Math.floor((img.width - minSide) / 2);
    const sy = Math.floor((img.height - minSide) / 2);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        setPreview(canvas.toDataURL());
        if (onChange) onChange(base64, file.name, file.type);
      };
      reader.readAsDataURL(blob);
    }, file.type || "image/png");
    URL.revokeObjectURL(url);
  }, [onChange, size]);

  return (
    <div>
      <div className="flex items-center gap-4">
        <div
          className="w-20 h-20 rounded-full bg-gray-800 overflow-hidden flex items-center justify-center"
          style={{ width: `${size / 2}px`, height: `${size / 2}px` }}
        >
          {preview ? (
            <img src={preview} alt="avatar preview" className="w-full h-full object-cover" />
          ) : (
            <div className="text-sm text-gray-400">No avatar</div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            className="px-3 py-2 rounded border border-gray-700"
            onClick={() => inputRef.current?.click()}
          >
            Choose file
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      </div>
    </div>
  );
}
