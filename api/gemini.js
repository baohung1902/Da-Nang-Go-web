// Vercel Serverless Function: /api/gemini
// This endpoint receives a user prompt, calls Google Gemini (gemini-2.0-flash)
// with the same system instruction used on the client, and returns a JSON
// response containing the plain answer string.

import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const { userPrompt } = req.body || {};
  if (!userPrompt) {
    res.status(400).json({ error: "Missing userPrompt in request body" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not configured in Vercel environment");
    res.status(500).json({ error: "Server configuration error: missing Gemini API key" });
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const MODEL_NAME = "gemini-3.5-flash"; // updated to gemini-3.5-flash (works in 2026 free tier)
    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 25000; // 25s as suggested by API
    const systemInstruction = `Bạn là một trợ lý AI thông thái, thân thiện và hiểu rõ về du lịch Đà Nẵng. Cung cấp câu trả lời ngắn gọn, hữu ích, không kèm markdown. Trả lời chỉ dưới dạng văn bản thuần, không có ký tự đặc biệt.`;
    const prompt = `${systemInstruction}\n\nCâu hỏi của người dùng: "${userPrompt}"`;
    let attempt = 0;
    while (attempt < MAX_RETRIES) {
      try {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        const result = await model.generateContent(prompt);
        const text = result?.response?.text?.() ?? result?.response?.text ?? "";
        res.status(200).json({ answer: text.trim() });
        return;
      } catch (error) {
        // If we hit quota (429) retry after delay
        if (error?.status === 429) {
          console.warn(`Gemini quota hit, retry ${attempt + 1}/${MAX_RETRIES} after ${RETRY_DELAY_MS}ms`);
          await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
          attempt++;
          continue;
        }
        console.error("Gemini serverless function error:", error);
        res.status(500).json({ error: "Không thể kết nối với Gemini. Vui lòng thử lại sau." });
        return;
      }
    }
    // If we exhausted retries
    res.status(503).json({ error: "Gemini quota exceeded, vui lòng thử lại sau." });
  } catch (error) {
    console.error("Gemini serverless function error:", error);
    res.status(500).json({ error: "Không thể kết nối với Gemini. Vui lòng thử lại sau." });
  }
}
