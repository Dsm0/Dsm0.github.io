const iniFrame = !!window.frameElement;
globalThis.inhtml1 = iniFrame ? true : false;
var static = true;
// const html_id = document.getElementById("html");
const canvas1 = document.getElementById("canvas1");
const canvas2 = document.getElementById("canvas2");
const canvas3 = document.getElementById("canvas3");
const p51 = document.getElementById("p51");
const p52 = document.getElementById("p52");
const p53 = document.getElementById("p53");
/* const cursor = document.getElementById("cursor"); */
const frame = document.getElementById("frame");
const blurbDiv = document.getElementById("blurb");
const body = document.getElementById("body");
const html = document.getElementById("html");
const dynamicSwitch = document.getElementById("dynamicSwitch");
const centerX = (recipX * window.innerWidth) / 2;
const centerY = (recipY * window.innerHeight) / 2;
const canvi = document.getElementsByClassName("glCanvas");
const p5Canvi = document.getElementsByClassName("p5Canvas");
function initP5(p5Obj) {
    var div = document.getElementById(p5Obj.divId);
    // console.log(div)
    div.setAttribute("data-blurb", p5Obj.blurb);
    return new p5(p5Obj.sketch);
}
var initScripts = function (e) {
    let loadedP5s = p5Objs.map(initP5);

    for (var i = 0; i < canvi.length; i++) {
        const canv = canvi[i];
        // move(canv, centerX + window.innerWidth, centerY + innerHeight);
        canv.onmouseover = function () {
            blurbDiv.innerHTML = canv.innerHTML;
            // reset the color after a short delay
        };
        canv.onmouseleave = function () {
            blurbDiv.innerHTML = "";
        };
    }
    for (var i = 0; i < p5Canvi.length; i++) {
        const p5Canv = p5Canvi[i];
        // move(p5Canvi[i], centerX + window.innerWidth, centerY + innerHeight);
        p5Canv.onmouseover = (_) => {
            blurbDiv.innerHTML = p5Canv.getAttribute("data-blurb");
        };
        p5Canv.onmouseleave = (_) => {
            blurbDiv.innerHTML = "";
        };
    }
    window.scrollTo(0, 0);

};
// onmousemove = function (event: MouseEvent) {
//   if (!static) {
//     moveElements(event);
//   }
// };
onkeypress = function (event) {
    staticDynamic(event);
};
function transitionStatic(elem) {
    elem.style.transition = elem.getAttribute("data-transitionStatic");
}
function transitionDynamic(elem) {
    elem.style.transition = elem.getAttribute("data-transitionDynamic");
}
function movetoStatic(elem) {
    var newWidth = (1 / scaleX) * xpercentToFloat(elem.getAttribute("data-staticX"));
    var newHeight = (1 / scaleY) * ypercentToFloat(elem.getAttribute("data-staticY"));
    move(elem, newWidth, newHeight);
}
onscroll = function (event) {
    move(blurbDiv, window.innerWidth * recipX * 0.05 + this.scrollX, window.outerHeight * recipY * 0.85);
};
// It won't scale, but it's good for now...
function staticify() {
    // body.style.setProperty("--overflow-mode", "scroll");
    dynamicSwitch.innerHTML = "mouseover for dynamic";
    for (var i = 0; i < canvi.length; i++) {
        transitionStatic(canvi[i]);
        movetoStatic(canvi[i]);
    }
    for (var i = 0; i < p5Canvi.length; i++) {
        transitionStatic(p5Canvi[i]);
        movetoStatic(p5Canvi[i]);
    }
    staticify();
}
// It won't scale, but it's good for now...
function dynamify() {
    dynamicSwitch.innerHTML = "mouseover for static";
    // transitionDynamic(contact);
    // transitionDynamic(email);
    // transitionDynamic(resume);
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
        }
        else {
            dynamify();
        }
    }
};

// the mini-iframe thing is on hold for now
/* onmousemove = (e) => { */
/*     if(iniFrame){ */
/*         let x = e.clientX, y = e.clientY; */
/*         let new_pos_string = {x,y}; */
/*         window.parent.postMessage(new_pos_string,'*'); */
/*     } else { */
/*         cursor.style.display = 'none' */
/*     } */
/* } */
/* window.addEventListener('message', function(e) { */
/*     var event = new MouseEvent('mouseover', { */
/*         'view': window, */
/*         'clientX': e.clientX, */
/*         'clientY': e.clientY, */
/*         'cancelable': true */
/*     }); */
/*     body.dispatchEvent(event); */
/*     const inset = e.data; */
/*     let new_pos_string = `${inset.y}px 0px 0px ${inset.x}px`; */
/*     cursor.style.display = 'block'; */
/*     giantMouse(new_pos_string,cursor); */
/* }); */
/* html.onmouseenter = (e) => { */
/*     if(iniFrame){ */
/*         console.log("out"); */
/*         cursor.style.display = 'none'; */
/*     } */
/* } */
/* html.onmouseout = (e) => { */
/*     if(iniFrame){ */
/*         console.log("in"); */
/*         cursor.style.display = 'block'; */
/*     } */
/* } */
