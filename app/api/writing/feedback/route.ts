import { groq } from "@/lib/claude";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text, prompt, level } = await req.json();

  if (!text || !prompt) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const systemPrompt = `You are a supportive French language teacher reviewing a student's writing exercise.
The student's level is: ${level || "beginner"}.
The writing prompt was: "${prompt}"

Provide helpful, encouraging feedback in this format:
1. **Overall impression** — What they did well (1-2 sentences)
2. **Corrections** — List specific grammar/spelling mistakes with corrections. Show the wrong phrase, the correct version, and explain why.
3. **Vocabulary** — Suggest better or additional words/phrases they could use
4. **Improved version** — Rewrite their text with corrections applied
5. **Next steps** — One specific thing to practice

Be encouraging but honest. Keep feedback concise and practical. Use simple English for explanations since they are learning.`;

  try {
    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Here is my French writing:\n\n${text}` },
      ],
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const chunkText = chunk.choices[0]?.delta?.content;
            if (chunkText) {
              controller.enqueue(encoder.encode(chunkText));
            }
          }
          controller.close();
        } catch (streamErr) {
          console.error("Writing feedback stream error:", streamErr);
          controller.error(streamErr);
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "AI service error";
    console.error("Writing feedback error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
