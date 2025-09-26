declare name        "Ambisonic Lebedev Decoder";
declare version     "1.0";
declare author      "Pierre Lecomte";
declare license     "CC-BY-NC-SA-4.0";
declare copyright   "(c) Pierre Lecomte";
declare options "[osc:on]";

//###Lebedev Decoder###
// This tool decodes an Ambisonic sound scene up to a maximal degree $L \leq \\{1, 2, 3, 5\\}$, on a $N$-node Lebedev grid with $N \in \\{6, 14, 26, 50\\}$[^lecomte]
// (see [grids.lib]({% link docs/grids.md %}#lebedevn-i-x)).
// The Near Field Compensation (NFC) filters are included (see [radial.lib]({% link docs/radial.md %}#near-field-compensation-filters)).
//
//
// ## Compilation parameters
// - `L`: maximal Spherical Harmonics degree (i.e., Ambisonics order), $0 \leq L \leq 5$,
// - `N`: number of node for the Lebedev grid, $N \in \\{6, 14, 26, 50\\}$,
// - `rspk`: array radius (m) for NFC $r_\text{spk} \in \]0, \infty[$.
// - `nfcon`: activate or not NFC: `0` for no NFC, `1` for NFC.
//
// In order to avoid spatial aliasing artifacts in the sweep spot, please respect the Tab. in [grids.lib]({% link docs/grids.md %}#lebedevn-i-x) when setting $L$ with respect to $N$.
//
// ## Inputs / Outputs
// - Inputs: $(L+1)^2$
// - Outputs: $N$
//
// ## User Interface
//
// |--------------------+------------+-----------+-----------+
// | Element            | OSC        | Min value | Max value |
// |--------------------|:----------:|:---------:|:---------:|
// | Outputs level (dB) | `levelout` | -10       | 10        |
// |--------------------+------------+-----------+-----------+
//
//
// [^lecomte]: P. Lecomte, P.-A. Gauthier, C. Langrenne, A. Berry, et A. Garcia, « A Fifty-Node Lebedev Grid and Its Applications to Ambisonics », Journal of the Audio Engineering Society, vol. 64, nᵒ 11, p. 868‑881, 2016.
//######

import("stdfaust.lib");
import("grids.lib");
import("radial.lib");
import("ylm.lib");

// COMPILATION PARAMETERS
L	=	3; // Maximum degree L, $0 \leq L \leq 5$.
N   =   26; // Number of nodes for the Lebedev grid $N \in \\{6, 14, 26, 50\\}$.
rspk	=	1; // Array radius (m)
nfcon   =   1; // NFC or not

// DO NOT EDIT BELOW HERE
// Inputs/Outputs
ins	=	(L+1)^2;
outs	=	N;

// User Interface
volout	=	vslider("[1]Outputs Gain[unit:dB][osc:/levelout -10 10]", 0, -10, 10, 0.1) : ba.db2linear : si.smoo;

nfcornot = case{
                (0) => par(l, L+1, par(i, 2 * l + 1, nfc(l,rspk)));
                (1) => si.bus(ins);
                }(nfcon==0);

matrix(n,l)	=	nfcornot<:par(i,l,buswg(row(i)):>_*(volout));

// Analytic decoder matrix Wlebedev.YLebedev [^lecomte]
// Vector of weighted spherical harmonics : spherical harmonics times the speaker weight for weighet quadrature rules [^lecomte]
row(i) = par(j, ins, yacn(j, lebedev(N, i, 0), lebedev(N, i, 1)) * lebedev(N, i, 2));

process = matrix(ins,outs);
