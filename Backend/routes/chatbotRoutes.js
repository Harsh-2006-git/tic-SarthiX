import express from "express";
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";
import wav from "wav";
import { z } from "zod";

const router = express.Router();

// ── Genkit AI initialisation ────────────────────────────────────────────────
const ai = genkit({
  plugins: [googleAI()],
  model: "googleai/gemini-2.0-flash",
});

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
Generate a detailed travel itinerary and output it as a JSON object.

User details:
- Origin: ${origin}
- Destination: ${destination}
- Departure Date: ${departureDate}
- Arrival Date: ${arrivalDate}
- Number of People: ${numberOfPeople || 1}
- Budget: ${budget || "Modest"}
- Style: ${style || "Peaceful"}

The entire response, including all text in the generated itinerary, should be in: ${language}.

For each day in the daily_plan:
- Provide specific hotel suggestions with name, price, and rating.
- Provide specific transportation suggestions (train/bus/taxi) with mode, details, and price.
- List cultural, religious, and sightseeing activities.
- Provide an estimated cost for each day.
Provide a total_estimated_cost for the entire trip.
Add optional helpful notes/tips for pilgrims.`;

    const { output } = await ai.generate({
      prompt,
      output: {
        schema: z.object({
          itinerary: z.object({
            title: z.string(),
            destination: z.string(),
            departureDate: z.string(),
            arrivalDate: z.string(),
            numberOfPeople: z.number(),
            budget: z.string(),
            style: z.string(),
            total_estimated_cost: z.string(),
            notes: z.string().optional(),
            daily_plan: z.array(
              z.object({
                day: z.number(),
                activities: z.array(z.string()),
                estimated_cost: z.string(),
                accommodation: z.object({
                  name: z.string(),
                  price: z.string(),
                  rating: z.string(),
                }).optional(),
                transportation_options: z.array(
                  z.object({
                    mode: z.string(),
                    details: z.string(),
                    price: z.string(),
                  })
                ),
              })
            ),
          }),
        }),
      },
    });

    return res.json({ data: output });
  } catch (err) {
    console.error("Chatbot /itinerary error:", err);
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
