import { createOpenAI } from "@ai-sdk/openai";
import { embedMany } from "ai";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { storeChunks } from "@/lib/ai/vector-store";

export const maxDuration = 60;

const chunkText = ({ text, chunkSize = 600, overlap = 80 }: Readonly<{ text: string; chunkSize?: number; overlap?: number }>): string[] => {
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter((p) => p.length > 0);
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    if (current.length + para.length + 1 <= chunkSize) {
      current = current.length > 0 ? `${current}\n\n${para}` : para;
    } else {
      if (current.length > 0) {
        chunks.push(current);
        const words = current.split(" ");
        const overlapWords = words.slice(-Math.floor(overlap / 5));
        current = overlapWords.join(" ");
      }
      if (para.length > chunkSize) {
        const sentences = para.split(/(?<=[.!?])\s+/);
        for (const sentence of sentences) {
          if (current.length + sentence.length + 1 <= chunkSize) {
            current = current.length > 0 ? `${current} ${sentence}` : sentence;
          } else {
            if (current.length > 0) chunks.push(current);
            current = sentence;
          }
        }
      } else {
        current = para;
      }
    }
  }

  if (current.length > 0) chunks.push(current);
  return chunks.filter((c) => c.trim().length > 20);
};

export const POST = async (request: Request): Promise<Response> => {
  const session = await auth();
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
    return NextResponse.json({ ok: false, error: "Non autorisé." }, { status: 401 });
  }

  if (!env.OPENAI_API_KEY) {
    return NextResponse.json({ ok: false, error: "OPENAI_API_KEY manquant." }, { status: 503 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ ok: false, error: "Aucun fichier fourni." }, { status: 400 });
  }

  const allowedTypes = ["application/pdf", "text/plain", "text/markdown"];
  if (!allowedTypes.includes(file.type) && !file.name.endsWith(".pdf") && !file.name.endsWith(".txt") && !file.name.endsWith(".md")) {
    return NextResponse.json({ ok: false, error: "Format non supporté. Utilisez PDF, TXT ou MD." }, { status: 400 });
  }

  let rawText = "";

  if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    const pdfData = await parser.getText();
    rawText = pdfData.text;
  } else {
    rawText = await file.text();
  }

  rawText = rawText.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();

  if (rawText.length < 50) {
    return NextResponse.json({ ok: false, error: "Le document ne contient pas assez de texte." }, { status: 400 });
  }

  const textChunks = chunkText({ text: rawText });

  if (textChunks.length === 0) {
    return NextResponse.json({ ok: false, error: "Impossible d'extraire du texte du document." }, { status: 400 });
  }

  const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY });

  const { embeddings } = await embedMany({
    model: openai.embedding("text-embedding-3-small"),
    values: textChunks,
  });

  const documentName = file.name.replace(/\.[^/.]+$/, "");
  const chunksToStore = textChunks.map((content, index) => ({
    document_name: documentName,
    content,
    metadata: { chunk_index: index, total_chunks: textChunks.length, file_name: file.name },
    embedding: embeddings[index],
  }));

  const { stored, error } = await storeChunks({ chunks: chunksToStore });

  if (error) {
    return NextResponse.json({ ok: false, error }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    document_name: documentName,
    chunks_stored: stored,
    message: `${stored} segment${stored > 1 ? "s" : ""} indexé${stored > 1 ? "s" : ""} avec succès.`,
  });
};
