import { NextResponse } from "next/server";
import {
  getGeminiVideoApiStatus,
  startGeminiVeoVideo
} from "@/lib/video-providers/gemini";

export const dynamic = "force-dynamic";

type GeminiVideoRequest = {
  prompt?: string;
  geminiPromptPackage?: string;
  model?: string;
  aspectRatio?: "16:9" | "9:16";
  durationSeconds?: "4" | "6" | "8";
  resolution?: "720p" | "1080p" | "4k";
  personGeneration?: "allow_all" | "allow_adult" | "dont_allow";
};

export function GET() {
  return NextResponse.json({
    provider: "gemini",
    videoApi: getGeminiVideoApiStatus()
  });
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as GeminiVideoRequest;
  const result = await startGeminiVeoVideo({
    prompt: payload.prompt ?? payload.geminiPromptPackage ?? "",
    model: payload.model,
    aspectRatio: payload.aspectRatio ?? "9:16",
    durationSeconds: payload.durationSeconds ?? "8",
    resolution: payload.resolution ?? "720p",
    personGeneration: payload.personGeneration
  });

  if (result.ok) {
    return NextResponse.json(result, { status: 202 });
  }

  const status = result.status === "invalid_request" ? 400 : result.status === "api_error" ? 502 : 503;
  return NextResponse.json(result, { status });
}
