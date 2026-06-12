
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Eimaa Agent is working" });
});
app.post("/api/agent", async (req, res) => {
  try {
    const { message, scenario } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "الرسالة مطلوبة",
      });
    }

    const systemPrompt =
      scenario?.systemPrompt ||
      `
أنت "إيماء"، مساعد ذكي مخصص للصم والبكم.

مهمتك:
- الرد بلغة عربية بسيطة.
- استخدام جمل قصيرة.
- شرح الخطوات بوضوح.
- جعل الرد مناسبًا للتحويل إلى لغة إشارة.
- لا تطلب معلومات حساسة.
`;

    const response = await client.responses.create({
      model: "gpt-5-nano",
      input: [
        {
          role: "system",
          content: `
${systemPrompt}

أخرج الرد بهذا الشكل دائمًا:

النص:
اكتب الرد العربي المبسط هنا.

خطوات_الإشارة:
- كلمة أو فعل مهم
- كلمة أو فعل مهم
- كلمة أو فعل مهم

نوع_الطلب:
اكتب نوع الطلب هنا.
`,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    res.json({
      reply: response.output_text,
    });
  } catch (error) {
    console.error("Agent Error:", error);

    res.status(500).json({
      error: "حدث خطأ في إيجنت إيماء",
    });
  }
});

app.listen(3001, () => {
  console.log("Eimaa Agent running on http://localhost:3001");
});