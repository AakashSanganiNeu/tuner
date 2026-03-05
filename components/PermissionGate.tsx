type PermissionGateProps = {
  permission: "idle" | "granted" | "denied" | "error";
  isStarting: boolean;
  onStart: () => void;
};

export function PermissionGate({ permission, isStarting, onStart }: PermissionGateProps) {
  if (permission === "granted") {
    return null;
  }

  const title =
    permission === "denied"
      ? "Microphone permission is blocked"
      : permission === "error"
        ? "Could not access microphone"
        : "Enable microphone to start tuning";

  const description =
    permission === "denied"
      ? "Allow microphone access in your browser site settings, then return to TuneMate."
      : "TuneMate needs live microphone input to detect pitch in real time. Audio stays on your device.";

  return (
    <div className="glass animate-driftIn rounded-3xl p-6 text-center shadow-tuner">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">{description}</p>
      <button
        type="button"
        onClick={onStart}
        disabled={isStarting}
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-bg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isStarting ? "Starting..." : permission === "denied" ? "Try Again" : "Start Listening"}
      </button>
      <p className="mt-4 text-xs text-slate-400">Tap once to allow mic. iOS Safari requires direct user interaction.</p>
    </div>
  );
}
