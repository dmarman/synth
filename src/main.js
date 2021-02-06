import * as Tone from 'tone';
import keyboard from './keyboard';
import Adsr from './adsr'
import oscilloscope from './oscilloscope'

let spread = document.querySelector('.spread').value
let width = document.querySelector('.width').value
let unison = document.querySelector('.unison');
let lines = [];
let oscs = [];
let type = '';
let simpleOsc = {};
let volumeCompensators = {
    sine: 0,
    triangle: -2,
    sawtooth: -4,
    square: -8
};
keyboard.Tone = Tone;
keyboard.connectOscilloscope(oscilloscope);

let adsrAmplitude = new Adsr('.adsr-amplitude');
let adsrFilter = new Adsr('.adsr-filter');

Tone.context.lookAhead = 0;

document.querySelector('.type').addEventListener('input', e => {
  updateVoices()
})

document.querySelector('.spread').addEventListener('input', e => {
    spread = e.target.value
    updateSpread(e.target.value);
})

document.querySelector('.voices').addEventListener('input', e => {
    updateVoices();
})

document.querySelector('.width').addEventListener('input', e => {
    width = e.target.value
    updateWidth(e.target.value);
})

document.querySelector('.amplitude .attack').addEventListener('input', e => {
    oscs.forEach((osc) => {osc.env.attack = Number(e.target.value)})
    adsrAmplitude.draw(oscs[0].env)
})
document.querySelector('.amplitude .decay').addEventListener('input', e => {
    oscs.forEach((osc) => {osc.env.decay = Number(e.target.value)})
    adsrAmplitude.draw(oscs[0].env)
})
document.querySelector('.amplitude .sustain').addEventListener('input', e => {
    oscs.forEach((osc) => {osc.env.sustain = Number(e.target.value)})
    adsrAmplitude.draw(oscs[0].env)
})
document.querySelector('.amplitude .release').addEventListener('input', e => {
    oscs.forEach((osc) => {osc.env.release = Number(e.target.value)})
    adsrAmplitude.draw(oscs[0].env)
})

document.querySelector('.filter-envelope .attack').addEventListener('input', e => {
    envFilter.attack = e.target.value
    adsrFilter.draw(envFilter)
})
document.querySelector('.filter-envelope .decay').addEventListener('input', e => {
    envFilter.decay = e.target.value
    adsrFilter.draw(envFilter)
})
document.querySelector('.filter-envelope .sustain').addEventListener('input', e => {
    envFilter.sustain = e.target.value
    adsrFilter.draw(envFilter)
})
document.querySelector('.filter-envelope .release').addEventListener('input', e => {
    envFilter.release = e.target.value
    adsrFilter.draw(envFilter)
})

document.querySelector('.frequency').addEventListener('input', e => {
    updateFilter()
})
document.querySelector('.resonance').addEventListener('input', e => {
    updateFilter()
})
document.querySelector('.envelope-ratio').addEventListener('input', e => {
    updateFilter()
})

document.querySelector('.simple-osc .octave').addEventListener('input', e => {
    updateSimpleOsc();
})

document.querySelector('.simple-osc .volume').addEventListener('input', e => {
    updateSimpleOsc();
})

document.querySelector('.reverb .length').addEventListener('input', e => {
    document.querySelector('.reverb-circle').style.width = 10*e.target.value
    document.querySelector('.reverb-circle').style.height = 10*e.target.value
    updateReverb()
})
document.querySelector('.reverb .wet').addEventListener('input', e => {
    document.querySelector('.reverb-circle').style.boxShadow = '0px 0px ' + 20*e.target.value + 'px #f30089 inset, 0 0 ' + 50*e.target.value + 'px #f30089'
    updateReverb()
})

function updateSpread(value) {
    let pair = 0;
    let valueStyle = value/15;
    let valueAudio = value/10;
    
    if(lines.length%2 === 0) pair = 1;
    let middle = (lines.length - 1)/2
    lines.forEach((div, key) => {
        if(key < middle) {
            div.style.left = -valueStyle*(key + 1) + pair*valueStyle/2 + 75;
            oscs[key].source.detune.value = - (valueAudio*(key + 1) + pair*valueAudio/2);
        }
        if(key > middle) {
            div.style.left = valueStyle*(key + (lines.length-1)%2 - Math.round(middle)) - pair*valueStyle/2 + 75;
            oscs[key].source.detune.value = (valueAudio*(key + (lines.length-1)%2 - Math.round(middle)) - pair*valueAudio/2);
        }
        if(key === middle) {
            oscs[key].panVol.pan.value = 0;
        }
    })
}

let analyser = new Tone.Analyser('waveform').toDestination();
oscilloscope.input(analyser)

const reverb = new Tone.Reverb({
    decay: document.querySelector('.reverb .length').value,
    wet: document.querySelector('.reverb .wet').value
}).connect(analyser);

