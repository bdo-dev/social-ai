import React, { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import EditPostDialog from "./EditPostDialog";
import DeletePostDialog from "./DeletePostDialog";
import { Button } from "@/components/ui/button"; // Import shadcn Button
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import shadcn DropdownMenu
import { cn } from "@/lib/utils"; // Import shadcn utility for class merging
import type { Post } from "../../store/posts";

interface PostActionsProps {
  post: Post;
}

const PostActions = ({ post }: PostActionsProps) => {

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
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
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className={cn(
            "w-48 rounded-lg border",
            "bg-white border-gray-100 text-theme-light-primary"
          )}
        >
          <DropdownMenuItem
            onClick={() => setShowEditDialog(true)}
            className={cn(
              "flex items-center gap-2",
               "text-gray-700 hover:bg-gray-50"
            )}
          >
            <Pencil className="w-4 h-4" />
            Edit Post
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className={cn(
              "flex items-center gap-2",
              "text-red-600 hover:bg-red-50"
            )}
          >
            <Trash2 className="w-4 h-4" />
            Delete Post
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditPostDialog
        post={post}
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
      />

      <DeletePostDialog
        postId={post.id}
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      />
    </div>
  );
};

export default PostActions;
