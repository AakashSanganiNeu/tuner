"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalibrationControl } from "@/components/CalibrationControl";
import { DetectedNoteCard } from "@/components/DetectedNoteCard";
import { InstrumentSelector } from "@/components/InstrumentSelector";
import { PermissionGate } from "@/components/PermissionGate";
import { PitchMeter } from "@/components/PitchMeter";
import { ReferenceTonePlayer } from "@/components/ReferenceTonePlayer";
import { StringSelector } from "@/components/StringSelector";
import { TuningInstructions } from "@/components/TuningInstructions";
import { MicrophoneInput, type MicPermissionState } from "@/lib/audio/microphone";
import { ReferenceTonePlayer as ToneEngine } from "@/lib/audio/referenceTone";
import { detectPitchYin } from "@/lib/pitch/detector";
import { centsDifference, midiToFrequency, midiToNoteParts, nearestMidiForFrequency } from "@/lib/pitch/notes";
import { PitchStabilizer } from "@/lib/pitch/smoothing";
import { TUNING_PRESETS, getPresetById, getReferenceNoteOptions } from "@/lib/tunings/presets";
import { findNearestStringTarget } from "@/lib/tunings/targeting";
import type { SignalState, TuningDirection } from "@/lib/types";

const PROCESS_INTERVAL_MS = 30;

