import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom"; // Import Outlet
import { supabase } from "./lib/supabase";
import Sidebar from "./components/Sidebar";
import { useSettingsStore } from "./store/settings";
import { usePostsStore } from "./store/posts";
import { debounce } from "lodash";
import { toast } from "./hooks/use-toast";
import Header from "./components/Header";

function AppLayout() {
  const { theme, density, animations } = useSettingsStore((state) => ({
    theme: state.appearance.theme,
    density: state.appearance.density,
    animations: state.appearance.animations,
  }));

  const { fetchPosts, posts, hasMore } = usePostsStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const handleSidebarToggle = (isExpanded: boolean) => {
    setIsSidebarExpanded(isExpanded);
  };

  const handlePageChange = (page: string) => {
    console.log("Page changed to:", page);
  };

  // Apply theme, density, and animations
  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark", "compact", "no-animations");

    if (theme === "system") {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        root.classList.add("dark");
      } else {
        root.classList.add("light");
      }
    } else {
      root.classList.add(theme);
    }

    if (density === "compact") {
      root.classList.add("compact");
    }

    if (!animations) {
      root.classList.add("no-animations");
    }
  }, [theme, density, animations]);

  // Fetch posts on mount and auth changes
  const loadPosts = async () => {
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
  };

  useEffect(() => {
    loadPosts();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) loadPosts();
    });

    return () => subscription.unsubscribe();
  }, [fetchPosts]);

  // Infinite scroll logic with debounce
  const handleScroll = debounce(async () => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100 &&
      hasMore &&
      !isLoading
    ) {
      setIsLoading(true);
      try {
        await fetchPosts(true);
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
  }, 200);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div className="flex min-h-screen bg-transparent">
      <Sidebar
        onSidebarToggle={handleSidebarToggle}
        isExpanded={isSidebarExpanded}
        onPageChange={handlePageChange}
      />
      <main
        className={`flex-1 transition-all duration-300 ${
          isSidebarExpanded ? "ml-64" : "ml-20"
        }`}
      >
        <div className="p-8 dark:bg-gray-900 dark:text-gray-100">
          <Header />
          <Outlet /> {/* Render child routes here */}
        </div>
      </main>
    </div>
  );
}

export default AppLayout;
