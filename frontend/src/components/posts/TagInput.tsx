import React, { useState, useRef } from "react";
import { X } from "lucide-react";
import { usePostsStore } from "../../store/posts";
import { Input } from "@/components/ui/input"; // Import shadcn Input component
import { Button } from "@/components/ui/button"; // Import shadcn Button component
import { Badge } from "@/components/ui/badge"; // Import shadcn Badge component
import { Card } from "@/components/ui/card"; // Import shadcn Card component

interface TagInputProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  isDarkMode?: boolean;
}

const TagInput = ({ selectedTags, onChange, isDarkMode }: TagInputProps) => {
 


  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const existingTags = usePostsStore((state) => state.tags);
  const addTags = usePostsStore((state) => state.addTags);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim().toLowerCase();
      if (!existingTags.includes(newTag)) {
        addTags([newTag]);
      }
      if (!selectedTags.includes(newTag)) {
        onChange([...selectedTags, newTag]);
      }
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="w-full">
      <Card
        className={`flex flex-wrap gap-2 p-2 min-h-[42px] rounded-xl border focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent ${
          "bg-white border-gray-200 text-theme-light-primary"
        }`}
      >
        {selectedTags.map((tag) => (
          <Badge
            key={tag}
            variant={ "default"}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-sm"
          >
            #{tag}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeTag(tag)}
              className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        ))}
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`flex-1 min-w-[120px] outline-none bg-transparent ${
            "text-theme-light-primary"
          }`}
          placeholder={
            selectedTags.length === 0 ? "Add tags (press Enter)" : ""
          }
        />
      </Card>
      {inputValue && (
        <Card className="mt-2 space-y-1">
          {existingTags
            .filter(
              (tag) =>
                tag.includes(inputValue.toLowerCase()) &&
                !selectedTags.includes(tag)
            )
            .map((tag) => (
              <Button
                key={tag}
                variant="ghost"
                onClick={() => {
                  onChange([...selectedTags, tag]);
                  setInputValue("");
                }}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  "text-theme-light-primary hover:bg-gray-100"
                }`}
              >
                #{tag}
              </Button>
            ))}
        </Card>
      )}
    </div>
  );
};

export default TagInput;
