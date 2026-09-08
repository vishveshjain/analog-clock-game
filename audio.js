/**
 * Sound synthesizer using Web Audio API and Web Speech API.
 * 100% self-contained, no external mp3/wav files required!
 */
class SoundManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.speechEnabled = true;
    this._initAudioContext = this._initAudioContext.bind(this);

    // Initialize audio context on first user interaction
    ['pointerdown', 'keydown', 'touchstart'].forEach(evt => {
      window.addEventListener(evt, this._initAudioContext, { once: true });
    });
  }

  _initAudioContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  // Play a soft wooden tick sound when dragging hands
  playTick() {
    if (this.isMuted) return;
    this._initAudioContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(700, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {}
  }

  // Play a satisfying snap sound when a hand locks onto a number
  playSnap() {
    if (this.isMuted) return;
    this._initAudioContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.07);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.07);
    } catch (e) {}
  }

  // Play happy victory fanfare (arpeggiated major chord + high ping)
  playSuccess() {
    if (this.isMuted) return;
    this._initAudioContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    const startTime = this.ctx.currentTime;

    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime + i * 0.09);

      gain.gain.setValueAtTime(0.28, startTime + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + i * 0.09 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime + i * 0.09);
      osc.stop(startTime + i * 0.09 + 0.35);
    });
  }

  // Play gentle retry chime (soft boing)
  playTryAgain() {
    if (this.isMuted) return;
    this._initAudioContext();
    if (!this.ctx) return;

    const startTime = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, startTime);
    osc.frequency.exponentialRampToValueAtTime(220, startTime + 0.25);

    gain.gain.setValueAtTime(0.2, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.25);
  }

  // Speak target time aloud for kids
  speakTime(hours, minutes) {
    if (this.isMuted || !this.speechEnabled) return;
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech

      let text = '';
      const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
      
      if (minutes === 0) {
        text = `Set the clock to ${hours} o'clock!`;
      } else if (minutes === 30) {
        text = `Set the clock to ${hours} thirty!`;
      } else if (minutes === 15) {
        text = `Set the clock to ${hours} fifteen!`;
      } else if (minutes === 45) {
        text = `Set the clock to ${hours} forty-five!`;
      } else {
        text = `Set the clock to ${hours} ${minutes}!`;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95; // Slightly slower, clear for children
      utterance.pitch = 1.15; // Friendly, warm pitch
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis unavailable', e);
    }
  }

  // Speak celebratory praise
  speakPraise() {
    if (this.isMuted || !this.speechEnabled) return;
    if (!('speechSynthesis' in window)) return;

    try {
      const phrases = [
        "Awesome job!",
        "Super! You got it right!",
        "Congratulations!",
        "Brilliant time telling!",
        "You're a clock master!"
      ];
      const pick = phrases[Math.floor(Math.random() * phrases.length)];
      const utterance = new SpeechSynthesisUtterance(pick);
      utterance.rate = 1.0;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  }
}

window.sounds = new SoundManager();
