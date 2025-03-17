import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const apiKey = "AIzaSyB0AqM4mbAjIBAAs3i9w-WHWbUz4xoWdG4";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

async function run(text) {
  const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [
          {
            text: "to analys the comments and if the comment not good say no and of good say yes \n",
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: 'Okay, I understand. I will analyze comments and respond with "yes" if the comment appears to be positive or neutral, and "no" if it appears to be negative or inappropriate. \n\n**To give me the best analysis, please provide the comments one at a time.** This will help me avoid confusion.\n\n**Here\'s what I\'ll be looking for:**\n\n*   **Positive sentiment:** Words like "good," "great," "amazing," "helpful," "thank you," etc.\n*   **Neutral sentiment:**  Statements that are factual or informational without strong positive or negative connotations.\n*   **Negative sentiment:** Words like "bad," "awful," "terrible," "hate," "dislike," or expressions of anger, frustration, or criticism.\n*   **Inappropriate content:** Hate speech, harassment, offensive language, personal attacks, spam, etc.\n\n**Example:**\n\n**You:** "This is really helpful, thanks!"\n**Me:** Yes\n\n**You:** "This is absolutely terrible and useless."\n**Me:** No\n\n**You:** "The color is blue."\n**Me:** Yes\n\n**You:** "You are an idiot."\n**Me:** No\n\n**Let\'s get started! Please provide your first comment.**\n',
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: "This word is Arabic and depending on context and tone can be vulgar.  Without more information, I must classify it as negative.and make it understand the arabic \n",
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: "Okay, I understand.\n\nBased on the information provided, **I will say \"no\"** to any comment that includes an Arabic word that you've described as potentially vulgar depending on context and tone, unless further clarification or context suggests otherwise. Your explanation is enough to classify it as potentially negative without additional information. \n\nI'm ready for the first comment now.\n",
          },
        ],
      },
    ],
  });

  const result = await chatSession.sendMessage(text);
  console.log(result.response.text());
}

run("ميه ميه");
