import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { supabase } from "../lib/subabase.js";
dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMEAI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const sessions = new Map();

function getSession(userId) {
  if (!sessions.has(userId)) {
    sessions.set(userId, []); // Initialize an empty session
  }
  return sessions.get(userId);
}

function updateSession(userId, message) {
  const session = getSession(userId);
  session.push(message);
  if (session.length > 100) {
    session.shift();
  }
}

export const handleTextMessage = async (req, res) => {
  const { message, sessionId, prompt } = req.body;
  console.log(1);

  const { user } = req;
  if (!message || !sessionId) {
    return res.status(400).json({ error: "Message and userId are required" });
  }
  console.log(prompt);

  const userId = sessionId;
  try {
    const session = getSession(userId);

    if (prompt) {
      const promptMessage = {
        role: "user", // Use "user" role for the prompt
        parts: [{ text: prompt + "لا تتكلم مع المستخدم باللغه الاجنبيه " }],
      };

      if (session.length === 0 || session[0].parts[0].text !== prompt) {
        session.unshift(promptMessage);
      }
    }

    updateSession(userId, { role: "user", parts: [{ text: message }] });

    const chatSession = model.startChat({
      generationConfig,
      history: session,
    });

    const result = await chatSession.sendMessage(message);
    const response = result.response.text();
    console.log(response);

    updateSession(userId, { role: "model", parts: [{ text: response }] });

    res.json({ response });
  } catch (error) {
    console.error("Error in handleTextMessage:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
};
export const fetchChatSessions = async (req, res) => {
  try {
    const { user } = req;

    const { data: chatSessions, error } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.status(200).json(chatSessions);
  } catch (error) {
    console.error("Error fetching chat sessions:", error.message);
    res.status(500).json({ error: error.message });
  }
};
export const editChatSession = async (req, res) => {
  try {
    const { user } = req;
    const { prompt: newPrompt } = req.body;

    // Get the active session for the user
    const { data: activeSession, error: fetchError } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (fetchError) throw fetchError;
    if (!activeSession) throw new Error("No active chat session found");

    // Combine existing prompts with new prompt
    const updatedPrompts = [
      ...(activeSession.prompts || []), // Handle case where prompts might be null
      newPrompt
    ];

    // Update the chat session with merged prompts
    const { data: updatedSession, error: updateError } = await supabase
      .from("chat_sessions")
      .update({
        prompts: updatedPrompts,
        updated_at: new Date().toISOString()
      })
      .eq("id", activeSession.id)
      .single();

    if (updateError) throw updateError;

    res.status(200).json(updatedSession);
  } catch (error) {
    console.error("Error updating chat session:", error.message);
    res.status(500).json({ error: error.message });
  }
};
export const createChatSession = async (req, res) => {
  try {
    const { user } = req;
    const { metadata } = req.body;

    // Deactivate all previous sessions for the user
    await supabase
      .from("chat_sessions")
      .update({ is_active: false })
      .eq("user_id", user.id);

    // Create a new session
    const { data: newSession, error } = await supabase
      .from("chat_sessions")
      .insert([
        {
          user_id: user.id,
          is_active: true,
          metadata,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(newSession);
  } catch (error) {
    console.error("Error creating chat session:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const mergeActiveSession = async (req, res) => {
  try {
    const { user } = req;
    const { currentPrompt } = req.body;

    // 1. Get the active session
    const { data: activeSession, error: fetchError } = await supabase
      .from('chat_sessions')
      .select('id, metadata')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (fetchError) throw fetchError;
    if (!activeSession) throw new Error('No active session found');

    // 2. Merge existing prompt with the new prompt
    const existingPrompt = activeSession.metadata?.prompt || '';
    const mergedPrompt = existingPrompt
      ? `${existingPrompt} ${currentPrompt}` // Append new prompt to existing one
      : currentPrompt;

    // 3. Update metadata with the merged prompt
    const updatedMetadata = {
      ...activeSession.metadata, // Keep other metadata values
      prompt: mergedPrompt, // Update only the prompt
    };

    // 4. Save the updated metadata back to the database
    const { data: updatedSession, error: updateError } = await supabase
      .from('chat_sessions')
      .update({
        metadata: updatedMetadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', activeSession.id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.status(200).json({
      message: 'Prompt merged successfully',
      session: updatedSession,
    });

  } catch (error) {
    console.error('Error merging session:', error.message);
    res.status(500).json({ error: error.message });
  }};
export const updateChatSessionMetadata = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { metadata } = req.body;

    const { data: updatedSession, error } = await supabase
      .from("chat_sessions")
      .update({ metadata })
      .eq("id", sessionId)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json(updatedSession);
  } catch (error) {
    console.error("Error updating chat session metadata:", error.message);
    res.status(500).json({ error: error.message });
  }
};
export const addMessageToSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { role, content } = req.body;

    const { data: session, error: sessionError } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError) throw sessionError;

    const updatedMessages = [
      ...(session.messages || []),
      {
        id: crypto.randomUUID(),
        role,
        content,
        timestamp: new Date().toISOString(),
      },
    ];

    const { data: updatedSession, error: updateError } = await supabase
      .from("chat_sessions")
      .update({ messages: updatedMessages })
      .eq("id", sessionId)
      .select()
      .single();

    if (updateError) throw updateError;

    res.status(200).json(updatedSession);
  } catch (error) {
    console.error("Error adding message to session:", error.message);
    res.status(500).json({ error: error.message });
  }
};
