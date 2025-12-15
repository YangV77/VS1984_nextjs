// app/api/xbc/logs/route.ts
import { NextRequest, NextResponse } from "next/server";
import vs1984 from "@/lib/server/vs1984";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const since = searchParams.get("since");
    const sinceId = since ? Number(since) : undefined;

    const logs = vs1984.getLogs(
        Number.isFinite(sinceId as number) ? (sinceId as number) : undefined
    );

    return NextResponse.json({ logs });
}
