import { create } from "zustand";
import axios from "axios";
import { toast } from "@/hooks/use-toast"; // Import the toast function

export type ToneType = "funny" | "formal" | "focused" | "emotional";

interface AIStore {
  isGenerating: boolean;
  generatedText: string;
  generatedImages: string[];
  setGenerating: (status: boolean) => void;
  generateContent: (prompt: string, tone: ToneType) => Promise<string>;
  generateImage: (prompt: string) => Promise<string[]>;
}

export const useAIStore = create<AIStore>((set) => ({
  isGenerating: false,
  generatedText: "",
  generatedImages: [],
  setGenerating: (status) => set({ isGenerating: status }),

  generateContent: async (prompt: string, tone: ToneType) => {
    const tokenCost = 5;

    try {
      // Check for sufficient tokens
      const balance = 1000;

      if (!balance) {
        toast({
          title: "Insufficient Tokens",
          description: "You don't have enough tokens to generate content.",
          variant: "destructive",
        });
        return prompt;
      }
      set({ isGenerating: true });

      // Show toast for content generation start
      toast({
        title: "Generating Content",
        description: "Your content is being generated. Please wait...",
      });

      const text = `ب اسلوب ${tone} ${prompt} Give me result in JSON format with a single field named "prompt" and do not return an array. يجب أن تكون النتيجة باللغة العربية.`;
      console.log(text);

      const content = await axios
        .post("http://localhost:3000/api/generateContent", {
          promptContent: text,
        })
        .then((res: any) => res.data);

      set({ generatedText: content.prompt, isGenerating: false });

      // Show toast for content generation success
      toast({
        title: "Content Generated",
        description: "Your content has been successfully generated!",
        variant: "default",
      });

      return content.prompt;
    } catch (error) {
      console.error("Error generating content:", error);

      // Show toast for content generation failure
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      set({ isGenerating: false });
    }
  },

  generateImage: async (prompt: string) => {
  
    const tokenCost = 10;
    // Check for sufficient tokens
    const balance = 100
    if (!balance) {
      toast({
        title: "Insufficient Tokens",
        description: "You don't have enough tokens to generate images.",
        variant: "destructive",
      });
      throw new Error("Insufficient tokens");
    }

    set({ isGenerating: true });

    // Show toast for image generation start
    toast({
      title: "Generating Images",
      description: "Your images are being generated. Please wait...",
    });

    try {
      const images = await axios
        .post("http://localhost:3000/api/generateImage", {
          promptImage: prompt,
        })
        .then((res: any) => res.data);

      set({ generatedImages: images.image, isGenerating: false });

      // Show toast for image generation success
      toast({
        title: "Images Generated",
        description: "Your images have been successfully generated!",
        variant: "default",
      });

      return images.image;
    } catch (error) {
      console.error("Error generating images:", error);

      // Show toast for image generation failure
      toast({
        title: "Error",
        description: "Failed to generate images. Please try again.",
        variant: "destructive",
      });

      throw error;
    } finally {
      set({ isGenerating: false });
    }
  },
}));
