import { formatFrequency, formatSignedCents } from "@/lib/utils/format";
import type { SignalState, TuningDirection } from "@/lib/types";

type DetectedNoteCardProps = {
  detectedLabel: string;
  targetLabel: string;
  detectedFrequency: number | null;
  cents: number | null;
  clarity: number;
  inputLevel: number;
  signalState: SignalState;
  direction: TuningDirection;
  lastStableLabel: string | null;
};

function directionLabel(direction: TuningDirection): string {
  if (direction === "flat") return "Flat";
  if (direction === "sharp") return "Sharp";
  if (direction === "in-tune") return "In Tune";
  return "Listening";
}

export function DetectedNoteCard({
  detectedLabel,
  targetLabel,
  detectedFrequency,
  cents,
  clarity,
  inputLevel,
  signalState,
  direction,
  lastStableLabel
}: DetectedNoteCardProps) {
  const statusTone =
    direction === "in-tune"
      ? "text-accent"
      : direction === "flat"
        ? "text-warning"
        : direction === "sharp"
          ? "text-danger"
          : "text-slate-300";

  return (
    <section className="glass rounded-3xl p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Detected Note</p>
          <p className="mt-2 text-6xl font-bold leading-none text-white">{detectedLabel}</p>
          <p className="mt-2 text-sm text-slate-300">Target: {targetLabel}</p>
        </div>
        <div className="grid gap-2 rounded-2xl bg-panelSoft p-4 text-sm text-slate-300">
          <div className="flex items-center justify-between">
            <span>Frequency</span>
            <span className="font-semibold text-white">{formatFrequency(detectedFrequency)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Cents</span>
            <span className="font-semibold text-white">{formatSignedCents(cents)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Status</span>
            <span className={`font-semibold ${statusTone}`}>{directionLabel(direction)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Signal</span>
            <span className="font-medium text-slate-200">
              {signalState === "noisy"
                ? "Too noisy"
                : signalState === "no-signal"
                  ? "No signal"
                  : signalState === "permission-denied"
                    ? "Mic denied"
                    : "Live"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Clarity</span>
            <span className="font-medium text-slate-200">{Math.round(clarity * 100)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Input level</span>
            <span className="font-medium text-slate-200">{inputLevel.toFixed(3)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Last stable</span>
            <span className="font-medium text-slate-200">{lastStableLabel ?? "--"}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
