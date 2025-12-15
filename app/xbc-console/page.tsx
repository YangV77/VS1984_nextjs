"use client";

import { useEffect, useRef, useState } from "react";

type LogEntry = {
    id: number;
    message: string;
    type?: number;
};

export default function XbcConsolePage() {
    const [cmd, setCmd] = useState("cmd self");
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [sending, setSending] = useState(false);

    const lastLogIdRef = useRef<number | null>(null);
    const shouldAutoScrollRef = useRef(true);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        document.documentElement.classList.add("bg-slate-200");
        document.body.classList.add("bg-slate-200");

        return () => {
            document.documentElement.classList.remove("bg-slate-200");
            document.body.classList.remove("bg-slate-200");
        };
    }, []);

    useEffect(() => {
        let stopped = false;

        async function poll() {
            while (!stopped) {
                try {
                    const url =
                        lastLogIdRef.current != null
                            ? `/api/xbc/logs?since=${lastLogIdRef.current}`
                            : `/api/xbc/logs`;

                    const res = await fetch(url);
                    if (!res.ok) {
                        console.error("fetch logs failed", res.status);
                    } else {
                        const data = (await res.json()) as { logs: LogEntry[] };
                        if (data.logs?.length) {
                            setLogs((prev) => {
                                const merged = [...prev, ...data.logs];
                                lastLogIdRef.current =
                                    data.logs[data.logs.length - 1].id ?? lastLogIdRef.current;
                                return merged.slice(-2000);
                            });
                        }
                    }
                } catch (e) {
                    console.error("poll logs error:", e);
                }

                await new Promise((r) => setTimeout(r, 1000));
            }
        }

        poll();
        return () => {
            stopped = true;
        };
    }, []);

    useEffect(() => {
        if (!shouldAutoScrollRef.current) return;
        bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }, [logs]);

    useEffect(() => {
        function onWindowScroll() {
            const doc = document.documentElement;
            const remaining = doc.scrollHeight - (doc.scrollTop + doc.clientHeight);
            shouldAutoScrollRef.current = remaining < 120;
        }

        window.addEventListener("scroll", onWindowScroll, { passive: true });
        onWindowScroll();

        return () => window.removeEventListener("scroll", onWindowScroll);
    }, []);

    async function handleSend() {
        const text = cmd.trim();
        if (!text || sending) return;

        setSending(true);
        try {
            const res = await fetch("/api/xbc/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cmd: text }),
            });

            if (!res.ok) {
                console.error("send cmd failed", await res.text());
            } else {
                setCmd("");
                shouldAutoScrollRef.current = true;
                requestAnimationFrame(() => {
                    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
                });
            }
        } catch (e) {
            console.error("send cmd error:", e);
        } finally {
            setSending(false);
        }
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
        }
    }

    function clearLogs() {
        setLogs([]);
        lastLogIdRef.current = null;
        shouldAutoScrollRef.current = true;
        requestAnimationFrame(() => {
            bottomRef.current?.scrollIntoView({ behavior: "auto" });
        });
    }

    return (
        <div className="min-h-screen bg-slate-200 text-slate-800">
            <div className="sticky top-0 z-10 border-b border-slate-300 bg-slate-200/90 backdrop-blur">
                <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
                    <h1 className="text-lg font-bold">VS1984 Console</h1>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={clearLogs}
                            className="rounded bg-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-400"
                            type="button"
                        >
                            Clear
                        </button>

                        <button
                            onClick={() =>
                                bottomRef.current?.scrollIntoView({ behavior: "smooth" })
                            }
                            className="rounded bg-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-400"
                            type="button"
                        >
                            Bottom
                        </button>
                    </div>
                </div>
            </div>
            <div className="mx-auto max-w-5xl px-4 pb-28">
                <div className="mt-4 text-xs font-mono">
                    {logs.length === 0 ? (
                        <div className="text-slate-500">No logs yet...</div>
                    ) : (
                        logs.map((l) => (
                            <div key={l.id} className="whitespace-pre-wrap leading-relaxed py-0.5">
                                {l.message}
                            </div>
                        ))
                    )}
                    <div ref={bottomRef} />
                </div>
            </div>
            <div className="fixed bottom-0 left-0 right-0 border-t border-slate-300 bg-slate-200/95 backdrop-blur">
                <div className="mx-auto max-w-5xl px-4 py-3 flex gap-2 items-center">
                    <input
                        className="flex-1 rounded border border-slate-500 bg-slate-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400"
                        value={cmd}
                        onChange={(e) => setCmd(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder='Type command and press Enter, e.g. "cmd self"'
                    />
                    <button
                        onClick={handleSend}
                        disabled={sending || !cmd.trim()}
                        className="px-4 py-2 rounded bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-sm font-medium"
                        type="button"
                    >
                        {sending ? "Sending..." : "Send"}
                    </button>
                </div>
            </div>
        </div>
    );
}
