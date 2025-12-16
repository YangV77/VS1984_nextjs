// app/api/xbc/run/route.ts
import { NextRequest, NextResponse } from "next/server";
import getVs1984 from "@/lib/server/vs1984";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const cmd = body.cmd as string | undefined;

        if (!cmd || typeof cmd !== "string") {
            return NextResponse.json({ error: "cmd is required" }, { status: 400 });
        }

        const vs1984 = getVs1984();
        vs1984.runCmd(cmd);

        return NextResponse.json({ ok: true });
    } catch (err: any) {
        console.error("Error in /api/xbc/run:", err);
        return NextResponse.json({ error: "internal error" }, { status: 500 });
    }
}
