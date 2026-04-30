const express = require("express");

// loads the .env file if present, fails silently if it's not
try {
  process.loadEnvFile(".env");
} catch {}

const app = express();
const port = Number(process.env.PORT || 3000);
const server = app.listen(port);

const CF_BASE = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run`;
const CF_HEADERS = {
  Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
  "Content-Type": "application/json"
};

const INITIAL_PROMPT = "a very small frog with a big strawberry";

// stores the last generated image so /api/transform can use it
let currentImageB64 = null;

//app.use() is run on every incoming request
//express.static serves the files in the specified folder when they are requested
//e.x. when client.js is requested, express.static sends public/client.js
app.use(express.static("public"));
app.use(express.json());

app.get("/api/generate", async (_, res) => {
  const response = await fetch(
    `${CF_BASE}/@cf/black-forest-labs/flux-1-schnell`,
    {
      method: "POST",
      headers: CF_HEADERS,
      body: JSON.stringify({
        prompt: INITIAL_PROMPT,
        steps: 4 // 1–8, higher = better quality but slower (default 4)
        // seed: 42  // uncomment for reproducible results
      })
    }
  );
  const data = await response.json();
  currentImageB64 = data.result.image;
  res.json({ image: currentImageB64 });
});

app.post("/api/transform", async (req, res) => {
  // Step 1: send the user's message to Gemini, get a short response
  const geminiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [
            {
              text: "You are a frog who desperately wants to live at the bottom of the ocean and is always trying to convince your friends to come with you."
            }
          ]
        },
        contents: [{ role: "user", parts: [{ text: req.body.message }] }],
        generationConfig: {
          temperature: 1,
          topP: 0.95,
          maxOutputTokens: 100
        }
      })
    }
  );
  const geminiData = await geminiResponse.json();
  if (geminiData.error) {
    console.error("Gemini error:", geminiData.error.message);
    return res.status(500).json({ error: geminiData.error.message });
  }
  const geminiText = geminiData.candidates[0].content.parts[0].text;

  // Step 2: use Gemini's response as the prompt to transform the current image
  const imgResponse = await fetch(
    `${CF_BASE}/@cf/runwayml/stable-diffusion-v1-5-img2img`,
    {
      method: "POST",
      headers: CF_HEADERS,
      body: JSON.stringify({
        prompt: geminiText,
        image_b64: currentImageB64,
        strength: 0.63 // 0–1, how much to transform (0 = no change, 1 = ignore original)
        // negative_prompt: "blurry, dark, text",  // what to avoid in the output
        // guidance: 7.5,     // how closely to follow the prompt (default 7.5)
        // num_steps: 20,     // diffusion steps, max 20 (default 20)
        // seed: 42           // uncomment for reproducible results
      })
    }
  );
  const imgBuffer = await imgResponse.arrayBuffer();
  currentImageB64 = Buffer.from(imgBuffer).toString("base64");

  res.json({ text: geminiText, image: currentImageB64 });
});

console.log(`Server is listening on port ${port}`);
