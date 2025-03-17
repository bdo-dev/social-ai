import {
  deleteFacebookComment,
  fetchPostComments,
  hideFacebookComment,
} from "../services/facebookService.js";
// import { geminiResponse } from "../utils/gemini.js";
//! maybe the comments in array

export const deletecomment = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteFacebookComment(id);
    res.status(200).json({
      message: "delete comment successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "error in delete comments",
    });
  }
};
export const hideComment = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await hideFacebookComment(id);
    res.status(200).json({
      message: "hide comment successfully",
      hidden: response.data.success,
    });
  } catch (error) {
    res.status(500).json({
      message: "error in hide comments",
    });
  }
};
export const deleteAllPostComments = async (req, res) => {
  const { id } = req.params;
  const deletionResults = [];
  try {
    const comments = await fetchPostComments(id);
    for (const comment of comments) {
      const analysisText = `Read this comment: ${comment.message}. If the comment is positive, respectful, and constructive, respond with 'yes'. If it is negative, disrespectful, respond with 'no'. Respond only with 'yes' or 'no'.`;
      let shouldDelete = ""; ///await geminiResponse(analysisText);
      if (shouldDelete.toLowerCase().trim() === "no") {
        await deleteFacebookComment(comment.id);
        deletionResults.push(`comment: ${comment.id} deleted successfully`);
      }
    }
    res.status(200).json({
      success: true,
      data: deletionResults,
    });
  } catch (error) {
    console.error("Failed to delete comments:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllComments = async (req, res) => {
  try {
    const { postsId } = req.body;
    console.log(postsId);
  } catch (error) {
    res.status(400).send(error.message);
  }
};
