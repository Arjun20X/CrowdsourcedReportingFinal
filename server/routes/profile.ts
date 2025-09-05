import { RequestHandler } from "express";
import { z } from "zod";
import type { ChangePasswordPayload, ChangePasswordResponse, GetProfileResponse, UpdateProfilePayload, UserProfile, UsernameCheckPayload, UsernameCheckResponse } from "@shared/api";

const updateSchema = z.object({ username: z.string().min(2).max(32).optional(), email: z.string().email().optional(), phone: z.string().min(7).max(20).optional() });
const usernameSchema = z.object({ username: z.string().min(2).max(32) });
const changePwSchema = z.object({ current: z.string().min(4), next: z.string().min(6) });

// In-memory demo store
const profiles = new Map<string, UserProfile & { password: string }>();
const takenUsernames = new Set<string>(["citizen", "admin", "support"]);

function ensureProfile(userId: string) {
  if (!profiles.has(userId)) {
    const username = userId;
    profiles.set(userId, { userId, username, email: `${userId}@example.com`, phone: "", password: "password" });
    takenUsernames.add(username);
  }
  return profiles.get(userId)!;
}

export const getProfile: RequestHandler = (req, res) => {
  const { userId } = req.params as { userId: string };
  const p = ensureProfile(userId);
  const payload: GetProfileResponse = { profile: { userId: p.userId, username: p.username, email: p.email, phone: p.phone } };
  res.json(payload);
};

export const updateProfile: RequestHandler = (req, res) => {
  const { userId } = req.params as { userId: string };
  const p = ensureProfile(userId);
  const parse = updateSchema.safeParse(req.body as UpdateProfilePayload);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const { username, email, phone } = parse.data;
  if (username && username !== p.username) {
    if (takenUsernames.has(username)) return res.status(409).json({ error: "Username already taken" });
    takenUsernames.delete(p.username);
    p.username = username;
    takenUsernames.add(username);
  }
  if (typeof email === "string") p.email = email;
  if (typeof phone === "string") p.phone = phone;
  const payload: GetProfileResponse = { profile: { userId: p.userId, username: p.username, email: p.email, phone: p.phone } };
  res.json(payload);
};

export const checkUsername: RequestHandler = (req, res) => {
  const parse = usernameSchema.safeParse(req.body as UsernameCheckPayload);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const available = !takenUsernames.has(parse.data.username);
  const payload: UsernameCheckResponse = { available };
  res.json(payload);
};

export const changePassword: RequestHandler = (req, res) => {
  const { userId } = req.params as { userId: string };
  const p = ensureProfile(userId);
  const parse = changePwSchema.safeParse(req.body as ChangePasswordPayload);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const { current, next } = parse.data;
  if (p.password !== current) return res.status(401).json({ error: "Incorrect current password" });
  p.password = next;
  const payload: ChangePasswordResponse = { ok: true };
  res.json(payload);
};
