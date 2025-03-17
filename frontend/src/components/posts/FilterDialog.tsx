import React from "react";
import { X } from "lucide-react";
import { usePostsStore } from "../../store/posts";

import TagInput from "./TagInput";
import { Button } from "@/components/ui/button"; // Import shadcn Button
import { Label } from "@/components/ui/label"; // Import shadcn Label
import { cn } from "@/lib/utils"; // Import shadcn utility for class merging

interface FilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const FilterDialog = ({ isOpen, onClose }: FilterDialogProps) => {
  

  const selectedTags = usePostsStore((state) => state.selectedTags);
  const setSelectedTags = usePostsStore((state) => state.setSelectedTags);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div
        className={cn(
          "rounded-2xl w-[90%] max-w-lg p-6",
          "bg-white border-gray-100 text-theme-light-primary"
        )}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Filter Posts
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
            <X className="w-5 h-5 text-gray-600" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label
              className={cn(
                "block text-sm font-medium mb-2",
                "text-gray-700"
              )}
            >
              Filter by Tags
            </Label>
            <TagInput selectedTags={selectedTags} onChange={setSelectedTags} />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              onClick={() => {
                setSelectedTags([]);
                onClose();
              }}
              variant="ghost"
              className={cn(
                "text-gray-700 hover:bg-gray-100"
              )}
            >
              Clear Filters
            </Button>
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 transition-opacity"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterDialog;
