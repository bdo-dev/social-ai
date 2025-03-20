import React, { useState, useRef } from "react";
import { Send, Bot, Settings2, History, FileInput } from "lucide-react";
import { useChatbotStore, type ChatMessage } from "../store/chatbot";

import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Toggle } from "../components/ui/toggle";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../components/ui/dropdown-menu";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import { read, utils } from "xlsx";
import axios from "axios";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
const API_BASE_URL = "http://localhost:3000/api";
const Chatbot = () => {


  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    prompt,
    tone,
    sessions,
    selectedSessionId,
    setPrompt,
    setTone,
    createSession,
    selectSession,
    sendMessage,
  } = useChatbotStore();

  const [testMessage, setTestMessage] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = utils.sheet_to_json(firstSheet, { header: 1 });
        
        const formattedData = jsonData
          .map((row: any) => row.join("\t"))
          .join("\n");
        
        setPrompt(`${prompt}\n\n[Uploaded Data]:\n${formattedData}`);
        setIsProcessingFile(false);
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error processing file:", error);
      setIsProcessingFile(false);
      alert("Error processing Excel file. Please check the format.");
    }
  };

  const handleCreateSession = () => {
    createSession();
  };

  const handleSendMessage = async () => {
    if (!testMessage.trim() || !selectedSessionId) return;
    await sendMessage(testMessage);
    setTestMessage("");
  };

  
  const handleDeploy = async () => {
  setIsDeploying(true);

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const authToken = session?.access_token;

    if (!authToken) {
      throw new Error("No authentication token found");
    }

    const currentSession = sessions.find((s) => s.id === selectedSessionId);

    if (!currentSession) {
      throw new Error("No active session found");
    }

    const response = await axios.post(
      `${API_BASE_URL}/chat-sessions`,
      {
        prompt: currentSession.metadata.prompt,
        metadata: { // Send prompt and tone inside "metadata"
          prompt: currentSession?.metadata.prompt,
          tone: currentSession?.metadata.tone 
        }
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (response.status === 201) {
      toast({
        title: "Success",
        description: "Chatbot configuration deployed successfully!",
        variant: "default",
      });
    } else {
      throw new Error("Failed to deploy chatbot configuration");
    }
  } catch (error) {
    console.error("Error deploying chatbot:", error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to deploy chatbot",
      variant: "destructive",
    });
  } finally {
    setIsDeploying(false);
    setIsDialogOpen(false);
  }
};
const handleMergePrompt = async () => {
  setIsAdding(true);
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const authToken = session?.access_token;

    if (!authToken) {
      throw new Error("No authentication token found");
    }

    // Get current prompt from session metadata or global state
    const currentPrompt = currentSession?.metadata.prompt || prompt;

    const response = await axios.post(
      `${API_BASE_URL}/chat-sessions/merge`,
      { currentPrompt },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (response.status === 200) {
      toast({
        title: "Success",
        description: "Prompt merged successfully into live chatbot!",
        variant: "default",
      });
    }
  } catch (error) {
    console.error("Error merging prompt:", error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to merge prompt",
      variant: "destructive",
    });
  } finally {
    setIsAdding(false);
    setIsAddDialogOpen(false);
  }
};
  const handleAddToChatbot = () => setIsAddDialogOpen(true);

  const currentSession = sessions.find((s) => s.id === selectedSessionId);
  const last10Messages = currentSession?.messages?.slice(-10) || [];

  const ChatMessage = ({ message }: { message: ChatMessage }) => (
    <div className={`flex items-start gap-2 md:gap-3 ${message.role === "assistant" ? "flex-row" : "flex-row-reverse"}`}>
      <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center ${
        message.role === "assistant" 
          ? "bg-gradient-to-r from-blue-600 to-purple-600" 
          :  "bg-gray-200"}`}>
        {message.role === "assistant" ? (
          <Bot className="w-4 h-4 md:w-5 md:h-5 text-white" />
        ) : (
          <div className="w-4 h-4 md:w-5 md:h-5 bg-gray-500 rounded-full" />
        )}
      </div>
      <Card className={`max-w-[85%] md:max-w-[80%] ${
        message.role === "assistant" 
          ? "bg-background" 
          : "bg-gradient-to-r from-blue-600 to-purple-600 text-white"}`}>
        <CardContent className="p-2 md:p-4 text-sm md:text-base">
          <ReactMarkdown>{message.content}</ReactMarkdown>
          <span className="text-xs mt-1 md:mt-2 block text-muted-foreground">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className={`p-4 md:p-8 ${ "bg-theme-light"}`}>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Chatbot Development
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Configure and test your customer service chatbot
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="col-span-1 space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-blue-600" />
                  Configuration
                </CardTitle>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    disabled={isProcessingFile}
                    className="text-sm md:text-base"
                  >
                    <FileInput className="w-4 h-4 mr-2" />
                    {isProcessingFile ? "Processing..." : "Import Excel"}
                  </Button>
                </motion.div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Chatbot Prompt</Label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter the prompt that will guide your chatbot's responses..."
                  className="min-h-[120px] text-sm md:text-base"
                />
              </div>
              <div>
                <Label>Response Tone</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {["formal", "casual", "friendly", "professional", "sarcastic", "humorous"].map((t) => (
                    <Toggle
                      key={t}
                      pressed={tone === t}
                      onPressedChange={() => setTone(t as any)}
                      className="w-full capitalize text-xs md:text-sm"
                    >
                      {t}
                    </Toggle>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  onClick={handleAddToChatbot}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-sm md:text-base"
                >
                  Add to Chatbot
                </Button>
                <Button
                  onClick={handleDeploy}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-sm md:text-base"
                >
                  Deploy Live
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                Test Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleCreateSession}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-sm md:text-base"
              >
                New Test Session
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full text-sm md:text-base">
                    Select Previous Session
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  {sessions.map((session) => (
                    <DropdownMenuItem
                      key={session.id}
                      onSelect={() => selectSession(session.id)}
                      className="text-xs md:text-sm"
                    >
                      Session {session.id.slice(0, 8)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
        </div>

        <Card className="md:col-span-2 flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-12rem)]">
          <CardContent className="flex-1 overflow-y-auto space-y-4 p-4 md:p-6">
            {selectedSessionId ? (
              last10Messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm md:text-base">
                Create or select a session to begin
              </div>
            )}
          </CardContent>
          <div className="border-t p-2 md:p-4">
            <div className="flex gap-2 flex-col md:flex-row">
              <Input
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Type a message to test the chatbot..."
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 text-sm md:text-base"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!selectedSessionId || !testMessage.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 w-full md:w-auto text-sm md:text-base"
              >
                <Send className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deploy Live</DialogTitle>
            <DialogDescription>
              The prompts you set will be used to interact with your customers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
              Confirm Deploy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Addition</DialogTitle>
      <DialogDescription>
        Current prompt will be merged with the live chatbot's configuration.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
        Cancel
      </Button>
      <Button 
        className="bg-gradient-to-r from-blue-600 to-purple-600"
        onClick={handleMergePrompt}
        disabled={isAdding}
      >
        {isAdding ? "Merging..." : "Confirm"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  );
};

export default Chatbot;