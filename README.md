# TuneMate

TuneMate is a production-oriented, mobile-first instrument tuner web app built with Next.js, TypeScript, Tailwind CSS, and the Web Audio API.

## Features

- Real microphone input (`getUserMedia`) with explicit user interaction.
- Real-time pitch detection (YIN-style autocorrelation family algorithm).
- Note mapping:
  - detected note + octave
  - nearest target note
  - target frequency
  - cents sharp/flat
- Large tuner UI with:
  - detected note card
  - pitch meter / animated needle
  - flat / in tune / sharp status
- Instrument modes:
  - Chromatic
  - Guitar Standard (E A D G B E)
  - Guitar Half-Step Down (Eb Ab Db Gb Bb Eb)
  - Guitar Whole-Step Down (D G C F A D)
  - Drop D (D A D G B E)
  - Ukulele Standard (G C E A)
  - Violin (G D A E)
  - Bass 4-string (E A D G)
  - Mandolin (G D A E)
- String-specific tuning by tapping a string.
- Optional auto-detect nearest string in instrument mode.
- Reference tone generator for target note.
- A4 calibration slider (432-446 Hz, default 440 Hz).
- Smoothing and stability handling for reduced UI jitter.
- Noise gate / silence rejection and noisy-signal handling.
- Mobile-first dark UI.

## Project Structure

```txt
app/
  globals.css
  layout.tsx
  page.tsx
components/
  CalibrationControl.tsx
  DetectedNoteCard.tsx
  InstrumentSelector.tsx
  PermissionGate.tsx
  PitchMeter.tsx
  ReferenceTonePlayer.tsx
  StringSelector.tsx
  TunerScreen.tsx
  TuningInstructions.tsx
lib/
  audio/
    microphone.ts
    referenceTone.ts
  pitch/
    detector.ts
    notes.ts
    smoothing.ts
  tunings/
    presets.ts
    targeting.ts
  utils/
    format.ts
  types.ts
package.json
next.config.ts
tailwind.config.ts
postcss.config.mjs
tsconfig.json
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Run the dev server:

```bash
npm run dev
```

3. Open:

```txt
http://localhost:3000
```

## Browser Permission Notes

- You must tap **Start Listening** to trigger microphone permission.
- If permission is denied, re-enable mic access from browser site settings.
- Best results are in modern Chrome and Safari on HTTPS or `localhost`.

## Pitch Detection Approach

TuneMate uses a YIN-style pitch detector (difference function + cumulative mean normalized difference) to detect monophonic pitch from live audio frames.

Pipeline summary:

1. Read time-domain audio from `AnalyserNode`.
2. Compute RMS for noise gate/silence rejection.
3. Run YIN-style tau search in a practical instrument range (35-1200 Hz).
4. Estimate pitch with parabolic refinement.
5. Apply a stabilizer (median + EMA) to reduce jitter.
6. Convert frequency to note/cents against selected tuning target.

## Production Notes

- No backend required for MVP.
- Uses native Web Audio API (minimal dependency footprint).
- Audio processing logic is isolated in `lib/audio` and `lib/pitch` for reuse/testing.
