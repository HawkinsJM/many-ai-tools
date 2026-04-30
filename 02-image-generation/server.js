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

app.get("/api/generate-image", async (req, res) => {
  const prompt = "a realistic photograph of a frog in a straw hat on the beach";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 1,
          responseModalities: ["IMAGE"],
          imageConfig: {
            aspectRatio: "4:3"
          }
        }
      })
    }
  );
  const data = await response.json();
  if (data.error) {
    console.error("Gemini error:", data.error.message);
    return res.status(500).json({ error: data.error.message });
  }
  const imagePart = data.candidates[0].content.parts.find(p => p.inlineData);
  if (!imagePart) {
    return res.status(500).json({ error: "No image returned" });
  }
  res.set("Content-Type", imagePart.inlineData.mimeType);
  res.send(Buffer.from(imagePart.inlineData.data, "base64"));
});

app.post("/api/ask", async (req, res) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [
            {
              text: "You are a frog who is enjoying a day at the beach and doesnt want to be bothered unless its to go swimming."
            }
          ]
        },
        contents: [{ role: "user", parts: [{ text: req.body.message }] }],
        generationConfig: {
          temperature: 1,
          topP: 0.95,
          maxOutputTokens: 2000
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
