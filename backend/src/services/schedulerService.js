import cron from "node-cron";
import { publishPost, publishPostToInstagram } from "./facebookService.js";
import fs from "fs";
const scheduledTasks = {};

export const schedulePost = async (post, now = false) => {
  console.log("sch", post);
  if (now) {
    await publishPost(post);
    await publishPostToInstagram(post);
    return;
  }
  const scheduledTime = new Date(post.scheduledFor);
  const cronExpression = `${scheduledTime.getMinutes()} ${scheduledTime.getHours()} ${scheduledTime.getDate()} ${
    scheduledTime.getMonth() + 1
  } *`;

  const task = cron.schedule(cronExpression, async () => {
    console.log(`جاري نشر المنشور المجدول في ${scheduledTime}...`);
    await publishPost(post);
  });

  scheduledTasks[post.id] = task;
};

export const cancelScheduledPost = (postId) => {
  if (scheduledTasks[postId]) {
    scheduledTasks[postId].stop();
    delete scheduledTasks[postId];
  }
};
// schedulePost({
//   id: "422504914289999",
//   scheduledTime: null,
//   message: "this post use cron 2",
// });
