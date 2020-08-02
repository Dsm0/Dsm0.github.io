var static = false;
var canvas1 = document.getElementById("canvas1");
var canvas2 = document.getElementById("canvas2");
var canvas3 = document.getElementById("canvas3");
var p51 = document.getElementById("p51");
var p52 = document.getElementById("p52");
var p53 = document.getElementById("p53");
var contact = document.getElementById("contact");
var email = document.getElementById("email");
var resume = document.getElementById("resume");
var blurbDiv = document.getElementById("blurb");
var body = document.getElementById("body");
var html = document.getElementById("html");
var dynamicSwitch = document.getElementById("dynamicSwitch");
var centerX = (recipX * window.innerWidth) / 2;
var centerY = (recipY * window.innerHeight) / 2;
var canvi = document.getElementsByClassName("glCanvas");
var p5Canvi = document.getElementsByClassName("p5Canvas");
function initP5(p5Obj) {
    var div = document.getElementById(p5Obj.divId);
    div.setAttribute("data-blurb", p5Obj.blurb);
    return new p5(p5Obj.sketch);
}
var initScripts = function (e) {
    var loadedP5s = p5Objs.map(initP5);
    // document.body.scrollTop = document.documentElement.scrollTop = 0;
    move(blurbDiv, window.innerWidth * recipX * 0.05, window.outerHeight * recipY * 0.85);
    // move(blurbDiv,parseFloat(this.style.left) - 500,parseFloat(this.style.top));
    move(contact, centerX, centerY);
    move(email, centerX + centerX / 20, centerY + centerY / 20);
    move(p51, centerX + centerX / 20, centerY + centerY / 20);
    move(p52, centerX + centerX / 20, centerY + centerY / 20);
    move(p53, centerX + centerX / 20, centerY + centerY / 20);
    if (!static) {
        var fakeEvent = {
            clientX: centerX,
            clientY: centerY,
        };
        moveElements(fakeEvent);
    }
    dynamicSwitch.onmouseover = function () {
        static = !static;
        if (static) {
            staticify();
        }
        else {
            dynamicSwitch.innerHTML = "mouseover for static";
            dynamify();
        }
    };
    var _loop_1 = function () {
        var canv = canvi[i];
        move(canv, centerX + window.innerWidth, centerY + innerHeight);
        canv.onmouseover = function () {
            blurbDiv.innerHTML = canv.innerHTML;
            // reset the color after a short delay
        };
        canv.onmouseleave = function () {
            blurbDiv.innerHTML = "";
        };
    };
    for (var i = 0; i < canvi.length; i++) {
        _loop_1();
    }
    var _loop_2 = function () {
        var p5Canv = p5Canvi[i];
        move(p5Canvi[i], centerX + window.innerWidth, centerY + innerHeight);
        p5Canv.onmouseover = function (_) {
            // move(blurbDiv,parseFloat(this.style.left) - 500,parseFloat(this.style.top));
            blurbDiv.innerHTML = p5Canv.getAttribute("data-blurb");
        };
        p5Canv.onmouseleave = function (_) {
            blurbDiv.innerHTML = "";
        };
    };
    for (var i = 0; i < p5Canvi.length; i++) {
        _loop_2();
    }
    scalePage(scaleX, scaleY);
    window.scrollTo(0, 0);
};
onmousemove = function (event) {
    if (!static) {
        moveElements(event);
    }
};
onkeypress = function (event) {
    staticDynamic(event);
};
onresize = function () {
    scaleX = window.innerWidth / 1920;
    scaleY = window.innerHeight / 956;
    scalePage(scaleX, scaleY);
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
// window.addEventListener("scroll", function (event) {
//   var scroll = this.scrollX;
//   console.log(scroll);
// });
onscroll = function (event) {
    move(blurbDiv, window.innerWidth * recipX * 0.05 + this.scrollX, window.outerHeight * recipY * 0.85);
};
// It won't scale, but it's good for now...
function staticify() {
    // window.scrollTo(0, 0);
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
var staticDynamic = function (e) {
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
var moveElements = function (e) {
    moveByPivot(e, contact);
    moveCanvi(e, canvi);
    moveCanvi(e, p5Canvi);
    moveByPivot(e, contact);
    moveByPivot(e, email);
    moveByPivot(e, resume);
};
// courtesy of
// https://stackoverflow.com/a/16779702
function getStyleSheetPropertyValue(selectorText, propertyName) {
    // search backwards because the last match is more likely the right one
    for (var s = document.styleSheets.length - 1; s >= 0; s--) {
        var cssRules = document.styleSheets[s].cssRules || document.styleSheets[s].rules || []; // IE support
        for (var c = 0; c < cssRules.length; c++) {
            if (cssRules[c].selectorText === selectorText)
                return cssRules[c].style[propertyName];
        }
    }
    return null;
}
