declare name "Ambisonic Converter";
declare version "1.0";
declare author      "Pierre Lecomte";
declare license     "CC-BY-NC-SA-4.0";
declare copyright   "(c) Pierre Lecomte";
declare options "[osc:on]";

import("stdfaust.lib");

// TODO:
// - use `config = environment{ L = 3;}`; with access `config.L`
// - rewrite with `route(m,n,et)`.
// - use `enable()` primitive to select the conversion at run time

// Changelog
// (2021-04-24)
// - Revert to azimuth-elevation spherical coordinate system $(\theta, \phi)$.
// 1.0 (2020-07-20)
// - Implementation according to [^ambitools]
// - Remove GUI options

//###Converter###
// This tool converts the Ambisonic signals from input convention `conv_in` to output convention `conv_out`. 
// Indeed, depending on the chosen convention, the [spherical harmonics]({% link docs/ylm.md %}#mjx-eqn-eq%3Asph) norm and ordering change.
// In ambitools, the default convention used is [`ACN_N3D`](#acn_n3d) (see [`ymn.lib`]({% link docs/ylm.md %})).
// 
// 
// ## Available Conventions
// ### `ACN_N3D`
// The `ACN_N3D` convention stands for "Ambisonic Channel Number - Fully normalized"[^wiki].
// The `N3D` norm is given by:
// 
// 
// \begin{equation}
// N_{l,m}^\text{N3D} = \sqrt{(2- \delta_m) (2 l + 1)\frac{(l-|m|)!}{(l+|m|)!}},
// \label{eq:n3d}
// \end{equation}
// 
// 
// where $\delta_m$ is the Kronecker delta function.
// The `ACN` ordering is given by^[ambix]:
// 
// $$\begin{equation}
//   \left\lbrace
//   \begin{aligned}
//      &\text{ACN}(l,m) = i = l^2 + l + m \\
//        &m = \lfloor \sqrt{i} \rfloor \\
//        &l = i - m^2 - m
//   \end{aligned}
//   \right.
// \label{eq:acn}
// \end{equation}$$
// 
// This results in a pyramidal shape for the spherical harmonics with increasing ACN $i$, as follows:
// 
// |--|--|--|--|--|--|--|
// |    |    |    | 0  |    |    |    |
// |    |    | 1  | 2  | 3  |    |    |
// |    |  4 | 5  | 6  | 7  | 8  |    |
// | 9  | 10 | 11 | 12 | 13 | 14 | 15 |
// 
// ---
// ### `ACN_SN3D`
// The `ACN_SN3D` convention stands for "Ambisonic Channel Number -  Schmidt semi-normalized"[^wiki].
// The `N3D` norm is given by:
// 
// 
// \begin{equation}
// N_{l,m}^\text{SN3D} = \sqrt{(2- \delta_m) \frac{(l-|m|)!}{(l+|m|)!}},
// \label{eq:sn3d}
// \end{equation}
// 
// The convention uses `ACN` ordering (see Eq. $\eqref{eq:acn}$).
//
// ---
// ### `FuMa`
// The `FuMa` convention stands for Furse and Malham[^wiki].
// Its norm uses the `MaxN` (except for $l = 0$). This norm is such that:
// 
// 
// \begin{equation}
// \max_{(\theta,\phi)}|Y_{l,m}(\theta,\phi)|=1
// \label{eq:maxn}
// \end{equation}
// 
// This means that the maximum signal value is 1 for all components except the first component $(l = 0, m = 0)$ weighted with $ 1 / \sqrt{2}$. Finally, the `FuMa` norm is:
// 
// $$\begin{equation}
// N_{l,m}^\text{FuMa} = 
//    \left\lbrace 
//        \begin{aligned}
//            1/\sqrt{2}  & & \text{for} & & l = 0 \\
//            \text{MaxN}  & & \text{for} & & l > 0  
//       \end{aligned} 
//   \right.,
// \end{equation}$$
// 
// In `FuMa` convention, the signals are ordered in such a way that the corresponding ACN $i$ are sorted as follows:
// 
// |--|--|--|--|--|--|--|
// |    |    |    | 0  |    |   |    |
// |    |    | 2  | 3  | 1  |   |    |
// |    |  8 | 6  | 4  | 5  | 7 |    |
// | 15 | 13 | 11 | 9 | 10 | 12 | 14 |
// 
// Note that the Furse and Malham convention was originally defined for $L \leq 3$. Therefore, for $L>3$ the inputs signals are killed in the current implementation.
// 
// 
// ## Compilation parameter
// - `L`: maximal Spherical Harmonics degree (i.e., Ambisonics order, $L > 0$)
// - `conv_in`: Input signals convention. 
//   1. `ACN_N3D`
//   2. `ACN_SN3D` 
//   3. `FuMa`
// - `conv_out`: Ouput signals convention.
//   1. `ACN_N3D`
//   2. `ACN_SN3D` 
//   3. `FuMa`
// 
// ## Inputs / Outputs
// - Inputs: $(L+1)^2$
// - Outputs: $(L+1)^2$
// 
// 
// [^wiki]: [https://en.wikipedia.org/wiki/Ambisonic_data_exchange_formats](https://en.wikipedia.org/wiki/Ambisonic_data_exchange_formats){:target="_blank"}
// [^norm]: T. Carpentier, « Normalization schemes in Ambisonic: does it matter? », in Audio Engineering Society Convention 142, Berlin, 2017. 
// [^ambitools]: P. Lecomte, « Ambitools: Tools for Sound Field Synthesis with Higher Order Ambisonics - V1.0 », in International Faust Conference, Mainz, 2018, p. 1‑9.
//######

