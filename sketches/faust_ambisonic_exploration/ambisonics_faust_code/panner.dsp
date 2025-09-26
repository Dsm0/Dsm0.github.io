declare name        "Ambisonic Panner";
declare version     "1.1";
declare author      "Pierre Lecomte";
declare license     "CC-BY-NC-SA-4.0";
declare copyright   "(c) Pierre Lecomte";
declare options "[osc:on]";

// Changelog
// (2022-09) v1.1
// - Doppler effect
// - Cartesian / Spherical coordinate choice at compilation
// - No more clicks when moving sources

//###Panner###
// This tool allows to pan $S$ sources on $N$ loudspeakers using Ambisonic equivalent panning laws[^lecomte].
// The $i$-th source, with $i \in \\{1, \cdots, S\\}$ carries a signal denoted $s_i(z)$ in the discrete domain. 
// Encoded as a point source, its position is $(r_i,\theta_i,\phi_i)$ from origin and it emits a spherical wave.
// For the $n$-th loudspeaker with $n \in \\{1, \cdots, N\\}$ and coordinates $(r_n, \theta_n, \varphi_n)$, the driving signal $s_n$ is given by:
//
// $$\begin{equation}
// s_n = \sum\limits_{i=0}^{S} \sum_{l=0}^{L} s_i(z) z^{- \lfloor \frac{r_i}{c} \rfloor} w_{\text{max-}r_E, l}(L) \frac{F_l(r_i, z)}{F_l(r_n, z)}  (2 l + 1) P_l(\cos(\gamma_i(n))), 
// \label{eq:panning_law}
// \end{equation}$$
//
// where $P_l$ is the $l$-th Legendre polynomial, $w_{\text{max-}r_E}$ are the [max-$r_E$ weights]({% link docs/ylm.md %}#wrelmax-l1-l),
// $\frac{F_l(r_i, z)}{F_l(r_n, z)}$ are the The Near Field [(NF) filters]({% link docs/radial.md %}#stabilization-of-nf-filters-with-nfc-filters)),
// and $\gamma_i(n) = \cos(\phi_i) \cos(\phi_n) \cos(\theta_i - \theta_n) + \sin(\phi_i) \sin(\phi_n)$ is the angle between the $i$-th source and the $n$-th loudspeaker.
//
// The NF filters can be activated or not at compilation time with parameter `nfon`. 
// If activated (`nfon=1`), the gain attenuation and propagation delay between loudspeakers are as well equalized. 
// If not activated (`nfon=0`), $\frac{F_l(r_i, z)}{F_l(r_n, z)} = 1$ in Eq. \eqref{eq:panning_law}, that is to say that no near field effect is included in the process.
//
// In addition, a delay $\frac{r_i}{c}$ due to the propagation time can be included. When the source moves, this produces a Doppler effect, which can be activated or not at runtime. 
//
// ## Compilation parameters
// - `S`: number of source, $S > 0$
// - `L`: maximal Spherical Harmonics degree, $L > 0$,
// - `N`: number of loudspeaker, $N > 0$,
// - `nfon`: activate or not NF filters: `nfon=0` for no NF, `nfon=1` for NF.
// - `speaker(n) = (x, y, z)` $n$-th loudspeaker Cartesian coordinates in meters. One loudspeaker per line.
// - `coord` : Choice of coordinate system : `0` => Spherical, `1` => Cartesian,
// - `doppler` : Possibility of Doppler effect : `0` => No, `1` => Yes.
//
// ## Inputs / Outputs
// - Inputs: $S$
// - Outputs: $N$
//
// ## User Interface
//
// |             Element                       |     OSC        | Min value | Max value |
// |:-----------------------------------------:|:--------------:|:---------:|:---------:|
// |          Gain (dB)                        |   `gain_i`     |    -20    |    20     |
// |           Doppler (`doppler = 1`)         |   `doppler_i`  |      0    |     1     |
// |       Radius $r$) (m) (`coord = 0`)       |  `radius_i`    |    0.75   |    50     |
// | Azimuth $\theta$ ($^\circ$) (`coord = 0`) | `azimuth_i`    |    -180   |    180    |
// | Elevation $\phi$ ($^\circ$) (`coord = 0`) |  `elevation_i` |    -90    |    90     |
// |             $x$ (m) (`coord = 1`)         |       `x_i`    |    -50    |    50     |
// |             $y$ (m) (`coord = 1`)         |       `y_i`    |    -50    |    50     |
// |             $z$ (m) (`coord = 1`)         |       `z_i`    |    -50    |    50     |
//
//
// [^lecomte]: P. Lecomte, P.-A. Gauthier, C. Langrenne, A. Berry, et A. Garcia, « A Fifty-Node Lebedev Grid and Its Applications to Ambisonics », Journal of the Audio Engineering Society, vol. 64, nᵒ 11, p. 868‑881, 2016.


import("stdfaust.lib");
import("ylm.lib");
import("grids.lib");
import("radial.lib");
import("grids.lib");

