import { supabase } from "../lib/subabase.js";
import { deleteFacebookPost, updatePostWithMedia } from "../services/facebookService.js";
import { cancelScheduledPost, schedulePost } from "../services/schedulerService.js";
export const createPost = async (req, res) => {
  try {
    const {
      user
    } = req;
    if (!user) {
      return res.status(401).json({
        error: "No authenticated user"
      });
    }
    const {
      content,
      images,
      tags,
      platform,
      scheduledFor
    } = req.body;
    if (!content || !platform) {
      return res.status(400).json({
        error: "Content and platform are required"
      });
    }
    const now = new Date();
    const isPublish = scheduledFor ? new Date(scheduledFor) <= now : false;
    const {
      data: post,
      error: postError
    } = await supabase.from("posts").insert({
      content: content,
      media_urls: images || [],
      tags: tags || [],
      platform: platform,
      user_id: user.id,
      scheduledFor: scheduledFor || null,
      isPublish: isPublish
    }).select("*").single();
    if (postError) {
      throw new Error(`Failed to create post: ${postError.message}`);
    }
    if (scheduledFor) {
      schedulePost(post, isPublish);
    }
    res.status(201).json({
      post
    });
  } catch (error) {
    console.error("Error creating post:", error.message);
    res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  }
};
export const updatePost = async (req, res) => {
  const {
    content,
    images,
    tags,
    platform,
    scheduledFor
  } = req.body;
  const {
    id
  } = req.params;
  try {
    const {
      user
    } = req;
    if (!user) {
      return res.status(401).json({
        error: "No authenticated user"
      });
    }
    const {
      data: existingPost,
      error: fetchError
    } = await supabase.from("posts").select("*").eq("id", id).single();
    if (fetchError) {
      throw fetchError;
    }
    const now = new Date();
    const newScheduledFor = scheduledFor || existingPost.scheduledFor;
    const isPublish = newScheduledFor ? new Date(newScheduledFor) <= now : false;
    const updateData = {};
    if (content !== undefined) {
      updateData.content = content;
    }
    if (images !== undefined) {
      updateData.media_urls = images;
    }
    if (tags !== undefined) {
      updateData.tags = tags;
    }
    if (platform !== undefined) {
      updateData.platform = platform;
    }
    if (scheduledFor !== undefined) {
      updateData.scheduledFor = scheduledFor;
    }
    updateData.isPublish = isPublish;
    const {
      data,
      error: postError
    } = await supabase.from("posts").update(updateData).eq("id", id).eq("user_id", user.id).select("id_post_facebook").single();
    console.log(data);
    const postId = data.id_post_facebook;
    if (postError) {
      throw postError;
    }

    // cancelScheduledPost(id);

    // if (scheduledFor) {
    //   schedulePost(updatedPost, isPublish);
    // }
    updatePostWithMedia(postId, content, images);
    res.status(200).json({
      success: true
    });
  } catch (error) {
    console.error("Error updating post:", error.message);
    res.status(500).json({
      error: error.message
    });
  }
};
export const getPosts = async (req, res) => {
  const {
    page = 0,
    loadMore = false
  } = req.query;
  const nextPage = loadMore ? parseInt(page) + 1 : 0;
  try {
    const {
      user
    } = req;
    if (!user) {
      return res.status(401).json({
        error: "No authenticated user"
      });
    }
    const {
      data: postsData,
      error: postsError
    } = await supabase.from("posts").select("*").eq("user_id", user.id).order("created_at", {
      ascending: false
    }).range(nextPage - 1 * 10, (nextPage + 1) * 10 - 1);
    if (postsError) {
      console.error("Posts Error:", postsError);
      throw postsError;
    }
    if (!postsData || postsData.length === 0) {
      return res.status(200).json({
        posts: [],
        hasMore: false
      });
    }
    const {
      full_name,
      username,
      avatar_url
    } = user.user_metadata;
    const formattedPosts = postsData.map(post => {
      const images = post.media_urls.map(url => {
        const el = JSON.parse(url);
        return {
          id: el.id,
          preview: el.preview,
          type: el.type || "image",
          aiGenerated: el.aiGenerated || false,
          objectUrl: el.objectUrl || undefined
        };
      });
      return {
        id: post.id,
        content: post.content,
        images: images || [],
        tags: post.tags || [],
        platform: post.platform,
        author: {
          name: full_name || "Anonymous",
          username: username || "anonymous",
          avatar: avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&q=80"
        },
        likes: post.likes_count || 0,
        comments: post.comments_count || 0,
        shares: post.shares_count || 0,
        timestamp: post.created_at,
        scheduledFor: post.scheduledFor || null,
        page: nextPage,
        hasMore: postsData.length === 10,
        isPublish: post.isPublish
      };
    });
    res.status(200).json({
      posts: formattedPosts,
      hasMore: postsData.length === 10
    });
  } catch (error) {
    console.error("Error fetching posts:", error.message);
    res.status(500).json({
      error: error.message
    });
  }
};
export const deletePost = async (req, res) => {
  const {
    id
  } = req.params;
  try {
    const {
      user
    } = req;
    if (!user) {
      return res.status(401).json({
        error: "No authenticated user"
      });
    }
    cancelScheduledPost(id);
    const {
      data,
      error
    } = await supabase.from("posts").delete().eq("id", id).eq("user_id", user.id).select("id_post_facebook");
    console.log(data);
    const postId = data[0]?.id_post_facebook;
    await deleteFacebookPost(postId);
    if (error) {
      throw error;
    }
    res.status(200).json({
      success: true
    });
  } catch (error) {
    console.error("Error deleting post:", error.message);
    res.status(500).json({
      error: error.message
    });
  }
};