//Description : this tool converts HOA signals defined with a convention 1 to HOA signals defined with convention 2. Proposed conventions are ACN N3D, ACN SN3D, FuMa. For ACN to FuMa, the ordering change is as in [1]


// Input ACN:       0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15
// Output FuMa:     0   3   1   2   6   7   5   8   4   12  13  11  14  10  15  9 : W   XYZ RSTUV   KLMNOPQ

// Input FuMa: 0    1   2   3   4   5   6   7   8   9   10  11  12  13  14  15 : W  XYZ RSTUV   KLMNOPQ
// Output ACN: 0    2   3   1   6   8   4   5   7   15  13  11  9   10  12  14

// COMPILATION PARAMETERS
L	=	3; // Maximum required degree.

// Input/Output convention
conv_in = 1;
conv_out = 2;

// DO NOT EDIT BELOW HERE
// Number of inputs
ins     =       (L+1)^2;
outs     =       ins;

//inconv  =       rint(hslider("[0]Input[style:knob] (1-ACN_N3D,2-ACN_SN3D, 3-FuMa)",1,1,3,1));
//outconv =       rint(hslider("[0]Output[style:knob] (1-ACN_N3D,2-ACN_SN3D, 3-FuMa)",1,1,3,1));

//uniq    =       int(3*inconv + outconv - 4);

// ACN_N3D Input
conversion(1,1) =   si.bus(ins); // ACN_N3D to ACN_N3D
conversion(1,2) =   par(m,L+1,par(n,2*m+1,_*(1/sqrt(2*m+1)))); // ACN_N3D to ACN_SN3D
conversion(1,3) =   par(i,L+1,ACNFuMa(i)); // ACN_N3D to FuMa

// ACN_SN3D Input
conversion(2,1) =   par(m,L+1,par(n,2*m+1,_*sqrt(2*m+1))); // ACN_SN3D to ACN_N3D
conversion(2,2) =   conversion(1,1); // ACN_SN3D to ACN_SN3D
conversion(2,3) =   par(m,L+1,par(n,2*m+1,_*sqrt(2*m+1))):par(i,L+1,ACNFuMa(i)); // ACN_SN3D to FuMa : ACN_SN3D to ACN_N3D to FuMa

// FuMa Input
conversion(3,1) =   par(i,L+1,FuMaACN(i)); // FuMa to ACN_N3D
conversion(3,2) =   par(i,L+1,FuMaACN(i)):par(m,L+1,par(n,2*m+1,_*(1/sqrt(2*m+1)))); // FuMa to ACN_SN3D : FuMa to ACN_N3D to ACN_SN3D
conversion(3,3) =   conversion(1,1); // FuMa to FuMa

ACNFuMa(0) = _*(1/sqrt(2));
ACNFuMa(1) = ro.cross(3):(_,ro.cross(2)):
            (_*(1/sqrt(3)),_*(1/sqrt(3)),_*(1/sqrt(3)));
ACNFuMa(2) = (ro.cross(3),_,_):(_,ro.cross(3),_):(_,_,ro.cross(2),_):(_,_,_,ro.cross(2)):
            (_*(1/sqrt(5)),_*(2/sqrt(15)),_*(2/sqrt(15)),_*(2/sqrt(15)),_*(2/sqrt(15)));
ACNFuMa(3) = (ro.cross(4),_,_,_):(_,ro.cross(4),_,_):(_,_,ro.cross(3),_,_):(_,_,_,ro.cross(3),_):(_,_,_,_,ro.cross(2),_):(_,_,_,_,_,ro.cross(2)):
            (_*(1/sqrt(7)),_*sqrt(45/224),_*sqrt(45/224),_*(3/sqrt(35)),_*(3/sqrt(35)),_*sqrt(8/35),_*sqrt(8/35));
ACNFuMa(m) = par(i,2*m+1,!:0);

FuMaACN(0) = _*sqrt(2);
FuMaACN(1) = (ro.cross(2),_):(_,ro.cross(2)):
            (_*sqrt(3),_*sqrt(3),_*sqrt(3));
FuMaACN(2) = ro.cross(5):(_,ro.cross(2),_,_):(_,_,ro.cross(3)):
            (_*(sqrt(15)/2),_*(sqrt(15)/2),_*sqrt(5),_*(sqrt(15)/2),_*(sqrt(15)/2));
FuMaACN(3) = ro.cross(7):(_,ro.cross(2),ro.cross(2),_,_):(_,_,ro.cross(2),_,_,_):(_,_,_,ro.cross(4)):
            (_*sqrt(35/8),_*(sqrt(35)/3),_*sqrt(224/45),_*sqrt(7),_*sqrt(224/45),_*(sqrt(35)/3),_*sqrt(35/8));
FuMaACN(m) = par(i,2*m+1,!:0); // normally they shouldn't be FuMa components for L>3

process = conversion(conv_in,conv_out);
