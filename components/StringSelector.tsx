import type { TuningString } from "@/lib/tunings/presets";

type StringSelectorProps = {
  strings: TuningString[];
  selectedStringId: string | null;
  activeStringId: string | null;
  autoDetectEnabled: boolean;
  onStringSelect: (stringId: string) => void;
  onAutoDetectChange: (enabled: boolean) => void;
};

export function StringSelector({
  strings,
  selectedStringId,
  activeStringId,
  autoDetectEnabled,
  onStringSelect,
  onAutoDetectChange
}: StringSelectorProps) {
  if (strings.length === 0) {
    return null;
  }

  return (
    <section className="glass rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Target String</h3>
        <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-slate-300">
          <input
            type="checkbox"
            checked={autoDetectEnabled}
            onChange={(event) => onAutoDetectChange(event.target.checked)}
            className="h-4 w-4 accent-accent"
          />
          Auto detect
        </label>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {strings.map((string) => {
          const isSelected = selectedStringId === string.id;
          const isActive = activeStringId === string.id;

          return (
            <button
              key={string.id}
              type="button"
              onClick={() => onStringSelect(string.id)}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                isActive
                  ? "border-accent bg-accentSoft text-accent shadow-glow"
                  : isSelected
                    ? "border-info/50 bg-info/15 text-info"
                    : "border-white/10 bg-panelSoft text-slate-200 hover:bg-slate-700/60"
              }`}
            >
              {string.label}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-slate-400">Tap a string to lock tuning, or keep auto-detect enabled.</p>
    </section>
  );
}
