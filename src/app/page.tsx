"use client";
import Image from "next/image";
import { useRef, useState, useCallback } from "react";

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = async (file: File) => {
    setUploading(true);
    setMessage(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload-syllabus", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setMessage("Upload successful!");
      } else {
        const data = await res.json();
        setMessage(data.error || "Upload failed.");
      }
    } catch (err) {
      setMessage("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="relative min-h-screen bg-white flex flex-col justify-between font-sans text-black">
      {/* Top-left logo */}
      <div className="absolute top-8 left-8">
        <Image
          src="/logo.png"
          alt="SyncSyllabus logo"
          width={80}
          height={80}
          priority
        />
      </div>

      {/* Centered content */}
      <main className="flex flex-col items-center justify-center flex-1 text-center px-4 mt-16">
        <h1 className="text-8xl font-normal mb-2">SyncSyllabus</h1>
        <div className="h-6" />
        <p className="text-base mb-2">The Fastest Way to Sync Course Dates to Your Calendar</p>
        <div className="h-6" />
        <p className="text-sm mb-8">Drag & Drop Your .pdf or .docx or .txt File To Begin</p>
        {/* Upload area */}
        <div
          className={`mb-4 w-40 h-40 flex flex-col items-center justify-center rounded-xl cursor-pointer transition-colors bg-white`}
          onClick={() => inputRef.current?.click()}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <Image
            src="/upload.png"
            alt="Upload icon"
            width={96}
            height={96}
            priority
          />
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={handleChange}
            disabled={uploading}
          />
        </div>
        {uploading && <div className="text-blue-600">Uploading...</div>}
        {message && <div className="mt-2 text-green-600">{message}</div>}
      </main>

      {/* Footer */}
      <footer className="absolute bottom-8 left-8 text-sm">
        Powered by Google and Notion
      </footer>
    </div>
  );
}
