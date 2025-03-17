import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } from "@google/generative-ai";
  import { GoogleAIFileManager } from "@google/generative-ai/server";
  
  // Initialize Gemini AI client

  const genAI = new GoogleGenerativeAI(process.env.GEMEAI_API_KEY);
  const fileManager = new GoogleAIFileManager(apiKey);
  
  /**
   * Uploads the given file to Gemini.
   *
   * See https://ai.google.dev/gemini-api/docs/prompting_with_media
   */
  async function uploadToGemini(path, mimeType) {
    const uploadResult = await fileManager.uploadFile(path, {
      mimeType,
      displayName: path,
    });
    const file = uploadResult.file;
    console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
    return file;
  }
  
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };
  
  /**
   * Main function to process the file upload and chat response
   */
   const a = async function run() {
    // TODO: Make these files available on the local file system
    // You may need to update the file paths
    console.log("hello my nigga");
    
    const files = [
      await uploadToGemini(
        "../saved_audio/audio.mp3",
        "audio/x-mp3" // Correct MIME type for .m4a files
      ),
    ];
    console.log("hello my nigga2");
    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {
              fileData: {
                mimeType: files[0].mimeType,
                fileUri: files[0].uri,
              },
            },
            { text: "اسمع الصوت و رد عليه باللهجه الليبيه" },
          ],
        },
      ],
    });
    
    const result = await chatSession.sendMessage("");
    console.log(result.response.text());
  }
  export {a};
  // You can now import and run the main function from another file
  // Example: import { run } from './path/to/this/file';
  // run();
  
  