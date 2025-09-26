declare name        "Ambisonic Blur";
declare version     "1.0";
declare author      "Pierre Lecomte";
declare license     "CC-BY-NC-SA-4.0";
declare copyright   "(c) Pierre Lecomte";
declare options "[osc:on]";

//###Ambisonic Blur###
// This tool controls the spatial resolution of the $L^\text{th}$ degree Ambisonic sound scene while preserving its overall energy. Implementation is described in[^carpentier].
// The user can  control the "blurriness" of the scene from $0\%$ to $100\%$ by gradually varying the maximum degree retained for the output sound scene and thus the spatial resolution.
// This is done by muting the higher degree components as the blur parameter $\alpha$ goes from $0\%$ to $100\%$ with weighting functions
// <div style="width:90%; margin:0 auto;" align="center" markdown="1">
// {% figure caption: "Energy-preserving weighting functions for $L=5$ and $\tau=1$ (thick) and $\tau=0.25$ (dashed)." label:blur%}
// ![Image]({{site.baseurl}}/assets/docs/blur_weights.png){:.rounded.border.shadow}
// {%endfigure%}
// </div>
// as shown in Fig.{% figref blur %}. Thus, when the components of degree $l_1 \leq L$ are muted, the remaining components of degree $l \leq l_1$ are amplified in accordance to keep the global energy of the sound scene.
//
// The slope of the weighting functions is controlled by a parameter $\tau$.
// ## Compilation parameter
// - `L`: maximal Spherical Harmonics degree (i.e., Ambisonics order, $L \geq 0$) 
//
// ## Inputs / Outputs
// - Inputs: $(L+1)^2$
// - Outputs: $(L+1)^2$
//
// ## User Interface
//
// |--------------------------------+-----------+-----------+-----------+
// | Element                        | OSC       | Min value | Max value |
// |--------------------------------|:---------:|:---------:|:---------:|
// | Blur proportion $\alpha$ ($\%$)| `alpha`   | 0         | 100       |
// |--------------------------------+-----------+-----------+-----------+
// | Steepness $\tau$               | `tau`     | 0.25      | 1         |
// |--------------------------------+-----------+-----------+-----------+
//
// [^carpentier]: T. Carpentier, « Ambisonic spatial blur », in Audio Engineering Society Convention 142, Berlin, 2017, p. 1‑7.


import("stdfaust.lib");

// COMPILATION PARAMETERS
L   =   3;  // Maximum required degree $L$

// DO NOT EDIT BELOW HERE

// User interface
alpha	=	hslider("[1][osc:/alpha 0.5 50][unit:%][style:knob]Alpha", 0, 0, 100, 0.01) : si.smoo;// alpha
tau	=	hslider("[2][osc:/tau 0 360][style:knob]Tau", 0.25, 0.25, 1, 0.01) : si.smoo; // tau

ins = (L+1)^2; // Number of inputs (= number of outputs).

g(L, l, alpha, tau) = 1 - 1 / (1 + exp(- tau * (alpha - 100 * (L - l + 1) / (L + 1))));

w(L, alpha, tau) = sqrt(sum(l, L + 1, (2 * l + 1) * g(L, l, 0, tau)^2) / sum(l, L + 1, (2 * l + 1) * g(L, l, alpha, tau)^2));

process = par(l, L + 1, par(m, 2 * l + 1, _*(w(L, alpha, tau)*g(L, l, alpha, tau))));


