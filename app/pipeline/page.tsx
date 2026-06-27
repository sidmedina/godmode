"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, ExternalLink, RefreshCw, Play, Plus, X, CheckCircle } from "lucide-react";
import type { Job } from "@/lib/types";

interface EvalResult {
  company: string;
  role: string;
  score: number;
  notes: string;
  recommendation: "apply" | "consider" | "skip";
}

const SCORE_COLOR = (s: number) =>
  s >= 4.5 ? "#00853e" : s >= 4.0 ? "#1a2b3c" : s >= 3.5 ? "#c87d00" : "#c0392b";

const REC_CONFIG = {
  apply:    { label: "Apply Now",  bg: "#e8f4ef", text: "#00853e", border: "#b8dfc9" },
  consider: { label: "Consider",   bg: "#fef4e0", text: "#c87d00", border: "#f4d9a0" },
  skip:     { label: "Skip",       bg: "#fce8e8", text: "#c0392b", border: "#f4b8b8" },
};

export default function PipelinePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanMsg, setScanMsg] = useState("");
  const [newUrl, setNewUrl] = useState("");

  // Evaluate drawer state
  const [evalJob, setEvalJob] = useState<Job | null>(null);
  const [evalText, setEvalText] = useState("");
  const [evalDone, setEvalDone] = useState(false);
  const [evalLoading, setEvalLoading] = useState(false);
  const [parsed, setParsed] = useState<EvalResult | null>(null);
  const [saved, setSaved] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const evalScrollRef = useRef<HTMLDivElement>(null);

  const fetchJobs = () => {
    setLoading(true);
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((d) => setJobs((d.jobs ?? []).filter((j: Job) => j.status === "Pipeline")))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchJobs(); }, []);

  // Auto-scroll eval output
  useEffect(() => {
    if (evalScrollRef.current) {
      evalScrollRef.current.scrollTop = evalScrollRef.current.scrollHeight;
    }
  }, [evalText]);

  const runScan = async () => {
    setScanning(true);
    setScanMsg("Scanning portals…");
    try {
      const res = await fetch("/api/scan", { method: "POST" });
      const data = await res.json();
      if (data.ok) { setScanMsg("Scan complete — refreshing…"); fetchJobs(); }
      else setScanMsg(`Scan error: ${data.error}`);
    } catch { setScanMsg("Scan failed. Check that career-ops is installed."); }
    setScanning(false);
    setTimeout(() => setScanMsg(""), 5000);
  };

  const addUrl = () => {
    const url = newUrl.trim();
    if (!url) return;
    setJobs((prev) => [{
      id: Date.now(), date: new Date().toISOString().split("T")[0],
      company: extractCompany(url), role: "Pending Evaluation",
      score: null, status: "Pipeline", hasPdf: false, notes: "", url,
    } as Job, ...prev]);
    setNewUrl("");
  };

  const startEval = async (job: Job) => {
    setEvalJob(job);
    setEvalText("");
    setEvalDone(false);
    setEvalLoading(true);
    setParsed(null);
    setSaved(false);
    setSaveMsg("");

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: job.url }),
      });

      if (!res.ok) {
        const err = await res.json();
        setEvalText(`Error: ${err.error}`);
        setEvalDone(true);
        setEvalLoading(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        // Parse SSE events from Anthropic
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (data === "[DONE]") continue;
          try {
            const evt = JSON.parse(data);
            if (evt.type === "content_block_delta" && evt.delta?.text) {
              full += evt.delta.text;
              // Strip the EVAL_JSON line from display
              const display = full.replace(/\nEVAL_JSON:.*$/s, "").replace(/EVAL_JSON:.*$/s, "");
              setEvalText(display);
            }
          } catch { /* partial JSON, skip */ }
        }
      }

      // Parse the EVAL_JSON block
      const jsonMatch = full.match(/EVAL_JSON:(\{.*\})/s);
      if (jsonMatch) {
        try { setParsed(JSON.parse(jsonMatch[1])); } catch { /* ignore parse error */ }
      }
    } catch (e) {
      setEvalText(`Network error: ${(e as Error).message}`);
    }

    setEvalDone(true);
    setEvalLoading(false);
  };

  const saveEvaluation = async () => {
    if (!parsed || !evalJob) return;
    const date = new Date().toISOString().split("T")[0];
    const res = await fetch("/api/save-evaluation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company: parsed.company, role: parsed.role, score: parsed.score, notes: parsed.notes, url: evalJob.url, date }),
    });
    const data = await res.json();
    if (data.ok) {
      setSaved(true);
      setSaveMsg("Saved to applications.md ✅  The dashboard will update shortly.");
      setJobs((prev) => prev.filter((j) => j.id !== evalJob.id));
    } else if (data.reason === "local-only") {
      setSaveMsg("Evaluated ✅  Run export-snapshot.mjs to sync to Netlify.");
      setSaved(true);
    } else {
      setSaveMsg(`Save failed: ${data.reason}`);
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main list */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-base font-semibold" style={{ color: "#1a2b3c" }}>Pipeline</h1>
            <p className="text-xs mt-0.5" style={{ color: "#aaa" }}>
              {jobs.length} URL{jobs.length !== 1 ? "s" : ""} pending · Last scan: daily at 6:00 AM
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchJobs} className="p-1.5 rounded" style={{ color: "#ccc", border: "1px solid #e0ddd8" }}>
              <RefreshCw size={13} />
            </button>
            <button onClick={runScan} disabled={scanning}
              className="flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold"
              style={{ background: scanning ? "#f0eeea" : "#1a2b3c", color: scanning ? "#aaa" : "#fff" }}>
              {scanning ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
              {scanning ? "Scanning…" : "Scan Now"}
            </button>
          </div>
        </div>

        {scanMsg && (
          <div className="mb-4 px-4 py-2.5 rounded text-xs" style={{ background: "#e8f4ef", color: "#00853e", border: "1px solid #b8dfc9" }}>
            {scanMsg}
          </div>
        )}

        {/* Add URL */}
        <div className="flex gap-2 mb-6">
          <input value={newUrl} onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addUrl(); }}
            placeholder="Paste a job URL to evaluate…"
            className="flex-1 px-3 py-2 rounded text-xs outline-none"
            style={{ background: "#fff", border: "1px solid #e0ddd8", color: "#333" }}
            onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "#00853e"; }}
            onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "#e0ddd8"; }} />
          <button onClick={addUrl} className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium"
            style={{ background: "#1a2b3c", color: "#fff" }}>
            <Plus size={12} /> Add
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 size={20} className="animate-spin" style={{ color: "#00853e" }} />
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-lg px-6 py-12 text-center" style={{ background: "#fff", border: "1px solid #e0ddd8" }}>
            <p className="text-sm" style={{ color: "#aaa" }}>Pipeline is empty.</p>
            <p className="text-xs mt-1" style={{ color: "#ccc" }}>Paste a URL above or hit Scan Now to find new offers.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {jobs.map((job) => (
              <div key={job.id} className="flex items-center gap-3 rounded-lg px-4 py-3"
                style={{ background: "#fff", border: "1px solid #e0ddd8", borderLeft: "3px solid #00853e" }}>
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#00853e" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "#1a2b3c" }}>{job.company}</p>
                  <p className="text-[10px] font-mono truncate mt-0.5" style={{ color: "#aaa" }}>{job.url}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => startEval(job)}
                    className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded font-semibold"
                    style={{ background: "#1a2b3c", color: "#fff" }}>
                    <Play size={10} /> Evaluate
                  </button>
                  {job.url && (
                    <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ color: "#ccc" }}>
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Evaluation drawer */}
      {evalJob && (
        <div className="w-[420px] shrink-0 flex flex-col border-l" style={{ background: "#fff", borderColor: "#e0ddd8" }}>
          {/* Drawer header */}
          <div className="px-5 py-4 flex items-start justify-between shrink-0" style={{ borderBottom: "1px solid #e0ddd8" }}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#aaa" }}>Evaluating</p>
              <p className="text-sm font-semibold mt-0.5" style={{ color: "#1a2b3c" }}>{evalJob.company}</p>
              <p className="text-[10px] font-mono truncate mt-1 max-w-[320px]" style={{ color: "#ccc" }}>{evalJob.url}</p>
            </div>
            <button onClick={() => setEvalJob(null)} style={{ color: "#ccc" }}>
              <X size={16} />
            </button>
          </div>

          {/* Streaming output */}
          <div ref={evalScrollRef} className="flex-1 overflow-y-auto px-5 py-4 text-xs leading-relaxed whitespace-pre-wrap"
            style={{ color: "#444", fontFamily: "ui-monospace, monospace", fontSize: "11px" }}>
            {evalLoading && !evalText && (
              <div className="flex items-center gap-2" style={{ color: "#aaa" }}>
                <Loader2 size={13} className="animate-spin" style={{ color: "#00853e" }} />
                Fetching job and evaluating…
              </div>
            )}
            {evalText}
            {evalLoading && evalText && (
              <span className="inline-block w-1.5 h-3 ml-0.5 animate-pulse" style={{ background: "#00853e" }} />
            )}
          </div>

          {/* Result card + save */}
          {evalDone && parsed && (
            <div className="shrink-0 px-5 py-4" style={{ borderTop: "1px solid #e0ddd8" }}>
              <div className="rounded-lg p-4 mb-3" style={{ background: "#f9f8f6", border: "1px solid #e0ddd8" }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "#1a2b3c" }}>{parsed.company}</p>
                    <p className="text-xs truncate mt-0.5" style={{ color: "#888" }}>{parsed.role}</p>
                    <p className="text-[11px] mt-2 leading-relaxed" style={{ color: "#666" }}>{parsed.notes}</p>
                  </div>
                  <div className="shrink-0 text-center">
                    <span className="text-2xl font-bold tabular-nums" style={{ color: SCORE_COLOR(parsed.score) }}>
                      {parsed.score.toFixed(1)}
                    </span>
                    <p className="text-[9px]" style={{ color: "#ccc" }}>/ 5.0</p>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: REC_CONFIG[parsed.recommendation].bg, color: REC_CONFIG[parsed.recommendation].text, border: `1px solid ${REC_CONFIG[parsed.recommendation].border}` }}>
                    {REC_CONFIG[parsed.recommendation].label}
                  </span>
                </div>
              </div>

              {saveMsg ? (
                <div className="flex items-center gap-2 text-xs px-3 py-2.5 rounded"
                  style={{ background: "#e8f4ef", color: "#00853e", border: "1px solid #b8dfc9" }}>
                  <CheckCircle size={13} /> {saveMsg}
                </div>
              ) : (
                <button onClick={saveEvaluation}
                  className="w-full py-2.5 rounded text-xs font-semibold"
                  style={{ background: "#00853e", color: "#fff" }}>
                  Save to Applications
                </button>
              )}
            </div>
          )}

          {evalDone && !parsed && (
            <div className="shrink-0 px-5 py-3 text-xs" style={{ color: "#c0392b", borderTop: "1px solid #e0ddd8" }}>
              Could not parse evaluation result. Copy the text above manually.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function extractCompany(url: string): string {
  try {
    const { hostname, pathname } = new URL(url);
    if (["greenhouse.io", "lever.co", "ashbyhq.com"].some((h) => hostname.includes(h))) {
      const seg = pathname.split("/").find((s) => s.length > 2 && !/^\d/.test(s));
      if (seg) return seg.replace(/-/g, " ");
    }
    return hostname.replace(/^www\./, "").split(".")[0];
  } catch { return "Unknown"; }
}
