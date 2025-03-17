import React, { useState, useEffect } from "react";
import { Calendar, Clock, MoreVertical } from "lucide-react";

import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";

import { Post, usePostsStore } from "@/store/posts";

const PostSchedule = () => {
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { posts } = usePostsStore();
  const [scheduledPosts, setScheduledPosts] = useState<Post[]>([]);

  useEffect(() => {
    setScheduledPosts(posts.filter((el: Post) => el.isPublish !== false));
  }, [posts]);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString([], {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const truncateTitle = (title: string) => {
    const words = title?.split(" ");
    const firstThreeWords = words?.slice(0, 3).join(" ");
    return firstThreeWords?.length > 25
      ? firstThreeWords?.substring(0, 25) + "..."
      : firstThreeWords;
  };

  return (
    <>
      <div
        className={cn(
          "backdrop-blur-sm rounded-xl border p-6",
          "bg-white/50 border-gray-100 text-theme-light-primary"
        )}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Scheduled Posts
          </h2>
          <Button
            variant="link"
            className={cn(
              "text-sm p-0",
               "text-blue-600 hover:text-blue-700"
            )}
            onClick={() => setIsDialogOpen(true)}
          >
            View All
          </Button>
        </div>
        <div className="space-y-4">
          {scheduledPosts.slice(0, 2).map((post) => (
            <div
              key={post.id}
              className={cn(
                "flex items-center gap-4 p-4 rounded-lg transition-colors group",
                 "hover:bg-white/50"
              )}
            >
              {post.images.length > 0 && (
                <img
                  src={post.images[0]?.preview}
                  alt=""
                  className="w-12 h-12 rounded-lg object-cover group-hover:scale-105 transition-transform"
                />
              )}
              <div className="flex-1">
                <h3
                  className={cn(
                    "font-medium",
                     "text-theme-light-primary"
                  )}
                >
                  {truncateTitle(post.content)}
                </h3>
                <div className="flex items-center gap-4 mt-1 text-sm">
                  <span
                    className={cn(
                      "flex items-center gap-1",
                       "text-theme-light-secondary"
                    )}
                  >
                    <Calendar className="w-4 h-4" />
                    {formatDate(new Date(post.scheduledFor))}
                  </span>
                  <span
                    className={cn(
                      "flex items-center gap-1",
                      "text-theme-light-secondary"
                    )}
                  >
                    <Clock className="w-4 h-4" />
                    {formatTime(new Date(post.scheduledFor))}
                  </span>
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
                <MoreVertical
                  className={cn(
                    "w-4 h-4",
                     "text-theme-light-secondary"
                  )}
                />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <ScheduledPostsDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        posts={scheduledPosts}
      />
    </>
  );
};

export default PostSchedule;
