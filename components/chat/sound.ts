// Utility for playing modern notification sound when new message arrives from edlapp
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      audioContext = new AudioCtx();
    }
  }
  if (audioContext && audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }
  return audioContext;
}

export function playNotificationSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Create 2 sine wave oscillators for a bright, pleasant "ding-dong" chime
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "sine";

    // Frequencies: E5 (659.25Hz) -> B5 (987.77Hz)
    osc1.frequency.setValueAtTime(659.25, now);
    osc2.frequency.setValueAtTime(987.77, now + 0.08);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.15);

    osc2.start(now + 0.08);
    osc2.stop(now + 0.45);
  } catch (err) {
    console.error("Failed to play notification chime sound:", err);
  }
}
