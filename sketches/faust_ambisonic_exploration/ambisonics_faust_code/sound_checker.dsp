declare name        "Multichannel Sound Checker";
declare version     "1.0";
declare license     "CC-BY-NC-SA-4.0";
declare copyright   "(c) Pierre Lecomte";
declare options "[osc:on]";

//###Multichannel Sound Checker###
// This tool allows to check the correct wiring of a multi-channel playback system. The test signals can be chosen among :
// - white noise
// - pink noise
// - sine tone
// - input signal
//
// The test signal is sent only to the destination channel selected at run-time. 
// Note thate the channel identifiers starts at $1$.
//
// ## Compilation parameter
// - `N`: number of loudspeakers, $N > 0$,
//
// ## Inputs / Outputs
// - Inputs: $1$
// - Outputs: $N$
//
// ## User Interface
//
// | Element                   | OSC       | Min value | Max value | 
// |:-------------------------:|:---------:|:---------:|:---------:|
// | Volume (dB)               | `volume`  |    -70    |    6      |
// | Sine Tone Frequency (kHz) | `freq`    |    0      |    20     |
// | Destination               | `dest`    |    1      |    N      |
// | Sine Tone                 | `sine`    |    0      |    1      |
// | White Noise               | `white`   |    0      |    1      |
// | Pink Noise                | `pink`    |    0      |    1      |
// | Input                     | `input`   |    0      |    1      |
//
//######

import("stdfaust.lib");

// COMPILATION PARAMETERS
N = 16; // number of channel

// DO NOT EDIT BELOW HERE
vol             = hslider("[1][osc:/volume -70 6][unit:dB] Volume", -70, -70, 6, 0.1): ba.db2linear : si.smoo;
freq            = hslider("[2][osc:/freq 0 20000][unit:Hz] Sine Tone Frequency", 1000, 0, 20000, 0.1);
dest            = int(hslider("[3][osc:/dest 1 N] Destination", 1, 1, N, 1));

testsignal      = _*checkbox("[7][osc:/input 0 1] Input")
		+ os.osci(freq)*checkbox("[4][osc:/sine 0 1] Sine Tone")
                + no.noise * checkbox("[5][osc:/white 0 1] White Noise")
                + no.pink_noise * ba.db2linear(20)  * checkbox("[6][osc:/pink 0 1] Pink Noise");

process         = vgroup( "Multichannel Sound Checker", testsignal * vol <: par(i,N, _ *((i+1) == dest)) );
