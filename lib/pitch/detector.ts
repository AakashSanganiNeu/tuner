export type PitchDetectionOptions = {
  minFrequency?: number;
  maxFrequency?: number;
  rmsThreshold?: number;
  yinThreshold?: number;
};

export type PitchDetectionResult = {
  frequency: number | null;
  clarity: number;
  rms: number;
  isNoisy: boolean;
};

function parabolicInterpolate(left: number, center: number, right: number): number {
  const denominator = 2 * (2 * center - right - left);

  if (denominator === 0) {
    return 0;
  }

  return (right - left) / denominator;
}

export function detectPitchYin(
  buffer: Float32Array,
  sampleRate: number,
  options: PitchDetectionOptions = {}
): PitchDetectionResult {
  const minFrequency = options.minFrequency ?? 35;
  const maxFrequency = options.maxFrequency ?? 1200;
  const rmsThreshold = options.rmsThreshold ?? 0.008;
  const yinThreshold = options.yinThreshold ?? 0.1;

  const length = buffer.length;
  const halfLength = Math.floor(length / 2);

  if (halfLength < 2) {
    return { frequency: null, clarity: 0, rms: 0, isNoisy: true };
  }

  let rmsSum = 0;
  let mean = 0;

  for (let i = 0; i < length; i += 1) {
    const sample = buffer[i];
    rmsSum += sample * sample;
    mean += sample;
  }

  const rms = Math.sqrt(rmsSum / length);

  if (rms < rmsThreshold) {
    return { frequency: null, clarity: 0, rms, isNoisy: false };
  }

  mean /= length;

  const normalized = new Float32Array(length);
  for (let i = 0; i < length; i += 1) {
    normalized[i] = buffer[i] - mean;
  }

  const minTau = Math.max(2, Math.floor(sampleRate / maxFrequency));
  const maxTau = Math.min(Math.floor(sampleRate / minFrequency), halfLength - 1);

  if (maxTau <= minTau) {
    return { frequency: null, clarity: 0, rms, isNoisy: true };
  }

  const yinBuffer = new Float32Array(maxTau + 1);

  for (let tau = minTau; tau <= maxTau; tau += 1) {
    let sum = 0;
    for (let i = 0; i < halfLength; i += 1) {
      const delta = normalized[i] - normalized[i + tau];
      sum += delta * delta;
    }
    yinBuffer[tau] = sum;
  }

  let runningSum = 0;
  let bestTau = -1;
  let bestValue = Number.POSITIVE_INFINITY;

  for (let tau = minTau; tau <= maxTau; tau += 1) {
    runningSum += yinBuffer[tau];
    const value = runningSum === 0 ? 1 : (yinBuffer[tau] * tau) / runningSum;
    yinBuffer[tau] = value;

    if (value < bestValue) {
      bestValue = value;
      bestTau = tau;
    }
  }

  let tauEstimate = -1;

  for (let tau = minTau; tau <= maxTau; tau += 1) {
    if (yinBuffer[tau] < yinThreshold) {
      while (tau + 1 <= maxTau && yinBuffer[tau + 1] < yinBuffer[tau]) {
        tau += 1;
      }
      tauEstimate = tau;
      break;
    }
  }

  if (tauEstimate === -1) {
    tauEstimate = bestTau;
  }

  if (tauEstimate <= 0) {
    return { frequency: null, clarity: 0, rms, isNoisy: true };
  }

  const left = yinBuffer[Math.max(minTau, tauEstimate - 1)] ?? yinBuffer[tauEstimate];
  const center = yinBuffer[tauEstimate];
  const right = yinBuffer[Math.min(maxTau, tauEstimate + 1)] ?? yinBuffer[tauEstimate];

  const shift = parabolicInterpolate(left, center, right);
  const refinedTau = tauEstimate + shift;

  if (!Number.isFinite(refinedTau) || refinedTau <= 0) {
    return { frequency: null, clarity: 0, rms, isNoisy: true };
  }

  const frequency = sampleRate / refinedTau;
  const clarity = Math.max(0, 1 - center);
  const isNoisy = clarity < 0.55;

  if (!Number.isFinite(frequency) || frequency < minFrequency || frequency > maxFrequency * 1.25) {
    return { frequency: null, clarity, rms, isNoisy: true };
  }

  return {
    frequency,
    clarity,
    rms,
    isNoisy
  };
}
