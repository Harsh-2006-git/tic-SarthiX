import express from "express";
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import wav from "wav";
import { z } from "zod";

const router = express.Router();

// ── Genkit AI initialisation (for chat & TTS) ────────────────────────────────
const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY })],
  model: "googleai/gemini-1.5-flash",
});

// ── Direct Google AI SDK (for itinerary - more reliable JSON output) ─────────
const getGenAI = () => new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── Helper: PCM buffer → base64 WAV ─────────────────────────────────────────
function toWav(pcmData, channels = 1, rate = 24000, sampleWidth = 2) {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({ channels, sampleRate: rate, bitDepth: sampleWidth * 8 });
    const bufs = [];
    writer.on("error", reject);
    writer.on("data", (d) => bufs.push(d));
    writer.on("end", () => resolve(Buffer.concat(bufs).toString("base64")));
    writer.write(pcmData);
    writer.end();
  });
}

// ── POST /api/v1/chatbot/chat ────────────────────────────────────────────────
router.post("/chat", async (req, res) => {
  try {
    const { history = [], language = "English" } = req.body;

    if (!Array.isArray(history)) {
      return res.status(400).json({ error: "history must be an array" });
    }

    const systemPrompt = `You are RoamAI, a friendly and helpful travel planning assistant for DivyaYatra. Your goal is to have a conversation with the user to gather the necessary information to plan their pilgrimage trip.

You need to ask for the following details:
- Origin (where the user is traveling from)
- Destination
- Departure Date
- Arrival Date
- Number of People
- Budget (e.g., Modest, Luxury, Budget)
- Travel Style (e.g., Peaceful, Devotional, Cultural, Adventure)

Keep your responses concise and conversational.
Always respond in the language specified by the user: ${language}.

If you have all the information, summarize it for the user and populate the itineraryInput JSON in your response with the collected details, and state that you are now generating the itinerary. Do not ask for confirmation.`;

    // Build messages for Genkit
    const messages = history.map((m) => ({
      role: m.role === "model" ? "model" : "user",
      content: [{ text: m.content }],
    }));

    const { output } = await ai.generate({
      system: systemPrompt,
      messages,
      output: {
        schema: z.object({
          response: z.string().describe("The AI response text"),
          itineraryInput: z.object({
            origin: z.string().optional(),
            destination: z.string().optional(),
            departureDate: z.string().optional(),
            arrivalDate: z.string().optional(),
            numberOfPeople: z.number().optional(),
            budget: z.string().optional(),
            style: z.string().optional(),
          }).optional().describe("Populated when all travel details are collected"),
        }),
      },
      prompt: messages.length === 0
        ? (language === "Hindi"
          ? "नमस्ते! मैं RoamAI हूँ। शुरू करते हैं — आप कहाँ से यात्रा करना चाहते हैं?"
          : "Hello! I am RoamAI. Let's get started — where are you traveling from?")
        : undefined,
    });

    return res.json({ data: output });
  } catch (err) {
    console.error("Chatbot /chat error:", err);
    return res.status(500).json({ error: err.message || "Failed to get chat response" });
  }
});

// ── POST /api/v1/chatbot/itinerary ───────────────────────────────────────────
router.post("/itinerary", async (req, res) => {
  try {
    const { origin, destination, departureDate, arrivalDate, numberOfPeople, budget, style, language = "English" } = req.body;

    if (!origin || !destination || !departureDate || !arrivalDate) {
      return res.status(400).json({ error: "origin, destination, departureDate, and arrivalDate are required" });
    }

    const prompt = `You are a travel agent specializing in creating personalized pilgrimage itineraries.
Generate a detailed travel itinerary as a valid JSON object only — no extra text, no markdown, no code fences.

User details:
- Origin: ${origin}
- Destination: ${destination}
- Departure Date: ${departureDate}
- Arrival Date: ${arrivalDate}
- Number of People: ${numberOfPeople || 1}
- Budget: ${budget || "Modest"}
- Style: ${style || "Peaceful"}

All text in the response should be in: ${language}.

Return ONLY this JSON structure (no markdown, no backticks):
{
  "itinerary": {
    "title": "string",
    "destination": "string",
    "departureDate": "string",
    "arrivalDate": "string",
    "numberOfPeople": number,
    "budget": "string",
    "style": "string",
    "total_estimated_cost": "string",
    "notes": "string (optional tips for pilgrims)",
    "daily_plan": [
      {
        "day": 1,
        "activities": ["activity1", "activity2"],
        "estimated_cost": "string",
        "accommodation": { "name": "string", "price": "string", "rating": "string" },
        "transportation_options": [{ "mode": "string", "details": "string", "price": "string" }]
      }
    ]
  }
}`;

    // Use direct Google AI SDK for reliable JSON output
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel(
      {
        model: "gemini-1.5-flash-latest",
        generationConfig: {
          responseMimeType: "application/json",
        },
      },
      { apiVersion: "v1" }
    );

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse the JSON response
    let parsed;
    try {
      // Strip any accidental markdown code fences
      const clean = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      parsed = JSON.parse(clean);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr.message, "\nRaw:", text.slice(0, 300));
      return res.status(500).json({ error: "AI returned invalid JSON. Please try again." });
    }

    return res.json({ data: parsed });
  } catch (err) {
    console.error("Chatbot /itinerary error:", err.message || err);
    return res.status(500).json({ error: err.message || "Failed to generate itinerary" });
  }
});

// ── POST /api/v1/chatbot/tts ─────────────────────────────────────────────────
router.post("/tts", async (req, res) => {
  try {
    const { text, language = "English" } = req.body;

    if (!text || !text.trim()) {
      return res.json({ data: { media: "" } });
    }

    const voiceName = language === "Hindi" ? "Achernar" : "Algenib";

    const { media } = await ai.generate({
      model: "googleai/gemini-1.5-flash-latest",
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
      prompt: text,
    });

    if (!media || !media.url) {
      throw new Error("No media returned from TTS model");
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(",") + 1),
      "base64"
    );
    const wavBase64 = await toWav(audioBuffer);

    return res.json({ data: { media: `data:audio/wav;base64,${wavBase64}` } });
  } catch (err) {
    console.error("Chatbot /tts error:", err);
    // Return empty media instead of error — TTS is non-critical
    return res.json({ data: { media: "" }, warning: err.message });
  }
});

export default router;
