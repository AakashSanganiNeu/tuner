import type { ReferenceNoteOption } from "@/lib/tunings/presets";

type ReferenceTonePlayerProps = {
  isPlaying: boolean;
  targetLabel: string;
  targetFrequency: number | null;
  referenceOptions: ReferenceNoteOption[];
  selectedReferenceMidi: number | null;
  onReferenceChange: (midi: number | null) => void;
  onToggle: () => void;
};

export function ReferenceTonePlayer({
  isPlaying,
  targetLabel,
  targetFrequency,
  referenceOptions,
  selectedReferenceMidi,
  onReferenceChange,
  onToggle
}: ReferenceTonePlayerProps) {
  return (
    <section className="glass rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Reference Tone</h3>
        <span className="text-xs text-slate-300">{targetLabel}</span>
      </div>
      <label htmlFor="reference-note" className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-400">
        Reference Note
      </label>
      <select
        id="reference-note"
        value={selectedReferenceMidi === null ? "target" : String(selectedReferenceMidi)}
        onChange={(event) => {
          const value = event.target.value;
          onReferenceChange(value === "target" ? null : Number(value));
        }}
        className="mb-3 w-full rounded-xl border border-white/10 bg-panelSoft px-3 py-2 text-sm text-white outline-none transition focus:border-accent"
      >
        <option value="target">Follow target note</option>
        {referenceOptions.map((option) => (
          <option key={option.midi} value={option.midi}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={onToggle}
        disabled={!targetFrequency}
        className={`w-full rounded-xl px-4 py-2 text-sm font-semibold transition ${
          isPlaying ? "bg-danger/90 text-white hover:bg-danger" : "bg-info/85 text-white hover:bg-info"
        } disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400`}
      >
        {isPlaying ? "Stop Tone" : "Play Tone"}
      </button>
      <p className="mt-3 text-xs text-slate-400">Pick any tuning note, or follow the live target automatically.</p>
    </section>
  );
}
