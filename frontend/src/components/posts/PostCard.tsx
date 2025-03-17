import React from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import PostActions from "./PostActions";
import { formatDistanceToNow } from "./utils/dateUtils"; // Import the formatDistanceToNow function
import { Button } from "@/components/ui/button"; // Import shadcn Button
import { cn } from "@/lib/utils"; // Import shadcn utility for class merging
import type { Post } from "../../store/posts";

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const platformColors: { [key in Post["platform"]]: string } = {
    Facebook: "from-blue-400 to-blue-600",
    instagram: "from-purple-400 to-pink-600",
    linkedin: "from-blue-700 to-blue-900", // Add other platforms if necessary
  };

  const renderMediaGrid = () => {
    if (!post?.images.length) return null;

    const gridStyles =
      {
        1: "grid-cols-1",
        2: "grid-cols-2",
        3: "grid-cols-2",
        4: "grid-cols-2",
      }[Math.min(post.images.length, 4)] || "grid-cols-2";

    return (
      <div className={`grid ${gridStyles} gap-2 mb-4`}>
        {post.images.slice(0, 4).map((mediaUrl, index) => {
          return (
            <div
              key={index}
              className={`relative ${
                post.images.length === 3 && index === 0 ? "col-span-2" : ""
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
              {post.images.length > 4 && index === 3 && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    +{post.images.length - 4}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "backdrop-blur-sm rounded-xl border p-6 hover:shadow-lg transition-all duration-300 group relative",
       "bg-white/50 border-gray-100 text-theme-light-primary"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
            />
            <div
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r ${
                platformColors[post.platform]
              } ring-2 ring-white`}
            />
          </div>
          <div>
            <h3
              className={cn(
                "font-semibold",
                "text-gray-900"
              )}
            >
              {post.author.name}
            </h3>
            <p
              className={cn(
                "text-sm",
                "text-gray-600"
              )}
            >
              @{post.author.username}
            </p>
          </div>
        </div>
        <PostActions post={post} />
      </div>

      <p
        className={cn(
          "mb-4",
           "text-gray-800"
        )}
      >
        {post.content}
      </p>

      {renderMediaGrid()}

      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
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
            "flex items-center gap-2 transition-colors",
             "text-gray-600 hover:text-red-500"
          )}
        >
          <Heart className="w-5 h-5" />
          <span className="text-sm">{post.likes}</span>
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-2 transition-colors",
             "text-gray-600 hover:text-blue-500"
          )}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm">{post.comments}</span>
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-2 transition-colors",
            "text-gray-600 hover:text-green-500"
          )}
        >
          <Share2 className="w-5 h-5" />
          <span className="text-sm">{post.shares}</span>
        </Button>
        <span
          className={cn(
            "text-sm",
             "text-gray-500"
          )}
        >
          {formatDistanceToNow(new Date(post.timestamp))}{" "}
          {/* Use formatDistanceToNow here */}
        </span>
      </div>
    </div>
  );
};

export default PostCard;
