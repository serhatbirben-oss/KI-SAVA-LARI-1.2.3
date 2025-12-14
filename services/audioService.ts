
// Web Audio API wrapper to generate SFX without external assets
class AudioController {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private isMuted: boolean = false;

  constructor() {
    try {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      this.ctx = new AudioContextClass();
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.connect(this.ctx.destination);
      this.sfxGain.gain.value = 0.3;
    } catch (e) {
      console.warn("Audio Context not supported");
    }
  }

  public init() {
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playSFX(type: 'CLICK' | 'HOVER' | 'GOLD' | 'SWORD' | 'WAR_HORN' | 'ERROR' | 'SUCCESS' | 'HIT' | 'MISS' | 'CRIT' | 'BLOCK') {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.sfxGain);

    const now = this.ctx.currentTime;

    switch (type) {
      case 'CLICK':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      
      case 'HOVER':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;

      case 'GOLD':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(1800, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;

      case 'SWORD': // Draw sword
        this.playNoise(0.3, 1000);
        break;
      
      case 'HIT': // Flesh impact
        this.playNoise(0.1, 200);
        break;

      case 'MISS': // Woosh
        this.playTone(150, 0.2, 0, 'triangle');
        break;
      
      case 'BLOCK': // Metal clang
        this.playTone(800, 0.1, 0, 'square');
        setTimeout(() => this.playTone(600, 0.2, 0, 'square'), 50);
        break;

      case 'CRIT': // Heavy impact + High pitch
        this.playNoise(0.3, 100);
        setTimeout(() => this.playTone(880, 0.5, 0, 'sawtooth'), 100);
        break;

      case 'WAR_HORN':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(200, now + 1.5);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.6, now + 0.2);
        gain.gain.linearRampToValueAtTime(0, now + 2.0);
        osc.start(now);
        osc.stop(now + 2.0);
        break;

      case 'ERROR':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.2);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
        
      case 'SUCCESS':
        this.playTone(440, 0.1, 0);
        setTimeout(() => this.playTone(554, 0.1, 0), 100);
        break;
    }
  }

  private playTone(freq: number, dur: number, delay: number, type: OscillatorType = 'sine') {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime + delay;
    osc.type = type;
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + dur);
    osc.start(now);
    osc.stop(now + dur);
  }

  private playNoise(duration: number, freq: number) {
    if (!this.ctx || !this.sfxGain) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    
    filter.type = 'lowpass';
    filter.frequency.value = freq;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    noise.start();
  }
}

export const audioService = new AudioController();
