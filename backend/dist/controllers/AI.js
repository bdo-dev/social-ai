import axios from "axios";
import { AIContentModel } from "../config/gereateImage.js";
import dotenv from "dotenv";
dotenv.config();
export const generateImage = async (req, res) => {
  try {
    const { promptImage } = req.body;
    if (!promptImage) {
      return res.status(400).send("promptImage is required.");
    }
    const apiKey = process.env.HF_API_KEY;
    if (!apiKey) {
      console.error("Hugging Face API key is missing.");
      return res.status(500).send("Server configuration error.");
    }
    const apiUrl =
      "https://api-inference.huggingface.co/models/strangerzonehf/Flux-Midjourney-Mix2-LoRA";
    const response = await axios.post(apiUrl, promptImage, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      responseType: "arraybuffer",
    });
    const data = response.data;
    const base64Image = Buffer.from(data, "binary").toString("base64");
    const base64ImageWithMime = `data:image/png;base64,${base64Image}`;
    res.status(200).send({
      image: base64ImageWithMime,
    });
  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).send("An error occurred while generating the image.");
  }
};
export const generateContent = async (req, res) => {
  try {
    const { promptContent } = req.body;
    console.log(promptContent);
    if (!promptContent) {
      return res.status(400).send("promptContent is required.");
    }
    console.log(promptContent);
    const content = await AIContentModel.sendMessage(promptContent);
    const candidates = content.response?.candidates;
    if (!candidates || candidates.length === 0) {
      return res.status(500).send("AI response is missing candidates.");
    }
    const text = candidates[0]?.content?.parts?.[0]?.text;
    console.log("hi", text);
    if (!text) {
      return res
        .status(500)
        .send("AI response is missing the expected text content.");
    }
    res.status(200).send(text);
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).send("An error occurred while generating content.");
  }
};
