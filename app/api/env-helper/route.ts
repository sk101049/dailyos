import { NextResponse } from "next/server";
import { join } from "node:path";

export const dynamic = "force-dynamic";

const envVars = [
  "OPENAI_API_KEY",
  "GEMINI_API_KEY",
  "GOOGLE_AI_API_KEY",
  "GOOGLE_API_KEY",
  "ELEVENLABS_API_KEY",
  "AZURE_SPEECH_KEY",
  "AZURE_SPEECH_REGION",
  "RUNWAY_API_KEY",
  "KLING_API_KEY",
  "PIKA_API_KEY",
  "CUSTOM_VIDEO_PROVIDER_API_KEY"
];

export function GET() {
  const projectRoot = process.cwd();
  const envPath = join(projectRoot, ".env.local");
  const template = envVars.map((name) => `${name}=`).join("\n");

  return NextResponse.json({
    projectRoot,
    envPath,
    openCommand: `notepad "${envPath}"`,
    template,
    canWriteFile: false,
    note: "安全起見，DailyOS 不會讀取或回傳既有 secret。請手動貼上範本並重新啟動 npm run dev。"
  });
}
