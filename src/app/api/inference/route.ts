import { NextRequest } from "next/server";
import { streamGenerate, createInferenceRequest } from "@/lib/ollama";
import { getModelById } from "@/lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface InferenceRequestBody {
  modelId: string;
  prompt: string;
  systemPrompt?: string;
  parameters?: {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    seed?: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: InferenceRequestBody = await request.json();
    const { modelId, prompt, systemPrompt, parameters } = body;

    // Validate model
    const model = getModelById(modelId);
    if (!model) {
      return new Response(
        JSON.stringify({ error: `Unknown model: ${modelId}` }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate prompt
    if (!prompt || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create Ollama request
    const ollamaRequest = createInferenceRequest(
      modelId,
      prompt,
      systemPrompt,
      parameters
    );

    // Create readable stream for SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamGenerate(ollamaRequest)) {
            const data = JSON.stringify({
              response: chunk.response,
              done: chunk.done,
              eval_count: chunk.eval_count,
            });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));

            if (chunk.done) {
              controller.close();
              return;
            }
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Inference failed";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: errorMessage, done: true })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Inference error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Inference failed",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
