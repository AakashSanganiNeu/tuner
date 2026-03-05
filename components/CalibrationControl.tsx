type CalibrationControlProps = {
  value: number;
  onChange: (value: number) => void;
};

export function CalibrationControl({ value, onChange }: CalibrationControlProps) {
  return (
    <section className="glass rounded-2xl p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Calibration</h3>
        <span className="text-sm text-slate-200">A4 = {value} Hz</span>
      </div>
      <input
        type="range"
        min={432}
        max={446}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-panelSoft accent-accent"
        aria-label="A4 calibration"
      />
      <div className="mt-2 flex justify-between text-xs text-slate-400">
        <span>432 Hz</span>
        <span>446 Hz</span>
      </div>
    </section>
  );
}
