class RetroSoundSynth {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  private bgmInterval: any = null;
  private bgmNotes: { freq: number; duration: number }[] = [];
  private bgmIndex: number = 0;
  private currentBgmType: string = 'none';

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopBGM();
    }
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  playHit() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playFaint() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(20, this.ctx.currentTime + 0.45);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.45);
  }

  playLevelUp() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 arpeggio
    
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.0, now);
      gain.gain.setValueAtTime(0.08, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.15);
    });
  }

  playCatch() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const shakes = [0, 0.2, 0.4];
    shakes.forEach(time => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now + time);
      osc.frequency.linearRampToValueAtTime(330, now + time + 0.08);

      gain.gain.setValueAtTime(0.06, now + time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + time);
      osc.stop(now + time + 0.08);
    });

    const successTime = now + 0.65;
    const chimeNotes = [523.25, 659.25, 783.99, 1046.50];
    chimeNotes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, successTime + idx * 0.05);

      gain.gain.setValueAtTime(0.06, successTime + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, successTime + idx * 0.05 + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(successTime + idx * 0.05);
      osc.stop(successTime + idx * 0.05 + 0.15);
    });
  }

  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.03);

    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.03);
  }

  playBGM(type: 'walking' | 'wild' | 'gym' | 'none') {
    if (this.muted || type === 'none') {
      this.stopBGM();
      return;
    }
    if (this.currentBgmType === type) return;
    this.stopBGM();
    this.currentBgmType = type;
    this.init();
    if (!this.ctx) return;

    let tempo = 120;
    let pattern: number[] = [];
    
    if (type === 'walking') {
      tempo = 105;
      pattern = [
        261.63, 329.63, 392.00, 329.63,
        349.23, 440.00, 523.25, 440.00,
        392.00, 493.88, 587.33, 493.88,
        523.25, 392.00, 329.63, 261.63
      ];
    } else if (type === 'wild') {
      tempo = 145;
      pattern = [
        220.00, 261.63, 329.63, 440.00,
        293.66, 349.23, 440.00, 587.33,
        329.63, 392.00, 493.88, 659.25,
        220.00, 329.63, 440.00, 220.00
      ];
    } else if (type === 'gym') {
      tempo = 155;
      pattern = [
        196.00, 233.08, 293.66, 392.00,
        207.65, 246.94, 311.13, 415.30,
        220.00, 261.63, 329.63, 440.00,
        233.08, 277.18, 349.23, 466.16
      ];
    }

    const noteDuration = 60 / tempo / 2;
    this.bgmNotes = pattern.map(freq => ({ freq, duration: noteDuration }));
    this.bgmIndex = 0;

    const playNextNote = () => {
      if (this.muted || !this.ctx || this.currentBgmType === 'none') return;
      const note = this.bgmNotes[this.bgmIndex];
      const now = this.ctx.currentTime;

      // Bass note
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type === 'gym' ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(note.freq / 2, now);
      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.duration * 0.9);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + note.duration);

      // Melody note (every alternate tick)
      if (this.bgmIndex % 2 === 0) {
        const oscMel = this.ctx.createOscillator();
        const gainMel = this.ctx.createGain();
        oscMel.type = 'square';
        oscMel.frequency.setValueAtTime(note.freq, now);
        gainMel.gain.setValueAtTime(0.01, now);
        gainMel.gain.exponentialRampToValueAtTime(0.001, now + note.duration * 0.85);
        oscMel.connect(gainMel);
        gainMel.connect(this.ctx.destination);
        oscMel.start(now);
        oscMel.stop(now + note.duration);
      }

      this.bgmIndex = (this.bgmIndex + 1) % this.bgmNotes.length;
      this.bgmInterval = setTimeout(playNextNote, note.duration * 1000);
    };

    playNextNote();
  }

  stopBGM() {
    if (this.bgmInterval) {
      clearTimeout(this.bgmInterval);
      this.bgmInterval = null;
    }
    this.currentBgmType = 'none';
  }
}

export const audio = new RetroSoundSynth();
export default audio;
