window.onload = function(e){
   var mover = document.getElementById("mover");
   var canvas1 = document.getElementById("canvas1");
   var email = document.getElementById("email");
   
   mover.style.left = (window.innerWidth/2)+'px';
   mover.style.top = (window.innerHeight/2)+'px';
   email.style.left = (window.innerWidth/2)+'px';
   email.style.top = (window.innerHeight/2)+'px';

   moveElemByMouse(e,"mover",xfactor=1.3);
   moveElemByMouse(e,"canvas1",xoffset=1000,yoffset=0,xfactor=4,yfactor=1);
   moveElemByMouse(e,"email",yoffset=100,xoffset=100,yfactor=1.25);

   // checkerBoard("canvas1",2,2);
   // mover.style.top = newPosY+'px';
   // moveElemBy(e,"mover");
   // moveElemBy(e,"canvas1",factor=3);
   // moveElemBy(e,"email",xoffset=90,yoffset=90);
  }

var onmousemove = function(e){
   moveElemByMouse(e,"mover",xfactor=1.3);
   moveElemByMouse(e,"canvas1",xoffset=1000,yoffset=0,xfactor=4,yfactor=1);
   moveElemByMouse(e,"email",yoffset=100,xoffset=100,yfactor=1.25);
  }
