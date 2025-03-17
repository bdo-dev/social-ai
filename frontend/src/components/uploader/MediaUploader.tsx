import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAIStore } from "../../store/ai";
import {
  Upload,
  Search,
  Image as ImageIcon,
  X,
  Check,
  Loader2,
  Trash2,
  Sparkles,
  Download,
  ZoomIn,
} from "lucide-react";
import clsx from "clsx";

// Define types for Unsplash images and media items
interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
  user: {
    name: string;
    username: string;
  };
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

interface PhotoUploaderProps {
  setImages: (images: MediaItem[]) => void;
  isDarkMode?: boolean; // Add dark mode prop
}

// Unsplash API access key
const UNSPLASH_ACCESS_KEY = "JSR5Qo1VJAJJyXaUjZjWncNocFxhDhIBmSM0hRaAIMo";

export function PhotoUploader({ setImages, isDarkMode }: PhotoUploaderProps) {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "unsplash" | "ai">(
    "upload"
  );
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [unsplashImages, setUnsplashImages] = useState<UnsplashImage[]>([]);
  const [aiImages, setAiImages] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { generateImage } = useAIStore();

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      mediaItems.forEach((item) => {
        if (item.objectUrl) {
          URL.revokeObjectURL(item.objectUrl);
        }
      });
    };
  }, [mediaItems]);

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newMediaItems = acceptedFiles.map((file) => {
      const id = crypto.randomUUID();
      setUploadProgress((prev) => ({ ...prev, [id]: 0 }));
      const objectUrl = URL.createObjectURL(file);

      const reader = new FileReader();
      reader.onloadstart = () => {
        setUploadProgress((prev) => ({ ...prev, [id]: 0 }));
      };
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress((prev) => ({
            ...prev,
            [id]: (event.loaded / event.total) * 100,
          }));
        }
      };
      reader.readAsDataURL(file);

      return {
        id,
        type: file.type.startsWith("image/")
          ? "image"
          : ("video" as "image" | "video"), // Correctly identify file type
        preview: objectUrl,
        file,
        objectUrl,
      };
    });

    setMediaItems((prev) => [...prev, ...newMediaItems]);
  }, []);

  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
      "video/*": [".mp4", ".webm"],
    },
    multiple: true,
  });

  // Search Unsplash images
  const searchUnsplash = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `https://api.unsplash.com/search/photos?query=${query}&per_page=20`,
        {
          headers: {
            Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        }
      );
      setUnsplashImages(response.data.results);
    } catch (err) {
      setError("Failed to fetch images from Unsplash");
    } finally {
      setLoading(false);
    }
  };

  // Simulate AI image generation
  const generateAiImages = async (prompt: string) => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const image: any = await generateImage(prompt);

      // Ensure the response is valid
      if (image) {
        setAiImages([
          {
            id: crypto.randomUUID(),
            type: "image",
            preview: image,
            aiGenerated: true,
          },
        ]);
      } else {
        setError("Failed to generate AI images: Invalid response");
      }
    } catch (err: any) {
      setError(`Failed to generate AI images: ${err.message}`);
      setAiImages([]); // Reset aiImages on error
    } finally {
      setLoading(false);
    }
  };

  // Select an Unsplash image
  const selectUnsplashImage = (image: UnsplashImage) => {
    const newMediaItem: MediaItem = {
      id: image.id,
      type: "image",
      preview: image.urls.regular,
      unsplashId: image.id,
    };
    setMediaItems((prev) => [...prev, newMediaItem]);
  };

  // Select an AI-generated image
  const selectAiImage = (image: MediaItem) => {
    const newMediaItem: MediaItem = {
      id: image.id,
      type: "image",
      preview: image.preview,
      aiGenerated: true,
    };
    setMediaItems((prev) => [...prev, newMediaItem]);
  };

  // Remove a media item
  const removeMediaItem = (id: string) => {
    setMediaItems((prev) => {
      const itemToRemove = prev.find((item) => item.id === id);
      if (itemToRemove?.objectUrl) {
        URL.revokeObjectURL(itemToRemove.objectUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[id];
      return newProgress;
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (mediaItems.length === 0) return;

    setIsSubmitting(true);

    try {
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Pass the media items to the parent component
      setImages(mediaItems);

      setIsSuccess(true);

      setTimeout(() => {
        setIsOpen(false);
        setMediaItems([]);
        setUploadProgress({});
        setIsSuccess(false);
      }, 1500);
    } catch (error) {
      setError("Failed to upload files");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const dialogVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", damping: 25, stiffness: 400 },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: 20,
      transition: { duration: 0.2 },
    },
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={clsx(
          "mx-auto flex items-center gap-2 px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors",
          isDarkMode
            ? "bg-blue-700 text-white hover:bg-blue-800" // Dark mode styles
            : "bg-blue-500 text-white hover:bg-blue-600" // Light mode styles
        )}
      >
        <Upload size={20} />
        Upload Media
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsOpen(false);
            }}
          >
            <motion.div
              variants={dialogVariants}
              className={clsx(
                "rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]",
                isDarkMode
                  ? "bg-gray-900 text-white" // Dark mode styles
                  : "bg-white text-gray-900" // Light mode styles
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b px-6 py-4 flex justify-between items-center flex-shrink-0">
                <h2 className="text-xl font-semibold">Upload Media</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className={clsx(
                    "p-2 rounded-full transition-colors",
                    isDarkMode
                      ? "hover:bg-gray-800" // Dark mode styles
                      : "hover:bg-gray-100" // Light mode styles
                  )}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="p-6">
                  <div className="flex gap-4 mb-6 sticky top-0 z-10 pb-4">
                    <button
                      onClick={() => setActiveTab("upload")}
                      className={clsx(
                        "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                        activeTab === "upload"
                          ? "bg-blue-500 text-white"
                          : isDarkMode
                          ? "bg-gray-800 hover:bg-gray-700"
                          : "bg-gray-100 hover:bg-gray-200"
                      )}
                    >
                      <Upload size={20} />
                      Upload
                    </button>
                    <button
                      onClick={() => setActiveTab("unsplash")}
                      className={clsx(
                        "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                        activeTab === "unsplash"
                          ? "bg-blue-500 text-white"
                          : isDarkMode
                          ? "bg-gray-800 hover:bg-gray-700"
                          : "bg-gray-100 hover:bg-gray-200"
                      )}
                    >
                      <ImageIcon size={20} />
                      Unsplash
                    </button>
                    <button
                      onClick={() => setActiveTab("ai")}
                      className={clsx(
                        "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                        activeTab === "ai"
                          ? "bg-blue-500 text-white"
                          : isDarkMode
                          ? "bg-gray-800 hover:bg-gray-700"
                          : "bg-gray-100 hover:bg-gray-200"
                      )}
                    >
                      <Sparkles size={20} />
                      AI Generate
                    </button>
                  </div>

                  {mediaItems.length > 0 && (
                    <div className="mb-6">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {mediaItems.map((item) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            whileHover={{ scale: 1.05 }}
                            className="relative group aspect-square"
                          >
                            <motion.div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <button
                                onClick={() => setPreviewImage(item.preview)}
                                className="p-2 bg-white/90 rounded-full shadow-lg mx-2 hover:bg-white transition-colors"
                              >
                                <ZoomIn size={16} className="text-gray-700" />
                              </button>
                            </motion.div>
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
                              <Trash2 size={16} className="text-red-500" />
                            </button>
                            {uploadProgress[item.id] !== undefined &&
                              uploadProgress[item.id] < 100 && (
                                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                  <div className="w-3/4 h-2 bg-white/30 rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{
                                        width: `${uploadProgress[item.id]}%`,
                                      }}
                                      className="h-full bg-white rounded-full"
                                    />
                                  </div>
                                </div>
                              )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  <AnimatePresence mode="wait">
                    {activeTab === "upload" ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key="upload"
                      >
                        <div
                          {...getRootProps()}
                          className={clsx(
                            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                            isDragActive
                              ? "border-blue-500 bg-blue-50"
                              : isDarkMode
                              ? "border-gray-700 bg-gray-800"
                              : "border-gray-300 bg-gray-100"
                          )}
                        >
                          <input {...getInputProps()} />
                          <Upload
                            size={48}
                            className={clsx(
                              "mx-auto mb-4",
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            )}
                          />
                          <p
                            className={clsx(
                              "text-lg mb-2",
                              isDarkMode ? "text-white" : "text-gray-900"
                            )}
                          >
                            Drag & drop your files here
                          </p>
                          <p
                            className={clsx(
                              "text-sm",
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            )}
                          >
                            or click to select files
                          </p>
                        </div>
                      </motion.div>
                    ) : activeTab === "unsplash" ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key="unsplash"
                        className="space-y-6"
                      >
                        <div className="relative sticky top-0 z-10">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && searchUnsplash(searchQuery)
                            }
                            placeholder="Search Unsplash images..."
                            className={clsx(
                              "w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                              isDarkMode
                                ? "bg-gray-800 border-gray-700 text-white"
                                : "bg-white border-gray-200 text-gray-900"
                            )}
                          />
                          <Search
                            size={20}
                            className={clsx(
                              "absolute left-3 top-1/2 transform -translate-y-1/2",
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            )}
                          />
                          <button
                            onClick={() => searchUnsplash(searchQuery)}
                            className={clsx(
                              "absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 rounded-md hover:bg-blue-600 transition-colors",
                              isDarkMode
                                ? "bg-blue-700 text-white hover:bg-blue-800"
                                : "bg-blue-500 text-white hover:bg-blue-600"
                            )}
                          >
                            Search
                          </button>
                        </div>

                        {loading ? (
                          <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto" />
                          </div>
                        ) : error ? (
                          <div className="text-center py-8 text-red-500">
                            {error}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {unsplashImages.map((image) => (
                              <motion.div
                                key={image.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.05 }}
                                className="relative group cursor-pointer aspect-square"
                              >
                                <motion.div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                  <button
                                    onClick={() => selectUnsplashImage(image)}
                                    className="p-2 bg-white/90 rounded-full shadow-lg mx-2 hover:bg-white transition-colors"
                                  >
                                    <Download
                                      size={16}
                                      className="text-gray-700"
                                    />
                                  </button>
                                  <button
                                    onClick={() =>
                                      setPreviewImage(image.urls.regular)
                                    }
                                    className="p-2 bg-white/90 rounded-full shadow-lg mx-2 hover:bg-white transition-colors"
                                  >
                                    <ZoomIn
                                      size={16}
                                      className="text-gray-700"
                                    />
                                  </button>
                                </motion.div>
                                <img
                                  src={image.urls.small}
                                  alt={image.alt_description}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key="ai"
                        className="space-y-6"
                      >
                        <div className="relative sticky top-0 z-10">
                          <input
                            type="text"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && generateAiImages(aiPrompt)
                            }
                            placeholder="Describe the image you want to generate..."
                            className={clsx(
                              "w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                              isDarkMode
                                ? "bg-gray-800 border-gray-700 text-white"
                                : "bg-white border-gray-200 text-gray-900"
                            )}
                          />
                          <Sparkles
                            size={20}
                            className={clsx(
                              "absolute left-3 top-1/2 transform -translate-y-1/2",
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            )}
                          />
                          <button
                            onClick={() => generateAiImages(aiPrompt)}
                            className={clsx(
                              "absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 rounded-md hover:bg-blue-600 transition-colors",
                              isDarkMode
                                ? "bg-blue-700 text-white hover:bg-blue-800"
                                : "bg-blue-500 text-white hover:bg-blue-600"
                            )}
                          >
                            Generate
                          </button>
                        </div>

                        {loading ? (
                          <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto" />
                          </div>
                        ) : error ? (
                          <div className="text-center py-8 text-red-500">
                            {error}
                          </div>
                        ) : aiImages.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {aiImages.map((image) => (
                              <motion.div
                                key={image.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.05 }}
                                className="relative group cursor-pointer aspect-square"
                              >
                                <motion.div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                  <button
                                    onClick={() => selectAiImage(image)}
                                    className="p-2 bg-white/90 rounded-full shadow-lg mx-2 hover:bg-white transition-colors"
                                  >
                                    <Download
                                      size={16}
                                      className="text-gray-700"
                                    />
                                  </button>
                                  <button
                                    onClick={() =>
                                      setPreviewImage(image.preview || null)
                                    }
                                    className="p-2 bg-white/90 rounded-full shadow-lg mx-2 hover:bg-white transition-colors"
                                  >
                                    <ZoomIn
                                      size={16}
                                      className="text-gray-700"
                                    />
                                  </button>
                                </motion.div>
                                <img
                                  src={image.preview}
                                  alt={"AI Generated Image"}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            No AI-generated images available. Try generating
                            one!
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="border-t px-6 py-4 flex justify-between items-center flex-shrink-0">
                <p
                  className={clsx(
                    "text-sm",
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  )}
                >
                  {mediaItems.length}{" "}
                  {mediaItems.length === 1 ? "item" : "items"} selected
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsOpen(false)}
                    className={clsx(
                      "px-4 py-2 rounded-lg transition-colors",
                      isDarkMode
                        ? "text-gray-400 hover:bg-gray-800"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={
                      mediaItems.length === 0 || isSubmitting || isSuccess
                    }
                    className={clsx(
                      "relative px-6 py-2 rounded-lg font-medium transition-all duration-200",
                      mediaItems.length > 0 && !isSubmitting && !isSuccess
                        ? isDarkMode
                          ? "bg-blue-700 text-white hover:bg-blue-800"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    )}
                  >
                    <AnimatePresence mode="wait">
                      {isSubmitting ? (
                        <motion.div
                          key="submitting"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <Loader2 size={20} className="animate-spin" />
                          Uploading...
                        </motion.div>
                      ) : isSuccess ? (
                        <motion.div
                          key="success"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2 text-green-500"
                        >
                          <Check size={20} />
                          Done!
                        </motion.div>
                      ) : (
                        <motion.span
                          key="submit"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          Upload {mediaItems.length}{" "}
                          {mediaItems.length === 1 ? "file" : "files"}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
