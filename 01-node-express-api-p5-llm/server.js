const express = require("express");

// loads the .env file if present, fails silently if it's not
try {
  process.loadEnvFile(".env");
} catch {}

const app = express();
const port = Number(process.env.PORT || 3000);
const server = app.listen(port);

const animalsList = ["frog", "cat", "bear", "squid", "zebra"];
const attributesList = [
  "jumping",
  "being a cat",
  "sleeping during winter",
  "squirting ink",
  "having stripes"
];

//Select a random animal and a random attribute independently
const animal = animalsList[Math.floor(Math.random() * animalsList.length)];
const attribute =
  attributesList[Math.floor(Math.random() * attributesList.length)];

const IMAGE_QUERY = animal;
const SYSTEM_PROMPT = `You are a ${animal} who is very proud of their ${attribute}.`;

//app.use() is run on every incoming request
//express.static serves the files in the specified folder when they are requested
//e.x. when client.js is requested, express.static sends public/client.js
app.use(express.static("public"));
app.use(express.json());

app.get("/api/image", async (_, res) => {
  const params = new URLSearchParams({
    key: process.env.PIXABAY_API_KEY,
    q: IMAGE_QUERY,
    image_type: "photo", // photo, illustration, vector
    orientation: "horizontal", // horizontal, vertical, all
    order: "popular", // popular, latest
    safesearch: "true", // filter adult content (DO NOT TURN THIS OFF PLEASE)
    per_page: 3 // minimum is 3, but returns an array
  });
  const response = await fetch(`https://pixabay.com/api/?${params}`);
  const data = await response.json();
  res.json({ url: data.hits[0].webformatURL }); //sends the url for the first image to p5
});

app.post("/api/ask", async (req, res) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        },
        contents: [{ role: "user", parts: [{ text: req.body.message }] }],
        generationConfig: {
          temperature: 1, // 0–2, controls randomness (0 = predictable, 2 = chaotic)
          topP: 0.95, // 0–1, limits word choices to most likely options (lower = safer/duller)
          maxOutputTokens: 200 // max length of the response (~¾ of a word per token)
        }
      })
    }
  );
  const data = await response.json();
  //error handeling
  if (data.error) {
    console.error("Gemini error:", data.error.message);
    return res.status(500).json({ error: data.error.message });
  }
  res.json({ text: data.candidates[0].content.parts[0].text });
});

console.log(`Server is listening on port ${port}`);
