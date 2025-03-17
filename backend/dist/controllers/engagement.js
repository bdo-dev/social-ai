import {
  getFacebookPostEngagement,
  getFacebookPostReach,
} from "../services/facebookService.js";
export const countEngagement = async (req, res) => {
  const { id } = req.params;
  try {
    const { likes, comments, shares } = await getFacebookPostEngagement(id);
    const totoalEngagement =
      (likes?.summary?.total_count || 0) +
      (comments?.summary?.total_count || 0) +
      (shares?.count || 0);
    res.status(200).json(totoalEngagement);
  } catch (error) {
    res.status(500).json({
      message: "error in countEngagement",
      error: error.message,
    });
  }
};
export const reachPost = async (req, res) => {
  const { id } = req.params;
  try {
    await getFacebookPostReach(id);
    res.status(200).json(reach);
  } catch (error) {
    res.status(500).json({
      message: "error in countEngagement",
      error: error.message,
    });
  }
};
