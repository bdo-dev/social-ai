import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, useLocation } from "react-router-dom";

import {
  Sun,
  Moon,
  Rocket,
  LayoutDashboard,
  Bot,
  BarChart,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Features list for the marketing section
const features = [
  {
    icon: <LayoutDashboard className="w-6 h-6" />,
    title: "Unified Dashboard",
    description: "Manage all your social accounts in one place",
  },
  {
    icon: <Bot className="w-6 h-6" />,
    title: "AI-Powered Tools",
    description: "Smart content generation and automated responses",
  },
  {
    icon: <BarChart className="w-6 h-6" />,
    title: "Advanced Analytics",
    description: "Track performance with real-time insights",
  },
];

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup
  const [email, setEmail] = useState(""); // Email input state
  const [password, setPassword] = useState(""); // Password input state
  const [username, setUsername] = useState(""); // Username input state (for signup)
  const [loading, setLoading] = useState(false); // Loading state for form submission
  const [error, setError] = useState<string | null>(null); // Error message state
  const navigate = useNavigate(); // Navigation hook
  const location = useLocation(); // Location hook to get the previous route

  // Access the theme and setTheme function from the settings store



  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        const from = location.state?.from?.pathname || "/";
        navigate(from);
      } else {
        const { data: existingUsers, error: checkError } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", username);

        if (checkError) {
          throw new Error("Failed to check username availability");
        }

        if (existingUsers && existingUsers.length > 0) {
          throw new Error("Username already taken");
        }

        const { error: signUpError, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              full_name: username,
            },
          },
        });

        if (signUpError) {
          if (signUpError.message.includes("User already registered")) {
            throw new Error("Email already registered");
          } else {
            throw signUpError;
          }
        }

        if (data.user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              username,
              full_name: username,
            });
          if (profileError) throw profileError;
        }

        navigate("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Toggle between dark and light mode

  return (
    <div
      className={cn(
        "min-h-screen flex",
          "bg-gray-50"
      )}
    >
      {/* Left Side - Marketing Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="hidden lg:flex w-2/5 bg-gradient-to-br from-purple-600 to-blue-500 p-12 text-white "
      >
        <div className="max-w-md space-y-8 mt-56">
          <div className="flex items-center gap-2">
            <Rocket className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Welcome to Postly</h1>
          </div>

          <p className="text-lg opacity-90">
            Elevate your social media management with AI-powered tools and
            seamless multi-platform integration.
          </p>

          <div className="space-y-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 backdrop-blur-sm bg-white/5 rounded-xl"
              >
                <div className="p-2 bg-white/10 rounded-lg">{feature.icon}</div>
                <div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="opacity-80">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={cn(
            "w-full max-w-md backdrop-blur-lg rounded-2xl border p-8 shadow-xl",
             "bg-white/90 border-gray-200"
          )}
        >
          {/* Theme Toggle */}
          <div className="flex justify-end mb-6">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-opacity-20"
            >
              { (
                <Moon className="w-5 h-5" />
              )}
            </Button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : "signup"}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                {isLogin ? "Welcome Back" : "Get Started"}
              </h2>

              {/* Form */}
              <form onSubmit={handleAuth} className="space-y-4">
                {!isLogin && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <label className="block text-sm font-medium mb-1">
                      Username
                    </label>
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) =>
                        setUsername(e.target.value.toLowerCase())
                      }
                      className="w-full"
                      required
                      pattern="[a-zA-Z0-9_]+"
                      title="Username can only contain letters, numbers, and underscores"
                      minLength={3}
                      maxLength={20}
                    />
                  </motion.div>
                )}

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                    required
                  />
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <label className="block text-sm font-medium mb-1">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full"
                    required
                    minLength={6}
                  />
                </motion.div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-lg font-semibold shadow-lg"
                >
                  {loading ? (
                    <span className="animate-pulse">Processing...</span>
                  ) : isLogin ? (
                    "Sign In"
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </motion.div>
          </AnimatePresence>

          {/* Switch between login/signup */}
          <motion.div className="mt-6 text-center" whileHover={{ scale: 1.02 }}>
            <Button
              onClick={() => setIsLogin(!isLogin)}
              variant="link"
              className="text-sm font-medium"
            >
              {isLogin ? (
                <div className="flex flex-col">
                  <div>
                    New to Postly?{" "}
                    <span className="ml-1 text-purple-600 hover:text-purple-700">
                      Create an account
                    </span>
                  </div>{" "}
                  <div className="ml-1 text-purple-600 hover:text-purple-700">
                    forget the password ?{" "}
                  </div>
                </div>
              ) : (
                <>
                  Already have an account?{" "}
                  <span className="ml-1 text-purple-600 hover:text-purple-700">
                    Sign in
                  </span>
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default AuthForm;
