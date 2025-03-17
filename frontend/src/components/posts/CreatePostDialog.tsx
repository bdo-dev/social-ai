import React, { useEffect, useState } from "react";
import {
  X,
  Facebook,
  Instagram,
  Linkedin,
  Plus,
  Wand2,
  ImagePlus,
  RefreshCw,
  Sparkles,
  Trash,
} from "lucide-react";
import PostPreview from "./PostPreview";
import TagInput from "./TagInput";
import DateTimePicker from "./DateTimePicker";
import { type Platform } from "./types";
import { usePostsStore } from "../../store/posts";
import { useAIStore, type ToneType } from "../../store/ai";
import { PhotoUploader } from "../uploader/MediaUploader";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Card } from "../ui/card";
import { cn } from "../../lib/utils";

interface CreatePostDialogProps {
  isOpen: boolean;
  onClose: () => void;
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

const CreatePostDialog = ({ isOpen, onClose }: CreatePostDialogProps) => {
  

  const [content, setContent] = useState("");
  const [images, setImages] = useState<MediaItem[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
    "Facebook",
  ]);
  const [scheduledFor, setScheduledFor] = useState(new Date().toISOString());
  const [selectedTone, setSelectedTone] = useState<ToneType>("focused");
  const addPost = usePostsStore((state) => state.addPost);

  const { isGenerating, generateContent, generateImage } = useAIStore();

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

  const handleSubmit = () => {
    if (!content.trim() || selectedPlatforms.length === 0) return;

    selectedPlatforms.forEach((platform) => {
      addPost({
        content,
        images,
        tags: selectedTags,
        platform,
        author: {
          name: "Your Name",
          username: "yourhandle",
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&q=80",
        },
        timestamp: new Date().toISOString(),
        scheduledFor,
        page: 0,
        hasMore: true,
        isPublish: false,
      });
    });

    setContent("");
    setImages([]);
    setSelectedTags([]);
    setScheduledFor(new Date().toISOString());
    setSelectedPlatforms(["Facebook"]);
    onClose();
  };

  const handleGenerateContent = async () => {
    const generatedText = await generateContent(
      content || "Write a social media post",
      selectedTone
    );
    setContent(generatedText);
  };

  const handleGenerateImage = async () => {
    const generatedImages = await generateImage(content);
    setImages((prev) => [
      ...prev,
      ...generatedImages.map((url) => ({
        id: crypto.randomUUID(),
        type: "image" as const,
        preview: url,
        aiGenerated: true,
      })),
    ]);
  };

  const handleMediaUpload = (newMediaItems: MediaItem[]) => {
    setImages((prev) => [...prev, ...newMediaItems]);
  };

  const removeMediaItem = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  if (!isOpen) return null;

