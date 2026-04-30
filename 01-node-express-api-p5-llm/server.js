const express = require("express");

// loads the .env file if present, fails silently if it's not
try {
  process.loadEnvFile(".env");
} catch {}

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
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: "You are a cat who has strong opinions about cats." }]
        },
        contents: [{ role: "user", parts: [{ text: req.body.message }] }],
        generationConfig: {
          temperature: 1,
          topP: 0.95,
          maxOutputTokens: 200
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
