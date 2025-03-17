import React, { useRef } from "react";
import { Plus, Link } from "lucide-react";


interface MediaUploaderProps {
  onComplete: (files: string[]) => void;
}

const MediaUploader = ({ onComplete }: MediaUploaderProps) => {
  

  const [urlInput, setUrlInput] = React.useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const urls = files.map((file) => URL.createObjectURL(file));
    onComplete(urls);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onComplete([urlInput.trim()]);
      setUrlInput("");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="image-upload"
          className={`block p-4 rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
             "border-gray-300 hover:border-gray-400"
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <Plus
              className={`w-6 h-6 ${
                 "text-gray-400"
              }`}
            />
            <span
              className={`text-sm ${
                 "text-gray-600"
              }`}
            >
              Upload from device
            </span>
          </div>
          <input
            ref={fileInputRef}
            id="image-upload"
            type="file"
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
            multiple
          />
        </label>
      </div>

      <div className="relative">
        <form onSubmit={handleUrlSubmit} className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Enter media URL..."
            className={`flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
               "bg-white border-gray-200 text-theme-light-primary"
            }`}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <Link className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MediaUploader;