export function TunerScreen() {
  const micRef = useRef<MicrophoneInput>(new MicrophoneInput());
  const stabilizerRef = useRef<PitchStabilizer>(new PitchStabilizer());
  const toneRef = useRef<ToneEngine>(new ToneEngine());
  const rafRef = useRef<number | null>(null);
  const lastProcessRef = useRef(0);
  const noSignalFramesRef = useRef(0);
  const noisyFramesRef = useRef(0);

  const [permission, setPermission] = useState<MicPermissionState>("idle");
  const [isStarting, setIsStarting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [signalState, setSignalState] = useState<SignalState>("idle");

  const [selectedPresetId, setSelectedPresetId] = useState<string>("guitar-standard");
  const [selectedStringId, setSelectedStringId] = useState<string | null>(null);
  const [autoDetectString, setAutoDetectString] = useState(true);
  const [a4Calibration, setA4Calibration] = useState(440);

  const [detectedFrequency, setDetectedFrequency] = useState<number | null>(null);
  const [clarity, setClarity] = useState(0);
  const [inputLevel, setInputLevel] = useState(0);
  const [lastStableLabel, setLastStableLabel] = useState<string | null>(null);
  const [isTonePlaying, setIsTonePlaying] = useState(false);
  const [selectedReferenceMidi, setSelectedReferenceMidi] = useState<number | null>(null);

  const selectedPreset = useMemo(() => getPresetById(selectedPresetId), [selectedPresetId]);
  const referenceOptions = useMemo(() => getReferenceNoteOptions(), []);

  useEffect(() => {
    if (selectedPreset.strings.length === 0) {
      setSelectedStringId(null);
      setAutoDetectString(true);
      return;
    }

    setSelectedStringId((previous) => previous ?? selectedPreset.strings[0]?.id ?? null);
  }, [selectedPreset]);

  const analysis = useMemo(() => {
    if (!detectedFrequency) {
      return {
        detectedLabel: "--",
        targetLabel: "--",
        detectedMidi: null as number | null,
        targetFrequency: null as number | null,
        cents: null as number | null,
        direction: "unknown" as TuningDirection,
        activeStringId: selectedStringId,
        targetStringId: selectedStringId
      };
    }

    const preferFlats = selectedPreset.strings.some((string) => string.note.includes("b"));
    const detectedMidi = nearestMidiForFrequency(detectedFrequency, a4Calibration);
    const detectedNote = midiToNoteParts(detectedMidi, preferFlats);

    if (selectedPreset.isChromatic) {
      const targetFrequency = midiToFrequency(detectedMidi, a4Calibration);
      const cents = centsDifference(detectedFrequency, targetFrequency);
      const direction: TuningDirection = Math.abs(cents) <= 5 ? "in-tune" : cents < 0 ? "flat" : "sharp";
      return {
        detectedLabel: detectedNote.label,
        targetLabel: detectedNote.label,
        detectedMidi,
        targetFrequency,
        cents,
        direction,
        activeStringId: null,
        targetStringId: null
      };
    }

    const selectedString = selectedPreset.strings.find((string) => string.id === selectedStringId) ?? selectedPreset.strings[0] ?? null;
    const matchedString = autoDetectString
      ? findNearestStringTarget(detectedFrequency, selectedPreset.strings, a4Calibration)?.string ?? selectedString
      : selectedString;

    const targetMidi = matchedString?.midi ?? detectedMidi;
    const targetFrequency = midiToFrequency(targetMidi, a4Calibration);
    const cents = centsDifference(detectedFrequency, targetFrequency);

    const direction: TuningDirection = Math.abs(cents) <= 5 ? "in-tune" : cents < 0 ? "flat" : "sharp";

    return {
      detectedLabel: detectedNote.label,
      targetLabel: matchedString?.label ?? midiToNoteParts(targetMidi, preferFlats).label,
      detectedMidi,
      targetFrequency,
      cents,
      direction,
      activeStringId: matchedString?.id ?? null,
      targetStringId: matchedString?.id ?? selectedString?.id ?? null
    };
  }, [a4Calibration, autoDetectString, detectedFrequency, selectedPreset, selectedStringId]);

  useEffect(() => {
    if (!detectedFrequency || clarity < 0.82) {
      return;
    }

    setLastStableLabel(analysis.detectedLabel);
  }, [analysis.detectedLabel, clarity, detectedFrequency]);

  const selectedReference = useMemo(() => {
    if (selectedReferenceMidi === null) {
      return {
        label: analysis.targetLabel === "--" ? "Follow target note" : `${analysis.targetLabel} (Target)`,
        frequency: analysis.targetFrequency
      };
    }

    const option = referenceOptions.find((entry) => entry.midi === selectedReferenceMidi);
    return {
      label: option?.label ?? midiToNoteParts(selectedReferenceMidi).label,
      frequency: midiToFrequency(selectedReferenceMidi, a4Calibration)
    };
  }, [a4Calibration, analysis.targetFrequency, analysis.targetLabel, referenceOptions, selectedReferenceMidi]);

  const stopProcessing = useCallback(async () => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    toneRef.current.stop();
    setIsTonePlaying(false);

    await micRef.current.stop();

    stabilizerRef.current.reset();
    noSignalFramesRef.current = 0;
    noisyFramesRef.current = 0;
    setDetectedFrequency(null);
    setIsListening(false);
    setSignalState((prev) => (prev === "permission-denied" ? prev : "idle"));
  }, []);

  const loop = useCallback((timestamp: number) => {
    rafRef.current = window.requestAnimationFrame(loop);

    if (timestamp - lastProcessRef.current < PROCESS_INTERVAL_MS) {
      return;
    }

    lastProcessRef.current = timestamp;

    const frame = micRef.current.readFrame();
    if (!frame) {
      return;
    }

    setInputLevel(frame.inputLevel);

    const result = detectPitchYin(frame.buffer, frame.sampleRate, {
      minFrequency: 35,
      maxFrequency: 1200,
      rmsThreshold: 0.008,
      yinThreshold: 0.11
    });

    setClarity(result.clarity);

    if (!result.frequency || result.isNoisy) {
      stabilizerRef.current.reset();
      setDetectedFrequency(null);

      if (result.rms < 0.008) {
        noSignalFramesRef.current += 1;
        noisyFramesRef.current = 0;
        if (noSignalFramesRef.current >= 4) {
          setSignalState("no-signal");
        }
      } else {
        noisyFramesRef.current += 1;
        noSignalFramesRef.current = 0;
        if (noisyFramesRef.current >= 4) {
          setSignalState("noisy");
        }
      }

      return;
    }

    noSignalFramesRef.current = 0;
    noisyFramesRef.current = 0;

    const stabilized = stabilizerRef.current.update(result.frequency);
    setDetectedFrequency(stabilized);
    setSignalState("listening");
  }, []);

  const handleStart = useCallback(async () => {
    setIsStarting(true);

    try {
      await micRef.current.start();
      setPermission("granted");
      setIsListening(true);
      setSignalState("listening");
      if (rafRef.current === null) {
        rafRef.current = window.requestAnimationFrame(loop);
      }
    } catch (error) {
      const errorName = error instanceof Error ? error.name : "";
      const denied = errorName === "NotAllowedError" || errorName === "SecurityError";
      setPermission(denied ? "denied" : "error");
      setSignalState(denied ? "permission-denied" : "idle");
    } finally {
      setIsStarting(false);
    }
  }, [loop]);

  const handleToneToggle = useCallback(async () => {
    if (!selectedReference.frequency) {
      return;
    }

    if (isTonePlaying) {
      toneRef.current.stop();
      setIsTonePlaying(false);
      return;
    }

    await toneRef.current.start(selectedReference.frequency, micRef.current.getContext() ?? undefined);
    setIsTonePlaying(true);
  }, [isTonePlaying, selectedReference.frequency]);

  useEffect(() => {
    if (!isTonePlaying || !selectedReference.frequency) {
      return;
    }

    toneRef.current.setFrequency(selectedReference.frequency);
  }, [isTonePlaying, selectedReference.frequency]);

  useEffect(() => {
    return () => {
      void stopProcessing();
    };
  }, [stopProcessing]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-black tracking-tight text-white">TuneMate</h1>
        <p className="mt-2 text-sm text-slate-300">Fast, accurate real-time tuner for strings and chromatic tuning.</p>
      </header>

      <div className="mb-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
        <span className="rounded-full border border-white/10 bg-panel px-3 py-1">Pluck one string at a time</span>
        <span className="rounded-full border border-white/10 bg-panel px-3 py-1">Best in quiet rooms</span>
        <span className="rounded-full border border-white/10 bg-panel px-3 py-1">Tap Start to grant mic access</span>
      </div>

      <div className="space-y-4">
        <PermissionGate permission={permission} isStarting={isStarting} onStart={handleStart} />

        <InstrumentSelector presets={TUNING_PRESETS} selectedId={selectedPresetId} onChange={setSelectedPresetId} />

        <StringSelector
          strings={selectedPreset.strings}
          selectedStringId={selectedStringId}
          activeStringId={analysis.activeStringId}
          autoDetectEnabled={autoDetectString}
          onAutoDetectChange={setAutoDetectString}
          onStringSelect={(stringId) => {
            setSelectedStringId(stringId);
            setAutoDetectString(false);
          }}
        />

        <DetectedNoteCard
          detectedLabel={analysis.detectedLabel}
          targetLabel={analysis.targetLabel}
          detectedFrequency={detectedFrequency}
          cents={analysis.cents}
          clarity={clarity}
          inputLevel={inputLevel}
          signalState={signalState}
          direction={analysis.direction}
          lastStableLabel={lastStableLabel}
        />

        <PitchMeter cents={analysis.cents} direction={analysis.direction} isListening={isListening} />

        <div className="grid gap-4 sm:grid-cols-2">
          <ReferenceTonePlayer
            isPlaying={isTonePlaying}
            targetLabel={selectedReference.label}
            targetFrequency={selectedReference.frequency}
            referenceOptions={referenceOptions}
            selectedReferenceMidi={selectedReferenceMidi}
            onReferenceChange={setSelectedReferenceMidi}
            onToggle={handleToneToggle}
          />
          <CalibrationControl value={a4Calibration} onChange={setA4Calibration} />
        </div>

        <TuningInstructions signalState={signalState} direction={analysis.direction} />

        {!isListening && permission === "granted" && (
          <button
            type="button"
            onClick={handleStart}
            className="w-full rounded-xl border border-accent/30 bg-accentSoft px-4 py-3 text-sm font-semibold text-accent transition hover:brightness-110"
          >
            Start Listening
          </button>
        )}

        {isListening && (
          <button
            type="button"
            onClick={() => void stopProcessing()}
            className="w-full rounded-xl border border-white/10 bg-panelSoft px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-700/60"
          >
            Stop Listening
          </button>
        )}
      </div>
    </main>
  );
}
