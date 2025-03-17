import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { runJson } from "./format.js";

const apiKey = "AIzaSyB0AqM4mbAjIBAAs3i9w-WHWbUz4xoWdG4";
const genAI = new GoogleGenerativeAI(apiKey);
const test = [];
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

async function run() {
  const text = await runJson();
  const data = JSON.stringify(text);
  const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [
          {
            text: `${data}\n\nأنت مساعد مفيد لـ CoolStore. جاوب على أسئلة المستخدم بناءً على البيانات المقدمة.  وللأسئلة الأخرى، قدم إجابات واضحة ومفيدة.`,
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: "فهمت. باش نجاوب على أي سؤال عن CoolStore ومنتجاته.",
          },
        ],
      },
    ],
  });

  const result = await chatSession.sendMessage(
    "عندكم  **MacBook Pro 16-inch (M2 Max, 2023)**"
  );

  console.log(result.response.text());

  // test.push(res);
}
run();
