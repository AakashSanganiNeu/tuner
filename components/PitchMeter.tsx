import { clamp } from "@/lib/utils/format";
import type { TuningDirection } from "@/lib/types";

type PitchMeterProps = {
  cents: number | null;
  direction: TuningDirection;
  isListening: boolean;
};

export function PitchMeter({ cents, direction, isListening }: PitchMeterProps) {
  const clamped = cents === null ? 0 : clamp(cents, -50, 50);
  const needleX = ((clamped + 50) / 100) * 100;

  const statusColor =
    direction === "in-tune" ? "bg-accent" : direction === "sharp" ? "bg-danger" : direction === "flat" ? "bg-warning" : "bg-slate-500";

  return (
    <section className="glass rounded-3xl p-5 shadow-tuner">
      <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
        <span>-50¢</span>
        <span>0¢</span>
        <span>+50¢</span>
      </div>

      <div className="relative h-10 rounded-full bg-panelSoft">
        <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/15" />
        <div className={`absolute left-1/2 top-1/2 h-7 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full ${isListening ? "bg-accent" : "bg-slate-500"}`} />
        <div
          className={`absolute top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full ${statusColor} transition-transform duration-150 ${
            direction === "in-tune" ? "animate-pulseCenter" : ""
          }`}
          style={{ left: `${needleX}%` }}
        />
      </div>

      <p className="mt-3 text-center text-sm text-slate-300">{isListening ? "Needle responds to your pitch in real time." : "Start listening to activate the meter."}</p>
    </section>
  );
}
