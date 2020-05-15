var centerX = window.innerWidth/2;
var centerY = window.innerHeight/2;
var static = false;

// window.onload = function(e)
var initScripts = function(e){

   var info = document.getElementById("contact");
   var canvas1 = document.getElementById("canvas1");
   var canvas2 = document.getElementById("canvas2");
   var email = document.getElementById("email");
   var resume = document.getElementById("resume");

   move(info,centerX,centerY);
   move(canvas1,centerX + window.innerWidth,centerY);
   move(canvas2,centerX + window.innerWidth,centerY+100);
   move(email,centerX + 100,centerY + 100);
   move(resume,centerX*(-1.4),centerY*0.3);


   // moveElemByMouse(e,"resume",centerX*1.2,centerY+800);

   //resizeIframe(resume);
}

function makeStatic(elem){
   var newWidth = window.innerWidth  * (parseFloat(elem.getAttribute("data-staticX"))/100);
   var newHeight = window.innerHeight * (parseFloat(elem.getAttribute("data-staticY"))/100);
   // "data-staticX" and "data-staticY" are stored as percent values
   // but I convert them to pixels so that the uniforms passed to shaders don't become 0-100
   move(elem,newWidth,newHeight);
}


// It won't scale, but it's good for now...
function staticify(){

   var info = document.getElementById("contact");
   var canvas1 = document.getElementById("canvas1");
   var canvas2 = document.getElementById("canvas2");
   var email = document.getElementById("email");
   var resume = document.getElementById("resume");

   info.style.transition = "0.2s";
   canvas1.style.transition = "0.2s";
   canvas2.style.transition = "0.2s";
   email.style.transition = "0.2s";
   resume.style.transition = "0.2s";


   // move(canvas1,canvas1.data-staticX,canvas1.data-staticY);
   makeStatic(canvas1);
   makeStatic(canvas2);

   // canvas2.style.left = canvas1.getAttribute("data-staticX")
   // canvas2.style.top= canvas1.getAttribute("data-staticY")
   // move(canvas2,centerX*1.3,centerY*1.5);

   move(info,centerX*0.85,centerY*1.6);
   move(email,centerX*0.87,centerY*1.8);
   move(resume,centerX*0.03,centerY*0.3);
}


// It won't scale, but it's good for now...
function dynamify(){

   var info = document.getElementById("contact");
   var canvas1 = document.getElementById("canvas1");
   var canvas2 = document.getElementById("canvas2");
   var email = document.getElementById("email");
   var resume = document.getElementById("resume");

   info.style.transition = "0s";
   canvas1.style.transition = "0s";
   canvas2.style.transition = "0s";
   email.style.transition = "0s";
   resume.style.transition = "0s";

}



var onkeypress = function(e){
   console.log(e);
   if(e.key == "s"){
      static = !static;
      if(static){
         staticify();
      } else {
         dynamify();
      }
   }  
}

var onmousemove = function(e){
   if(!static){
      moveElemByMouse(e,"contact",centerX,centerY,xfactor=0.5,yfactor=0.5);
      moveElemByMouse(e,"canvas1",centerX*1.4,centerY,xfactor=2,yfactor=1);
      moveElemByMouse(e,"canvas2",centerX*1.4,centerY+100,xfactor=2,yfactor=2);
      moveElemByMouse(e,"email",pivotX=centerX+70,pivotY=centerY+70,yfactor=0.7);
      moveElemByMouseMax(e,"resume",centerX*0.3,centerY*0.3,xfactor=4,yfactor=0,maxX=centerX*0.1);
      }
}

function changeCSS(cssFile) {
   var cssLoader = document.getElementById("cssLoader");
   cssLoader.href = cssFile;
}

// ^^^^^^^^^^^^^
// todo!!!! 
// integraate the static.css sheet with the getStypeSheetPropertyValue function
// to switch between static and dynamic layouts
//\/\/\/\/\/\/\/


// courtesy of
// https://stackoverflow.com/a/16779702 
function getStyleSheetPropertyValue(selectorText, propertyName) {
   // search backwards because the last match is more likely the right one
   for (var s= document.styleSheets.length - 1; s >= 0; s--) {
       var cssRules = document.styleSheets[s].cssRules ||
               document.styleSheets[s].rules || []; // IE support
       for (var c=0; c < cssRules.length; c++) {
           if (cssRules[c].selectorText === selectorText) 
               return cssRules[c].style[propertyName];
       }
   }
   return null;
}
