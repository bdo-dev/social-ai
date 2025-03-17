import app from "./app.js";

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Page ID and URLss
// const PAGE_ID = "510008268858718";
// const FB_GET_URL = `https://graph.facebook.com/v15.0/${PAGE_ID}?fields=posts`;
// const FB_POST_URL = `https://graph.facebook.com/v15.0/${PAGE_ID}/feed`;

// // Initialize OpenAI client
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// app.post('/analyzecomment', async (req, res) => {
//   try {
//     const { comment } = req.body;

//     if (!comment) {
//       return res.status(400).json({ error: 'Comment is required to analyze.' });
//     }

//     const completion = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         {
//           role: 'system',
//           content: 'You are a content moderator. Determine if comments are inappropriate, offensive, or harmful. Respond with only "bad comment" or "good comment".'
//         },
//         {
//           role: 'user',
//           content: comment
//         }
//       ],
//       max_tokens: 10,
//       temperature: 0.7
//     });

//     const result = completion.choices[0].message.content.trim();

//     res.status(200).json({ comment, analysis: result });
//   } catch (error) {
//     console.error('Error analyzing comment:', error.message);
//     res.status(500).json({ error: 'An unexpected error occurred while analyzing the comment.' });
//   }
// });
// get all the posts
// app.get("/getposts", async (req, res) => {
//   try {
//     const accessToken = process.env.FB_ACCESS_TOKEN;

//     if (!accessToken) {
//       return res
//         .status(400)
//         .json({
//           error: "Access token is missing. Please set it in the .env file.",
//         });
//     }

//     const response = await axios.get(FB_GET_URL, {
//       params: {
//         access_token: accessToken,
//       },
//     });

//     res.json(response.data);
//   } catch (error) {
//     console.error("Error fetching posts:", error.message);
//     if (error.response) {
//       return res
//         .status(error.response.status)
//         .json({ error: error.response.data });
//     }
//     res.status(500).json({ error: "error" });
//   }
// });

// //TODO create new post + need to edit this to edit post here in the same function
// app.post("/post", async (req, res) => {
//   try {
//     const accessToken = process.env.FB_ACCESS_TOKEN;

//     if (!accessToken) {
//       return res
//         .status(400)
//         .json({
//           error: "Access token is missing. Please set it in the .env file.",
//         });
//     }

//     const { message } = req.body;

//     if (!message) {
//       return res
//         .status(400)
//         .json({ error: "Message is required to create a post." });
//     }

//     const response = await axios.post(FB_POST_URL, null, {
//       params: {
//         message,
//         access_token: accessToken,
//       },
//     });

//     res.status(201).json(response.data);
//   } catch (error) {
//     console.error(
//       "Error creating post:",
//       error.response?.data || error.message
//     );
//     if (error.response) {
//       return res
//         .status(error.response.status)
//         .json({ error: error.response.data });
//     }
//     res.status(500).json({ error: "An unexpected error occurred" });
//   }
// });

// // get a specific post using the id
// app.get("/getpost/:postId", async (req, res) => {
//   try {
//     const accessToken = process.env.FB_ACCESS_TOKEN;
//     const { postId } = req.params;

//     if (!accessToken) {
//       return res
//         .status(400)
//         .json({
//           error: "Access token is missing. Please set it in the .env file.",
//         });
//     }

//     if (!postId) {
//       return res
//         .status(400)
//         .json({ error: "Post ID is required to fetch a specific post." });
//     }

//     const FB_GET_POST_URL = `https://graph.facebook.com/v15.0/${postId}`;

//     const response = await axios.get(FB_GET_POST_URL, {
//       params: {
//         access_token: accessToken,
//       },
//     });

//     res.status(200).json(response.data);
//   } catch (error) {
//     console.error(
//       "Error fetching post:",
//       error.response?.data || error.message
//     );
//     if (error.response) {
//       return res
//         .status(error.response.status)
//         .json({ error: error.response.data });
//     }
//     res.status(500).json({ error: "An unexpected error occurred" });
//   }
// });

// // delete a post using an id too
// app.delete("/deletepost/:postId", async (req, res) => {
//   try {
//     const accessToken = process.env.FB_ACCESS_TOKEN;
//     const { postId } = req.params;

//     if (!accessToken) {
//       return res
//         .status(400)
//         .json({
//           error: "Access token is missing. Please set it in the .env file.",
//         });
//     }

