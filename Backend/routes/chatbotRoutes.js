import express from "express";
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import wav from "wav";
import { z } from "zod";
import { spawn } from "child_process";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

    const latestMessage = history.length > 0 ? history[history.length - 1].content : "";
    const lowerMsg = latestMessage.toLowerCase().trim();

    // ── Hardcoded Responses for Predefined Buttons ──────────────────────────────
    const hardcodedResponses = {
      // Mahakaleshwar
      "mahakaleshwar visit": "Mahakaleshwar Jyotirlinga is one of the most sacred shrines. Bhasma Aarti starts at 4 AM (pre-booking required). General Darshan takes 1-3 hours depending on the queue. You can carry only water inside.",
      "महाकालेश्वर दर्शन": "महाकालेश्वर ज्योतिर्लिंग सबसे पवित्र स्थलों में से एक है। भस्म आरती सुबह 4 बजे शुरू होती है (प्री-बुकिंग अनिवार्य है)। सामान्य दर्शन में कतार के अनुसार 1-3 घंटे लगते हैं। अंदर केवल जल ले जाने की अनुमति है।",

      // Food
      "best food in ujjain": "Ujjain is famous for Poha-Jalebi at Tower Chowk, Sabudana Khichdi, and Malpua. Don't forget to try the legendary Thali at Shri Ganga or the street food near Mahakal Temple.",
      "उज्जैन का प्रसिद्ध भोजन": "उज्जैन अपने पोहा-जलेबी (टावर चौक), साबूदाना खिचड़ी और मालपुआ के लिए प्रसिद्ध है। श्री गंगा की थाली और महाकाल मंदिर के पास मिलने वाले स्ट्रीट फूड का आनंद जरूर लें।",

      // 2-day itinerary
      "2-day itinerary": "Day 1: Mahakaleshwar Bhasma Aarti, Harsiddhi Temple, and Kshipra River Aarti. Day 2: Kal Bhairav, Mangalnath Temple, and Sandipani Ashram. Have a peaceful journey!",
      "2 दिनों की यात्रा": "दिन 1: महाकालेश्वर भस्म आरती, हरसिद्धि मंदिर और क्षिप्रा तट पर आरती। दिन 2: काल भैरव, मंगलनाथ मंदिर और सांदीपनि आश्रम। आपकी यात्रा मंगलमय हो!",

      // Timings
      "temple timings": "Most temples open at 5:00 AM and close at 10:00 PM. Mahakaleshwar opens at 4:00 AM for Bhasma Aarti and closes at 11:00 PM after Shayan Aarti.",
      "मंदिरों का समय": "अधिकांश मंदिर सुबह 5:00 बजे खुलते हैं और रात 10:00 बजे बंद होते हैं। महाकालेश्वर मंदिर भस्म आरती के लिए सुबह 4:00 बजे खुलता है और शयन आरती के बाद रात 11:00 बजे बंद होता है।",

      // Emergency
      "emergency helpline": "Ujjain Police: 100, Ambulance: 108, Mahakal Temple Office: +91-734-2550563. Stay safe, Pilgrim!",
      "हेल्पलाइन नंबर": "उज्जैन पुलिस: 100, एम्बुलेंस: 108, महाकाल मंदिर कार्यालय: +91-734-2550563। अपनी सुरक्षा का ध्यान रखें!",
    };

    if (hardcodedResponses[lowerMsg]) {
      return res.json({ data: { response: hardcodedResponses[lowerMsg] } });
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

All text in the response (except keys) should be in: ${language}.

The JSON must include:
1. "destination_history": A rich historical and spiritual overview of Ujjain.
2. "train_connectivity": Real-world train options from ${origin} to Ujjain.
3. "recommended_hotels": A list of 3-5 hotels or dharamshalas in Ujjain within the ${budget} range.
4. "daily_plan": A day-by-day activity list.

Return ONLY this JSON structure exactly:
{
  "itinerary": {
    "title": "string",
    "destination": "string",
    "destination_history": "string (detailed)",
    "train_connectivity": [{ "train_name": "string", "frequency": "string", "travel_time": "string" }],
    "recommended_hotels": [{ "name": "string", "type": "string (Hotel/Dharamshala)", "price_range": "string" }],
    "departureDate": "string",
    "arrivalDate": "string",
    "numberOfPeople": number,
    "budget": "string",
    "style": "string",
    "total_estimated_cost": "string",
    "notes": "string",
    "daily_plan": [
      {
        "day": 1,
        "activities": ["string"],
        "estimated_cost": "string",
        "accommodation": { "name": "string", "price": "string" },
        "transportation_options": [{ "mode": "string", "details": "string", "price": "string" }]
      }
    ]
  }
}`;

    // Use direct Google AI SDK for reliable JSON output
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });

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

    const langCode = language === "Hindi" ? "hi" : "en";
    const tmpFile = path.join(os.tmpdir(), `tts_${Date.now()}.mp3`);
    const scriptPath = path.join(__dirname, "..", "AI_Core", "tts_engine.py");

    const python = spawn("py", [scriptPath, text, langCode, tmpFile]);

    let output = "";
    let error = "";

    python.stdout.on("data", (data) => { output += data.toString(); });
    python.stderr.on("data", (data) => { error += data.toString(); });

    python.on("close", (code) => {
      if (code !== 0) {
        console.error("TTS Python Error:", error);
        return res.json({ data: { media: "" }, warning: error });
      }
      res.json({ data: { media: output.trim() } });

      // Cleanup temp file after a delay
      setTimeout(() => {
        try { if (os.existsSync(tmpFile)) os.unlinkSync(tmpFile); } catch (e) { }
      }, 5000);
    });

  } catch (err) {
    console.error("Chatbot /tts server error:", err);
    return res.json({ data: { media: "" }, warning: err.message });
  }
});

export default router;
