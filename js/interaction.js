var centerX = window.innerWidth/2;
var centerY = window.innerHeight/2;

window.onload = function(e){

   moveElemByMouse(e,"mover",xfactor=1.3);
   moveElemByMouse(e,"canvas1",xoffset=1000,yoffset=0,xfactor=4,yfactor=1);
   moveElemByMouse(e,"email",yoffset=100,xoffset=100,yfactor=1.25);

   var mover = document.getElementById("mover");
   var canvas1 = document.getElementById("canvas1");
   var email = document.getElementById("email");

   move(mover,centerX,centerY);
   move(canvas1,centerX + 300,centerY);
   move(email,centerX + 100,centerY + 100);


  }


var onmousemove = function(e){
   // console.log(e.clientX - centerX,e.clientY - centerY)

   moveElemByMouse(e,"mover",centerX,centerY,xfactor=0.3);
   moveElemByMouse(e,"canvas1",centerX+300,centerY,xfactor=4,yfactor=1);
   moveElemByMouse(e,"email",pivotX=centerX+100,pivotY=centerY+100,yfactor=0.7);

  }
