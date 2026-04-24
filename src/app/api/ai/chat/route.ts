import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, embed } from "ai";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { detectSubject, buildSystemPrompt, GLOBAL_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { searchSimilarChunks, buildContextFromChunks } from "@/lib/ai/vector-store";

export const maxDuration = 30;

export const POST = async (request: Request): Promise<Response> => {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  if (!env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY manquant." }, { status: 503 });
  }
  if (!env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY manquant." }, { status: 503 });
  }

  const body = await request.json() as { query?: string };
  const query = (body.query ?? "").trim();

  if (query.length === 0) {
    return NextResponse.json({ error: "La question est vide." }, { status: 400 });
  }

  const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY });
  const anthropic = createAnthropic({ apiKey: env.ANTHROPIC_API_KEY });

  const { embedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: query,
  });

  const chunks = await searchSimilarChunks({
    queryEmbedding: embedding,
    matchThreshold: 0.45,
    matchCount: 6,
  });

  const context = buildContextFromChunks({ chunks });
  const subjectPrompt = detectSubject({ query });
  const systemPrompt = buildSystemPrompt({
    globalSystemPrompt: GLOBAL_SYSTEM_PROMPT,
    context,
    subjectPrompt,
  });

  const result = streamText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: systemPrompt,
    messages: [{ role: "user", content: query }],
    maxOutputTokens: 400,
    temperature: 0.2,
  });

  return result.toTextStreamResponse();
};
