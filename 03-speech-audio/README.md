# 03 — Talking Cat + Sound Effects

Chat with a cat-personality LLM (Gemini) and hear its responses spoken aloud using ElevenLabs text-to-speech. Also generates AI sound effects from a text prompt.

## Setup

1. `npm install`
2. Create a `.env` file with:
   ```
   GEMINI_API_KEY=your_key_here
   CAT_API_KEY=your_key_here
   ELEVENLABS_API_KEY=your_key_here
   ```
3. `npm run dev`
4. Open http://localhost:3000

## Get API keys

- Gemini: https://aistudio.google.com/apikey
- Cat API: https://thecatapi.com/
- ElevenLabs: https://elevenlabs.io/ — sign up and create an API key (free tier works)
