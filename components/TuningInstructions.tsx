import type { SignalState, TuningDirection } from "@/lib/types";

type TuningInstructionsProps = {
  signalState: SignalState;
  direction: TuningDirection;
};

export function TuningInstructions({ signalState, direction }: TuningInstructionsProps) {
  let headline = "Pluck one string at a time";
  let detail = "Keep your device close to the instrument and reduce background noise.";

  if (signalState === "permission-denied") {
    headline = "Microphone permission required";
    detail = "Allow microphone access and tap Start Listening again.";
  } else if (signalState === "no-signal") {
    headline = "No signal detected";
    detail = "Pluck harder or move closer to your instrument.";
  } else if (signalState === "noisy") {
    headline = "Signal too noisy";
    detail = "Mute other strings and avoid noisy rooms for best pitch lock.";
  } else if (direction === "flat") {
    headline = "Tighten slightly";
    detail = "Bring the pitch up slowly toward center.";
  } else if (direction === "sharp") {
    headline = "Loosen slightly";
    detail = "Lower the pitch gently toward center.";
  } else if (direction === "in-tune") {
    headline = "In tune";
    detail = "Nice. Lock this string, then tune the next one.";
  }

  return (
    <section className="glass rounded-2xl p-4">
      <h3 className="text-base font-semibold text-white">{headline}</h3>
      <p className="mt-1 text-sm text-slate-300">{detail}</p>
    </section>
  );
}
