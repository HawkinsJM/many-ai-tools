# 02 — Image Transform

Generates an image from a fixed prompt (Cloudflare FLUX), then lets you send a message via Gemini (50 tokens) and transforms the image based on Gemini's response (Cloudflare img2img).

I will give you API keys, or you are welcome to sign up for your own.

## Setup

1. `npm install`
2. Create a `.env` file with:
   ```
   GEMINI_API_KEY=use_the_key_i_give_you
   CLOUDFLARE_ACCOUNT_ID=use_the_key_i_give_you
   CLOUDFLARE_API_TOKEN=use_the_key_i_give_you
   ```
3. `npm run dev`
4. Open http://localhost:3000

## Get your own keys (optional)

- Gemini: https://aistudio.google.com/apikey
- Cloudflare: https://dash.cloudflare.com/profile/api-tokens
