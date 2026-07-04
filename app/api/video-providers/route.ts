import { NextResponse } from "next/server";
import { getVideoProviderStatuses } from "@/lib/video-providers";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    providers: getVideoProviderStatuses()
  });
}
