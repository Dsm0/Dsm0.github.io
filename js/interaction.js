window.onload = function(e){
   var mover = document.getElementById("mover");
   var canvas1 = document.getElementById("canvas1");
   var email = document.getElementById("email");

   mover.style.left = (window.innerWidth/2)+'px';
   mover.style.top = (window.innerHeight/2)+'px';
   email.style.left = (window.innerWidth/2)+'px';
   email.style.top = (window.innerHeight/2)+'px';
   // mover.style.top = newPosY+'px';
   // moveElemBy(e,"mover");
   // moveElemBy(e,"canvas1",factor=3);
   // moveElemBy(e,"email",xoffset=90,yoffset=90);
  }

var onmousemove = function(e){
   moveElemBy(e,"mover");
   moveElemBy(e,"canvas1",xfactor=1);
   moveElemBy(e,"email",yoffset=100,xoffset=100,yfactor=1.25);
  }
