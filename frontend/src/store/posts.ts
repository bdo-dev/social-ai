import { create } from "zustand";
import axios from "axios";
import { type Platform } from "../components/posts/types";
import { supabase } from "../lib/supabase";
import { toast } from "@/hooks/use-toast"; // Import the toast function

interface MediaItem {
  id: string;
  type: "image" | "video";
  preview: string;
  file?: File;
  unsplashId?: string;
  aiGenerated?: boolean;
  objectUrl?: string;
}

export interface Post {
  id: string;
  content: string;
  images: MediaItem[];
  tags: string[];
  page: number;
  hasMore: boolean;
  platform: Platform;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  scheduledFor: string;
  isPublish: boolean;
}

interface PostsStore {
  posts: Post[];
  tags: string[];
  selectedTags: string[];
  page: number;
  hasMore: boolean;
  addPost: (
    post: Omit<Post, "id" | "likes" | "comments" | "shares">
  ) => Promise<void>;
  updatePost: (post: Post) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  addTags: (newTags: string[]) => void;
  setSelectedTags: (tags: string[]) => void;
  updatePostSchedule: (postId: string, scheduledFor: string) => Promise<void>;
  fetchPosts: (loadMore?: boolean) => Promise<void>;
}

const API_BASE_URL = "http://localhost:3000/api";

export const usePostsStore = create<PostsStore>((set, get) => ({
  posts: [],
  tags: ["food", "travel", "tech", "lifestyle"],
  selectedTags: [],
  page: 0,
  hasMore: true,

  fetchPosts: async (loadMore = false) => {
    const { page } = get();
    const nextPage = loadMore ? page + 1 : 0;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const authToken = session?.access_token;

      if (!authToken) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_BASE_URL}/posts`, {
        params: { page: nextPage, loadMore },
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const { posts, hasMore } = response.data;
      console.log(posts);

      set((state) => ({
        posts: loadMore ? [...state.posts, ...posts] : posts,
        page: nextPage,
        hasMore,
      }));
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw error;
    }
  },

  addPost: async (newPost) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const authToken = session?.access_token;

      if (!authToken) {
        throw new Error("No authentication token found");
      }
      console.log(authToken);

      const response = await axios.post(`${API_BASE_URL}/posts`, newPost, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const { post } = response.data;

      set((state) => ({
        posts: [
          {
            id: post.id,
            content: newPost.content,
            images: newPost.images,
            tags: newPost.tags,
            platform: newPost.platform,
            author: {
              name: "Anonymous",
              username: "anonymous",
              avatar:
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&q=80",
            },
            likes: 0,
            comments: 0,
            shares: 0,
            timestamp: new Date().toISOString(),
            page: state.page,
            hasMore: state.hasMore,
            scheduledFor: newPost.scheduledFor,
            isPublish: new Date() > new Date(newPost.scheduledFor),
          },
          ...state.posts,
        ],
      }));

      toast({
        title: "Post Added",
        description: "Your post has been successfully added.",
      });
    } catch (error) {
      console.error("Error adding post:", error);

      toast({
        title: "Error",
        description: "Failed to add the post. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  },
  updatePost: async (updatedPost) => {
    try {
      console.log(updatedPost);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const authToken = session?.access_token;

      if (!authToken) {
        throw new Error("No authentication token found");
      }
      console.log(updatedPost);

      await axios.put(`${API_BASE_URL}/posts/${updatedPost.id}`, updatedPost, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === updatedPost.id ? updatedPost : post
        ),
      }));

      toast({
        title: "Post Updated",
        description: "Your post has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating post:", error);

      toast({
        title: "Error",
        description: "Failed to update the post. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  },

  deletePost: async (postId) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const authToken = session?.access_token;

      if (!authToken) {
        throw new Error("No authentication token found");
      }

      await axios.delete(`${API_BASE_URL}/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      set((state) => ({
        posts: state.posts.filter((post) => post.id !== postId),
      }));

      toast({
        title: "Post Deleted",
        description: "Your post has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting post:", error);

      toast({
        title: "Error",
        description: "Failed to delete the post. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  },

  addTags: (newTags) =>
    set((state) => ({
      tags: Array.from(new Set([...state.tags, ...newTags])),
    })),

  setSelectedTags: (tags) =>
    set(() => ({
      selectedTags: tags,
    })),

  updatePostSchedule: async (postId, scheduledFor) => {
    try {
      // Get the session token
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const authToken = session?.access_token;

      if (!authToken) {
        throw new Error("No authentication token found");
      }

      await axios.put(
        `${API_BASE_URL}/posts`,
        { id: postId, scheduledFor },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId ? { ...post, scheduledFor } : post
        ),
      }));

      toast({
        title: "Schedule Updated",
        description: "Your post schedule has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating post schedule:", error);

      toast({
        title: "Error",
        description: "Failed to update the post schedule. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  },
}));
