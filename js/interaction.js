//  DISCLAIMER
//  
//  This website isn't completely spaghetti, but the html attribute management is, 
//    as of late, very unintuitive. The site is more of a rapid-prototype of an idea 
//    I had for a more interactive portfolio. I vow to clean this up and make it easier to scale


// const centerX = window.innerWidth/2;
// const centerY = window.innerHeight/2;
var static = false;


var scaleX = window.innerWidth/1920;
var scaleY = window.innerHeight/956;

var recipX = 1/scaleX;
var recipY = 1/scaleY;

// var unitX = window.innerWidth/(2*scaleX);
// var unitY = window.innerHeight/scaleY);

const centerX = window.innerWidth/2;
const centerY = window.innerHeight/2;

var initScripts = function(e){

   
   scalePage(scaleX,scaleY);

   var info = document.getElementById("contact");
   var canvas1 = document.getElementById("canvas1");
   var canvas2 = document.getElementById("canvas2");
   var canvas3 = document.getElementById("canvas3");
   var resume = document.getElementById("resume");


   move(info,centerX,centerY);
   move(email,centerX+(centerX/20),centerY+(centerY/20));
   move(contact,-1*window.innerWidth,centerY+innerHeight);
   move(canvas1,centerX + window.innerWidth,centerY+innerHeight);
   move(canvas2,centerX + window.innerWidth,centerY+innerHeight);
   move(canvas3,centerX + window.innerWidth,centerY+innerHeight);




}

function transitionStatic(elem){
   elem.style.transition = elem.getAttribute("data-transitionStatic");
}

function transitionDynamic(elem){
   elem.style.transition = elem.getAttribute("data-transitionDynamic");
}

function movetoStatic(elem){
   var newWidth = (1/scaleX)*xpercentToFloat(elem.getAttribute("data-staticX"));
   var newHeight = (1/scaleY)*ypercentToFloat(elem.getAttribute("data-staticY"));
   move(elem,newWidth,newHeight);
}

// It won't scale, but it's good for now...
function staticify(){

   var info = document.getElementById("contact");
   var canvas1 = document.getElementById("canvas1");
   var canvas2 = document.getElementById("canvas2");
   var canvas3 = document.getElementById("canvas3");
   var email = document.getElementById("email");
   var resume = document.getElementById("resume");


   transitionStatic(canvas1);
   transitionStatic(canvas2);
   transitionStatic(canvas3);
   transitionStatic(info);
   transitionStatic(email);
   transitionStatic(resume);

   movetoStatic(canvas1);
   movetoStatic(canvas2);
   movetoStatic(canvas3);
   movetoStatic(resume);
   movetoStatic(info);
   movetoStatic(email);

}


// It won't scale, but it's good for now...
function dynamify(){

   var info = document.getElementById("contact");
   var canvas1 = document.getElementById("canvas1");
   var canvas2 = document.getElementById("canvas2");
   var canvas3 = document.getElementById("canvas3");
   var email = document.getElementById("email");
   var resume = document.getElementById("resume");

   transitionDynamic(info);
   transitionDynamic(canvas1);
   transitionDynamic(canvas2);
   transitionDynamic(canvas3);
   transitionDynamic(email);
   transitionDynamic(resume);

}

var onkeypress = function(e){
   //console.log(e);
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
      moveElemByMouse(e,"contact",centerX*recipX,centerY*recipY,xfactor=0.5,yfactor=0.5);

      moveCanvi(e);

      moveElemByMouse(e,"email",pivotX=recipX*(centerX+(centerX/20)),pivotY=recipY*(centerY+ (centerY/20)),xfactor = 1,yfactor=0.7);
      moveElemByMouseMax(e,"resume",pivotX=scaleX*centerX*0.35,pivotY=recipY*centerY*0.35,xfactor=3,yfactor=0,maxX=centerX*0.05);
      }
}

// function changeCSS(cssFile) {
//    var cssLoader = document.getElementById("cssLoader");
//    cssLoader.href = cssFile;
// }

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
