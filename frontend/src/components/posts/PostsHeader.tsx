import React from "react";
import { Plus, Filter } from "lucide-react";
import { usePostsStore } from "../../store/posts";

import { Button } from "@/components/ui/button"; // Import shadcn Button
import { cn } from "@/lib/utils"; // Import shadcn utility for class merging

interface PostsHeaderProps {
  onNewPost: () => void;
  onFilter: () => void;
}

const PostsHeader = ({ onNewPost, onFilter }: PostsHeaderProps) => {
 
  

  const selectedTags = usePostsStore((state) => state.selectedTags);

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Posts
        </h1>
        <p
          className={cn(
           "text-gray-600"
          )}
        >
          {selectedTags.length > 0
            ? `Filtered by: ${selectedTags.map((tag) => `#${tag}`).join(", ")}`
            : "Manage and monitor your social media content"}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Button
          onClick={onFilter}
          variant={selectedTags.length > 0 ? "default" : "outline"}
          className={cn(
            "flex items-center gap-2",
            selectedTags.length > 0
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent"
              :  "bg-white border-gray-200 hover:bg-gray-50"
          )}
        >
          <Filter className="w-4 h-4" />
          <span>Filter</span>
          {selectedTags.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-sm">
              {selectedTags.length}
            </span>
          )}
        </Button>
        <Button
          onClick={onNewPost}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span>New Post</span>
        </Button>
      </div>
    </div>
  );
};

export default PostsHeader;
