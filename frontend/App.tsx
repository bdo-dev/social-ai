import React, { useEffect, useState, useCallback } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
import Sidebar from "./components/Sidebar";
import Posts from "./pages/Posts";

import Comments from "./pages/Comments";
import Chatbot from "./pages/Chatbot";

import { usePostsStore } from "./store/posts";
import AuthForm from "./components/AuthForm";
import Header from "./components/Header";
import { debounce } from "lodash";
import { ToastWrapper } from "@/components/ui/toast-provider"; // Import ToastWrapper
import { toast } from "./hooks/use-toast"; // Import toast function

function AppContent() {
  
  const { fetchPosts, posts, hasMore } = usePostsStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const handleSidebarToggle = useCallback((isExpanded: boolean) => {
    setIsSidebarExpanded(isExpanded);
  }, []);
  let theme = "light"; 
  let animations = true;
  let density = "compact";
  // Apply theme, density, and animations
  useEffect(() => {
    const root = window.document.documentElement;

    // Apply theme
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else if (theme === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
    } else {
      // Follow system preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        root.classList.add("dark");
        root.classList.remove("light");
      } else {
        root.classList.remove("dark");
        root.classList.add("light");
      }
    }

    // Apply density
    if (density === "compact") {
      root.classList.add("compact");
    } else {
      root.classList.remove("compact");
    }

    // Apply animations
    if (!animations) {
      root.classList.add("no-animations");
    } else {
      root.classList.remove("no-animations");
    }
  }, [theme, density, animations]);

  // Fetch posts on mount and auth changes
  const loadPosts = useCallback(async () => {
    try {
      await fetchPosts();
    } catch (error) {
      console.error("Failed to load posts:", error);
      toast({
        title: "Error",
        description: "Failed to load posts. Please try again.",
        variant: "destructive",
      });
    }
  }, [fetchPosts]);

  useEffect(() => {
    loadPosts();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        loadPosts();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadPosts]);

  // Infinite scroll logic with debounce
  const handleScroll = useCallback(async () => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100 && // Trigger fetch 100px before the bottom
      hasMore &&
      !isLoading
    ) {
      setIsLoading(true);
      try {
        await fetchPosts(true); // Fetch more posts
      } catch (error) {
        console.error("Failed to fetch more posts:", error);
        toast({
          title: "Error",
          description: "Failed to fetch more posts. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  }, [hasMore, isLoading, fetchPosts, posts]);

  useEffect(() => {
    const debouncedHandleScroll = debounce(handleScroll, 200); // Debounce for 200ms
    window.addEventListener("scroll", debouncedHandleScroll);
    return () => window.removeEventListener("scroll", debouncedHandleScroll);
  }, [handleScroll]);

  return (
    <>
      <div className="flex min-h-screen bg-transparent">
        <Sidebar
          onPageChange={() => {}}
          currentPage=""
          onSidebarToggle={handleSidebarToggle} // Pass the handler
        />
        <main
          className={`flex-1 transition-all duration-300 ${
            isSidebarExpanded ? "ml-64" : "ml-20"
          }`}
        >
          <div className="p-8 dark:bg-gray-900 dark:text-gray-100">
            <Header />
          </div>
          <Routes>
            
            <Route path="/posts" element={<Posts />} />
            <Route path="/comments" element={<Comments />} />
            <Route path="/chatbot" element={<Chatbot />} />
           
            
            <Route path="*" element={<Navigate to="/analytics" replace />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

function App() {
  const [session, setSession] = useState<null | any>(null);

  // Check for existing session on mount
  useEffect(() => {
    const storedSession = localStorage.getItem("supabase.auth.session");
    if (storedSession) {
      const parsedSession = JSON.parse(storedSession);
      const currentTime = new Date().getTime();
      if (currentTime - parsedSession.created_at < 15 * 60 * 1000) {
        setSession(parsedSession);
      } else {
        localStorage.removeItem("supabase.auth.session");
      }
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        localStorage.setItem("supabase.auth.session", JSON.stringify(session));
      } else {
        localStorage.removeItem("supabase.auth.session");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <ToastWrapper>
      <Routes>
        <Route path="/login" element={<AuthForm />} />
        <Route
          path="*"
          element={session ? <AppContent /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </ToastWrapper>
  );
}

export default App;
