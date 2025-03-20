import { create } from "zustand";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
const uuidv4 = () => crypto.randomUUID();

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  messages: ChatMessage[];
  metadata: {
    tone: string;
    prompt: string;
  };
}
const API_BASE_URL = "http://localhost:3000/api";


interface ChatbotStore {
  prompt: string;
  tone: string;
  sessions: ChatSession[];
  selectedSessionId: string | null;
  setPrompt: (prompt: string) => void;
  setTone: (tone: string) => void;
  createSession: () => void;
  selectSession: (sessionId: string | null) => void;
  sendMessage: (message: string) => Promise<void>;
}

export const useChatbotStore = create<ChatbotStore>((set, get) => ({
  prompt: "You are a helpful customer service assistant.",
  tone: "formal",
  sessions: [],
  selectedSessionId: null,

  setPrompt: (prompt) => set({ prompt }),
  setTone: (tone) => set({ tone }),

  createSession: () => {
    const newSession = {
      id: crypto.randomUUID(),
      messages: [],
      metadata: {
        tone: get().tone,
        prompt: get().prompt
      }
    };
    set((state) => ({
      sessions: [newSession, ...state.sessions],
      selectedSessionId: newSession.id
    }));
  },

  selectSession: (sessionId) => set({ selectedSessionId: sessionId }),

  sendMessage: async (message) => {
    const { selectedSessionId, sessions } = get();
    if (!selectedSessionId) return;
  
    try {
      // Create user message first
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: message,
        timestamp: new Date().toISOString()
      };
  
      // Immediately update state with user message
      set((state) => ({
        sessions: state.sessions.map(session => 
          session.id === selectedSessionId
            ? { ...session, messages: [...session.messages, userMessage] }
            : session
        )
      }));
  
      // Get Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
  
      if (!token) {
        throw new Error("No authentication token found");
      }
  
      // Get current session data
      const currentSession = get().sessions.find(s => s.id === selectedSessionId);
      
      // API call
      const response = await fetch('http://localhost:3000/api/chat/text', {
        method: 'POST',
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message,
          sessionId: selectedSessionId,
          prompt: currentSession?.metadata.prompt || get().prompt,
          tone: currentSession?.metadata.tone || get().tone
        })
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
  
      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString()
      };
  
      // Update state with assistant message
      set((state) => ({
        sessions: state.sessions.map(session => 
          session.id === selectedSessionId
            ? { ...session, messages: [...session.messages, assistantMessage] }
            : session
        )
      }));
  
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    }
  }
}));