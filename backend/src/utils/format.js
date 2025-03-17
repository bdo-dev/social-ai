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

export const runJson = async () => {
  const mac = `
 **MacBook Air (M2, 2022)**
   - **Price**: Starting at $1,099 (13.6-inch, 8-core GPU, 256GB SSD)
   - **Key Features**: M2 chip, Liquid Retina display, MagSafe charging.

**MacBook Air (M1, 2020)**
   - **Price**: Starting at $999 (13.3-inch, 7-core GPU, 256GB SSD)
   - **Key Features**: M1 chip, Retina display, fanless design.

 **MacBook Pro 14-inch (M2 Pro, 2023)**
   - **Price**: Starting at $1,999 (M2 Pro, 512GB SSD)
   - **Key Features**: Mini-LED Liquid Retina XDR display, ProMotion, HDMI port.

 **MacBook Pro 16-inch (M2 Max, 2023)**
   - **Price**: Starting at $2,499 (M2 Max, 512GB SSD)
   - **Key Features**: Larger display, high-performance M2 Max chip, advanced cooling system.

. **MacBook Pro 13-inch (M2, 2022)**
   - **Price**: Starting at $1,299 (M2, 256GB SSD)
   - **Key Features**: Touch Bar, M2 chip,
   **MacBook Pro 15-inch (M2, 2022)**
   - **Price**: Starting at $2,299 (M2, 256GB SSD)
   - **Key Features**: Touch Bar, M2 chip,
   `;
  const text = `• John Doe, CEO, john.doe@coolstore.com • Jane Smith, Head of Marketing, jane.smith@coolstore.com • Alice Johnson, Lead Product Designer, alice.johnson@coolstore.com • Twitter: @CoolStore • Facebook: facebook.com/CoolStore • Instagram: instagram.com/CoolStore • Email: support@coolstore.com • Phone: +1-800-555-1234 • Website: https://www.coolstore.com 123 Innovation Way, Techville, CA, USA, 90210 1. Smart Thermostat, Home Automation, $149.99 • Features: Energy saving AI, Voice control integration, Customizable schedules • Availability: In Stock • Rating: 4.8 2. Wireless Headphones, Electronics, $199.99 • Features: Noise cancellation, 40-hour battery life, Bluetooth 5.2 • Availability: Pre-order • Rating: 4.6 3. Eco-Friendly Water Bottle, Lifestyle, $29.99 • Features: Double-wall insulation, BPA-free materials, Keeps drinks cold for 24 hours • Availability: In Stock • Rating: 4.9 • Return Policy: 30-day money-back guarantee • Shipping Policy: Free shipping on orders over $50 • Warranty: 1-year warranty on all electronics pizza price is 12lyd small size and big size 20lyd  lyd mean libyan dinar , ${mac}`;
  const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [
          {
            text: "Certainly! Could you please specify the type of content you’d like formatted and structured as a JSON \n",
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: text,
          },
        ],
      },
    ],
  });

  const result = await chatSession.sendMessage(text);
  const responseText = result.response.text();
  const jsonStartIndex = responseText.indexOf("```json") + "```json".length;
  const jsonEndIndex = responseText.lastIndexOf("```");
  const jsonString = responseText.slice(jsonStartIndex, jsonEndIndex).trim();
  const jsonData = JSON.parse(jsonString);
  return jsonData;
};
