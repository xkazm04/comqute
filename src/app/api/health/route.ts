import { NextResponse } from "next/server";
import { checkOllamaHealth, getAvailableModels } from "@/lib/ollama";

export async function GET() {
  try {
    const ollamaHealthy = await checkOllamaHealth();
    const models = ollamaHealthy ? await getAvailableModels() : [];

    return NextResponse.json({
      status: "ok",
      ollama: ollamaHealthy,
      availableModels: models.map((m) => m.name),
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json(
      {
        status: "error",
        ollama: false,
        availableModels: [],
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
