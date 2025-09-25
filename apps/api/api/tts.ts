import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export default async function handler(req, res) {
  try {
    const { lines = [] } = req.body || {};
    if (!Array.isArray(lines) || lines.length === 0) return res.status(400).json({ error: "lines required" });

    const results = [];
    for (const text of lines) {
      const speech = await client.audio.speech.create({
        model: "gpt-4o-mini-tts",
        voice: "alloy",
        input: text,
        format: "mp3"
      });
      const b64 = Buffer.from(await speech.arrayBuffer()).toString("base64");
      results.push({ text, audioB64: b64, mime: "audio/mpeg" });
    }
    res.json({ clips: results });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "tts_failed" });
  }
}
