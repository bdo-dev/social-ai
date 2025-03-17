import axios from "axios";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { supabase } from "../lib/subabase.js";

import Sentiment from "sentiment";
import { log } from "console";
import { deleteFacebookComment } from "../services/facebookService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sentiment = new Sentiment();
// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI("");
const fileManager = new GoogleAIFileManager(
  ""
);

// Session manager to store conversation history
const sessions = new Map();

function getSession(userId) {
  if (!sessions.has(userId)) {
    sessions.set(userId, []);
  }
  return sessions.get(userId);
}

function updateSession(userId, message) {
  const session = getSession(userId);
  session.push(message);
  if (session.length > 10) {
    // Limit history to last 10 messages
    session.shift();
  }
}

// Upload file to Gemini
async function uploadToGemini(filePath, mimeType) {
  try {
    const fileData = await fs.promises.readFile(filePath);
    const uploadResult = await fileManager.uploadFile(filePath, {
      mimeType,
      displayName: path.basename(filePath),
      fileData,
    });
    const file = uploadResult.file;
    // console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
    return file;
  } catch (error) {
    console.error("Error uploading file to Gemini:", error);
    throw error;
  }
}

// Gemini model configuration
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// Process file upload and chat response
async function run(audioFilePath) {
  try {
    const files = [await uploadToGemini(audioFilePath, "audio/x-mp3")];
    // console.log("Files uploaded:", files);
    const { data: activeSession, error: fetchError } = await supabase
      .from("chat_sessions")
      .select("id, metadata")
      .eq("is_active", true)
      .single();
    const existingPrompt = activeSession.metadata?.prompt || "";
    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {
              fileData: { mimeType: files[0].mimeType, fileUri: files[0].uri },
            },
            {
              text: ` اسمع الصوت و رد عليه باللهجه الليبيه بناد علي هذه التعليمات ${existingPrompt}`,
            },
          ],
        },
      ],
    });

    const result = await chatSession.sendMessage("");
    // console.log("Model response:", result.response.text());
    return result.response.text();
  } catch (error) {
    console.error("Error in run function:", error);
    throw error;
  }
}

// Save audio file
async function saveAudioFile(audioUrl) {
  try {
    const fileName = `audio.mp3`;
    const savePath = path.join(__dirname, "saved_audio", fileName);
    if (!fs.existsSync(path.join(__dirname, "saved_audio"))) {
      await fs.promises.mkdir(path.join(__dirname, "saved_audio"), {
        recursive: true,
      });
    }
    const response = await axios({
      method: "get",
      url: audioUrl,
      responseType: "stream",
    });
    const writer = fs.createWriteStream(savePath);
    response.data.pipe(writer);
    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
    // console.log(`Audio file saved at ${savePath}`);
    return savePath;
  } catch (error) {
    console.error("Error saving audio file:", error);
    throw error;
  }
}

// Handle audio processing
async function handleAudio(audioUrl) {
  try {
    const audioFilePath = await saveAudioFile(audioUrl); // Save the audio file and get the path
    const response = await run(audioFilePath); // Process the audio file
    return response;
  } catch (error) {
    console.error("Error handling audio:", error);
    throw error;
  }
}

// Send Messenger message
async function sendMessengerMessage(recipientId, message) {
  const PAGE_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;
  const url = `https://graph.facebook.com/v21.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;
  try {
    const response = await axios.post(url, {
      recipient: { id: recipientId },
      message: { text: message },
    });
    // console.log("Message sent:", response.data);
  } catch (error) {
    console.error(
      "Error sending message:",
      error.response ? error.response.data : error.message
    );
  }
}

// Like a comment
async function likeComment(commentId) {
  const PAGE_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;
  const url = `https://graph.facebook.com/v21.0/${commentId}/likes?access_token=${PAGE_ACCESS_TOKEN}`;
  try {
    const response = await axios.post(url);
    // console.log("Comment liked successfully:", response.data);
  } catch (error) {
    console.error(
      "Error liking comment:",
      error.response ? error.response.data : error.message
    );
  }
}

// Reply to a comment
async function replyToComment(commentId, message) {
  const PAGE_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;
  const url = `https://graph.facebook.com/v21.0/${commentId}/comments?access_token=${PAGE_ACCESS_TOKEN}`;
  try {
    const response = await axios.post(url, { message });
    // console.log("Replied to comment:", response.data);
  } catch (error) {
    console.error(
      "Error replying to comment:",
      error.response ? error.response.data : error.message
    );
  }
}

// Webhook verification
export function verifyWebhook(req, res) {
  const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified successfully");
    res.status(200).send(challenge);
  } else {
    console.error("Webhook verification failed");
    res.sendStatus(403);
  }
}

