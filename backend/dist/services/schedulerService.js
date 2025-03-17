import cron from "node-cron";
import { publishPost } from "./facebookService.js";
import fs from "fs";
import { log } from "console";
import { publishPostToInstagram } from "../../src/services/facebookService.js";
const scheduledTasks = {};
export const schedulePost = async (post, now = false) => {
  console.log("sch", post);
  console.log(now);

  if (now) {
    console.log("ye sn");

    await publishPostToInstagram(post);
    // await publishPost(post);
    console.log("yes");

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
