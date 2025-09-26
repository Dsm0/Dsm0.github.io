declare name        "Ambisonic Mirroring";
declare version     "1.0";
declare author      "Pierre Lecomte";
declare license     "CC-BY-NC-SA-4.0";
declare copyright   "(c) Pierre Lecomte";
declare options "[osc:on]";

// Changelog:
// 1.0 (2020-07-16)
// - Implementation according to [^ambitools]

//###Mirroring###
// This tool operates a mirroring of the front and back, left and right, or top and bottom sides of the 3D sound scene.
// The implementation is done by changing the sign of specific Ambisonic signals, following the symmetry properties of spherical harmonics[^chapman].
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
// |----------------------------+-----------+-----------+-----------+
// | Element                    | OSC       | Min value | Max value |
// |----------------------------|:---------:|:---------:|:---------:|
// | Front-Back                 |`fb`       |0          |1          |
// |----------------------------|:---------:|:---------:|:---------:|
// | Left-Right                 |`lr`       |0          |1          |
// |----------------------------|:---------:|:---------:|:---------:|
// | Up-Down                    |`ud`       |0          |1          |
// |----------------------------+-----------+-----------+-----------+
//
// [^chapman]: M. Chapman, « Symmetries of Spherical Harmonics: applications to ambisonics », in Ambisonics Symposium, Graz, 2009, p. 1‑14.
// [^ambitools]: P. Lecomte, « Ambitools: Tools for Sound Field Synthesis with Higher Order Ambisonics - V1.0 », in International Faust Conference, Mainz, 2018, p. 1‑9.

import("stdfaust.lib");

// COMPILATION PARAMETERS
L	=	3; // Maximum required degree $L$

// DO NOT EDIT BELOW HERE
ud=checkbox("Up-Down[osc:/ud 0 1]");
lr=checkbox("Left-Right[osc:/lr 0 1]");
fb=checkbox("Front-Back[osc:/fb 0 1]");

//up-down switching: all spherical harmonics with degree and order as l+m odd
updown = par(l,L+1,par(i,2*l+1,term
	  with{	term	=	_<:ba.if((ud==1) & (i%2==1),_*-1,_); // i+l^2 = l^2+l+m
	  })
	  );
	
//left-right switching : all spherical harmonics of degree m<0
leftright = par(l,L+1,par(i,2*l+1,term
	  with{	term	=	_<:ba.if((lr==1) & ((i-l)<0),_*-1,_); // i+l^2 = l^2+l+m
	  })
	  );
	  
//front-back switching : all spherical harmonics of order (m<0 & m even) or (m>0 & m odd)
frontback = par(l,L+1,par(i,2*l+1,term
	  with{	term	=	_<:
	  ba.if(
	    ((fb==1)
	    &
	    (
		(
		 ((i-l)<0)
		 &
		 ((i-l)%2==0)
	      )
	      |
	      (
		 ((i-l)>0)
		 &
		 ((i-l)%2==1)
	      )
	    )
	    )
	  ,_*-1,_); // i+l^2 = l^2+l+m
	  })
	  );	  
	    
process=vgroup("Ambisonic Mirroring",updown:leftright:frontback);

//EXAMPLE AT DEGREE 5
//up-down switching : all spherical harmonics with degree and order as l+m odd
// updown=(
//           _,
//         _,u,_,
//       _,u,_,u,_,
//     _,u,_,u,_,u,_,
//   _,u,_,u,_,u,_,u,_,
// _,u,_,u,_,u,_,u,_,u,_
// )
// with { u = (_<:ba.if(ud==1,_*-1,_)); };


//left-right switching : all spherical harmonics of order m<0
// leftright=(
//           _,
//         l,_,_,
//       l,l,_,_,_,
//     l,l,l,_,_,_,_,
//   l,l,l,l,_,_,_,_,_,
// l,l,l,l,l,_,_,_,_,_,_
// )
// with { l = (_<:ba.if(lr==1,_*-1,_)); };

//front-back switching : all spherical harmonics of order (m<0 & m even) and (m>0 & m odd)
// frontback=(
//           _,
//         _,_,f,
//       f,_,_,f,_,
//     _,f,_,_,f,_,f,
//   f,_,f,_,_,f,_,f,_,
// _,f,_,f,_,_,f,_,f,_,f
// )
// with { f = (_<:ba.if(fb==1,_*-1,_)); };
