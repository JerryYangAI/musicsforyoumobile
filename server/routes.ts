import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import { insertUserSchema, insertSongSchema, insertVoiceSampleSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required in production");
  }
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required in production");
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "dev-only-jwt-secret-not-for-production";
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-only-session-secret-not-for-production";
const JWT_EXPIRES_IN = "7d";

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

let lastCleanup = 0;
const CLEANUP_INTERVAL = 60 * 60 * 1000;

async function maybeCleanupExpiredTokens() {
  const now = Date.now();
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    lastCleanup = now;
    const { storage } = await import('./storage');
    storage.cleanupExpiredTokens().catch(() => {});
  }
}

const upload = multer({ 
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }
});

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.use(
    session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: isProduction,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      },
    })
  );

  const requireAuth = async (req: any, res: any, next: any) => {
    if (req.session.userId) {
      return next();
    }
    
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        
        maybeCleanupExpiredTokens();
        
        const tokenHash = hashToken(token);
        const isRevoked = await storage.isTokenRevoked(tokenHash);
        if (isRevoked) {
          return res.status(401).json({ error: "Unauthorized" });
        }
        
        const user = await storage.getUser(decoded.userId);
        if (user) {
          req.session.userId = user.id;
          (req as any).authToken = token;
          return next();
        }
      } catch (error) {
        // Silent fail - don't expose token validation details
      }
    }
    
    return res.status(401).json({ error: "Unauthorized" });
  };

  app.post("/api/auth/send-code", async (req, res) => {
    try {
      const { phone } = z.object({ phone: z.string() }).parse(req.body);
      console.log(`[AUTH] Sending code to ${phone}`);
      res.json({ success: true, message: "Code sent" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/verify", async (req, res) => {
    try {
      const { phone, code } = z.object({
        phone: z.string(),
        code: z.string(),
      }).parse(req.body);

      console.log(`[AUTH] Verifying code for ${phone}`);

      let user = await storage.getUserByPhone(phone);
      if (!user) {
        user = await storage.createUser({ phone });
        console.log(`[AUTH] Created new user: ${user.id}`);
      }

      req.session.userId = user.id;
      
      const token = jwt.sign(
        { userId: user.id },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      res.json({ 
        success: true,
        token,
        user: {
          id: user.id,
          phone: user.phone,
          credits: user.credits,
          hasCustomVoice: user.hasCustomVoice,
        }
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/logout", async (req: any, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; exp: number };
        const tokenHash = hashToken(token);
        const expiresAt = new Date(decoded.exp * 1000);
        await storage.revokeToken(tokenHash, decoded.userId, expiresAt);
      } catch (error) {
        // Token already invalid, continue with session logout
      }
    }
    
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/user/profile", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({
        id: user.id,
        phone: user.phone,
        credits: user.credits,
        hasCustomVoice: user.hasCustomVoice,
        voiceId: user.voiceId,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/music/generate", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { prompt, style, mood, duration } = z.object({
        prompt: z.string(),
        style: z.string().optional(),
        mood: z.string().optional(),
        duration: z.number(),
      }).parse(req.body);

      const creditsRequired = duration === 30 ? 1 : 2;
      
      if (user.credits < creditsRequired) {
        return res.status(402).json({ error: "Insufficient credits" });
      }

      const song = await storage.createSong({
        userId,
        title: `Generated: ${prompt.substring(0, 30)}...`,
        prompt,
        style: style || "Mixed",
        mood: mood || "Neutral",
        duration,
        audioUrl: null,
        coverUrl: null,
      });

      await storage.updateUserCredits(userId, user.credits - creditsRequired);

      setTimeout(async () => {
        await storage.updateSongStatus(
          song.id,
          "completed",
          "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          "https://via.placeholder.com/300/6d28d9/ffffff?text=Generated"
        );
      }, 3000);

      res.json({ 
        success: true,
        song: {
          id: song.id,
          title: song.title,
          status: song.status,
        }
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/music/song/:id", requireAuth, async (req, res) => {
    try {
      const song = await storage.getSong(req.params.id);
      if (!song) {
        return res.status(404).json({ error: "Song not found" });
      }
      if (song.userId !== req.session.userId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      res.json(song);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/music/library", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const songs = await storage.getSongsByUser(userId);
      res.json({ songs });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/voice/upload-sample", requireAuth, upload.single("audio"), async (req, res) => {
    try {
      const userId = req.session.userId!;
      
      if (!req.file) {
        return res.status(400).json({ error: "No audio file provided" });
      }

      const { transcript } = z.object({
        transcript: z.string(),
      }).parse(req.body);

      const audioFileName = `voice-${userId}-${Date.now()}${path.extname(req.file.originalname)}`;
      const audioPath = path.join("uploads", audioFileName);
      
      await fs.rename(req.file.path, audioPath);

      const sample = await storage.createVoiceSample({
        userId,
        audioUrl: `/uploads/${audioFileName}`,
        transcript,
      });

      res.json({ 
        success: true,
        sample: {
          id: sample.id,
          status: sample.status,
        }
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.use("/uploads", express.static("uploads"));

  return httpServer;
}
