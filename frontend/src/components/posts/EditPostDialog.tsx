import React, { useState } from "react";
import { usePostsStore } from "../../store/posts";
import { PhotoUploader } from "../uploader/MediaUploader";
import TagInput from "./TagInput";
import DateTimePicker from "./DateTimePicker";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { cn } from "@/lib/utils";
import type { Post } from "../../store/posts";
import { X } from "lucide-react";

interface EditPostDialogProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
}

const EditPostDialog = ({ post, isOpen, onClose }: EditPostDialogProps) => {
  
  const [content, setContent] = useState(post.content);
  const [images, setImages] = useState(post.images);
  const [selectedTags, setSelectedTags] = useState(post.tags);
  const [scheduledFor, setScheduledFor] = useState(post.scheduledFor);
  const [hasChanges, setHasChanges] = useState(false); // Track if there are changes
  const [showConfirmation, setShowConfirmation] = useState(false); // Show confirmation dialog
  const updatePost = usePostsStore((state) => state.updatePost);

  // Check for changes whenever content, images, tags, or scheduledFor changes
  React.useEffect(() => {
    const isContentChanged = content !== post.content;
    const isImagesChanged =
      JSON.stringify(images) !== JSON.stringify(post.images);
    const isTagsChanged =
      JSON.stringify(selectedTags) !== JSON.stringify(post.tags);
    const isScheduledForChanged = scheduledFor !== post.scheduledFor;

    setHasChanges(
      isContentChanged ||
        isImagesChanged ||
        isTagsChanged ||
        isScheduledForChanged
    );
  }, [content, images, selectedTags, scheduledFor, post]);

  const handleSubmit = () => {
    if (!content.trim()) return;

    updatePost({
      ...post,
      content,
      images,
      tags: selectedTags,
      scheduledFor,
    });

    onClose();
  };

  // Function to remove an image
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle closing the dialog
  const handleClose = () => {
    if (hasChanges) {
      setShowConfirmation(true); // Show confirmation dialog if there are changes
    } else {
      onClose(); // Close directly if no changes
    }
  };

  // Handle confirmation dialog actions
  const handleConfirmation = (shouldSave: boolean) => {
    if (shouldSave) {
      handleSubmit(); // Save changes and close
    } else {
      onClose(); // Discard changes and close
    }
    setShowConfirmation(false); // Hide confirmation dialog
  };

  return (
    <>
      {/* Main Dialog */}
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent
          className={cn(
            "max-w-2xl",
           "bg-white text-gray-900"
          )}
        >
          <DialogHeader>
            <DialogTitle
              className={cn( "text-gray-900")}
            >
              Edit Post
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {/* Textarea */}
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className={cn(
                "w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                 "bg-white border-gray-200 text-gray-900"
              )}
            />

            {/* PhotoUploader Component */}
            <div>
              <Label
                className={cn(
                  "block text-sm font-medium mb-2",
                   "text-gray-700"
                )}
              >
                Media
              </Label>
              <PhotoUploader setImages={setImages}  />
            </div>

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={typeof image === "string" ? image : image.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className={cn(
                        "absolute top-1 right-1 p-1 rounded-full bg-black/50 hover:bg-black/70 transition-colors",
                        "text-gray-100"
                      )}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Tag Input */}
            <div>
              <Label
                className={cn(
                  "block text-sm font-medium mb-2",
                   "text-gray-700"
                )}
              >
                Tags
              </Label>
              <TagInput
                selectedTags={selectedTags}
                onChange={setSelectedTags}
                
              />
            </div>

            {/* DateTimePicker */}
            <div>
              <Label
                className={cn(
                  "block text-sm font-medium mb-2",
                   "text-gray-700"
                )}
              >
                Schedule
              </Label>
              <DateTimePicker
                value={scheduledFor}
                onChange={setScheduledFor}
                disabled={post.isPublish} // Disable if the post is already published
              />
            </div>
          </div>

          {/* Dialog Footer */}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              onClick={handleClose}
              variant="ghost"
              className={cn(
                 "text-gray-700 hover:bg-gray-100"
              )}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim()}
              className={cn(
                "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50",
                 "bg-blue-600 hover:bg-blue-700"
              )}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent
          className={cn(
            "max-w-md",
             "bg-white text-gray-900"
          )}
          onInteractOutside={(e) => e.preventDefault()} // Prevent closing by clicking outside
        >
          <DialogHeader>
            <DialogTitle
              className={cn( "text-gray-900")}
            >
              Save Changes?
            </DialogTitle>
          </DialogHeader>
          <p className={cn( "text-gray-700")}>
            You have unsaved changes. Do you want to save them before closing?
          </p>
          <DialogFooter>
            <Button
              onClick={() => handleConfirmation(false)}
              variant="ghost"
              className={cn(
                "text-gray-700 hover:bg-gray-100"
              )}
            >
              Discard
            </Button>
            <Button
              onClick={() => handleConfirmation(true)}
              className={cn(
                "bg-blue-600 text-white hover:bg-blue-700",
                 "bg-blue-600 hover:bg-blue-700"
              )}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditPostDialog;
