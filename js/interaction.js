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

   // moveElemByMouse(e,"resume",centerX*1.2,centerY+800);

   resizeIframe(resume);
}

var onkeypress = function(e){
   console.log(e);
   if(e.key == "s"){
      static = !static;
      if(static){
         changeCSS("css/static.css");
      } else {
         changeCSS("css/dynamic.css");
      }
   }
}


var onmousemove = function(e){
   if(!static){
      moveElemByMouse(e,"contact",centerX,centerY,xfactor=0.5,yfactor=0.5);
      moveElemByMouse(e,"canvas1",centerX*1.4,centerY,xfactor=2,yfactor=1);
      moveElemByMouse(e,"canvas2",centerX*1.4,centerY+100,xfactor=2,yfactor=2);
      moveElemByMouse(e,"email",pivotX=centerX+70,pivotY=centerY+70,yfactor=0.7);

      // moveElemByMouse(e,"resume",centerX*1.2,centerY+800);

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