export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { message, botName } = req.body;
  if (!message) return res.status(400).json({ error: "No message provided" });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 60,
        system: `You are ${botName || "a rock"} in Rock Talk — a social app where users are rocks in random rooms. You cannot move, only talk. Dry wit, geological humor, existential musings. Under 20 words. Funny and charming.`,
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || null;
    return res.status(200).json({ text });
  } catch (err) {
    console.error("Bot error:", err);
    return res.status(200).json({ text: null });
  }
}