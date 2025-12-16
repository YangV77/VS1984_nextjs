/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */

import path from "path";
import EventEmitter from "events";

type XbcNative = {
    init(args: string[]): number;
    runCmd(cmd: string): void;
    logInfo(type_code: number): string;
    on(
        event: "log" | "connected" | "antiDebug",
        handler: (...args: any[]) => void
    ): void;
};

export type Vs1984LogEntry = {
    id: number;
    message: string;
    type?: number;
    raw?: string;
};

function isBuildPhase(): boolean {
    return process.env.NEXT_PHASE === "phase-production-build";
}

class Vs1984Service extends EventEmitter {
    private native: XbcNative | null = null;
    private started = false;
    private logs: Vs1984LogEntry[] = [];
    private nextLogId = 1;

    private ensureNativeLoaded() {
        if (this.native) return;

        const nativePath = path.join(
            process.cwd(),
            "lib",
            "native",
            "vs1984_native.node"
        );

        const dynamicRequire = eval("require") as NodeRequire;
        this.native = dynamicRequire(nativePath) as XbcNative;
    }

    private normalizeLog(payload: string): Vs1984LogEntry {
        const id = this.nextLogId++;

        let message = payload;
        let type: number | undefined = undefined;

        const s = (payload ?? "").trim();
        if (s.startsWith("{") && s.endsWith("}")) {
            try {
                const obj = JSON.parse(s) as any;

                if (obj && typeof obj.msg === "string") {
                    message = obj.msg;
                }

                if (obj && typeof obj.type === "number") {
                    type = obj.type;
                } else if (obj && typeof obj.type === "string") {
                    const n = Number(obj.type);
                    if (Number.isFinite(n)) type = n;
                }

                return { id, message, type, raw: payload };
            } catch {
                // JSON FAILED
            }
        }

        return { id, message };
    }

    private startIfNeeded() {
        if (this.started) return;
        this.started = true;

        if (isBuildPhase()) return;

        this.ensureNativeLoaded();
        if (!this.native) return;

        this.native.on("log", (payload: string) => {
            const entry = this.normalizeLog(payload);
            this.logs.push(entry);

            if (this.logs.length > 500) {
                this.logs.splice(0, this.logs.length - 500);
            }

            this.emit("log", entry);
        });

        this.native.on("connected", (info: { key: string; value: string }) => {
            this.emit("connected", info);
        });

        this.native.on("antiDebug", (detail: string) => {
            this.emit("antiDebug", detail);
            // process.exit(0)
        });

        const args = ["vs1984", "-n", "-h", path.join(process.cwd(), "vshome")];
        // const args = ["vs1984", "-n", "-h", "vshome"];
        this.native.init(args);
    }

    runCmd(cmd: string) {
        if (cmd === "cmd exit") return;

        if (isBuildPhase()) return;

        this.startIfNeeded();
        this.native?.runCmd(cmd);
    }

    logInfo(type_code: number) {
        if (isBuildPhase()) return "";
        this.startIfNeeded();
        return this.native?.logInfo(type_code) ?? "";
    }

    getLogs(sinceId?: number): Vs1984LogEntry[] {
        if (isBuildPhase()) return [];

        this.startIfNeeded();

        if (sinceId == null) return this.logs;
        return this.logs.filter((l) => l.id > sinceId);
    }
}

let singleton: Vs1984Service | null = null;

export default function getVs1984(): Vs1984Service {
    if (!singleton) singleton = new Vs1984Service();
    return singleton;
}