// COMPILATION PARAMETERS
S   =   2;  // Source number
L   =   3;  // Maximum required degree $L$
N   =   22; // Loudspeaker number
nfon = 1; // activate or not NF filters: `nfon=0` for no NF, `nfon=1` for NF.
coord = 0; // Choice of coordinate system : 0 => Spherical, 1 => Cartesian,
doppler = 0; // Possibility of Doppler effect : `0` => No, `1` => Yes.

// Loudspeakers Cartesian coordinates $(x, y, z)$ in meters.
speaker(0) = (1.6, 2, 0);
speaker(1) = (1.6, 1, 0);
speaker(2) = (1.6, 0, 0);
speaker(3) = (1.6, -1, 0);
speaker(4) = (1.6, -2, 0);
speaker(5) = (0, 2, 0);
speaker(6) = (0, -2, 0);
speaker(7) = (-1.7, 1.7, 0);
speaker(8) = (-1.7, 0, 0);
speaker(9) = (-1.7, -1.7, 0);
speaker(10) = (1.6, 2, 1.24);
speaker(11) = (1.6, 0, 1.24);
speaker(12) = (1.6, -2, 1.24);
speaker(13) = (0, 2, 1.24);
speaker(14) = (0, 0, 1.24);
speaker(15) = (0, -2, 1.24);
speaker(16) = (-1.7, 1.7, 1.24);
speaker(17) = (-1.7, 0, 1.24);
speaker(18) = (-1.7, -1.7, 1.24);
speaker(19) = (1.6, 2, -1);
speaker(20) = (1.6, 0, -1);
speaker(21) = (1.6, -2, -1);


// DO NOT EDIT BELOW HERE
rsmax = 50; // maximum radius
rsmin = 0.75;

rs = par(i, N, ba.take(1, cart2spher(ba.take(1, speaker(i)), ba.take(2, speaker(i)), ba.take(3, speaker(i)))));
rmax = sup(rs);

// User interface
g(s)	=	hslider("[%s+1][unit:dB][osc:/gain_%s -20 20][style:knob]Gain %2s",0, -20, 20, 0.1): ba.db2linear; // gain
d(s)    =   checkbox("[%s+5][osc:/doppler_%s 0 1]Doppler"); // Doppler effect

// User interface Cartesian
x(s)	=	vslider("[%s+2][unit:m][osc:/x_%s -%rsmax %rsmax]x %2s", 1, -rsmax, rsmax, 0.01); 
y(s)	=	vslider("[%s+3][unit:m][osc:/y_%s -%rsmax %rsmax]y %2s", 0, -rsmax, rsmax, 0.01);
z(s)	=	vslider("[%s+4][unit:m][osc:/z_%s -%rsmax %rsmax]z %2s", 0, -rsmax, rsmax, 0.01);

rtp(s) =  (x(s), y(s), z(s)) : cart2spher : (max(_, rsmin), _, _); // ensures to never go below rsmin.

r1(s) = rtp(s) : _, !, ! ;
t1(s) = rtp(s) : !, _, ! ;
p1(s) = rtp(s) : !, !, _ ;

// User interface Spherical
r0(s)	=	hslider("[%s+2][unit:m][osc:/radius_%s %rsmin %rsmax][style:knob]Radius %2s", 1, rsmin, rsmax, 0.01);// radius
t0(s)	=	hslider("[%s+3][unit:°][osc:/azimuth_%s -180 180][style:knob]Azimuth %2s", 0, -180, 180, 0.1)*ma.PI/180; // azimuth
p0(s)	=	hslider("[%s+4][unit:°][osc:/elevation_%s -90 90][style:knob]Elevation %2s", 0, -90, 90, 0.1)*ma.PI/180; // zenith

// Resulting Spherical coordinate system
r(s) = case{
        (0) => r0(s);
        (1) => r1(s);
        }(coord) : si.smoo;

t(s) = case{
        (0) => t0(s);
        (1) => t1(s);
        }(coord);

p(s) = case{
        (0) => p0(s);
        (1) => p1(s);
        }(coord);

// Doppler delay or not
dd(s) = case{
        (0) => _;
        (1) => ddelay(sqrt(3) * rsmax, r(s) * d(s));
        }(doppler);

gain(s, i) = g(s) * case{
                (0) => sum(l, L + 1, (2 * l + 1) * wre(L, L, l) * legendre(l, costheta(t2, p2, t(s), p(s)) : si.smoo ));
                (1) => sum(l, L + 1, nf(l, r(s), r2) * (2 * l + 1) * wre(L, L, l) * legendre(l, costheta(t2, p2, t(s), p(s)) : si.smoo)) / rmax : de.delay(rmax / c * ma.SR, (rmax - r2) / c * ma.SR ); // normalize by rmax
                }(nfon)  with 
                        {
                        r2 = ba.take(1, cart2spher(ba.take(1, speaker(i)), ba.take(2, speaker(i)), ba.take(3, speaker(i))));
                        t2 = ba.take(2, cart2spher(ba.take(1, speaker(i)), ba.take(2, speaker(i)), ba.take(3, speaker(i))));
                        p2 = ba.take(3, cart2spher(ba.take(1, speaker(i)), ba.take(2, speaker(i)), ba.take(3, speaker(i))));
                        };


process = par(s, S, hgroup("Source %2s", dd(s) <: par(i, N, gain(s, i)))) :> si.bus(N);

