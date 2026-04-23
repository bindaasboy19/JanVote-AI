import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Backend APIs
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  const ELECTION_SYSTEM_PROMPT = `
You are JanVote AI, an Intelligent Election Education Assistant. 
Your mission is to educate users about the election process.

STRICT CONSTRAINTS:
1. ONLY answer election-related queries (registration, voter ID, polling process, casting vote, deadlines, etc.).
2. REFUSE any political bias. Do NOT support or criticize any party or candidate.
3. ADAPT your response based on the user profile provided.

USER PROFILES:
- First-time Voter: Provide detailed, encouraging, step-by-step guidance.
- Regular Voter: Provide concise updates and advanced information.
- Illiterate User: Use VERY simple language. Avoid jargon. (System will convert this to voice).
- Awareness Volunteer: Provide scripts, talking points, and training material for outreach.

MISINFORMATION GUARD:
- Reject any party-specific प्रचार (propaganda).
- Be neutral and facts-based.
- If a question is outside election education, politely state that you can only help with election process education.

Always structure responses clearly using Markdown.
  `;

  app.post("/api/chat", async (req, res) => {
    try {
      const { prompt, userType, language = "en", history = [] } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server. Please set it in your environment variables." });
      }

      const formattedHistory = history.map((m: any) => ({
        role: m.role,
        parts: m.parts || [{ text: m.content || "" }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview", // Using standard stable model or pro depending on key
        contents: [
          { role: "user", parts: [{ text: `User Profile: ${userType}, Preferred Response Language: ${language === 'hi' ? 'Hindi' : 'English'}` }] },
          ...formattedHistory,
          { role: "user", parts: [{ text: prompt }] }
        ],
        config: {
          systemInstruction: ELECTION_SYSTEM_PROMPT,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("AI Chat Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI response." });
    }
  });

  app.post("/api/broadcast", async (req, res) => {
    try {
      const { prompt, userType, language = "en" } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server. Please set it in your environment variables." });
      }

      const guidance = `Generate an awareness script for: ${prompt}. 
      Mandatory: Use extremely simple language suitable for a village audience. 
      Structure it clearly. No political bias.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview", // Using standard stable model
        contents: [
          { role: "user", parts: [{ text: `User Profile: ${userType}, Preferred Response Language: ${language === 'hi' ? 'Hindi' : 'English'}` }] },
          { role: "user", parts: [{ text: guidance }] }
        ],
        config: {
          systemInstruction: ELECTION_SYSTEM_PROMPT,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("AI Broadcast Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI response." });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
