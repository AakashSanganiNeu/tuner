import { centsDifference, midiToFrequency } from "@/lib/pitch/notes";
import type { TuningString } from "@/lib/tunings/presets";

export type StringMatch = {
  string: TuningString;
  cents: number;
  targetFrequency: number;
};

export function findNearestStringTarget(
  frequency: number,
  strings: TuningString[],
  a4 = 440
): StringMatch | null {
  if (strings.length === 0) {
    return null;
  }

  let best: StringMatch | null = null;

  for (const string of strings) {
    const targetFrequency = midiToFrequency(string.midi, a4);
    const cents = centsDifference(frequency, targetFrequency);

    if (!best || Math.abs(cents) < Math.abs(best.cents)) {
      best = {
        string,
        cents,
        targetFrequency
      };
    }
  }

  return best;
}
