declare name        "Ambisonic Directional Dirac Filtering";
declare version     "1.0";
declare author      "Pierre Lecomte";
declare license     "CC-BY-NC-SA-4.0";
declare copyright   "(c) Pierre Lecomte";
declare options "[osc:on]";

// Changelog
// (2021-04-24)
// - Revert to azimuth-elevation spherical coordinate system $(\theta, \phi)$.
// - Normalize encoding by dividing each component by $(L+1)^2$.
// 1.0 (2021-03-20)
// - Implementation according to [^ambitools]

//###Directional Dirac Filtering###
// This tools performs a directional filtering of the Ambisonic sound scene as follows: only one direction $(\theta, \phi)$ is retained in the output sound scene[^aes].
// Therefore, it is possible to point and listen to only one direction at the run time. A focus slider is available to manage the ratio between original and filtered sound scene.
//
// ## Compilation parameters
// - `L`: maximal Spherical Harmonics degree (i.e., Ambisonics order, $L > 0$) 
//
// ## Inputs / Outputs
// - Inputs: $(L+1)^2$
// - Outputs: $(L+1)^2$
//
// ## User Interface
//
// |----------------------------+-----------+-----------------------+-----------+
// | Element                    | OSC       | Min value             | Max value |
// |----------------------------|:---------:|:---------------------:|:---------:|
// | Azimuth ($\theta^\circ$)   |`theta`    |-180                   |180        |
// |----------------------------|:---------:|:---------------------:|:---------:|
// | Elevation ($\phi^\circ$)   |`phi`      |-90                    |90         |
// |----------------------------|:---------:|:---------------------:|:---------:|
// | Focus (%)                  |`focus`    |0 (effect is bypassed) |100        |
// |----------------------------|:---------:|:---------------------:|:---------:|
//
// [^aes]: P. Lecomte, P.-A. Gauthier, A. Berry, A. Garcia, et C. Langrenne, « Directional filtering of Ambisonic sound scenes », in Audio Engineering Society Conference: Spatial Reproduction, Tokyo, 2018, p. 1‑9.
//#####

import("stdfaust.lib");
import("ylm.lib"); // just for buswg function.

// COMPILATION PARAMETERS
L	=	3; // Maximum required degree $L$.

// DO NOT EDIT BELOW HERE
ins = (L+1)^2; // Number of inputs (= number of outputs).

// User Interface
t    = hslider("Azimuth[osc:/theta -180 180][unit:°]", 0, -180, 180, 0.01) * ma.PI/180 : si.smoo;
p    = hslider("elevation[osc:/phi -90 90][unit:°]", 0, -90, 90, 0.01) * ma.PI/180 : si.smoo;
focus = hslider("Focus[osc:/focus 0 100][unit:%]", 0, 0, 100, 1) / 100 : si.smoo;

process = si.bus(ins)<:(par(i, ins, _*(1-focus)), (yvec(ins, t, p):>_*focus<:yvec(ins, t, p):par(i,ins,_/(L+1)^2))):>si.bus(ins);
