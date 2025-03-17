import React from "react";
import { Bell, Sun, Moon } from "lucide-react";

import { Button } from "../components/ui/button"; // Import shadcn Button
import { cn } from "../lib/utils"; // Import shadcn utility for class merging

const Header = () => {


  // Toggle between light and dark mode


  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"></h1>
        <p
          className={cn(
             "text-theme-light-secondary"
          )}
        ></p>
      </div>
      <div className="flex items-center gap-4">
        {/* Light/Dark Mode Toggle Button */}
        <Button
         
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-full transition-colors",
             "hover:bg-gray-100"
          )}
        >
          { (
            <Moon className="w-5 h-5 text-theme-light-secondary" />
          )}
        </Button>

        {/* Notification Bell */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative rounded-full transition-colors",
            "hover:bg-gray-100"
          )}
        >
          <Bell className="w-5 h-5 text-theme-dark-secondary dark:text-theme-light-secondary" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </Button>

        {/* Profile Picture */}
        <img
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&q=80"
          alt="Profile"
          className={cn(
            "w-8 h-8 rounded-full ring-2",
            "ring-white"
          )}
        />
      </div>
    </div>
  );
};

export default Header;
