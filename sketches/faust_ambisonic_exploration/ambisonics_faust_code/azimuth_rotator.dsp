declare name        "Ambisonic Azimuth Rotator";
declare version     "1.0";
declare author      "Pierre Lecomte";
declare license     "CC-BY-NC-SA-4.0";
declare copyright   "(c) Pierre Lecomte";
declare options "[osc:on]";

// Changelog:
// 1.1 (2021-03-20)
// - Change azimuth angle from [0 360] to [-180 180]
// 1.0 (2018-07-16)
// - Implementation according to [^ambitools]

//###Azimuth Rotator###
// This tool rotates the $L^\text{th}$ degree Ambisonic scene around the $z$-axis (azimuth angle).
// Driven with OSC from head-tracking signals, this tool can compensate the head rotations during binaural playback.
// Implementation according to [^kronlachner] with corrections.
//
// ## Compilation parameter
// - `L`: maximal Spherical Harmonics degree (i.e., Ambisonics order, $L \geq 0$) 
//
// ## Inputs / Outputs
// - Inputs: $(L+1)^2$
// - Outputs: $(L+1)^2$
//
// ## User Interface
//
// |----------------------------+-----------+-----------+-----------+
// | Element                    | OSC       | Min value | Max value |
// |----------------------------|:---------:|:---------:|:---------:|
// | Azimuth angle ($^\circ$)   | `azimuth` | -180      | 180       |
// |----------------------------+-----------+-----------+-----------+
//
// [^kronlachner]:  M. Kronlachner, “Spatial Transformations for the Alteration of Ambisonic Recordings,” Graz University Of Technology, Austria, 2014.
// [^ambitools]: P. Lecomte, « Ambitools: Tools for Sound Field Synthesis with Higher Order Ambisonics - V1.0 », in International Faust Conference, Mainz, 2018, p. 1‑9.


import("stdfaust.lib");
import("ylm.lib"); // just for buswg function.

// COMPILATION PARAMETERS

L	=	3; // Maximum degree $L$.

// DO NOT EDIT BELOW HERE

ins = (L+1)^2; // Number of inputs (= number of outputs).

t = hslider("Azimuth[osc:/azimuth -180 180][style:knob][unit:°]", 0, -180, 180, 0.01) * ma.PI/180; // Yaw angle

// SUB-MATRIX TERM, AT EACH DEGREE l
// diagonal terms, anti-diagonal terms, extra diagonal terms
rot(l,i,j)	=	case{
			(1,1) => 1; // (i,j) is on the extra-diagonal AND on the diagonal.
			(0,1) => cos((l-i)*t); // (i,j) is NOT on the extra-diaognal AND on the diagonal.
			(1,0) => sin((l-i)*t); // (i,j) is on the extra diagonal AND not on the diagonal. sinus is anti-symmetric which correspond to the anti-symetric matrix
			(0,0) => 0; // (i,j) is NOT on the extra-diagonal AND NOT on the diagonal
			}(i+1+j+1==2*l+1+1,i==j); //test: ((i,j) is on the extra diagonal, (i,j) is on the diagonal)
			
// MAIN-MATRIX ROW			
row(L,i)	=	par(l,L+1,
			  par(j,2*l+1,term 
			    with{term = ba.if((i >= l^2) & (i< (l+1)^2),rot(l,int(i-l^2),j),0);}
			    )
			    );

// Matrix multiplication
// ii = number of inputs
// oo = number of outputs
matrix(ii,oo) = par(i,ii,_) <: par(i,oo,buswg(row(L,i)):>_);

process = matrix(ins,ins);

// EXAMPLE OF A MATRIX AT Degree 5
// a(0)=(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
// 
// a(1)=(0, cos(t), 0, sin(t), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0); 
// a(2)=(0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0); 
// a(3)=(0, -1*sin(t), 0, cos(t), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
// 
// a(4)=(0, 0, 0, 0, cos(2*t), 0, 0, 0, sin(2*t), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0); 
// a(5)=(0, 0, 0, 0, 0, cos(t), 0, sin(t), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0); 
// a(6)=(0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
// a(7)=(0, 0, 0, 0, 0, -1*sin(t), 0, cos(t), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0); 
// a(8)=(0, 0, 0, 0, sin(2*t), 0, 0, 0, cos(2*t), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
// 
// a(9)=(0, 0, 0, 0, 0, 0, 0, 0, 0, cos(3*t), 0, 0, 0, 0, 0, sin(3*t), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
// a(10)=(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, cos(2*t), 0, 0, 0, sin(2*t), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
// a(11)=(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, cos(t), 0, sin(t), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0); 
// a(12)=(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0); 
// a(13)=(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1*sin(t), 0, cos(t), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0); 
// a(14)=(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1*sin(2*t), 0, 0, 0, cos(2*t), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0); 
// a(15)=(0, 0, 0, 0, 0, 0, 0, 0, 0, -1*sin(3*t), 0, 0, 0, 0, 0, cos(3*t), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
// 
// a(16)=(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, cos(4*t), 0, 0, 0, 0, 0, 0, 0, sin(4*t), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0); 
// a(17)=(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, cos(3*t), 0, 0, 0, 0, 0, sin(3*t), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
// a(18)=(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, cos(2*t), 0, 0, 0, sin(2*t), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
// a(19)=(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, cos(t), 0, sin(t), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0); 
// a(20)=(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
// a(21)=(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1*sin(t), 0, cos(t), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
// a(22)=(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1*sin(2*t), 0, 0, 0, cos(2*t), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
// a(23)=(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1*sin(3*t), 0, 0, 0, 0, 0, cos(3*t), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
// a(24)=(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1*sin(4*t), 0, 0, 0, 0, 0, 0, 0, cos(4*t), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0); 
// 
// a(25)=(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, cos(5*t), 0, 0, 0, 0, 0, 0, 0, 0, 0, sin(5*t));
// a(26)=(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, cos(4*t), 0, 0, 0, 0, 0, 0, 0, sin(4*t), 0);
// a(27)=(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, cos(3*t), 0, 0, 0, 0, 0, sin(3*t), 0, 0);
// a(28)=(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, cos(2*t), 0, 0, 0, sin(2*t), 0, 0, 0);
// a(29)=(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, cos(t), 0, sin(t), 0, 0, 0, 0);
// a(30)=(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0);
// a(31)=(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1*sin(t), 0, cos(t), 0, 0, 0, 0);
// a(32)=(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1*sin(2*t), 0, 0, 0, cos(2*t), 0, 0, 0);
// a(33)=(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1*sin(3*t), 0, 0, 0, 0, 0, cos(3*t), 0, 0);
// a(34)=(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1*sin(4*t), 0, 0, 0, 0, 0, 0, 0, cos(4*t), 0);
// a(35)=(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1*sin(5*t), 0, 0, 0, 0, 0, 0, 0, 0, 0, cos(5*t));
