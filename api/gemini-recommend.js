// Vercel Serverless Function: Gemini review analysis endpoint
import { GoogleGenerativeAI } from "@google/generative-ai";

function stripMarkdownFences(raw) {
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/g, "");
}

const SYSTEM_INSTRUCTION = `
You are a Da Nàng local travel expert.
Your job is to analyse a list of user reviews for a place and output ONLY a raw JSON object (no markdown, no extra explanation) that follows this exact schema:

{
  "ai_score": <number from 1 to 10>,
  "is_recommended": <boolean>,
  "highlights": [<top‑3 positive short phrases>],
  "warnings": [<negative points, empty array if none>],
  "summary": "<2‑sentence engaging summary>"
}

- ai_score: overall quality rating (1 = terrible, 10 = perfect).
- is_recommended: true only if the place has no critical issues (e.g., scams, severe hygiene problems).
- highlights: up to three concise positive points extracted from the reviews.
- warnings: any negative issues; leave empty if there are none.
- summary: a friendly two‑sentence overview for a travel‑app user.

Do NOT wrap the response in markdown fences (e.g., ```json```). Return the JSON exactly as shown.
`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { placeName, reviews } = req.body ?? {};
  if (
    typeof placeName !== "string" ||
    !Array.isArray(reviews) ||
    reviews.some((r) => typeof r !== "string")
  ) {
    return res.status(400).json({
      error: "Invalid request body – expected { placeName: string, reviews: string[] }",
    });
  }

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable." });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  const userPrompt = `
Place name: "${placeName}"
Reviews (each line is a separate review):
${reviews.map((r) => `- ${r}`).join("\n")}
`;

  let rawResponse = "";
  try {
    const result = await model.generateContent(userPrompt);
    rawResponse = await result.response.text();
  } catch (geminiErr) {
    console.error("Gemini API error:", geminiErr);
    const fallback = {
      ai_score: 0,
      is_recommended: false,
      highlights: [],
      warnings: [],
      summary: "Unable to generate a recommendation at this time.",
    };
    return res.status(500).json(fallback);
  }

  try {
    const clean = stripMarkdownFences(rawResponse).trim();
    const parsed = JSON.parse(clean);
    const required = [
      "ai_score",
      "is_recommended",
      "highlights",
      "warnings",
      "summary",
    ];
    const missing = required.filter((k) => !(k in parsed));
    if (missing.length) throw new Error(`Missing keys: ${missing.join(", ")}`);
    return res.status(200).json(parsed);
  } catch (parseErr) {
    console.error("Failed to parse Gemini JSON:", parseErr, "Raw response:", rawResponse);
    const fallback = {
      ai_score: 0,
      is_recommended: false,
      highlights: [],
      warnings: [],
      summary: "Unable to parse the recommendation response.",
    };
    return res.status(500).json(fallback);
  }
}
