import React, { useState } from "react";

import PostsHeader from "../components/posts/PostsHeader";
import PostsGrid from "../components/posts/PostsGrid";
import CreatePostDialog from "../components/posts/CreatePostDialog";
import FilterDialog from "../components/posts/FilterDialog";

const Posts = () => {
 
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

  return (
    <div
      className={`p-8 min-h-screen ${
         "bg-theme-light"
      }`}
    >
      <PostsHeader
        onNewPost={() => setIsCreateDialogOpen(true)}
        onFilter={() => setIsFilterDialogOpen(true)}
      />
      <PostsGrid />
      <CreatePostDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />
      <FilterDialog
        isOpen={isFilterDialogOpen}
        onClose={() => setIsFilterDialogOpen(false)}
      />
    </div>
  );
};

export default Posts;
