import { supabase } from "../lib/subabase.js";
import {
  deleteFacebookComment,
  fetchPostComments,
  hideFacebookComment,
} from "../services/facebookService.js";
// import { geminiResponse } from "../utils/gemini.js";
//! maybe the comments in array

export const deletecomment = async (req, res) => {
  const { id } = req.params;
  console.log(id);

  try {
    await deleteFacebookComment(id);
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("comment_id_facebook", id);
    res.status(200).json({ message: "delete comment successfully" });
  } catch (error) {
    res.status(500).json({ message: "error in delete comments" });
  }
};

export const getAllComments = async (req, res) => {
  const { postId } = req.params;
  console.log(postId);

  try {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("postId", postId);

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
