import React from "react";
import PostCard from "./PostCard";
import { usePostsStore } from "../../store/posts";

const PostsGrid = () => {
  
  const posts = usePostsStore((state) => state.posts);

  const selectedTags = usePostsStore((state) => state.selectedTags);

  const filteredPosts =
    selectedTags.length > 0
      ? posts.filter((post) =>
          post.tags.some((tag) => selectedTags.includes(tag))
        )
      : posts;

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${
       "text-theme-light-primary"
      }`}
    >
      {filteredPosts.map((post, index) => (
        <div
          key={post.id}
          className="opacity-0 animate-fade-in"
          style={{ animationDelay: `${index * 150}ms` }}
        >
          <PostCard post={post} />
        </div>
      ))}
    </div>
  );
};

export default PostsGrid;
