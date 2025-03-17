import React, { useEffect } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button"; // Import shadcn Button
import { cn } from "@/lib/utils"; // Import shadcn utility for class merging
import { type Platform } from "./types";

interface PostPreviewProps {
  content: string;
  images: MediaItem[];
  tags: string[];
  platform: Platform;
  isOpen: boolean;
}
interface MediaItem {
  id: string;
  type: "image" | "video";
  preview: string;
  file?: File;
  unsplashId?: string;
  aiGenerated?: boolean;
  objectUrl?: string;
}

const PostPreview = ({
  content,
  images,
  tags,
  platform,
  isOpen,
}: PostPreviewProps) => {
  
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);
  const platformStyles = {
    Facebook: "from-blue-400 to-blue-600",
    instagram: "from-purple-400 to-pink-600",
    linkedin: "from-blue-600 to-blue-800",
  };

  const user = {
    name: "Your Name",
    username: "yourhandle",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&q=80",
  };

  const renderMediaGrid = () => {
    if (images.length === 0) return null;

    const gridStyles =
      {
        1: "grid-cols-1",
        2: "grid-cols-2",
        3: "grid-cols-2",
        4: "grid-cols-2",
      }[Math.min(images.length, 4)] || "grid-cols-2";

    return (
      <div className={`grid ${gridStyles} gap-2 mb-4`}>
        {images.slice(0, 4).map((mediaUrl, index) => (
          <div
            key={index}
            className={`relative ${
              images.length === 3 && index === 0 ? "col-span-2" : ""
            }`}
          >
            {mediaUrl.type === "video" ? (
              <video
                src={mediaUrl.preview}
                className="w-full h-48 object-cover rounded-lg"
                controls
              />
            ) : (
              <img
                src={mediaUrl.preview}
                alt={`Post media ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg"
              />
            )}
            {images.length > 4 && index === 3 && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  +{images.length - 4}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-6",
         "bg-white border-gray-200 text-theme-light-primary"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
            />
            <div
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r ${platformStyles[platform]} ring-2 ring-white`}
            />
          </div>
          <div>
            <h3
              className={cn(
                "font-semibold",
                "text-gray-900"
              )}
            >
              {user.name}
            </h3>
            <p
              className={cn(
                "text-sm",
                 "text-gray-600"
              )}
            >
              @{user.username}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-full transition-colors",
             "hover:bg-gray-100"
          )}
        >
          <MoreHorizontal
            className={cn(
              "w-5 h-5",
               "text-gray-600"
            )}
          />
        </Button>
      </div>

      <p
        className={cn(
          "mb-4 whitespace-pre-wrap",
           "text-gray-800"
        )}
      >
        {content || "Your post content will appear here"}
      </p>

      {renderMediaGrid()}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <span
              key={tag}
              className={cn(
                "px-2 py-1 rounded-lg text-sm",
                 "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700"
              )}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div
        className={cn(
          "flex items-center justify-between pt-4 border-t",
          "border-gray-100"
        )}
      >
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-2",
             "text-gray-600"
          )}
        >
          <Heart className="w-5 h-5" />
          <span className="text-sm">0</span>
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-2",
             "text-gray-600"
          )}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm">0</span>
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-2",
             "text-gray-600"
          )}
        >
          <Share2 className="w-5 h-5" />
          <span className="text-sm">0</span>
        </Button>
      </div>
    </div>
  );
};

export default PostPreview;
