import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { addComment, createIssue, listIssues, stats, updateStatus, voteContribution, voteIssue, addContribution } from "./routes/issues";
import { listCommunityPosts, createCommunityPost, likeCommunityPost } from "./routes/community";
import { getProfile, updateProfile, checkUsername, changePassword } from "./routes/profile";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Issues API
  app.get("/api/issues", listIssues);
  app.post("/api/issues", createIssue);
  app.post("/api/issues/:id/vote", voteIssue);
  app.post("/api/issues/:id/comments", addComment);
  app.post("/api/issues/:id/contributions", addContribution);
  app.post("/api/issues/:id/contributions/:cid/vote", voteContribution);
  app.put("/api/issues/:id/status", updateStatus);
  app.get("/api/stats", stats);

  // Community Posts API
  app.get("/api/community-posts", listCommunityPosts);
  app.post("/api/community-posts", createCommunityPost);
  app.post("/api/community-posts/:id/like", likeCommunityPost);

  // Profile API
  app.get("/api/profile/:userId", getProfile);
  app.put("/api/profile/:userId", updateProfile);
  app.post("/api/profile/username-check", checkUsername);
  app.post("/api/profile/:userId/change-password", changePassword);

  return app;
}
