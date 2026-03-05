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

  constructor(
    private readonly windowSize = 7,
    private readonly alpha = 0.35,
    private readonly maxJumpCents = 180
  ) {}

  update(frequency: number): number {
    if (this.ema !== null) {
      const jumpCents = Math.abs(centsDifference(frequency, this.ema));
      if (jumpCents > this.maxJumpCents) {
        return this.ema;
      }
    }

    this.history.push(frequency);

    if (this.history.length > this.windowSize) {
      this.history.shift();
    }

    const localMedian = median(this.history);
    const blended = localMedian * 0.65 + frequency * 0.35;

    if (this.ema === null) {
      this.ema = blended;
    } else {
      this.ema += this.alpha * (blended - this.ema);
    }

    return this.ema;
  }

  reset(): void {
    this.history = [];
    this.ema = null;
  }

  current(): number | null {
    return this.ema;
  }
}
