/**
 * Zero-dependency Web Audio API sound synthesizer for instant Goal Alerts & Whistles.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioCtx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a stadium referee whistle and cheering chime for a goal.
 */
export function playGoalSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // 1. Referee Whistle Sound (dual oscillating tones)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainWhistle = ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(2600, now);
    osc1.frequency.exponentialRampToValueAtTime(3200, now + 0.08);
    osc1.frequency.exponentialRampToValueAtTime(2800, now + 0.25);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2850, now);
    osc2.frequency.exponentialRampToValueAtTime(3450, now + 0.08);
    osc2.frequency.exponentialRampToValueAtTime(3000, now + 0.25);

    gainWhistle.gain.setValueAtTime(0, now);
    gainWhistle.gain.linearRampToValueAtTime(0.3, now + 0.02);
    gainWhistle.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gainWhistle);
    osc2.connect(gainWhistle);
    gainWhistle.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);

    // 2. Celebratory Triad Fanfare (C5 -> E5 -> G5 -> C6)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const noteOsc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      const startTime = now + 0.15 + (idx * 0.12);

      noteOsc.type = 'sine';
      noteOsc.frequency.setValueAtTime(freq, startTime);

      noteGain.gain.setValueAtTime(0, startTime);
      noteGain.gain.linearRampToValueAtTime(0.25, startTime + 0.03);
      noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      noteOsc.connect(noteGain);
      noteGain.connect(ctx.destination);

      noteOsc.start(startTime);
      noteOsc.stop(startTime + 0.4);
    });
  } catch (err) {
    console.warn('Audio playback not permitted or unavailable:', err);
  }
}
