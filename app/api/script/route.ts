import { NextResponse } from "next/server";
import {
  generateInsuranceScript,
  type ScriptGenerationInput
} from "@/lib/openai";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<ScriptGenerationInput>;
    const input = parseScriptGenerationInput(body);
    const script = await generateInsuranceScript(input);

    return NextResponse.json({ script });
  } catch (error) {
    console.error("Script generation failed", error);

    return NextResponse.json(
      { error: "無法產生腳本，請稍後再試。" },
      { status: 500 }
    );
  }
}

function parseScriptGenerationInput(
  body: Partial<ScriptGenerationInput>
): ScriptGenerationInput {
  const topic = readString(body.topic);
  const targetAudience = readString(body.targetAudience);
  const videoLength = readString(body.videoLength);
  const tone = readString(body.tone);
  const platform = readString(body.platform);

  if (!topic || !targetAudience || !videoLength || !tone || !platform) {
    throw new Error("Missing script generation fields.");
  }

  return {
    topic,
    targetAudience,
    videoLength,
    tone,
    platform
  };
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}