//     if (!postId) {
//       return res
//         .status(400)
//         .json({ error: "Post ID is required to delete a post." });
//     }

//     const FB_DELETE_URL = `https://graph.facebook.com/v15.0/${postId}`;

//     const response = await axios.delete(FB_DELETE_URL, {
//       params: {
//         access_token: accessToken,
//       },
//     });

//     res
//       .status(200)
//       .json({
//         success: true,
//         message: "Post deleted successfully",
//         data: response.data,
//       });
//   } catch (error) {
//     console.error(
//       "Error deleting post:",
//       error.response?.data || error.message
//     );
//     if (error.response) {
//       return res
//         .status(error.response.status)
//         .json({ error: error.response.data });
//     }
//     res.status(500).json({ error: "An unexpected error occurred" });
//   }
// });

// //edit post youuuu my friend so you
// app.put("/editpost/:postId", async (req, res) => {
//   try {
//     const accessToken = process.env.FB_ACCESS_TOKEN;
//     const { postId } = req.params;
//     const { message } = req.body;

//     if (!accessToken) {
//       return res
//         .status(400)
//         .json({
//           error: "Access token is missing. Please set it in the .env file.",
//         });
//     }

//     if (!postId) {
//       return res
//         .status(400)
//         .json({ error: "Post ID is required to edit a post." });
//     }

//     if (!message) {
//       return res
//         .status(400)
//         .json({ error: "Message is required to update the post." });
//     }

//     const FB_EDIT_URL = `https://graph.facebook.com/v15.0/${postId}`;

//     const response = await axios.post(FB_EDIT_URL, null, {
//       params: {
//         message,
//         access_token: accessToken,
//       },
//     });

//     res
//       .status(200)
//       .json({
//         success: true,
//         message: "Post updated successfully",
//         data: response.data,
//       });
//   } catch (error) {
//     console.error("Error editing post:", error.response?.data || error.message);
//     if (error.response) {
//       return res
//         .status(error.response.status)
//         .json({ error: error.response.data });
//     }
//     res.status(500).json({ error: "An unexpected error occurred" });
//   }
// });

// //get comments on specific posts
// app.get("/comments/:postId", async (req, res) => {
//   try {
//     const accessToken = process.env.FB_ACCESS_TOKEN;
//     const { postId } = req.params;

//     if (!accessToken) {
//       return res
//         .status(400)
//         .json({
//           error: "Access token is missing. Please set it in the .env file.",
//         });
//     }

//     if (!postId) {
//       return res
//         .status(400)
//         .json({ error: "Post ID is required to fetch a specific post." });
//     }

//     const FB_GET_POST_URL = `https://graph.facebook.com/v15.0/${postId}/comments`;

//     const response = await axios.get(FB_GET_POST_URL, {
//       params: {
//         access_token: accessToken,
//       },
//     });

//     res.status(200).json(response.data);
//   } catch (error) {
//     console.error(
//       "Error fetching post:",
//       error.response?.data || error.message
//     );
//     if (error.response) {
//       return res
//         .status(error.response.status)
//         .json({ error: error.response.data });
//     }
//     res.status(500).json({ error: "An unexpected error occurred" });
//   }
// });

// //delete a specific comment
// app.delete("/deletecomment/:commentId", async (req, res) => {
//   try {
//     const accessToken = process.env.FB_ACCESS_TOKEN;
//     const { commentId } = req.params;

//     if (!accessToken) {
//       return res
//         .status(400)
//         .json({
//           error: "Access token is missing. Please set it in the .env file.",
//         });
//     }

//     if (!commentId) {
//       return res
//         .status(400)
//         .json({ error: "Comment ID is required to delete a comment." });
//     }

//     const FB_DELETE_COMMENT_URL = `https://graph.facebook.com/v15.0/${commentId}`;

//     const response = await axios.delete(FB_DELETE_COMMENT_URL, {
//       params: {
//         access_token: accessToken,
//       },
//     });

//     res
//       .status(200)
//       .json({
//         success: true,
//         message: "Comment deleted successfully",
//         data: response.data,
//       });
//   } catch (error) {
//     console.error(
//       "Error deleting comment:",
//       error.response?.data || error.message
//     );
//     if (error.response) {
//       return res
//         .status(error.response.status)
//         .json({ error: error.response.data });
//     }
//     res.status(500).json({ error: "An unexpected error occurred" });
//   }
// });
// Start the server
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });
