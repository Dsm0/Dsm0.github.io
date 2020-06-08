// const centerX = window.innerWidth/2;
// const centerY = window.innerHeight/2;
var static = false;

// var unitX = window.innerWidth/(2*scaleX);
// var unitY = window.innerHeight/scaleY);

const centerX = recipX * window.innerWidth/2;
const centerY = recipY * window.innerHeight/2;

const canvi = document.getElementsByClassName("glCanvas");
const p5Canvi = document.getElementsByClassName("p5Canvas");

const blurbDiv = document.getElementById("blurb");

const body = document.getElementById("body");
const html = document.getElementById("html");

function initP5(p5Obj){
  var div = document.getElementById(p5Obj.divId);
  div.setAttribute("data-blurb",p5Obj.blurb);
  return new p5(p5Obj.sketch);        
}

var initScripts = function(e){

   var loadedP5s = p5Objs.map(initP5);

   move(blurbDiv,window.innerWidth*recipX*0.05,window.outerHeight*recipY*0.85);

   var info = document.getElementById("contact");
   var canvas1 = document.getElementById("canvas1");
   var canvas2 = document.getElementById("canvas2");
   var canvas3 = document.getElementById("canvas3");
   var p51 = document.getElementById("p51");
   var p52 = document.getElementById("p52");
   var p53 = document.getElementById("p53");


   var dynamicSwitch = document.getElementById("dynamicSwitch");

   var resume = document.getElementById("resume");

   move(info,centerX,centerY);
   // move(dynamicSwitch,centerX*1.2,centerY*1.4);

   move(email,centerX+(centerX/20),centerY+(centerY/20));

   move(p51,centerX+(centerX/20),centerY+(centerY/20));
   move(p52,centerX+(centerX/20),centerY+(centerY/20));
   move(p53,centerX+(centerX/20),centerY+(centerY/20));

   dynamicSwitch.onmouseover = function() {   
      console.log("ah")
      static = !static;
      if(static){
         staticify();
      } else {
         this.innerHTML = "mouseover for static";
         dynamify();
      }
   };

   for(var i = 0; i < canvi.length;i++){
      move(canvi[i],centerX + window.innerWidth,centerY+innerHeight)
      canvi[i].onmouseover = function() {   
         // move(blurbDiv,parseFloat(this.style.left) - 500,parseFloat(this.style.top));
         blurbDiv.innerHTML = this.innerHTML;
         // reset the color after a short delay
      };
      canvi[i].onmouseleave = function() {
         blurbDiv.innerHTML = "";
      }
   }

   for(var i = 0; i < p5Canvi.length;i++){
      move(p5Canvi[i],centerX + window.innerWidth,centerY+innerHeight)
      p5Canvi[i].onmouseover = function() {   
         // move(blurbDiv,parseFloat(this.style.left) - 500,parseFloat(this.style.top));
         blurbDiv.innerHTML = this.getAttribute("data-blurb");
      };
      p5Canvi[i].onmouseleave = function() {
         blurbDiv.innerHTML = "";
      }
   }

   scalePage(scaleX,scaleY);

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
   var dynamicSwitch= document.getElementById("dynamicSwitch");


   body.style.setProperty("--overflow-mode","auto");


   dynamicSwitch.innerHTML = "mouseover for dynamic";

   var canvas1 = document.getElementById("canvas1");
   var canvas2 = document.getElementById("canvas2");
   var canvas3 = document.getElementById("canvas3");

   var email   = document.getElementById("email");
   var resume  = document.getElementById("resume");
   var p51     = document.getElementById("p51");

   for(var i = 0; i < canvi.length;i++){
      transitionStatic(canvi[i]);
      movetoStatic(canvi[i]);
   }

   for(var i = 0; i < p5Canvi.length;i++){
      transitionStatic(p5Canvi[i]);
      movetoStatic(p5Canvi[i]);
   }


   transitionStatic(info);
   transitionStatic(email);
   transitionStatic(resume);

   movetoStatic(resume);
   movetoStatic(info);
   movetoStatic(email);

}


// It won't scale, but it's good for now...
function dynamify(){

   var info = document.getElementById("contact");
   var email = document.getElementById("email");
   var resume = document.getElementById("resume");



   var dynamicSwitch= document.getElementById("dynamicSwitch");
   dynamicSwitch.innerHTML = "mouseover for static";

   transitionDynamic(info);
   transitionDynamic(email);
   transitionDynamic(resume);

   for(var i = 0; i < canvi.length;i++){
      transitionDynamic(canvi[i]);
   }

   for(var i = 0; i < p5Canvi.length;i++){
      transitionDynamic(p5Canvi[i]);
   }

   body.style.setProperty("--overflow-mode","hidden");

   window.scrollTo(0,0);

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

var onho

var onmousemove = function(e){


   if(!static){

      var contact = document.getElementById("contact");
      var email = document.getElementById("email");
      var resume = document.getElementById("resume");

      moveByPivot(e,contact);

      moveCanvi(e,canvi);
      moveCanvi(e,p5Canvi);

      moveByPivot(e,contact);
      moveByPivot(e,email);
      moveByPivot(e,resume);

      }

}

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


