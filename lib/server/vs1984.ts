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

class Vs1984Service extends EventEmitter {
    private native: XbcNative;
    private started = false;
    private logs: Vs1984LogEntry[] = [];
    private nextLogId = 1;

    constructor() {
        super();

        const nativePath = path.join(
            process.cwd(),
            "lib",
            "native",
            "vs1984_native.node"
        );

        const dynamicRequire = eval("require") as NodeRequire;
        this.native = dynamicRequire(nativePath) as XbcNative;

        this.start();
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

    private start() {
        if (this.started) return;
        this.started = true;
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

        const args = [
            "vs1984",
            "-n",
            "-h",
            "vshome",
        ];
        this.native.init(args);
    }

    runCmd(cmd: string) {
        if (cmd === "cmd exit") return;
        this.native.runCmd(cmd);
    }

    logInfo(type_code: number) {
        return this.native.logInfo(type_code);
    }

    getLogs(sinceId?: number): Vs1984LogEntry[] {
        if (sinceId == null) return this.logs;
        return this.logs.filter((l) => l.id > sinceId);
    }
}

const vs1984Service = new Vs1984Service();
export default vs1984Service;
