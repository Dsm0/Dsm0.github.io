declare name        "Ambisonic Stereo Panner";
declare version     "1.1";
declare author      "Pierre Lecomte";
declare license     "CC-BY-NC-SA-4.0";
declare copyright   "(c) Pierre Lecomte";
declare options "[osc:on]";

// Changelog
// (2022-09) v1.1
// - Doppler effect
// - No more clicks when moving sources

//###Stereo Panner###
// This tool allows to pan a stereo source as 2 point sources on $N$ loudspeakers using Ambisonic equivalent panning laws[^lecomte] up to degree $L$.
// See the [Panner]({% link docs/panner.md %}) tool for details on the panning laws, the [Encoder]({% link docs/encoder.md %}) tool for details on point source and plane wave encoding and
// the [Stereo Encoder]({% link docs/stereo_encoder.md %}) tool for details on the left and right channels positions.
//
// The NF filters can be activated or not at compilation time with parameter `nfon`. 
// If activated (`nfon=1`), the gain attenuation and propagation delay between loudspeakers are as well equalized. 
// If not activated (`nfon=0`), no near field effect is included in the process.
//
// ## Compilation parameters
// - `L`: maximal Spherical Harmonics degree, $L > 0$,
// - `N`: number of loudspeaker, $N > 0$,
// - `nfon`: activate or not NF filters: `nfon=0` for no NF, `nfon=1` for NF.
// - `speaker(n) = (x, y, z)` $n$-th loudspeaker Cartesian coordinates in meters. One loudspeaker per line.
// - `doppler` : Possibility of Doppler effect : `0` => No, `1` => Yes.
//
// ## Inputs / Outputs
// - Inputs: 2
// - Outputs: $N$
//
// ## User Interface
// For the $i$-th source:
//
// |             Element         |     OSC        | Min value | Max value |
// |:---------------------------:|:--------------:|:---------:|:---------:|
// |          Gain (dB)          |   `gain`       |    -20    |    20     |
// |   Doppler (`doppler = 1`)   |   `doppler_i`  |      0    |     1     |
// |        Radius $r$ (m)       |  `radius`      |    0.75   |    50     |
// | Azimuth $\theta$ ($^\circ$) | `azimuth`      |    -180   |    180    |
// | Elevation $\phi$ ($^\circ$) |  `elevation`   |    -90    |    90     |
// | Width $\alpha$ ($^\circ$)   |  `width`       |    0      |    360    |
// | Roll  $\beta$  ($^\circ$)   |  `roll`        |    -180   |    180    |
// |           Doppler           |   `doppler`    |      0    |     1     |
//
//
// [^lecomte]: P. Lecomte, P.-A. Gauthier, C. Langrenne, A. Berry, et A. Garcia, « A Fifty-Node Lebedev Grid and Its Applications to Ambisonics », Journal of the Audio Engineering Society, vol. 64, nᵒ 11, p. 868‑881, 2016.


import("stdfaust.lib");
import("ylm.lib");
import("grids.lib");
import("radial.lib");

// COMPILATION PARAMETERS
L   =   3;  // Maximum required degree $L$
N   =   22; // Loudspeaker number
nfon =  1; // Include NFC (1=included, 0=not included)
doppler = 0; // Activate the possibility of Doppler effect : 0 => No, 1 => Yes

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
g       =   hslider("[1][unit:dB][osc:/gain -20 20][style:knob]Gain",0,-20,20,0.1): ba.db2linear; // gain
r       =   hslider("[2][unit:m][osc:/radius %rsmin %rsmax][style:knob]Radius", 1, rsmin, rsmax, 0.01) : si.smoo;// radius
t       =	hslider("[3][unit:°][osc:/azimuth -180 180][style:knob]Azimuth", 0, -180, 180, 0.01)*ma.PI/180; // azimuth
p       =	hslider("[4][unit:°][osc:/elevation -90 90][style:knob]Elevation", 0, -90, 90, 0.01)*ma.PI/180; // elevation
width   =   hslider("[5][unit:°][osc:/width 0 360][style:knob]Width", 60, 0, 360, 0.01)*ma.PI/180; // width
roll    =   hslider("[6][unit:°][osc:/roll -180 180][style:knob]Roll", 0, -180, 180, 0.01)*ma.PI/180; // roll
d       =   checkbox("[7][osc:/doppler 0 1]Doppler"); // Doppler effect

// https://en.wikipedia.org/wiki/Spherical_coordinate_system#Integration_and_differentiation_in_spherical_coordinates

// Left-Right channels Cartesian coordinates in basis $(u_r, u_\theta, u_\phi)$
l1 = case{
        (0) => (r * cos(width / 2), 0, r * cos(width / 2) * tan(width / 2));
        (1) => (cos(width / 2), 0, cos(width / 2) * tan(width / 2));// Left-channel
        }(nfon==0);
        
r1 = case{
        (0) => (r * cos(width / 2), 0, -r * cos(width / 2) * tan(width / 2));
        (1) => (cos(width / 2), 0, -1 * cos(width / 2) * tan(width / 2)); // Right-channel
        }(nfon==0);

// Transition matrix between from basis $(u_r, u_\theta, u_\phi)$ to basis $(x, y, z)$.
m(0) = (cos(t) * cos(p), cos(t) * sin(p), -1 * sin(t));
m(1) = (cos(p) * sin(t), sin(t) * sin(p), cos(t));
m(2) = (sin(p), -1 * cos(p), 0);

// Rotation matrix around vector $u_r$ in basis $(u_r, u_\theta, u_\phi)$
rot(0) = (1, 0, 0);
rot(1) = (0, cos(roll), -1 * sin(roll));
rot(2) = (0, sin(roll), cos(roll));

// It should be possible to combine the two above matrices. However, it is left as it is for readibility: the simplifications are left to the compiler.. :)

// Left-Right channels Cartesian coordinates in basis $(u_r, u_\theta, u_\phi)$ rotated of a angle roll around $u_r$.
l2 = l1 <: par(i, 3, buswg(rot(i)) :>_);
r2 = r1 <: par(i, 3, buswg(rot(i)) :>_);

// Left-Right final channels Cartesian coordinates in basis $(x, y, z)$.
l3  = l2 <: par(i, 3, buswg(m(i)) :>_);
r3  = r2 <: par(i, 3, buswg(m(i)) :>_);

// Left-Right channels in Spherical coordinates
tt(0) = ba.take(2, cart2spher(l3 : (_,!,!), l3 : (!,_,!), l3 : (!,!,_)));
pp(0) = ba.take(3, cart2spher(l3 : (_,!,!), l3 : (!,_,!), l3 : (!,!,_)));
tt(1) = ba.take(2, cart2spher(r3 : (_,!,!), r3 : (!,_,!), r3 : (!,!,_)));
pp(1) = ba.take(3, cart2spher(r3 : (_,!,!), r3 : (!,_,!), r3 : (!,!,_)));

// Doppler delay or not
dd = case{
        (0) => _;
        (1) => ddelay(rsmax, r * d);
        }(doppler);

gain(s, i) = g * case{
                (0) => sum(l, L + 1, (2 * l + 1) * wre(L, L, l) * legendre(l, costheta(t1, p1, tt(s), pp(s)) : si.smoo));
                (1) => sum(l, L + 1, nf(l, r, r1) * (2 * l + 1) * wre(L, L, l) * legendre(l, costheta(t1, p1, tt(s), pp(s)) : si.smoo)) / rmax : de.delay(rmax / c * ma.SR, (rmax - r1) / c * ma.SR); // normalize by rmax
                }(nfon)  with 
                        {
                        r1 = ba.take(1, cart2spher(ba.take(1, speaker(i)), ba.take(2, speaker(i)), ba.take(3, speaker(i))));
                        t1 = ba.take(2, cart2spher(ba.take(1, speaker(i)), ba.take(2, speaker(i)), ba.take(3, speaker(i))));
                        p1 = ba.take(3, cart2spher(ba.take(1, speaker(i)), ba.take(2, speaker(i)), ba.take(3, speaker(i))));
                        };


process = par(s, 2, hgroup("", dd <: par(i, N, gain(s, i)))) :> si.bus(N);

