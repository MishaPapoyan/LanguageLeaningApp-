import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { groq, getTutorSystemPrompt } from "@/lib/claude";
import { TutorScenario, ChatMessage } from "@/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const body = await req.json();
    const { messages, scenario } = body as { messages: ChatMessage[]; scenario: TutorScenario };

    const systemPrompt = getTutorSystemPrompt(scenario);
    if (!systemPrompt) {
      return new Response(JSON.stringify({ error: "Invalid scenario" }), { status: 400 });
    }

    // Build messages for Groq (OpenAI-compatible format)
    const apiMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: systemPrompt },
    ];

    if (messages.length > 0) {
      for (const m of messages) {
        apiMessages.push({ role: m.role as "user" | "assistant", content: m.content });
      }
    } else {
      // New scenario — send greeting to get AI's opening message
      apiMessages.push({ role: "user", content: "Bonjour! Let's begin." });
    }

    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 512,
      stream: true,
      messages: apiMessages,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (streamErr) {
          console.error("Tutor stream error:", streamErr);
          controller.error(streamErr);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "AI service error";
    console.error("Tutor API error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
