import { clsx } from "clsx";
import type { ApplicationStatus, PipelineStatus } from "@/lib/mock-data";

const appColors: Record<ApplicationStatus, string> = {
  Evaluated: "bg-zinc-800 text-zinc-300",
  Applied: "bg-blue-950 text-blue-400",
  Responded: "bg-sky-950 text-sky-400",
  Interview: "bg-amber-950 text-amber-400",
  Offer: "bg-green-950 text-green-400",
  Rejected: "bg-red-950 text-red-500",
  Discarded: "bg-zinc-800 text-zinc-600",
  SKIP: "bg-zinc-800 text-zinc-600",
};

const pipelineColors: Record<PipelineStatus, string> = {
  pending: "bg-zinc-800 text-zinc-400",
  evaluating: "text-[#00f0ff]",
  done: "bg-green-950 text-green-400",
  skip: "bg-zinc-800 text-zinc-600",
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        appColors[status]
      )}
    >
      {status}
    </span>
  );
}

export function PipelineBadge({ status }: { status: PipelineStatus }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        pipelineColors[status]
      )}
    >
      {label}
    </span>
  );
}
