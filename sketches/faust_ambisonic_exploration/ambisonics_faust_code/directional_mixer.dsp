declare name        "Ambisonic Directional Mixer";
declare version     "1.0";
declare author      "Pierre Lecomte";
declare license     "CC-BY-NC-SA-4.0";
declare copyright   "(c) Pierre Lecomte";
declare options "[osc:on]";

// Changelog
// (2021-04-24)
// - Revert to azimuth-elevation spherical coordinate system $(\theta, \phi)$.

//###Directional Mixer###
// This tools applies $S$ max-$r_E$ beampatterns to the Ambisonic sound scene. It can be used as an Ambisonic "directional mixer".
// This means that a directional filtering is operated to enhance and reduce some directions according to the chosen beampatterns[^aes]. 
// The proposed beampatterns are on-axis normalized max-$r_E$ beampatterns of degree $L_1$
// <div style="width:90%; margin:0 auto;" align="center" markdown="1">
// {% figure caption: "max-$r_E$ beampatterns for $L_1 \in [0, 1, 2, 3]$. Their steering angle is set to $(\theta=0^\circ, \phi=0^\circ)$. The beampatterns are axi-symmetric in 3D is plotted as ballon plot. For readibility, a cut on the horizontal plane is shown here." label:max-re%}
// ![Image]({{site.baseurl}}/assets/docs/maxre.png){:.rounded.border.shadow}
// {%endfigure%}
// </div>
// as shown in Fig.{% figref max-re %}. They have an high side-lobe attenuation
// while maintaining a narrow main lobe[^daniel]. For $L_1 = 0$ the beampattern is omnidirectional. The higher the beampattern degree, the more selective the directionnal filtering.
// At execution time, the steering angles ($\theta, \phi)$, the degree $L_1$ as well as the gain in dB of the each $S$ beampatterns can be changed.
// This directional filtering effect requires a higher degree of re-expansion $\tilde{L}$ for the filtered sound scene such that[^aes]:
// 
// $$\begin{equation}
// \tilde{L} = L + L_1,
// \end{equation}$$
//
// where $L$ is the input Ambisonic sound scene degree and $L_1$ is the beampattern degree. However, it is possible to choose the same degree for the output ($\tilde{L} = L$) with reasonable results.
//
// ## Compilation parameters
// - `S`: number of beampatterns to apply on the input sound scene,
// - `L`: maximal Spherical Harmonics degree for the input $(L > 0)$,
// - `L1`: maximal max-$r_E$ beampatterns degree ($L1 \geq 0$).
//
// In the current implemtation $L + L1 \leq 10$.
//
// Warning: the compilation can last several hours as $L_1$ and $S$ increase. Don't forget the flag `-t 0` with the `faust2...` scripts.
// {:.warning}
//
// ## Inputs / Outputs
// - Inputs: $(L+1)^2$
// - Outputs: $(L+L_1+1)^2$ or $(L+1)^2$
//
// ## User Interface
// For the $i$-th beampattern:
//
// |             Element         |     OSC        | Min value | Max value |
// |:---------------------------:|:--------------:|:---------:|:---------:|
// |          Gain (dB)          |   `gain_i`     |    -10    |    10     |
// | Azimuth $\theta$ ($^\circ$) | `azimuth_i`    |    -180   |    180    |
// | Elevation $\phi$ ($^\circ$) |  `elevation_i` |    -90    |    90     |
// | Degree $L_1$                |  `degree_i`    |     0     |    `L1`   |
// | On                          |  `on_i`        |     0     |    1      |
//
// ## Example of use
// Let's start with a sound scene a degree $L = 7$ composed of several unit-amplitude plane waves with various direction of arrival. 
// <div style="width:90%; margin:0 auto;" align="center" markdown="1">
// {% figure caption: "Input sound scene at degree $L=7$." label:input%}
// ![Image]({{site.baseurl}}/assets/docs/directional_mixer_input.png){:.rounded.border.shadow}
// {%endfigure%}
// </div>
// The square normalized amplitude of this scene is shown in Fig.{% figref input %}.
// Now we apply two max-$r_E$ beampatterns on this scene:
// - Beampattern 1: degree $L_{1,1} = 1$, of amplitude $g_1 = 0$ dB, steering angles ($\theta_1 = -135^\circ$, $\phi_1 = 45^\circ$),
// - Beampattern 2: degree $L_{1,1} = 2$, of amplitude $g_2 = 10$ dB, steering angles ($\theta_2 = 75^\circ$, $\phi_2 = 0^\circ$).
// <div style="width:90%; margin:0 auto;" align="center" markdown="1">
// {% figure caption: "Output sound scene at degree $\tilde{L}=7$." label:output2%}
// ![Image]({{site.baseurl}}/assets/docs/directional_mixer_output2.png){:.rounded.border.shadow}
// {%endfigure%}
// </div>
// <div style="width:90%; margin:0 auto;" align="center" markdown="1">
// {% figure caption: "Output sound scene at degree $\tilde{L}=9$." label:output1%}
// ![Image]({{site.baseurl}}/assets/docs/directional_mixer_output1.png){:.rounded.border.shadow}
// {%endfigure%}
// </div>
// The square normalized amplitude of the resulting sound scene is shown in Fig.{% figref output2 %} at degree $\tilde{L} = 7$ and in Fig.{% figref output1 %} at degree $\tilde{L} = 9$.
//
// [^carpentier]: T. Carpentier, « Ambisonic spatial blur », in Audio Engineering Society Convention 142, Berlin, 2017, p. 1‑7.
// [^daniel]: J. Daniel, J.-B. Rault, et J.-D. Polack, « Ambisonics encoding of other audio formats for multiple listening conditions », in Audio Engineering Society Convention 105, San Francisco, 1998, p. 1‑29.
// [^aes]: P. Lecomte, P.-A. Gauthier, A. Berry, A. Garcia, et C. Langrenne, « Directional filtering of Ambisonic sound scenes », in Audio Engineering Society Conference: Spatial Reproduction, Tokyo, 2018, p. 1‑9.
//#####

