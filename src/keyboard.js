class Keyboard 
{
    constructor()
    {
        this.keyToNote = {
            'a': { note: 'C', offset: 0},
            'w': { note: 'C#', offset: 0},
            's': { note: 'D', offset: 0},
            'e': { note: 'D#', offset: 0},
            'd': { note: 'E', offset: 0},
            'f': { note: 'F', offset: 0},
            't': { note: 'F#', offset: 0},
            'g': { note: 'G', offset: 0},
            'y': { note: 'G#', offset: 0},
            'h': { note: 'A', offset: 0},
            'u': { note: 'A#', offset: 0},
            'j': { note: 'B', offset: 0},
            'k': { note: 'C', offset: 1},
            'o': { note: 'C#', offset: 1},
            'l': { note: 'D', offset: 1}
        }

        this.key = 2
        this.Tone = {};
        this.oscs = [];
        this.simpleOsc = {};
        this.currentKey = [];
		
        this.init();
    }

    init()
    {
        document.addEventListener('keyup', e => {
            if(e.key === 'z') this.key--
            if(e.key === 'x') this.key++
        });
    }

    noteFrom(key)
    {
        if(this.keyToNote[key] === undefined) return

        return this.keyToNote[key].note + (this.key + this.keyToNote[key].offset);
    }

    keyDown(e)
    {
        if(!e.repeat && this.noteFrom(e.key)){
            if(this.currentKey.includes(e.key)) return
            this.currentKey.push(e.key);

            this.oscs.forEach((osc) => {
                if(osc.source.state === 'stopped') osc.source.start();
                
                osc.source.frequency.value = this.Tone.Frequency(this.noteFrom(e.key)).transpose(document.querySelector('.glide .semitones').value).toNote()
                osc.env.triggerAttack(this.Tone.context.currentTime);
			
				osc.source.frequency.rampTo(this.noteFrom(e.key), document.querySelector('.glide .time').value);
            });
            
            if(this.simpleOsc.source.state === 'stopped') this.simpleOsc.source.start();
            this.simpleOsc.source.frequency.value = this.Tone.Frequency(this.noteFrom(e.key)).transpose(this.simpleOsc.octave*12).toNote()
            this.simpleOsc.env.triggerAttack(this.Tone.context.currentTime);
            
            this.oscs.envFilter.triggerAttack(this.Tone.context.currentTime);

            this.oscilloscope.setNote(this.Tone.Frequency(this.noteFrom(e.key)).toFrequency())
        } 
    }

    keyUp(e)
    {
        if(this.currentKey.length > 1) {
            this.currentKey = this.currentKey.filter(item => item !== e.key)
            return
        }

		if(this.currentKey[0] === e.key){
			this.oscs.forEach((osc) => {
				osc.env.triggerRelease();
            });
            this.simpleOsc.env.triggerRelease();
			this.oscs.envFilter.triggerRelease();
        }
        this.currentKey = this.currentKey.filter(item => item !== e.key)
    }

    connectOscilloscope(oscilloscope)
    {
        this.oscilloscope = oscilloscope;
    }
}

module.exports = new Keyboard();