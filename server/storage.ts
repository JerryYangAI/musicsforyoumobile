import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import { eq, desc, lt } from "drizzle-orm";
import type { User, InsertUser, Song, InsertSong, VoiceSample, InsertVoiceSample } from "@shared/schema";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCredits(userId: string, credits: number): Promise<User | undefined>;
  updateUserVoice(userId: string, voiceId: string): Promise<User | undefined>;
  
  getSongsByUser(userId: string): Promise<Song[]>;
  getSong(id: string): Promise<Song | undefined>;
  createSong(song: InsertSong): Promise<Song>;
  updateSongStatus(id: string, status: string, audioUrl?: string, coverUrl?: string): Promise<Song | undefined>;
  
  createVoiceSample(sample: InsertVoiceSample): Promise<VoiceSample>;
  getVoiceSamplesByUser(userId: string): Promise<VoiceSample[]>;
  
  revokeToken(tokenHash: string, userId: string, expiresAt: Date): Promise<void>;
  isTokenRevoked(tokenHash: string): Promise<boolean>;
  cleanupExpiredTokens(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return result[0];
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.phone, phone));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(schema.users).values(insertUser).returning();
    return result[0];
  }

  async updateUserCredits(userId: string, credits: number): Promise<User | undefined> {
    const result = await db.update(schema.users)
      .set({ credits })
      .where(eq(schema.users.id, userId))
      .returning();
    return result[0];
  }

  async updateUserVoice(userId: string, voiceId: string): Promise<User | undefined> {
    const result = await db.update(schema.users)
      .set({ voiceId, hasCustomVoice: true })
      .where(eq(schema.users.id, userId))
      .returning();
    return result[0];
  }

  async getSongsByUser(userId: string): Promise<Song[]> {
    return await db.select()
      .from(schema.songs)
      .where(eq(schema.songs.userId, userId))
      .orderBy(desc(schema.songs.createdAt));
  }

  async getSong(id: string): Promise<Song | undefined> {
    const result = await db.select().from(schema.songs).where(eq(schema.songs.id, id));
    return result[0];
  }

  async createSong(insertSong: InsertSong): Promise<Song> {
    const result = await db.insert(schema.songs).values(insertSong).returning();
    return result[0];
  }

  async updateSongStatus(id: string, status: string, audioUrl?: string, coverUrl?: string): Promise<Song | undefined> {
    const updateData: any = { status };
    if (audioUrl) updateData.audioUrl = audioUrl;
    if (coverUrl) updateData.coverUrl = coverUrl;
    
    const result = await db.update(schema.songs)
      .set(updateData)
      .where(eq(schema.songs.id, id))
      .returning();
    return result[0];
  }

  async createVoiceSample(insertSample: InsertVoiceSample): Promise<VoiceSample> {
    const result = await db.insert(schema.voiceSamples).values(insertSample).returning();
    return result[0];
  }

  async getVoiceSamplesByUser(userId: string): Promise<VoiceSample[]> {
    return await db.select()
      .from(schema.voiceSamples)
      .where(eq(schema.voiceSamples.userId, userId))
      .orderBy(desc(schema.voiceSamples.createdAt));
  }

  async revokeToken(tokenHash: string, userId: string, expiresAt: Date): Promise<void> {
    await db.insert(schema.revokedTokens).values({
      tokenHash,
      userId,
      expiresAt,
    }).onConflictDoNothing();
  }

  async isTokenRevoked(tokenHash: string): Promise<boolean> {
    const result = await db.select()
      .from(schema.revokedTokens)
      .where(eq(schema.revokedTokens.tokenHash, tokenHash));
    return result.length > 0;
  }

  async cleanupExpiredTokens(): Promise<void> {
    await db.delete(schema.revokedTokens)
      .where(lt(schema.revokedTokens.expiresAt, new Date()));
  }
}

export const storage = new DatabaseStorage();