import("stdfaust.lib");
import("ylm.lib");
import("gaunt.lib");

// COMPILATION PARAMETERS
L = 3; // maximum required degree $L$
L1 = 2; // regular beampattern maximal degree
S = 4; // number of beampatterns

// DO NOT EDIT BELOW HERE
ins = (L + 1)^2;
outs = ins; //(L + L1 + 1)^2 // if lossless required;

// User interface
g(s)	=	hslider("[%s+1][unit:dB][osc:/gain_%s -20 20][style:knob]Gain %2s",0,-10,10,0.1): ba.db2linear : si.smoo; // $s$-th beampattern gain
t(s)	=	hslider("[%s+2][unit:°][osc:/azimuth_%s -180 180][style:knob]Azimuth %2s", 0, -180, 180, 0.01)*ma.PI/180 : si.smoo; // $s$-th beampattern azimuth
p(s)	=	hslider("[%s+3][unit:°][osc:/elevation_%s -90 90][style:knob]Zenith %2s", 0, -90, 90, 0.01)*ma.PI/180 : si.smoo; // $s$-th beampattern elevation
d(s)    =   int(hslider("[%s+4][osc:/degree_%s 0 %L1][style:knob]Degree %2s", 0, 0, L1, 0.1)); // $s$-th beampattern degree
o(s)	=	checkbox("[%s+5][osc:/on_%s 0 1]On"); // $s$-th beampattern on/off

// Matrix $T_{i,j}$ current term for $s$-th beampattern:
Tijs(i, j, s)	=	hgroup("Beampattern %2s", maxre(L1, d(s), t(s), p(s)) : par(k, (L1+1)^2, _*Cijk(i,j,k))  :> _*g(s)*o(s));

Tij(i, j) = par(s, S, Tijs(i, j, s)) :>_;

// Matrix $\mathbf{T}$ $i$-th row
Ti(j) = par(i, ins, Tij(i, j));

// Matrix $\mathbf{T}$
T	=	par(i,ins,_) <: par(j, outs, buswg(Ti(j)) :> _);

process = T;