let filter = new Tone.Filter(1500, 'lowpass').connect(reverb);

function updateReverb()
{
	reverb.decay = document.querySelector('.reverb .length').value;
	reverb.wet.value = document.querySelector('.reverb .wet').value;
}

const envFilter = new Tone.FrequencyEnvelope({
    attack: document.querySelector('.filter-envelope .attack').value,
    decay: document.querySelector('.filter-envelope .decay').value,
    sustain: document.querySelector('.filter-envelope .sustain').value,
    release: document.querySelector('.filter-envelope .release').value,
}).connect(filter.frequency);

function updateFilter()
{
    envFilter.baseFrequency = logslider(0, 255, 20, 20000, document.querySelector('.frequency').value);
    filter.Q.value = document.querySelector('.resonance').value;
    envFilter.octaves = document.querySelector('.envelope-ratio').value;
}

updateFilter();

adsrFilter.draw(envFilter);

function updateVoices() {
    let value = document.querySelector('.voices').value

    oscs.forEach((osc) => {
      osc.source.stop()
    });
    if(simpleOsc.source) simpleOsc.source.stop()

    unison.innerHTML = '';
    lines = [];
    oscs = [];


    for(let i = 0; i < value; i++){
        let div = document.createElement('div');
        div.classList.add('unison-line')
        div.style.left = 75;
        unison.appendChild(div)
        lines.push(div);

        let env = new Tone.AmplitudeEnvelope({
          attack: document.querySelector('.amplitude .attack').value,
          decay: document.querySelector('.amplitude .decay').value,
          sustain: document.querySelector('.amplitude .sustain').value,
          release: document.querySelector('.amplitude .release').value
        }).connect(filter);

        env.decayCurve = 'exponential';
        env.releaseCurve = 'exponential';
        adsrAmplitude.draw(env)

        let panVol = new Tone.PanVol(0, 0).connect(env);
        type = document.querySelector('.type').value;

        let source = new Tone.OmniOscillator({
            type: type
        }).connect(panVol);
		
        source.volume.value = -5*Math.sqrt(value) + volumeCompensators[type];
        oscs.push({source, panVol, env})
    }

    updateSpread(spread)
    updateWidth(width)
    oscs.envFilter = envFilter;
    keyboard.oscs = oscs;
}


// Simple Oscillator
let env = new Tone.AmplitudeEnvelope({
    attack: document.querySelector('.amplitude .attack').value,
    decay: document.querySelector('.amplitude .decay').value,
    sustain: document.querySelector('.amplitude .sustain').value,
    release: document.querySelector('.amplitude .release').value
  }).connect(filter);

let source = new Tone.OmniOscillator({type: 'sine'}).connect(env);
source.volume.value = -logslider(0, 255, 60, 1, document.querySelector('.simple-osc .volume').value);
let octave = document.querySelector('.simple-osc .octave').value;
simpleOsc = {source, env, octave};
keyboard.simpleOsc = simpleOsc;

function updateSimpleOsc()
{
    simpleOsc.octave = document.querySelector('.simple-osc .octave').value;
    simpleOsc.source.volume.value = -6 -logslider(0, 255, 60, 1, document.querySelector('.simple-osc .volume').value);
    keyboard.simpleOsc = simpleOsc;
}


function updateWidth(value = document.querySelector('.width').value)
{
    let ratio = 1;
    let maxRatio = 1;
    let pair = 0;
    value = value/255;
   
    if(lines.length%2 === 0) pair = 1;
    let middle = (lines.length - 1)/2

    oscs.forEach((osc, key) => {
        if(key < middle) {
            ratio = value*(key + 1) + pair*value/2;
            maxRatio = ((Math.round(middle)-1) + 1) + pair/2;

            osc.panVol.pan.value = -ratio/maxRatio;

            lines[key].style.transform = 'skewX(-' + value*5 + 'deg)';
          }
        if(key > middle) {
            ratio = (value*(key + (lines.length-1)%2 - Math.round(middle)) - pair*value/2);
            maxRatio =  (oscs.length-1 + (lines.length-1)%2 - Math.round(middle)) - pair/2

            osc.panVol.pan.value = ratio/maxRatio;

            lines[key].style.transform = 'skewX(' + value*5 + 'deg)';
        }
        if(key === middle) {
            osc.panVol.pan.value = 0;
        }
    })
}

function logslider(minp, maxp, minv, maxv, position) {
    minv = Math.log(minv);
    maxv = Math.log(maxv);
  
    var scale = (maxv-minv) / (maxp-minp);
  
    return Math.exp(minv + scale*(position-minp));
}

updateVoices()

document.addEventListener('keydown', keyboard.keyDown.bind(keyboard));
document.addEventListener('keyup', keyboard.keyUp.bind(keyboard));
