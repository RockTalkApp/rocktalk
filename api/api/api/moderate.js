export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { text, type } = req.body;
  if (!text) return res.status(400).json({ error: "No text provided" });

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
        max_tokens: 100,
        system: `You are a ${type || "message"} moderator for Rock Talk, a fun family-friendly app.
Reject content with: racial slurs, hate speech, harassment, threats like "kill yourself", sexual content, or anything targeting someone's identity.
Allow: rock puns, creative names, mild swearing, normal conversation, edgy humor that isn't targeting anyone.
Respond ONLY with valid JSON: {"allowed":true} or {"allowed":false,"reason":"brief friendly reason"}`,
        messages: [{ role: "user", content: `Check this ${type || "message"}: "${text}"` }],
      }),
    });

    const data = await response.json();
    const result = JSON.parse((data.content?.[0]?.text || '{"allowed":true}').replace(/```json|```/g, "").trim());
    return res.status(200).json(result);
  } catch (err) {
    console.error("Moderation error:", err);
    return res.status(200).json({ allowed: true }); // fail open
  }
}