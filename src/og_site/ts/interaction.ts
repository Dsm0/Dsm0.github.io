declare var p5: any; // stupid fix for "Cannot find name 'p5'"

var static = false;

const canvas1 = document.getElementById("canvas1");
const canvas2 = document.getElementById("canvas2");
const canvas3 = document.getElementById("canvas3");
const p51 = document.getElementById("p51");
const p52 = document.getElementById("p52");
const p53 = document.getElementById("p53");

const contact = document.getElementById("contact");
const email = document.getElementById("email");
const resume = document.getElementById("resume");

const blurbDiv = document.getElementById("blurb");

const body = document.getElementById("body");
const html = document.getElementById("html");

const dynamicSwitch = document.getElementById("dynamicSwitch");

const centerX = (recipX * window.innerWidth) / 2;
const centerY = (recipY * window.innerHeight) / 2;

const canvi: HTMLCollectionOf<Element> = document.getElementsByClassName(
  "glCanvas"
);
const p5Canvi: HTMLCollectionOf<Element> = document.getElementsByClassName(
  "p5Canvas"
);

function initP5(p5Obj) {
  var div = document.getElementById(p5Obj.divId);
  div.setAttribute("data-blurb", p5Obj.blurb);
  return new p5(p5Obj.sketch);
}

var initScripts = function (e) {
  let loadedP5s = p5Objs.map(initP5);

  move(
    blurbDiv,
    window.innerWidth * recipX * 0.05,
    window.outerHeight * recipY * 0.85
  );

  move(contact, centerX, centerY);

  move(email, centerX + centerX / 20, centerY + centerY / 20);

  move(p51, centerX + centerX / 20, centerY + centerY / 20);
  move(p52, centerX + centerX / 20, centerY + centerY / 20);
  move(p53, centerX + centerX / 20, centerY + centerY / 20);
  if (!static) {
    const fakeEvent = {
      clientX: centerX,
      clientY: centerY,
    };
    moveElements(fakeEvent);
  }
  dynamicSwitch.onmouseover = function () {
    static = !static;
    if (static) {
      staticify();
    } else {
      dynamicSwitch.innerHTML = "mouseover for static";
      dynamify();
    }
  };

  for (var i = 0; i < canvi.length; i++) {
    const canv = <HTMLCanvasElement>canvi[i];
    move(canv, centerX + window.innerWidth, centerY + innerHeight);
    canv.onmouseover = function () {
      blurbDiv.innerHTML = canv.innerHTML;
      // reset the color after a short delay
    };
    canv.onmouseleave = function () {
      blurbDiv.innerHTML = "";
    };
  }

  for (var i = 0; i < p5Canvi.length; i++) {
    const p5Canv = <HTMLCanvasElement>p5Canvi[i];
    move(p5Canvi[i], centerX + window.innerWidth, centerY + innerHeight);
    p5Canv.onmouseover = (_) => {
      blurbDiv.innerHTML = p5Canv.getAttribute("data-blurb");
    };
    p5Canv.onmouseleave = (_) => {
      blurbDiv.innerHTML = "";
    };
  }
  scalePage(scaleX, scaleY);
  window.scrollTo(0, 0);
};

onmousemove = function (event: MouseEvent) {
  if (!static) {
    moveElements(event);
  }
};

onkeypress = function (event: KeyboardEvent) {
  staticDynamic(event);
};

// onresize = function () {
//   scaleX = window.innerWidth / 1920;
//   scaleY = window.innerHeight / 956;
//   scalePage(scaleX, scaleY);
// };

function transitionStatic(elem) {
  elem.style.transition = elem.getAttribute("data-transitionStatic");
}

function transitionDynamic(elem) {
  elem.style.transition = elem.getAttribute("data-transitionDynamic");
}

function movetoStatic(elem) {
  var newWidth =
    (1 / scaleX) * xpercentToFloat(elem.getAttribute("data-staticX"));
  var newHeight =
    (1 / scaleY) * ypercentToFloat(elem.getAttribute("data-staticY"));
  move(elem, newWidth, newHeight);
}

onscroll = function (event) {
  move(
    blurbDiv,
    window.innerWidth * recipX * 0.05 + this.scrollX,
    window.outerHeight * recipY * 0.85
  );
};

// It won't scale, but it's good for now...
function staticify() {
  body.style.setProperty("--overflow-mode", "scroll");

  dynamicSwitch.innerHTML = "mouseover for dynamic";

  for (var i = 0; i < canvi.length; i++) {
    transitionStatic(canvi[i]);
    movetoStatic(canvi[i]);
  }

  for (var i = 0; i < p5Canvi.length; i++) {
    transitionStatic(p5Canvi[i]);
    movetoStatic(p5Canvi[i]);
  }

  transitionStatic(contact);
  transitionStatic(email);
  transitionStatic(resume);

  movetoStatic(resume);
  movetoStatic(contact);
  movetoStatic(email);
}

// It won't scale, but it's good for now...
function dynamify() {
  dynamicSwitch.innerHTML = "mouseover for static";

  transitionDynamic(contact);
  transitionDynamic(email);
  transitionDynamic(resume);

  for (var i = 0; i < canvi.length; i++) {
    transitionDynamic(canvi[i]);
  }

  for (var i = 0; i < p5Canvi.length; i++) {
    transitionDynamic(p5Canvi[i]);
  }

  body.style.setProperty("--overflow-mode", "hidden");

  window.scrollTo(0, 0);
}

const staticDynamic = function (e) {
  if (e.key == "s") {
    static = !static;
    if (static) {
      staticify();
    } else {
      dynamify();
    }
  }
};

const moveElements = function (e) {
  moveByPivot(e, contact);

  moveCanvi(e, canvi);
  moveCanvi(e, p5Canvi);

  moveByPivot(e, contact);
  moveByPivot(e, email);
  moveByPivot(e, resume);
};

// // courtesy of
// // https://stackoverflow.com/a/16779702
// function getStyleSheetPropertyValue(selectorText, propertyName) {
//   // search backwards because the last match is more likely the right one
//   for (var s = document.styleSheets.length - 1; s >= 0; s--) {
//     var cssRules =
//       document.styleSheets[s].cssRules || document.styleSheets[s].rules || []; // IE support
//     for (var c = 0; c < cssRules.length; c++) {
//       if (cssRules[c].selectorText === selectorText)
//         return cssRules[c].style[propertyName];
//     }
//   }
//   return null;
// }