// Handle webhook events
export async function handleWebhookEvents(req, res) {
  const body = req.body;

  console.log("Received webhook payload:", JSON.stringify(body, null, 2));
  if (body.object === "page") {
    const promises = [];
    for (const entry of body.entry) {
      if (entry.messaging) {
        for (const webhookEvent of entry.messaging) {
          const senderId = webhookEvent.sender.id;
          if (webhookEvent.message) {
            if (webhookEvent.message.text) {
              const messageText = webhookEvent.message.text;
              const session = getSession(senderId);

              // Add user message to session
              updateSession(senderId, {
                role: "user",
                parts: [{ text: messageText }],
              });

              // Call Gemini API with the session history
              promises.push(
                callGeminiAPI(session)
                  .then((response) => {
                    updateSession(senderId, {
                      role: "model",
                      parts: [{ text: response }],
                    });
                    return sendMessengerMessage(senderId, response);
                  })
                  .catch((error) =>
                    console.error("Error handling text message:", error)
                  )
              );
            }
            if (webhookEvent.message.attachments) {
              for (const attachment of webhookEvent.message.attachments) {
                if (attachment.type === "audio") {
                  const audioUrl = attachment.payload.url;
                  promises.push(
                    handleAudio(audioUrl)
                      .then((response) =>
                        sendMessengerMessage(senderId, response)
                      )
                      .catch((error) =>
                        console.error("Error handling audio message:", error)
                      )
                  );
                } else {
                  promises.push(
                    sendMessengerMessage(
                      senderId,
                      "I currently support text and audio messages only."
                    )
                  );
                }
              }
            }
          }
        }
      }
      if (entry.changes) {
        for (const change of entry.changes) {
          if (change.field === "feed") {
            const commentId = change.value.comment_id;
            const commentMessage = change.value.message;
            const pageId = change.value.post_id.split("_")[0];
            // console.log("pageid is :", pageId);
            const usrId = change.value.from.id;
            if (pageId !== usrId) {
              if (
                change.value.message === undefined &&
                change.value.item !== "reaction"
              )
                continue;
              // console.log(change.value?.reaction_type);
              console.log(change.value);

              if (change.value?.reaction_type !== undefined) {
                if (change.value.verb === "edit") continue;
                addOrRemoveLike(
                  change.value?.parent_id,
                  change.value.verb === "remove"
                );
              } else {
                hadnleSentiment(change, pageId);
                const replyMessage = `Thank you for your comment: "${commentMessage}"!`;
                promises.push(
                  replyToComment(commentId, replyMessage)
                    .then(() => likeComment(commentId))
                    .catch((error) =>
                      console.error("Error handling comment:", error)
                    )
                );
              }
            }
          }
        }
      }
    }
    await Promise.all(promises);
    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
}
const isCommentDelete = async (pageId) => {
  try {
    console.log(pageId);

    const { data } = await supabase
      .from("profiles")
      .select("autoDelete")
      .eq("page_id", pageId);
    console.log("data in back", data);

    const res = await data[0].autoDelete;
    console.log("res", res);
    return res;
  } catch (error) {
    console.log("in auto Delete ", error);
  } finally {
    // return false;
  }
};
// Call Gemini AI API
async function callGeminiAPI(session) {
  try {
    const chatSession = model.startChat({
      generationConfig,
      history: session,
    });
    const { data: activeSession, error: fetchError } = await supabase
      .from("chat_sessions")
      .select("id, metadata")
      .eq("is_active", true)
      .single();

    if (fetchError) throw fetchError;
    if (!activeSession) throw new Error("No active session found");

    // 2. Merge existing prompt with the new prompt
    const existingPrompt = activeSession.metadata?.prompt || "";
    const lastMessage = session[session.length - 1].parts[0].text;

    // Add Libyan dialect reinforcement
    const prompt = `${lastMessage}\n\nthat was the user message now answer it based on this infomation ${existingPrompt}`;

    const result = await chatSession.sendMessage(prompt);

    return result.response.text();
  } catch (error) {
    console.error("Error in callGeminiAPI:", error);
    return "يا هلا، فيه مشكلة تقنية بسيطة. ممكن تعيد المحاولة بعد شوية؟";
  }
}

const hadnleSentiment = async (comment, pageId) => {
  try {
    const idFacebookPost = await fetchPostId(comment.value.post_id);
    const sentimentComment = await analysisComment(comment.value.message);
    console.log("facebook here ok  :", idFacebookPost, sentimentComment);
    const is = await isCommentDelete(pageId);
    console.log(is);

    if (is) {
      if (sentimentComment === "negative") {
        console.log("yes");

        await deleteFacebookComment(comment.value.comment_id);
        return;
      }
    }

    const { error } = await supabase.from("comments").insert({
      postId: idFacebookPost,
      content: comment.value.message,
      sentiment: sentimentComment,
      authorName: comment.value.from.name,
      isHidden: false,
      comment_id_facebook: comment.value.comment_id,
    });
    if (error) log(error);
  } catch (error) {
    console.log("handleSentiment", error);
  }
};

const analysisComment = async (content) => {
  const textAfterConvert = await convertTextToEnglish(content);
  // console.log(textAfterConvert);

  const result = sentiment.analyze(textAfterConvert);
  // log(result);
  if (result.score > 0) {
    return "positive";
  } else if (result.score < 0) {
    return "negative";
  } else {
    return "neutral";
  }
};
const fetchPostId = async (idFacebook) => {
  const { data, error } = await supabase
    .from("posts")
    .select("id")
    .eq("id_post_facebook", idFacebook);
  // console.log("in data base ", data);

  if (error) {
    throw new Error(error.message);
  }
  return data?.[0]?.id;
};

const convertTextToEnglish = async (text) => {
  const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [
          {
            text: "Translate the given text into English while preserving its original meaning and tone. Ensure clarity, accuracy, and natural phrasing. (The text may be in Libyan dialect, so I want the translation to be precise and understandable. Do not add anything else, and provide only the translated sentence that I sent without any extra commentary.)\n",
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: "Okay, I understand. Please provide the text you want me to translate.\n",
          },
        ],
      },
    ],
  });

  const result = await chatSession.sendMessage(text);
  const res = result.response.text();

  return res;
};
// analysisComment(" شن صاير معاكم ");
const addOrRemoveLike = async (comment_id, isRemove) => {
  console.log(comment_id, isRemove);
  const { data, error } = await supabase
    .from("comments")
    .select("id")
    .eq("comment_id_facebook", comment_id);
  if (data === null) return;
  if (error) {
    console.log(error);
  }
  const { data: comment, error: errorComment } = await supabase.rpc(
    "comment_count",
    {
      comment_id,
      should_decrement: isRemove,
    }
  );
  if (errorComment) console.error(errorComment);
  else console.log(comment, isRemove);
};
