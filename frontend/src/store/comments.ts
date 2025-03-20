import { create } from "zustand";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import Comments from "@/pages/Comments";

export interface Comment {
  id: string;
  postId: string;
  content: string;
  authorName: string;
  sentiment: "positive" | "neutral" | "negative";
  createdAt: string;
  updatedAt: string;
  metadata?: {
    platform?: string;
    likes?: number;
    parentCommentId?: string;
  };
}

interface CommentsStore {
  comments: Comment[];
  autoModeration: boolean;
  filters: {
    searchTerm: string;
    sentiment: string;
    author: string;
    dateRange: DateRange;
  };
  sortBy: "newest" | "oldest" | "mostLikes";
  loading: boolean;
  error: string | null;
  selectedComments: string[];
  currentPostIndex: number;
  currentOffset: number;
  hasMore: boolean;

  // Actions
  setAutoModeration: (enabled: boolean) => void;
  setFilters: (filters: Partial<CommentsStore["filters"]>) => void;
  setSortBy: (sort: CommentsStore["sortBy"]) => void;
  deleteComment: (commentId: string) => Promise<void>;
  toggleCommentSelection: (commentId: string) => void;
  deleteSelectedComments: () => Promise<void>;
  addComment: (
    comment: Omit<Comment, "id" | "createdAt" | "updatedAt">
  ) => void;
  fetchComments: (postId: string[]) => Promise<void>;
  resetPagination: () => void;
  reset: () => void;
}

const initialState = {
  comments: [],
  autoModeration: false,
  filters: {
    searchTerm: "",
    sentiment: "",
    author: "",
    dateRange: { from: undefined, to: undefined },
  },
  sortBy: "newest" as const,
  loading: false,
  error: null,
  selectedComments: [],
  currentPostIndex: 0,
  currentOffset: 0,
  hasMore: true,
};

const API_BASE_URL = "http://localhost:3000/api";

export const useCommentsStore = create<CommentsStore>((set, get) => ({
  ...initialState,

  setAutoModeration: (enabled) => set({ autoModeration: enabled }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  setSortBy: (sort) => set({ sortBy: sort }),

  deleteComment: async (commentId) => {
    try {
      await axios.delete(`${API_BASE_URL}/comment/${commentId}`);
      toast({
        title: "Success",
        description: "Comment deleted successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
    set((state) => ({
      comments: state.comments.filter((comment) => comment.id !== commentId),
      selectedComments: state.selectedComments.filter((id) => id !== commentId),
    }));
  },

  toggleCommentSelection: (commentId) =>
    set((state) => ({
      selectedComments: state.selectedComments.includes(commentId)
        ? state.selectedComments.filter((id) => id !== commentId)
        : [...state.selectedComments, commentId],
    })),

  deleteSelectedComments: async () => {
    try {
      const { selectedComments } = get();
      await Promise.all(
        selectedComments.map((commentId) =>
          axios.delete(`${API_BASE_URL}/comment/${commentId}`)
        )
      );
      toast({
        title: "Success",
        description: "Selected comments deleted successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to delete selected comments:", error);
      toast({
        title: "Error",
        description: "Failed to delete selected comments",
        variant: "destructive",
      });
    }
    set((state) => ({
      comments: state.comments.filter(
        (comment) => !state.selectedComments.includes(comment.id)
      ),
      selectedComments: [],
    }));
  },

  addComment: (comment) =>
    set((state) => ({
      comments: [
        {
          ...comment,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...state.comments,
      ],
    })),

  fetchComments: async (postsId: string[]) => {
    set({ loading: true, error: null });

    try {
      // Clear comments before fetching new ones
      set((state) => ({
        comments: [],
      }));

      // Fetch comments for each post
      const allComments: Comment[] = [];
      for (const currentPostId of postsId) {
        const response = await axios.get(
          `${API_BASE_URL}/comments/${currentPostId}`
        );
        const newComments = response.data.map((el: any) => ({
          id: `${currentPostId}-${el.id}`, // Ensure unique key
          postId: el.postId,
          content: el.content,
          authorName: el.authorName,
          sentiment: el.sentiment,
          createdAt: el.createdAt,
          updatedAt: el.updatedAt,
          metadata: {
            likes: el.count,
            parentCommentId: el.comment_id_facebook,
          },
        }));
        allComments.push(...newComments);
      }

      // Update the state with all fetched comments at once
      set((state) => ({
        comments: allComments,
        currentOffset: allComments.length,
        loading: false,
      }));
    } catch (error) {
      set({ error: "Failed to fetch comments", loading: false });
      toast({
        title: "Error",
        description: "Failed to fetch comments",
        variant: "destructive",
      });
    }
  },

  resetPagination: () =>
    set({
      currentPostIndex: 0,
      currentOffset: 0,
      hasMore: true,
      comments: [],
    }),

  reset: () => set(initialState),
}));
