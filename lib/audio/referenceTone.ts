export class ReferenceTonePlayer {
  private context: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;

  async start(frequency: number, context?: AudioContext): Promise<void> {
    if (typeof window === "undefined") {
      return;
    }

    this.context = context ?? this.context ?? new AudioContext();

    if (this.context.state === "suspended") {
      await this.context.resume();
    }

    if (this.oscillator && this.gainNode) {
      this.oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
      return;
    }

    this.oscillator = this.context.createOscillator();
    this.oscillator.type = "sine";
    this.oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);

    this.gainNode = this.context.createGain();
    this.gainNode.gain.setValueAtTime(0, this.context.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(0.08, this.context.currentTime + 0.08);

    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.context.destination);
    this.oscillator.start();
  }

  setFrequency(frequency: number): void {
    if (!this.oscillator || !this.context) {
      return;
    }

    this.oscillator.frequency.setTargetAtTime(frequency, this.context.currentTime, 0.02);
  }

  stop(): void {
    if (!this.context || !this.oscillator || !this.gainNode) {
      return;
    }

    const stopAt = this.context.currentTime + 0.08;
    this.gainNode.gain.cancelScheduledValues(this.context.currentTime);
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.context.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(0, stopAt);

    this.oscillator.stop(stopAt);

    const oscillator = this.oscillator;
    const gainNode = this.gainNode;

    oscillator.onended = () => {
      oscillator.disconnect();
      gainNode.disconnect();
    };

    this.oscillator = null;
    this.gainNode = null;
  }
}
