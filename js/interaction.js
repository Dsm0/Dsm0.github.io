//  DISCLAIMER
//  
//  This website isn't completely spaghetti, but the html attribute management is, 
//    as of late, very unintuitive. The site is more of a rapid-prototype of an idea 
//    I had for a more interactive portfolio. I vow to clean this up and make it easier to scale


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

   // move(info,centerX,centerY);
   // move(canvas1,centerX + window.innerWidth,centerY);
   // move(canvas2,centerX + window.innerWidth,centerY+100);
   // move(email,centerX + 100,centerY + 100);
   // move(resume,centerX*(-1.4),centerY*0.3);

   // movetoStatic(info);
   // movetoStatic(canvas1);
   // movetoStatic(canvas2);
   // movetoStatic(emai);
   // movetoStatic(resume);
   // // moveElemByMouse(e,"resume",centerX*1.2,centerY+800);

   //resizeIframe(resume);
}

function transitionStatic(elem){
   elem.style.transition = elem.getAttribute("data-transitionStatic");
}

function transitionDynamic(elem){
   elem.style.transition = elem.getAttribute("data-transitionDynamic");
}

function movetoStatic(elem){
   var newWidth = window.innerWidth  * (parseFloat(elem.getAttribute("data-staticX"))/100);
   var newHeight = window.innerHeight * (parseFloat(elem.getAttribute("data-staticY"))/100);
   move(elem,newWidth,newHeight);
}


// It won't scale, but it's good for now...
function staticify(){

   var info = document.getElementById("contact");
   var canvas1 = document.getElementById("canvas1");
   var canvas2 = document.getElementById("canvas2");
   var email = document.getElementById("email");
   var resume = document.getElementById("resume");


   transitionStatic(canvas1);
   transitionStatic(canvas2);
   transitionStatic(info);
   transitionStatic(email);
   transitionStatic(resume);

   movetoStatic(canvas1);
   movetoStatic(canvas2);
   movetoStatic(resume);
   movetoStatic(info);
   movetoStatic(email);


}


// It won't scale, but it's good for now...
function dynamify(){

   var info = document.getElementById("contact");
   var canvas1 = document.getElementById("canvas1");
   var canvas2 = document.getElementById("canvas2");
   var email = document.getElementById("email");
   var resume = document.getElementById("resume");

   transitionDynamic(info);
   transitionDynamic(canvas1);
   transitionDynamic(canvas2);
   transitionDynamic(email);
   transitionDynamic(resume);

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
