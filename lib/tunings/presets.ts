import { midiToFrequency, noteNameToMidi } from "@/lib/pitch/notes";

export type TuningString = {
  id: string;
  label: string;
  note: string;
  midi: number;
};

export type TuningPreset = {
  id: string;
  label: string;
  instrument: string;
  isChromatic?: boolean;
  strings: TuningString[];
};

export type ReferenceNoteOption = {
  midi: number;
  label: string;
};

function buildStrings(notes: string[]): TuningString[] {
  return notes.map((note, index) => ({
    id: `${note}-${index}`,
    label: note,
    note,
    midi: noteNameToMidi(note)
  }));
}

export const TUNING_PRESETS: TuningPreset[] = [
  {
    id: "chromatic",
    label: "Chromatic",
    instrument: "Chromatic",
    isChromatic: true,
    strings: []
  },
  {
    id: "guitar-standard",
    label: "Guitar Standard",
    instrument: "Guitar",
    strings: buildStrings(["E2", "A2", "D3", "G3", "B3", "E4"])
  },
  {
    id: "guitar-half-step-down",
    label: "Guitar Half-Step Down",
    instrument: "Guitar",
    strings: buildStrings(["Eb2", "Ab2", "Db3", "Gb3", "Bb3", "Eb4"])
  },
  {
    id: "guitar-whole-step-down",
    label: "Guitar Whole-Step Down",
    instrument: "Guitar",
    strings: buildStrings(["D2", "G2", "C3", "F3", "A3", "D4"])
  },
  {
    id: "guitar-drop-d",
    label: "Drop D",
    instrument: "Guitar",
    strings: buildStrings(["D2", "A2", "D3", "G3", "B3", "E4"])
  },
  {
    id: "ukulele-standard",
    label: "Ukulele Standard",
    instrument: "Ukulele",
    strings: buildStrings(["G4", "C4", "E4", "A4"])
  },
  {
    id: "violin-standard",
    label: "Violin",
    instrument: "Violin",
    strings: buildStrings(["G3", "D4", "A4", "E5"])
  },
  {
    id: "bass-standard",
    label: "Bass 4-String",
    instrument: "Bass",
    strings: buildStrings(["E1", "A1", "D2", "G2"])
  },
  {
    id: "mandolin-standard",
    label: "Mandolin",
    instrument: "Mandolin",
    strings: buildStrings(["G3", "D4", "A4", "E5"])
  }
];

export function getPresetById(presetId: string): TuningPreset {
  return TUNING_PRESETS.find((preset) => preset.id === presetId) ?? TUNING_PRESETS[0];
}

export function stringTargetFrequency(midi: number, a4 = 440): number {
  return midiToFrequency(midi, a4);
}

export function getReferenceNoteOptions(): ReferenceNoteOption[] {
  const byMidi = new Map<number, string>();

  for (const preset of TUNING_PRESETS) {
    for (const string of preset.strings) {
      if (!byMidi.has(string.midi)) {
        byMidi.set(string.midi, string.label);
      }
    }
  }

  return [...byMidi.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([midi, label]) => ({ midi, label }));
}
