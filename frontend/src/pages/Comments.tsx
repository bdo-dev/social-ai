import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, AlertTriangle, Filter, Trash } from "lucide-react";
import { useCommentsStore } from "../store/comments";

import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { DatePickerWithRange } from "../components/ui/datepicker";
import { usePostsStore } from "@/store/posts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

type Comment = {
  id: string;
  content: string;
  authorName: string;
  authorAvatar?: string;
  sentiment: "positive" | "neutral" | "negative";
  createdAt: string;
  metadata?: {
    platform?: string;
    likes?: number;
    parentCommentId?: string;
  };
};

const Comments = () => {
 
  const { posts } = usePostsStore();
  const postsId = useMemo(() => posts.map((el) => el.id), [posts]);
  const {
    comments,
    autoModeration,
    filters,
    sortBy,
    loading,
    error,
    selectedComments,
    setAutoModeration,
    setFilters,
    setSortBy,
    deleteComment,
    toggleCommentSelection,
    deleteSelectedComments,
    fetchComments,
    hasMore,
  } = useCommentsStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [com, setCom] = useState([]);
  const updataAuto = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const authToken = session?.access_token;

      if (!authToken) {
        throw new Error("No authentication token found");
      }
      console.log(autoModeration);
      const userId = session?.user.id;
      const { error } = await supabase
        .from("profiles")
        .update({ autoDelete: !autoModeration })
        .eq("id", userId);
    } catch (error:any) {
      toast({
        title: "Error",
        description: error.mesaage,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const authToken = session?.access_token;

        if (!authToken) {
          throw new Error("No authentication token found");
        }
        console.log(autoModeration);
        const userId = session?.user.id;
        const { data } = await supabase
          .from("profiles")
          .select("autoDelete")
          .eq("id", userId);
        const { autoDelete } = data;
        console.log("here");

        await fetchComments(postsId);
        setAutoModeration(autoDelete);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete comment",
          variant: "destructive",
        });
      }
    };
    getData();
  }, []);

  const filteredComments = comments
    .filter((comment) => {
      const matchesSearch = comment.content
        .toLowerCase()
        .includes(filters.searchTerm.toLowerCase());
      const matchesSentiment =
        filters.sentiment === "all" ||
        !filters.sentiment ||
        comment.sentiment === filters.sentiment;
      const matchesAuthor =
        !filters.author ||
        comment.authorName.toLowerCase().includes(filters.author.toLowerCase());
      const matchesDate =
        !filters.dateRange.from ||
        !filters.dateRange.to ||
        (new Date(comment.createdAt) >= filters.dateRange.from &&
          new Date(comment.createdAt) <= filters.dateRange.to);

      return matchesSearch && matchesSentiment && matchesAuthor && matchesDate;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      if (sortBy === "oldest") {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
      return (b.metadata?.likes || 0) - (a.metadata?.likes || 0);
    });

  const handleSelectAll = () => {
    const commentIds = filteredComments
      .slice(0, 100)
      .map((comment) => comment.id)
      .filter((id): id is string => id !== undefined);

    if (selectedComments.length === commentIds.length) {
      commentIds.forEach((id) => toggleCommentSelection(id));
    } else {
      commentIds.forEach((id) => {
        if (!selectedComments.includes(id)) {
          toggleCommentSelection(id);
        }
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setCommentToDelete(commentId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (commentToDelete) {
      await deleteComment(commentToDelete);
      setIsDeleteDialogOpen(false);
      setCommentToDelete(null);
      await fetchComments(postsId);
    }
  };

  const handleDeleteSelectedComments = async () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDeleteSelected = async () => {
    await deleteSelectedComments();
    setIsDeleteDialogOpen(false);
  };

  const CommentCard = ({ comment }: { comment: Comment }) => (
    <Card
      className={`transition-all duration-300 ${
        selectedComments.includes(comment.id)
          ? "bg-blue-50 dark:bg-blue-900"
          : ""
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="font-semibold">{comment.authorName}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                comment.sentiment === "positive"
                  ? "bg-green-100 text-green-700"
                  : comment.sentiment === "negative"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {comment.sentiment}
            </span>
            <input
              type="checkbox"
              checked={selectedComments.includes(comment.id)}
              onChange={() => toggleCommentSelection(comment.id)}
              className="w-4 h-4 accent-blue-600"
            />
            <Button
              variant="ghost"
              onClick={() =>
                comment.metadata?.parentCommentId &&
                handleDeleteComment(comment.metadata.parentCommentId)
              }
              className="text-red-600 hover:bg-red-50"
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="mt-3">{comment.content}</p>
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            {new Date(comment.createdAt).toLocaleString()}
          </div>
          {comment.metadata?.likes !== undefined && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>❤️</span>
              {comment.metadata.likes}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div
      className={`min-h-screen p-8 ${
       "bg-theme-light"
      }`}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Comment Management
        </h1>
        <p className="text-muted-foreground">
          Monitor and moderate user comments
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search comments..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters({ searchTerm: e.target.value })}
                    className="pl-10"
                  />
                </div>

                <DatePickerWithRange
                  selectedRange={filters.dateRange}
                  onSelect={(range) => setFilters({ dateRange: range })}
                  className="w-[280px]"
                />
              </div>

              <div className="flex items-center gap-4">
                {selectedComments.length > 0 && (
                  <Button
                    variant="destructive"
                    onClick={handleDeleteSelectedComments}
                    className="gap-2"
                  >
                    <Trash className="w-4 h-4" />
                    Delete Selected ({selectedComments.length})
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={handleSelectAll}
                  disabled={filteredComments.length === 0}
                >
                  {selectedComments.length ===
                  filteredComments.slice(0, 100).length
                    ? "Deselect All"
                    : "Select All (Max 100)"}
                </Button>

                <div className="flex items-center gap-2">
                  <AlertTriangle
                    className={`w-5 h-5 ${
                      autoModeration
                        ? "text-green-600"
                        : "text-muted-foreground"
                    }`}
                  />
                  <Label htmlFor="auto-moderation">Auto-Delete</Label>
                  <Switch
                    id="auto-moderation"
                    checked={autoModeration}
                    onCheckedChange={setAutoModeration}
                    onClick={async () => {
                      await updataAuto();
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <Select
                  value={filters.sentiment}
                  onValueChange={(value) => setFilters({ sentiment: value })}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select sentiment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sentiments</SelectItem>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Input
                type="text"
                placeholder="Filter by author..."
                value={filters.author}
                onChange={(e) => setFilters({ author: e.target.value })}
                className="w-[200px]"
              />

              <Select
                value={sortBy}
                onValueChange={(value: typeof sortBy) => setSortBy(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="mostLikes">Most Likes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div
            ref={containerRef}
            className="h-[calc(100vh-20rem)] overflow-y-auto space-y-4"
          >
            {!loading && !error && filteredComments.length > 0 ? (
              filteredComments.map((comment) => (
                <CommentCard key={comment.id} comment={comment} />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {!loading &&
                  !error &&
                  "No comments found matching your filters"}
              </div>
            )}
            {loading && (
              <div className="text-center py-4">Loading more comments...</div>
            )}
            {!hasMore && (
              <div className="text-center py-4 text-muted-foreground">
                No more comments to load
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => setIsDeleteDialogOpen(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              selected comments.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={
                commentToDelete
                  ? handleConfirmDelete
                  : handleConfirmDeleteSelected
              }
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Comments;
