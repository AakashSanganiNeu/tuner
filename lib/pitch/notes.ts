export const SHARP_NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B"
] as const;

export const FLAT_NOTE_NAMES = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B"
] as const;

export type NoteName = (typeof SHARP_NOTE_NAMES)[number] | (typeof FLAT_NOTE_NAMES)[number];

export type NoteParts = {
  midi: number;
  name: NoteName;
  octave: number;
  label: string;
};

const NOTE_INDEX_BY_NAME: Record<string, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11
};

export function frequencyToMidi(frequency: number, a4 = 440): number {
  return 69 + 12 * Math.log2(frequency / a4);
}

export function midiToFrequency(midi: number, a4 = 440): number {
  return a4 * 2 ** ((midi - 69) / 12);
}

export function nearestMidiForFrequency(frequency: number, a4 = 440): number {
  return Math.round(frequencyToMidi(frequency, a4));
}

export function midiToNoteParts(midi: number, preferFlats = false): NoteParts {
  const rounded = Math.round(midi);
  const octave = Math.floor(rounded / 12) - 1;
  const noteIndex = ((rounded % 12) + 12) % 12;
  const name = (preferFlats ? FLAT_NOTE_NAMES[noteIndex] : SHARP_NOTE_NAMES[noteIndex]) as NoteName;

  return {
    midi: rounded,
    name,
    octave,
    label: `${name}${octave}`
  };
}

export function centsDifference(detectedFrequency: number, targetFrequency: number): number {
  return 1200 * Math.log2(detectedFrequency / targetFrequency);
}

export function noteNameToMidi(noteLabel: string): number {
  const match = /^([A-G](?:#|b)?)(-?\d+)$/.exec(noteLabel.trim());

  if (!match) {
    throw new Error(`Invalid note label: ${noteLabel}`);
  }

  const noteName = match[1];
  const octave = Number.parseInt(match[2], 10);
  const noteIndex = NOTE_INDEX_BY_NAME[noteName];

  if (noteIndex === undefined) {
    throw new Error(`Unsupported note name: ${noteName}`);
  }

  return (octave + 1) * 12 + noteIndex;
}
