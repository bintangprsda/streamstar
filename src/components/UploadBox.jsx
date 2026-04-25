import React, { useState, useRef } from "react";
import { Upload } from "lucide-react";

const UploadBox = ({ onUploaded }) => {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const form = new FormData();
    form.append("video", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload", true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setProgress(percent);
      }
    };

    xhr.onload = () => {
      setProgress(0);
      setIsUploading(false);
      onUploaded?.();
      if (inputRef.current) inputRef.current.value = "";
    };

    xhr.onerror = () => {
      alert("Upload failed!");
      setIsUploading(false);
      setProgress(0);
    };

    xhr.send(form);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all group ${
        isUploading ? "border-emerald-500 bg-slate-800/30" : "border-slate-700 cursor-pointer hover:border-emerald-500/50 hover:bg-slate-800/30"
      }`}
      onClick={() => !isUploading && inputRef.current?.click()}
    >
      <div className="bg-slate-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
        <Upload className={`text-slate-400 ${isUploading ? "animate-bounce text-emerald-400" : "group-hover:text-emerald-400"}`} />
      </div>
      <div className="text-sm font-medium text-slate-300">
        {isUploading ? "Uploading..." : "Click to upload video"}
      </div>
      <div className="text-xs text-slate-500 mt-1">MP4, MOV or WEBM</div>
      {progress > 0 && (
        <div className="mt-4 max-w-xs mx-auto">
          <div className="text-xs text-emerald-400 mb-1">Progress: {progress}%</div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        hidden
        accept="video/*"
        onChange={handleUpload}
        disabled={isUploading}
      />
    </div>
  );
};

export default UploadBox;
