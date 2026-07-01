import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = (import.meta && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) || process.env.VITE_GEMINI_API_KEY;
console.log('VITE_GEMINI_API_KEY value:', apiKey ? '***' : 'undefined');
let genAI;
if (apiKey && apiKey.length > 10) {
  genAI = new GoogleGenerativeAI(apiKey);
} else {
  console.warn('VITE_GEMINI_API_KEY is missing or invalid. Gemini integration will not work.');
}

/* ─────────────────────────────────────────
   Mock Reviews Generator (simulates scraped data)
   30% chance of negative reviews to test AI detection
───────────────────────────────────────── */
function getMockReviews(placeName, category) {
  const isFoodOrCafe = category === "Ẩm thực" || category === "Cà phê";
  if (isFoodOrCafe && Math.random() > 0.7) {
    return `
      1. Quán ăn quá bẩn, có ruồi trong tô bún. Thái độ nhân viên lồi lõm, gọi đồ 30 phút không thấy mang ra.
      2. Đồ ăn ôi thiu, ăn xong bị đau bụng cả đêm. Giá thì chặt chém khách du lịch. Không bao giờ quay lại!
      3. Không gian chật hẹp, nóng nực, thức ăn tạm được nhưng vệ sinh cực kỳ kém.
    `;
  } else if (isFoodOrCafe) {
    return `
      1. Đồ ăn ở ${placeName} cực kỳ ngon, hương vị đậm đà chuẩn miền Trung.
      2. Quán sạch sẽ, không gian thoáng mát. Nhân viên phục vụ rất nhiệt tình, gọi món ra nhanh.
      3. Giá cả hợp lý so với chất lượng, tôi sẽ giới thiệu cho bạn bè khi đến Đà Nẵng.
      4. Có một chút ồn ào vào giờ cao điểm, nhưng nhìn chung đồ ăn tuyệt vời.
    `;
  } else {
    return `
      1. ${placeName} rất đẹp, không gian rộng rãi và cảnh quan tuyệt vời để check-in.
      2. Mọi thứ được giữ gìn sạch sẽ. Chi phí hợp lý, phù hợp gia đình.
      3. Đi vào mùa hè hơi đông đúc và phải xếp hàng lâu, nhưng trải nghiệm rất đáng giá.
      4. Bãi đỗ xe hơi chật, nhưng nhân viên hướng dẫn nhiệt tình, thân thiện với khách du lịch.
    `;
  }
}

/* ─────────────────────────────────────────
   Safe JSON Extractor
   Handles cases where Gemini wraps JSON in markdown
───────────────────────────────────────── */
function extractJSON(text) {
  // Remove markdown code fences
  let cleaned = text.replace(/```json/gi, '').replace(/```/gi, '').trim();
  // Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch (_) {
    // Try to extract the first {...} block
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error('No valid JSON found in AI response');
  }
}

/* ─────────────────────────────────────────
   Main AI Analysis Function
   With retry logic on JSON parse failure
───────────────────────────────────────── */
export async function analyzeLocationWithAI(placeName, category) {
  if (!genAI) {
    throw new Error(
      "API Key Gemini chưa được cấu hình. Vui lòng thêm VITE_GEMINI_API_KEY hợp lệ vào file .env và khởi động lại ứng dụng."
    );
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  const reviews = getMockReviews(placeName, category);

  const buildPrompt = (strict = false) => `Bạn là một trợ lý AI chuyên phân tích đánh giá nhà hàng, quán ăn, và địa điểm du lịch.
Nhiệm vụ của bạn là đọc danh sách các bình luận của khách hàng dưới đây và quyết định xem địa điểm này có đáng để giới thiệu không.

Tên địa điểm: ${placeName}
Danh sách bình luận:
"""
${reviews}
"""

Tiêu chí đánh giá:
1. KHÔNG ĐỀ XUẤT (is_recommended=false) nếu có: mất vệ sinh, ruồi/bọ/tóc, thức ăn ôi thiu, đau bụng, thái độ xấc xược, lừa đảo giá.
2. ĐỀ XUẤT (is_recommended=true) nếu đa số đánh giá tích cực: đồ ăn ngon, cảnh đẹp, sạch sẽ, phục vụ tốt, giá hợp lý.

${strict ? 'CẢNH BÁO: Chỉ trả về JSON thuần túy, TUYỆT ĐỐI không có text nào khác.' : ''}
YÊU CẦU BẮT BUỘC: Chỉ trả về 1 JSON object hợp lệ, không có text nào khác, không dùng \`\`\`json:

{"ai_score":<số nguyên 1-10>,"is_recommended":<true hoặc false>,"bad_reviews":[<string>],"good_reviews":[<string>],"reason":"<1 câu giải thích>"}`;

  // Attempt 1
  try {
    const result = await model.generateContent(buildPrompt(false));
      const text = result?.response?.text?.() ?? result?.response?.text ?? result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? result?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      if (!text) throw new Error('Empty response from Gemini');
      return extractJSON(text);
  } catch (firstError) {
    console.warn("AI Analysis — Attempt 1 failed, retrying...", firstError.message);
    // Attempt 2 with stricter prompt
    try {
      const result = await model.generateContent(buildPrompt(true));
       const text = result?.response?.text?.() ?? result?.response?.text ?? result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? result?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
       if (!text) throw new Error('Empty response from Gemini');
       return extractJSON(text);
    } catch (secondError) {
      console.error("AI Analysis — Both attempts failed:", secondError);
      throw new Error(
        "Không thể phân tích dữ liệu AI. Hãy kiểm tra API Key hoặc thử lại sau."
      );
    }
  }
}

// -------------------------------------------------------------------
// Chatbot helper: askGeminiAboutDaNang
// Accepts a free‑form user query and returns a concise answer.
// Uses the gemini-2.0-flash model with a strict system instruction.
// -------------------------------------------------------------------
export async function askGeminiAboutDaNang(userPrompt) {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userPrompt }),
    });
    if (!response.ok) {
      const err = await response.json();
      console.error('Server error response:', err);
      throw new Error(err.error || 'Không thể kết nối với Gemini. Vui lòng thử lại sau.');
    }
    const data = await response.json();
    return data.answer?.trim() ?? '';
  } catch (error) {
    console.error('Gemini API Error details:', error);
    throw new Error('Không thể kết nối với Gemini. Vui lòng thử lại sau.');
  }
}
