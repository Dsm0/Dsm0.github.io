declare name        "Ambisonic Rotator";
declare version     "1.1";
declare author      "Pierre Lecomte";
declare license     "CC-BY-NC-SA-4.0";
declare copyright   "(c) Pierre Lecomte";
declare options "[osc:on]";

// Changelog
// (2021-04-24)
// - Revert to azimuth-elevation spherical coordinate system $(\theta, \phi)$.
// 1.1 (2020-07-15)
// - Fix compilation error for $L \geq 3$
// - Change order $m$ by degree $l$ and degree $n$ by order $l$.
// 1.0 (2018-07-17)
// - Implementation according to [^ambitools]

//###Rotator###
// This tool rotates the $L^\text{th}$ degree Ambisonic scene around the $z$-axis (yaw angle), $y$-axis (pitch angle) and $x$-axis (roll angle),
// <div style="width:50%; margin:0 auto;" align="center" markdown="1">
// {% figure caption: "Yaw, Pitch and Roll angles." label:yawpitchroll%}
// ![Image]({{site.baseurl}}/assets/docs/yawpitchroll.jpg){:.rounded.border.shadow}
// {%endfigure%}
// </div>
// according to Fig.{% figref yawpitchroll %}. Driven with OSC from head-tracking signals, this tool can compensate the head rotations during binaural playback.
// Implementation according to [^ivanic] with corrections.
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
// |------------------------+---------+-----------+-----------+
// | Element                | OSC     | Min value | Max value |
// |------------------------|:-------:|:---------:|:---------:|
// | Yaw angle ($^\circ$)   | `yaw`   | -180      | 180       |
// |------------------------|:-------:|:---------:|:---------:|
// | Pitch angle ($^\circ$) | `pitch` | -180      | 180       |
// |------------------------|:-------:|:---------:|:---------:|
// | Roll angle ($^\circ$)  | `roll`  | -180      | 180       |
// |------------------------+---------+-----------+-----------+
//
// [^ivanic]: J. Ivanic and K. Ruedenberg, “Rotation matrices for real spherical harmonics. Direct determination by recursion,” J. Phys. Chem., vol. 100, no. 15, pp. 6342–6347, 1996.
// [^ambitools]: P. Lecomte, « Ambitools: Tools for Sound Field Synthesis with Higher Order Ambisonics - V1.0 », in International Faust Conference, Mainz, 2018, p. 1‑9.
//######

// In Tab. 2 of this [^ivanic], from the corrections, the formula for the term $V(l,m,m')$ should be taken from the original paper...

import("stdfaust.lib");
import("ylm.lib"); // just for buswg function.

// COMPILATION PARAMETERS
L	=	3; // Maximum required degree $L$

// DO NOT EDIT BELOW HERE
// User Interface
yaw     =   hslider("[1]Yaw[osc:/yaw -180 180][style:knob][unit:°]", 0, -180, 180, 0.01) * ma.PI/180; // Yaw (rad)
pitch   =   hslider("[2]Pitch[osc:/picth -180 180][style:knob][unit:°]", 0, -180, 180, 0.01) * ma.PI/180; // Pitch (rad)
roll    =   hslider("[3]Roll[osc:/roll -180 180][style:knob][unit:°]", 0, -180, 180, 0.01) * ma.PI/180; // Roll (rad)

ins =   (L+1)^2;

// Zero-th degree
rot(0,l,m) = 1;

// First degree rotation matrix (n1, n2)
rot(1,-1,-1)    =   cos(roll)*cos(yaw) - sin(pitch)*sin(roll)*sin(yaw);
rot(1,-1,0)     =   -1*cos(pitch)*sin(roll);
rot(1,-1,1)     =   cos(yaw)*sin(pitch)*sin(roll) + cos(roll)*sin(yaw);
rot(1,0,-1)     =   cos(yaw)*sin(roll) + cos(roll)*sin(pitch)*sin(yaw);
rot(1,0,0)      =   cos(pitch)*cos(roll);
rot(1,0,1)      =   -1*cos(roll)*cos(yaw)*sin(pitch) + sin(roll)*sin(yaw);
rot(1,1,-1)     =   -1*cos(pitch)*sin(yaw);
rot(1,1,0)      =   sin(pitch);
rot(1,1,1)      =   cos(pitch)*cos(yaw);
rot(1,l,m)      =   0; // other cases for 1st order.


// Recurrence computations for higher degrees
denom(l,m2)     =   case{
                    (1)  => (l+m2)*(l-m2);
                    (0)  => 2*l*(2*l-1);
                    }(abs(m2)<l);


u(l,m1,m2)      =   case{
                    (1) => sqrt((l+m1)*(l-m1)/denom(l,m2));
                    (0) => 0; // to prevent negative square root (multiplied by 0 anyway...)
                    }(abs(m1)<l);

v(l,m1,m2)      =   1/2*sqrt((1+(m1==0))*(l+abs(m1)-1)*(l+abs(m1))/denom(l,m2))*(1-2*(m1==0));
w(l,m1,m2)      =   -1/2*sqrt((l-abs(m1)-1)*(l-abs(m1))/denom(l,m2))*(1-(m1==0));

U(l,0,m2)       =   P(0,l,0,m2);
U(l,m1,m2)      =   P(0,l,m1,m2);

V(l,m1,m2)      =   case{
                    (1,0,0)     =>P(1,l,1,m2)+P(-1,l,-1,m2);
                    (0,1,0)     =>P(1,l,m1-1,m2)*sqrt(1+(m1==1))-P(-1,l,-m1+1,m2)*(1-(m1==1));
                    (0,0,1)     =>P(1,l,m1+1,m2)*(1-(m1==-1))+P(-1,l,-m1-1,m2)*sqrt(1+(m1==-1)); // sqrt(1+(m1==1)) is right, in the correction of the paper it's sqrt(1-(m1==1))
                    }(m1==0,m1>0,m1<0);
                    
W(l,m1,m2)      =   case{
                    (1,0,0)     => 0; // Shouldn't be defined but covers some pattern matching cases.
                    (0,1,0)     => P(1,l,m1+1,m2)+P(-1,l,-m1-1,m2);
                    (0,0,1)     => P(1,l,m1-1,m2)-P(-1,l,-m1+1,m2);
                    }(m1==0,m1>0,m1<0);

P(i,l,mu,m2)    =   case{
                    (1,0,0)     => rot(1,i,0)*rot(l-1,mu,m2);
                    (0,1,0)     => rot(1,i,1)*rot(l-1,mu,l-1)-rot(1,i,-1)*rot(l-1,mu,-l+1);
                    (0,0,1)     => rot(1,i,1)*rot(l-1,mu,-l+1)+rot(1,i,-1)*rot(l-1,mu,l-1);
                    }(abs(m2)<l,m2==l,m2==-l);

// Other cases
rot(l,m1,m2)    =   u(l,m1,m2)*U(l,m1,m2)+v(l,m1,m2)*V(l,m1,m2)+w(l,m1,m2)*W(l,m1,m2);

// Main-matrix row			
row(L,i)	=	par(l,L+1,
			  par(j,2*l+1,term 
			    with{
                                term = 
                                case{
                                    (0) => 0;
                                    (1) => rot(l,int(i-l^2)-l,j-l);
                                    }((i >= l^2) & (i< (l+1)^2));
                                }
                             )
			    );
			    
			    
// Matrix multiplication
// ii = number of inputs
// oo = number of outputs
matrix(ii,oo) = par(i,ii,_) <: par(i,oo,buswg(row(L,i)):>_);

process = matrix(ins,ins);
