export type MicPermissionState = "idle" | "granted" | "denied" | "error";

export type AudioFrame = {
  sampleRate: number;
  buffer: Float32Array;
  inputLevel: number;
};

export class MicrophoneInput {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private frameBuffer: Float32Array<ArrayBuffer> | null = null;

  async start(): Promise<void> {
    if (typeof window === "undefined") {
      throw new Error("Microphone is only available in the browser.");
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("getUserMedia is not supported in this browser.");
    }

    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }

    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }

    if (!this.mediaStream) {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });
    }

    if (!this.sourceNode) {
      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
    }

    if (!this.analyserNode) {
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 4096;
      this.analyserNode.smoothingTimeConstant = 0.03;
      this.frameBuffer = new Float32Array(this.analyserNode.fftSize) as Float32Array<ArrayBuffer>;
      this.sourceNode.connect(this.analyserNode);
    }
  }

  readFrame(): AudioFrame | null {
    if (!this.audioContext || !this.analyserNode || !this.frameBuffer) {
      return null;
    }

    this.analyserNode.getFloatTimeDomainData(this.frameBuffer);

    let sum = 0;
    for (let i = 0; i < this.frameBuffer.length; i += 1) {
      const sample = this.frameBuffer[i];
      sum += sample * sample;
    }

    const rms = Math.sqrt(sum / this.frameBuffer.length);

    return {
      sampleRate: this.audioContext.sampleRate,
      buffer: this.frameBuffer,
      inputLevel: rms
    };
  }

  getContext(): AudioContext | null {
    return this.audioContext;
  }

  async stop(): Promise<void> {
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    if (this.analyserNode) {
      this.analyserNode.disconnect();
      this.analyserNode = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    this.frameBuffer = null;
  }
}
