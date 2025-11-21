
let audioCtx: AudioContext | null = null;

const getContext = () => {
  if (!audioCtx) {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (Ctx) {
      audioCtx = new Ctx();
    }
  }
  return audioCtx;
};

export const playSound = (type: 'boot' | 'login' | 'click' | 'open' | 'close' | 'minimize' | 'restore' | 'error') => {
  const ctx = getContext();
  if (!ctx) return;
  
  // Resume if suspended (browser autoplay policy)
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);

  switch (type) {
    case 'boot':
      // Ethereal startup swell (G Major 6/9)
      const freqs = [196.00, 261.63, 329.63, 392.00, 523.25]; 
      freqs.forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = 'sine';
        o.frequency.value = f;
        
        // Slow attack
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.05, t + 0.5 + (i * 0.1));
        // Long release
        g.gain.exponentialRampToValueAtTime(0.0001, t + 4);
        
        o.start(t);
        o.stop(t + 5);
      });
      return; 

    case 'login':
        // Pleasant success chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.exponentialRampToValueAtTime(880, t + 0.15);
        
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.05, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1);
        
        osc.start(t);
        osc.stop(t + 1);
        break;

    case 'click':
        // Subtle high-tech tick
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, t);
        gain.gain.setValueAtTime(0.01, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        osc.start(t);
        osc.stop(t + 0.05);
        break;

    case 'open':
        // Quick holographic "swish" up
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.linearRampToValueAtTime(500, t + 0.1);
        
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.05, t + 0.05);
        gain.gain.linearRampToValueAtTime(0, t + 0.2);
        
        osc.start(t);
        osc.stop(t + 0.2);
        break;

    case 'close':
        // Quick holographic "swish" down
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, t);
        osc.frequency.linearRampToValueAtTime(200, t + 0.1);
        
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.05, t + 0.05);
        gain.gain.linearRampToValueAtTime(0, t + 0.2);
        
        osc.start(t);
        osc.stop(t + 0.2);
        break;

    case 'minimize':
        // "Bloop" down
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(200, t + 0.15);
        
        gain.gain.setValueAtTime(0.03, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.15);
        
        osc.start(t);
        osc.stop(t + 0.15);
        break;
    
    case 'restore': 
        // "Bloop" up
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(400, t + 0.15);
        
        gain.gain.setValueAtTime(0.03, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.15);
        
        osc.start(t);
        osc.stop(t + 0.15);
        break;

    case 'error':
        // Soft warning buzz
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.linearRampToValueAtTime(100, t + 0.2);
        
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.2);
        
        osc.start(t);
        osc.stop(t + 0.2);
        break;
  }
};
