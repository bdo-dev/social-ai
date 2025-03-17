import React, { useState } from "react";
import {
  BarChart3,
  Calendar,
  MessageCircle,
  Settings,
  Users,
  LogOut,
  MessageSquare,
  Bot,
  Wallet,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase"; // Adjust the path as necessary

import { Button } from "../components/ui/button"; // Import shadcn Button
import { cn } from "../lib/utils"; // Import shadcn utility for class merging

interface SidebarProps {
  onPageChange: (page: string) => void;
  onSidebarToggle: (isExpanded: boolean) => void;
  isExpanded: boolean;
}

const Sidebar = ({
  onPageChange,
  onSidebarToggle,
  isExpanded,
}: SidebarProps) => {
 
 
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(isExpanded);

  const toggleSidebar = () => {
    const newState = !isSidebarExpanded;
    setIsSidebarExpanded(newState);
    onSidebarToggle(newState);
  };

  const menuItems = [
    // {
    //   icon: BarChart3,
    //   label: "Analytics",
    //   id: "analytics",
    //   path: "/analytics",
    // },
    // { icon: Calendar, label: "Calendar", id: "calendar", path: "/calendar" },
    { icon: MessageCircle, label: "Posts", id: "posts", path: "/posts" },
    {
      icon: MessageSquare,
      label: "Comments",
      id: "comments",
      path: "/comments",
    },
    { icon: Bot, label: "Chatbot", id: "chatbot", path: "/chatbot" },
    // { icon: Wallet, label: "Billing", id: "billing", path: "/billing" },
    // { icon: Settings, label: "Settings", id: "settings", path: "/settings" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onPageChange(path);
  };

  return (
    <div
      className={cn(
        "backdrop-blur-xl h-screen border-r p-4 fixed left-0 transition-all duration-300",
        isSidebarExpanded ? "w-64" : "w-20",
        
          
           "bg-white/50 border-gray-200 text-theme-light-primary"
      )}
    >
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
          <BarChart3 className="w-6 h-6 text-white" />
        </div>
        {isSidebarExpanded && (
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            socialy
          </span>
        )}
      </div>
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <Button
            key={item.label}
            onClick={() => handleNavigation(item.path)}
            variant="ghost"
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg mb-1 transition-all w-full justify-start",
              location.pathname === item.path
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                : "text-theme-light-secondary hover:bg-gray-100"
            )}
          >
            <item.icon className="w-5 h-5" />
            {isSidebarExpanded && (
              <span className="font-medium">{item.label}</span>
            )}
          </Button>
        ))}
      </nav>
      <div className="absolute bottom-8 left-4 right-4">
        <Button
          onClick={toggleSidebar}
          variant="ghost"
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg transition-colors w-full justify-start",
             "text-theme-light-secondary hover:bg-gray-100"
          )}
        >
          {isSidebarExpanded ? (
            <ChevronLeft className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
          {isSidebarExpanded && <span className="font-medium">Collapse</span>}
        </Button>
        <Button
          onClick={handleLogout}
          variant="ghost"
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg transition-colors w-full justify-start",
             "text-theme-light-secondary hover:bg-gray-100"
          )}
        >
          <LogOut className="w-5 h-5" />
          {isSidebarExpanded && <span className="font-medium">Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
