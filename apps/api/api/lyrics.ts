import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const SYSTEM = `You write silly, kid-safe, 6–10 word chant lines about chores.
No sarcasm, no brand names, no violence. Keep it upbeat and clear.`;

export default async function handler(req, res) {
  try {
    const { chores = [], kidName = "" } = req.body || {};
    if (!Array.isArray(chores) || chores.length === 0) return res.status(400).json({ error: "chores required" });

    const prompt = `Chores: ${chores.join(", ")}.
If kidName provided, use once in intro only: "${kidName}".
Return JSON: [{chore:string, lines:string[]}] with 2 short lines per chore.`;

    const chat = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: SYSTEM }, { role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.8
    });

    const text = chat.choices[0]?.message?.content ?? "[]";
    let data; try { data = JSON.parse(text); } catch { data = []; }
    res.json({ data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "lyrics_failed" });
  }
}
