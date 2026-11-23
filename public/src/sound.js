const Sound = {
    enabled: false,
    ctx: null,
    
    init: function() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    
    toggle: function() {
        this.init();
        this.enabled = !this.enabled;
        const muteBtn = document.getElementById('muteButton');
        if (muteBtn) {
            muteBtn.innerHTML = this.enabled 
                ? '<i class="fa fa-volume-up"></i> Sound On' 
                : '<i class="fa fa-volume-off"></i> Sound Off';
            if (this.enabled) {
                muteBtn.classList.add('sound-active');
            } else {
                muteBtn.classList.remove('sound-active');
            }
        }
        
        // Save to player settings if available
        if (typeof player !== 'undefined' && player.settings) {
            player.settings.soundEnabled = this.enabled;
        }
        
        // Play a short feedback beep if unmuted
        if (this.enabled) {
            this.playLevelUp();
        }
    },
    
    playHit: function() {
        if (!this.enabled) return;
        this.init();
        
        try {
            const ctx = this.ctx;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(150, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.1);
            
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.1);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } catch (e) {
            console.error('Audio playHit error:', e);
        }
    },
    
    playCapture: function(success) {
        if (!this.enabled) return;
        this.init();
        
        try {
            const ctx = this.ctx;
            const now = ctx.currentTime;
            
            if (success) {
                // Retro success fanfare
                const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
                notes.forEach((freq, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'square';
                    osc.frequency.value = freq;
                    
                    gain.gain.setValueAtTime(0.06, now + idx * 0.08);
                    gain.gain.linearRampToValueAtTime(0.001, now + idx * 0.08 + 0.12);
                    
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    
                    osc.start(now + idx * 0.08);
                    osc.stop(now + idx * 0.08 + 0.12);
                });
            } else {
                // Ball shake fail sound
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(80, ctx.currentTime);
                osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.12);
                
                gain.gain.setValueAtTime(0.08, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.12);
                
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.start();
                osc.stop(ctx.currentTime + 0.12);
            }
        } catch (e) {
            console.error('Audio playCapture error:', e);
        }
    },
    
    playFaint: function() {
        if (!this.enabled) return;
        this.init();
        
        try {
            const ctx = this.ctx;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(180, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.3);
            
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } catch (e) {
            console.error('Audio playFaint error:', e);
        }
    },
    
    playLevelUp: function() {
        if (!this.enabled) return;
        this.init();
        
        try {
            const ctx = this.ctx;
            const now = ctx.currentTime;
            const notes = [392.00, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.value = freq;
                
                gain.gain.setValueAtTime(0.06, now + idx * 0.06);
                gain.gain.linearRampToValueAtTime(0.001, now + idx * 0.06 + 0.15);
                
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.start(now + idx * 0.06);
                osc.stop(now + idx * 0.06 + 0.15);
            });
        } catch (e) {
            console.error('Audio playLevelUp error:', e);
        }
    },
    
    playCry: function(pokeName) {
        if (!this.enabled) return;
        this.init();
        
        try {
            if (typeof POKEDEX === 'undefined') return;
            const index = POKEDEX.findIndex(p => p.pokemon[0].Pokemon.toLowerCase() === pokeName.toLowerCase());
            if (index === -1) return;
            const id = index + 1;
            const cryUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/cries/${id}.ogg`;
            
            const audio = new Audio(cryUrl);
            audio.volume = 0.22;
            audio.play().catch(err => {
                console.warn('Audio playCry failed to play:', err);
            });
        } catch (e) {
            console.error('Audio playCry error:', e);
        }
    },
    
    playHealTune: function() {
        if (!this.enabled) return;
        this.init();
        
        try {
            const ctx = this.ctx;
            const now = ctx.currentTime;
            
            const notes = [
                { freq: 1046.50, duration: 0.15 }, // C6
                { freq: 1174.66, duration: 0.15 }, // D6
                { freq: 1318.51, duration: 0.15 }, // E6
                { freq: 1567.98, duration: 0.25 }, // G6
                { freq: 1318.51, duration: 0.15 }, // E6
                { freq: 1567.98, duration: 0.35 }  // G6
            ];
            
            let time = now;
            notes.forEach(note => {
                const osc = ctx.createOscillator();
                const gainNode = ctx.createGain();
                
                osc.type = 'square';
                osc.frequency.setValueAtTime(note.freq, time);
                
                gainNode.gain.setValueAtTime(0.04, time);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, time + note.duration);
                
                osc.connect(gainNode);
                gainNode.connect(ctx.destination);
                
                osc.start(time);
                osc.stop(time + note.duration);
                
                time += note.duration + 0.05;
            });
        } catch (e) {
            console.warn("Failed to play heal tune:", e);
        }
    }
};
