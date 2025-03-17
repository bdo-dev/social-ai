import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import express from "express";
import chatbotRoutes from "./routes/chatbot.js";
import chatbotWebhookRoute from "./routes/chatbotWebhookRoute.js";
import postRouter from "./routes/postRoutes.js";
import commentRouter from "./routes/commentsRouter.js";
import engagementRouter from "./routes/engagmentRouter.js";
import AI from "./routes/AI.js";
import wallet from "./routes/wallet.js";
const app = express();
app.use(
  cors({
    credentials: true,
  })
);

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use("/api", postRouter);
app.use("/api", commentRouter);
app.use("/api", engagementRouter);
app.use("/api", chatbotRoutes);
app.use("/api", AI);
app.use("/api", wallet);
app.use("/api", chatbotWebhookRoute);
export default app;
