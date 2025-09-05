import { RequestHandler } from "express";
import { z } from "zod";
import type { CommunityPost, CommunityPostMedia, CommunityPostsResponse, CreateCommunityPostPayload } from "@shared/api";

const createSchema = z.object({
  userId: z.string().min(1),
  description: z.string().min(1).max(2000),
  mediaBase64: z.array(z.string()).default([]),
});

const likesByPost: Record<string, Record<string, 1>> = {};
const posts: CommunityPost[] = [];

function id() { return Math.random().toString(36).slice(2, 10); }
function nowIso() { return new Date().toISOString(); }

export const listCommunityPosts: RequestHandler = (_req, res) => {
  const payload: CommunityPostsResponse = { posts: posts.slice().sort((a,b)=>+new Date(b.createdAt)-+new Date(a.createdAt)) };
  res.json(payload);
};

export const createCommunityPost: RequestHandler = (req, res) => {
  const parsed = createSchema.safeParse(req.body as CreateCommunityPostPayload);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const media: CommunityPostMedia[] = (parsed.data.mediaBase64 || []).map((m) => ({ url: m, kind: m.startsWith("data:video") ? "video" : "image" }));
  const post: CommunityPost = { id: id(), userId: parsed.data.userId, description: parsed.data.description, media, upvotes: 0, createdAt: nowIso() };
  posts.unshift(post);
  res.status(201).json(post);
};

export const likeCommunityPost: RequestHandler = (req, res) => {
  const { id: pid } = req.params as { id: string };
  const post = posts.find((p) => p.id === pid);
  if (!post) return res.status(404).json({ error: "Post not found" });
  const userId = (req.body?.userId as string) || "anon";
  likesByPost[pid] ||= {};
  if (!likesByPost[pid][userId]) {
    likesByPost[pid][userId] = 1;
    post.upvotes += 1;
  }
  res.json(post);
};
