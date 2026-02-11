import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  credits: integer("credits").notNull().default(10),
  hasCustomVoice: boolean("has_custom_voice").notNull().default(false),
  voiceId: varchar("voice_id", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const songs = pgTable("songs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  prompt: text("prompt").notNull(),
  style: varchar("style", { length: 50 }),
  mood: varchar("mood", { length: 50 }),
  duration: integer("duration").notNull(),
  audioUrl: text("audio_url"),
  coverUrl: text("cover_url"),
  status: varchar("status", { length: 20 }).notNull().default("queued"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const voiceSamples = pgTable("voice_samples", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  audioUrl: text("audio_url").notNull(),
  transcript: text("transcript").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const revokedTokens = pgTable("revoked_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertSongSchema = createInsertSchema(songs).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertVoiceSampleSchema = createInsertSchema(voiceSamples).omit({
  id: true,
  createdAt: true,
  status: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSong = z.infer<typeof insertSongSchema>;
export type Song = typeof songs.$inferSelect;

export type InsertVoiceSample = z.infer<typeof insertVoiceSampleSchema>;
export type VoiceSample = typeof voiceSamples.$inferSelect;
