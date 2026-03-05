import type { TuningPreset } from "@/lib/tunings/presets";

type InstrumentSelectorProps = {
  presets: TuningPreset[];
  selectedId: string;
  onChange: (presetId: string) => void;
};

export function InstrumentSelector({ presets, selectedId, onChange }: InstrumentSelectorProps) {
  return (
    <section className="glass rounded-2xl p-4">
      <label htmlFor="instrument" className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-400">
        Instrument Mode
      </label>
      <select
        id="instrument"
        value={selectedId}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-white/10 bg-panelSoft px-3 py-2 text-sm text-white outline-none transition focus:border-accent"
      >
        {presets.map((preset) => (
          <option key={preset.id} value={preset.id}>
            {preset.label}
          </option>
        ))}
      </select>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {presets.map((preset) => {
          const active = preset.id === selectedId;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(preset.id)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition ${
                active ? "bg-accent text-bg" : "bg-panelSoft text-slate-300 hover:bg-slate-700/60"
              }`}
            >
              {preset.instrument}
            </button>
          );
        })}
      </div>
    </section>
  );
}
