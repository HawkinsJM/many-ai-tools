const express = require("express");
const { ElevenLabsClient } = require("@elevenlabs/elevenlabs-js");
const { GoogleGenAI } = require("@google/genai");

// loads the .env file if present, fails silently if it's not
try {
  process.loadEnvFile(".env");
} catch {}

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY
});
const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const app = express();
const port = Number(process.env.PORT || 3000);
const server = app.listen(port);

//app.use() is run on every incoming request
//express.static serves the files in the specified folder when they are requested
//e.x. when client.js is requested, express.static sends public/client.js
app.use(express.static("public"));
app.use(express.json());

app.get("/api/cat", async (req, res) => {
  const response = await fetch(
    "https://api.thecatapi.com/v1/images/search?mime_types=jpg,png",
    {
      headers: { "x-api-key": process.env.CAT_API_KEY }
    }
  );
  const [cat] = await response.json();
  const imgResponse = await fetch(cat.url);
  res.set("Content-Type", imgResponse.headers.get("content-type"));
  res.send(Buffer.from(await imgResponse.arrayBuffer()));
});

app.post("/api/ask", async (req, res) => {
  const response = await gemini.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: req.body.message,
    config: {
      systemInstruction: "You are a cat who has strong opinions about cats.",
      temperature: 1,
      topP: 0.95,
      maxOutputTokens: 200
    }
  });
  res.json({ text: response.text });
});

app.post("/api/speak", async (req, res) => {
  const audio = await elevenlabs.textToSpeech.convert("hpp4J3VqNfWAUOO0d1Us", {
    text: req.body.text,
    modelId: "eleven_flash_v2_5",
    outputFormat: "mp3_44100_128", // mp3_44100_128, wav_48000, opus_48000_192
    voiceSettings: {
      stability: 0.5, // 0–1, lower = more expressive, higher = more consistent
      similarityBoost: 0.75, // 0–1, how closely it matches the original voice
      style: 0, // 0–1, style exaggeration
      speed: 1.0 // speech rate (0.7–1.2)
    }
  });
  res.set("Content-Type", "audio/mpeg");
  const chunks = [];
  for await (const chunk of audio) chunks.push(chunk);
  res.send(Buffer.concat(chunks));
});

let cachedSfx = null;

app.get("/api/sfx", async (_, res) => {
  if (!cachedSfx) {
    const audio = await elevenlabs.textToSoundEffects.convert({
      text: "very rapid cat mewows and a siren",
      durationSeconds: 2
    });
    const chunks = [];
    for await (const chunk of audio) chunks.push(chunk);
    cachedSfx = Buffer.concat(chunks);
  }
  res.set("Content-Type", "audio/mpeg");
  res.send(cachedSfx);
});

console.log(`Server is listening on port ${port}`);
