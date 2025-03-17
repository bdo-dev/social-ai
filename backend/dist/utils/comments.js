import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
const apiKey = "AIzaSyB0AqM4mbAjIBAAs3i9w-WHWbUz4xoWdG4";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});
const generationConfig = {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 256,
  responseMimeType: "text/plain",
};
async function run() {
  const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [
          {
            text: "You are a professional Facebook page moderator who speaks in a friendly and polite Libyan Arabic dialect. Respond to comments politely in Libyan Arabic without asking any follow-up questions. Your responses should be concise, friendly, and engaging.",
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: "تمام، فهمت عليك! حاضر، بنجاوب بكل ود واحترام بدون أسئلة إضافية. يلا نبدأ! 😊",
          },
        ],
      },
    ],
  });
  const result = await chatSession.sendMessage("ليبيا حلوا");
  console.log(result.response.text());
}
run();
