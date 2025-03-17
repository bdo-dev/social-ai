import React from "react";
import { usePostsStore } from "../../store/posts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button"; // Import shadcn Button

import { cn } from "@/lib/utils"; // Import shadcn utility for class merging

interface DeletePostDialogProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

const DeletePostDialog = ({
  postId,
  isOpen,
  onClose,
}: DeletePostDialogProps) => {
  
  

  const deletePost = usePostsStore((state) => state.deletePost);

  const handleDelete = () => {
    deletePost(postId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
           "bg-white border-gray-100 text-theme-light-primary"
        )}
      >
        <DialogHeader>
          <DialogTitle
            className={cn(
               "text-theme-light-primary"
            )}
          >
            Delete Post?
          </DialogTitle>
          <DialogDescription
            className={cn(
               "text-theme-light-secondary"
            )}
          >
            This post will be permanently deleted. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            onClick={onClose}
            variant="ghost"
            className={cn(
              "text-gray-700 hover:bg-gray-100"
            )}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="destructive"
            className="hover:bg-red-700"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeletePostDialog;
