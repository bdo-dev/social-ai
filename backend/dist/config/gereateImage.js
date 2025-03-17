import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
const apiKey = "AIzaSyCELTUZk5Rv5RYlik9WemWhqYOVeGbe9dA";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp"
});
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json"
};
export const AIImageModel = model.startChat({
  generationConfig,
  history: [{
    role: "user",
    parts: [{
      text: "    Generate an image for the platform '{facebook}', incorporating the following content provided by the user: '{الوضع الاقتصادي في ليبيا}'. The image should align with the theme or purpose of the platform and reflect the user's input creatively.  Ensure the final output is visually appealing and matches the user's requirements,Give me result in JSON portal with prompt field only \n"
    }]
  }, {
    role: "model",
    parts: [{
      text: '```json\n{\n  "prompt": "A visually compelling image for a Facebook post about the economic situation in Libya. The image should evoke a sense of concern and reflection, but also hope for improvement. Consider using a combination of imagery: perhaps a stylized map of Libya with economic indicators subtly overlaid (like upward/downward trending arrows or bar graphs), or a split image showing both potential prosperity and current challenges (e.g., modern buildings juxtaposed with areas showing signs of economic hardship). Use a color palette that conveys seriousness yet is not overly bleak; perhaps muted blues and grays contrasted with hints of gold or green to signify potential growth. Avoid overly dramatic or politically charged imagery. The style should be clean and modern, suitable for a social media post aiming for broad engagement and discussion on a complex topic. The overall feeling should be thoughtful and engaging, prompting users to reflect on \'الوضع الاقتصادي في ليبيا\' (the economic situation in Libya)."\n}\n```\n'
    }]
  }]
});
export const AIContentModel = model.startChat({
  generationConfig,
  history: [{
    role: "user",
    parts: [{
      text: "اكتب لي منشور "
    }]
  }]
});