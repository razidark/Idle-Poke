// Polyphonic Web Audio API Synthesized Sound Effects and 8-Bit Chiptune Engine for IdlePoke

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmGain: GainNode | null = null;
  private isBgmPlaying: boolean = false;
  private bgmTimer: number | null = null;
  private currentStep: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.initCtx();
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('keydown', unlock);
      };
      window.addEventListener('pointerdown', unlock, { once: true });
      window.addEventListener('keydown', unlock, { once: true });
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.bgmGain) {
      this.bgmGain.gain.value = 0;
    } else if (!muted && this.bgmGain) {
      this.bgmGain.gain.value = 0.05;
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public playClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  public playHit(type: 'normal' | 'super' | 'weak' = 'normal') {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (type === 'super') {
      // Super Effective Blast
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.15);
    } else if (type === 'weak') {
      // Weak hit
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.08);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.08);
    } else {
      // Normal hit impact
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.09);
    }

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playCatch(success: boolean) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    if (success) {
      // Pokémon Victory Catch Fanfare (C5 -> E5 -> G5 -> C6)
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);
        gain.gain.setValueAtTime(0.1, now + idx * 0.09);
        gain.gain.linearRampToValueAtTime(0.001, now + idx * 0.09 + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.14);
      });
    } else {
      // Escape tone
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(150, now + 0.2);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  }

  public playLevelUp() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880, 830.61, 880];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      gain.gain.setValueAtTime(0.1, now + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.001, now + idx * 0.07 + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.12);
    });
  }

  public startBgm() {
    if (this.isBgmPlaying || this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    this.isBgmPlaying = true;
    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.value = 0.04;
    this.bgmGain.connect(this.ctx.destination);

    // Authentic Gen 1/2 Wild Pokémon Battle Polyphonic Theme (140 BPM, 16 steps)
    const melodyLine = [440, 523.25, 659.25, 523.25, 440, 523.25, 659.25, 783.99, 440, 523.25, 659.25, 523.25, 880, 783.99, 659.25, 523.25];
    const bassLine   = [220, 220, 261.63, 220, 220, 220, 293.66, 220, 220, 220, 261.63, 220, 329.63, 293.66, 261.63, 220];

    this.currentStep = 0;

    const playStep = () => {
      if (!this.isBgmPlaying || !this.ctx || !this.bgmGain) return;
      const now = this.ctx.currentTime;
      const stepIdx = this.currentStep % melodyLine.length;

      // 1. Lead Melody Channel (Square Wave)
      const leadOsc = this.ctx.createOscillator();
      const leadGain = this.ctx.createGain();
      leadOsc.type = 'square';
      leadOsc.frequency.setValueAtTime(melodyLine[stepIdx], now);
      leadGain.gain.setValueAtTime(0.025, now);
      leadGain.gain.linearRampToValueAtTime(0.001, now + 0.14);
      leadOsc.connect(leadGain);
      leadGain.connect(this.bgmGain);
      leadOsc.start(now);
      leadOsc.stop(now + 0.15);

      // 2. Bass Harmony Channel (Triangle Wave)
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(bassLine[stepIdx], now);
      bassGain.gain.setValueAtTime(0.035, now);
      bassGain.gain.linearRampToValueAtTime(0.001, now + 0.16);
      bassOsc.connect(bassGain);
      bassGain.connect(this.bgmGain);
      bassOsc.start(now);
      bassOsc.stop(now + 0.17);

      this.currentStep++;
      this.bgmTimer = window.setTimeout(playStep, 175);
    };

    playStep();
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

export const audioEngine = new AudioEngine();

