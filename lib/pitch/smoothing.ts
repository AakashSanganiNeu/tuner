import { centsDifference } from "@/lib/pitch/notes";

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

export class PitchStabilizer {
  private history: number[] = [];
  private ema: number | null = null;
  private confidenceHistory: number[] = [];

  constructor(
    private readonly windowSize = 10,
    private readonly alpha = 0.25,
    private readonly maxJumpCents = 120
  ) {}

  update(frequency: number, confidence: number = 0.8): number {
    // Reject frequencies with low confidence
    if (confidence < 0.65) {
      return this.ema ?? frequency;
    }

    if (this.ema !== null) {
      const jumpCents = Math.abs(centsDifference(frequency, this.ema));
      if (jumpCents > this.maxJumpCents) {
        return this.ema;
      }
    }

    this.history.push(frequency);
    this.confidenceHistory.push(confidence);

    if (this.history.length > this.windowSize) {
      this.history.shift();
      this.confidenceHistory.shift();
    }

    // Weight median by confidence
    const weightedValues = this.history.map((freq, i) => ({
      freq,
      weight: this.confidenceHistory[i] ?? 0.5
    }));
    
    weightedValues.sort((a, b) => a.freq - b.freq);
    
    let cumulativeWeight = 0;
    const totalWeight = weightedValues.reduce((sum, v) => sum + v.weight, 0);
    const targetWeight = totalWeight / 2;
    
    let localMedian = this.history[0];
    for (const v of weightedValues) {
      cumulativeWeight += v.weight;
      if (cumulativeWeight >= targetWeight) {
        localMedian = v.freq;
        break;
      }
    }

    const blended = localMedian * 0.6 + frequency * 0.4;

    if (this.ema === null) {
      this.ema = blended;
    } else {
      this.ema += this.alpha * (blended - this.ema);
    }

    return this.ema;
  }

  reset(): void {
    this.history = [];
    this.confidenceHistory = [];
    this.ema = null;
  }

  current(): number | null {
    return this.ema;
  }
}