  const toneButtons: { id: ToneType; icon: typeof Sparkles; label: string }[] =
    [
      { id: "funny", icon: Sparkles, label: "Funny" },
      { id: "formal", icon: Sparkles, label: "Formal" },
      { id: "focused", icon: Sparkles, label: "Focused" },
      { id: "emotional", icon: Sparkles, label: "Emotional" },
    ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div
        className={cn(
          "rounded-2xl w-[90%] max-w-6xl h-[90vh] flex overflow-hidden",
           "bg-white border-gray-100 text-theme-light-primary"
        )}
      >
        {/* Left side - Editor */}
        <div className="flex-1 p-6 border-r overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Create New Post
            </h2>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-full transition-colors",
                 "hover:bg-gray-100"
              )}
            >
              <X
                className={cn(
                  "w-5 h-5",
                  "text-theme-light-secondary"
                )}
              />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Platform Selection */}
            <div className="flex gap-4">
              {[
                { id: "Facebook", icon: Facebook, color: "bg-blue-500" },
                { id: "instagram", icon: Instagram, color: "bg-pink-500" },
                { id: "linkedin", icon: Linkedin, color: "bg-blue-700" },
              ].map(({ id, icon: Icon, color }) => {
                const isSelected = selectedPlatforms.includes(id as Platform);
                return (
                  <Button
                    key={id}
                    onClick={() => {
                      setSelectedPlatforms((prev) =>
                        prev.includes(id as Platform)
                          ? prev.filter((p) => p !== id)
                          : [...prev, id as Platform]
                      );
                    }}
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "p-3 rounded-xl transition-all relative",
                      isSelected
                        ? `${color} text-white scale-110`
                        :  "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                        <div className={`w-3 h-3 rounded-full ${color}`} />
                      </div>
                    )}
                  </Button>
                );
              })}
            </div>

            {/* AI Tone Selection */}
            <Card
              className={cn(
                "rounded-xl p-4",
                 "bg-gray-50"
              )}
            >
              <h3
                className={cn(
                  "text-sm font-medium mb-3 flex items-center gap-2",
                  "text-theme-light-secondary"
                )}
              >
                <Wand2 className="w-4 h-4 text-blue-600" />
                AI Tone Selection
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {toneButtons.map(({ id, icon: Icon, label }) => (
                  <Button
                    key={id}
                    onClick={() => setSelectedTone(id)}
                    variant={selectedTone === id ? "default" : "secondary"}
                    className={cn(
                      "py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-1.5 transition-all",
                      selectedTone === id
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white scale-105"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Button>
                ))}
              </div>
            </Card>

            {/* Content Input with AI Generation */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  className={cn(
                    "text-sm font-medium",
                    "text-theme-light-secondary"
                  )}
                >
                  Content
                </label>
                <Button
                  onClick={handleGenerateContent}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isGenerating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Wand2 className="w-4 h-4" />
                  )}
                  Generate Content
                </Button>
              </div>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                className={cn(
                  "w-full h-40 p-4 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none",
                  "bg-white border-gray-200 text-theme-light-primary"
                )}
              />
              <div
                className={cn(
                  "flex justify-between text-sm mt-2",
                   "text-theme-light-secondary"
                )}
              >
                <span>Add hashtags with #</span>
                <span>{content?.length}/280</span>
              </div>
            </div>

            {/* Tags Input */}
            <div>
              <label
                className={cn(
                  "block text-sm font-medium mb-2",
                   "text-theme-light-secondary"
                )}
              >
                Add Tags
              </label>
              <TagInput
                selectedTags={selectedTags}
                onChange={setSelectedTags}
              />
            </div>

            {/* Schedule */}
            <div>
              <label
                className={cn(
                  "block text-sm font-medium mb-2",
                   "text-theme-light-secondary"
                )}
              >
                Schedule Post
              </label>
              <DateTimePicker
                value={scheduledFor}
                onChange={setScheduledFor}
                disabled={false}
              />
            </div>

            {/* Image Upload and Generation */}
            <div>
              <PhotoUploader
                setImages={handleMediaUpload}
              />
            </div>

            {/* Media Gallery */}
            <div className="mt-6">
              <label
                className={cn(
                  "block text-sm font-medium mb-2",
                 "text-theme-light-secondary"
                )}
              >
                Uploaded Media
              </label>

              <div className="grid grid-cols-3 gap-4">
                {images.map((item) => (
                  <div key={item.id} className="relative group aspect-square">
                    {item.type === "image" ? (
                      <img
                        src={item.preview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <video
                        src={item.preview}
                        className="w-full h-full object-cover rounded-lg"
                        controls
                      />
                    )}
                    <button
                      onClick={() => removeMediaItem(item.id)}
                      className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                    >
                      <Trash size={16} className="text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={!content?.trim() || selectedPlatforms.length === 0}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Schedule Post
            </Button>
          </div>
        </div>

        {/* Right side - Preview */}
        <Card
          className={cn(
            "w-[45%] p-6",
            "bg-gray-50"
          )}
        >
          <h3
            className={cn(
              "text-lg font-semibold mb-6",
              "text-theme-light-primary"
            )}
          >
            Preview
          </h3>
          <PostPreview
            content={content}
            images={images}
            tags={selectedTags}
            isOpen={isOpen}
          />
        </Card>
      </div>
    </div>
  );
};

export default CreatePostDialog;