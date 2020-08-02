var startDate = new Date();
var startTime = startDate.getTime();
// THIS FUNCTION CALCULATES THE SECONDS ELAPSED SINCE THE PAGE WAS LOADED
// https://www.webdeveloper.com/d/3153-how-much-time-has-elapsed-since-loading-this-web-page
var scaleX = window.innerWidth / 1920;
var scaleY = window.innerHeight / 956;
var recipX = 1 / scaleX;
var recipY = 1 / scaleY;
function seconds_elapsed() {
    var date_now = new Date();
    var time_now = date_now.getTime();
    var time_diff = time_now - startTime;
    var seconds_elapsed = Math.floor(time_diff / 1000);
    return seconds_elapsed;
}
function move(moveme, x_pos, y_pos) {
    moveme.style.left = parseFloat(x_pos) + "px";
    moveme.style.top = parseFloat(y_pos) + "px";
}
function scalePage(scalX, scalY) {
    var html = document.getElementsByTagName("html")[0];
    html.style.setProperty("--page-scaleX", scalX);
    html.style.setProperty("--page-scaleY", scalY);
}
function moveElemBy(id, xoffset, yoffset) {
    var movee = document.getElementById(id);
    var x0 = parseInt(movee.style.left);
    var y0 = parseInt(movee.style.top);
    move(movee, Math.abs(x0 - xoffset), Math.abs(y0 - yoffset));
}
function moveElemByMouse(e, id, pivotX, pivotY, xfactor, yfactor) {
    if (xfactor === void 0) { xfactor = 1; }
    if (yfactor === void 0) { yfactor = 1; }
    var elem = document.getElementById(id);
    move(elem, pivotX + (pivotX - e.clientX) * xfactor, pivotY + (pivotY - e.clientY) * yfactor);
}
function moveElemByMouseMax(e, id, pivotX, pivotY, xfactor, yfactor, maxX, maxY) {
    if (xfactor === void 0) { xfactor = 1; }
    if (yfactor === void 0) { yfactor = 1; }
    if (maxX === void 0) { maxX = centerX * recipX; }
    if (maxY === void 0) { maxY = centerY * recipY; }
    var elem = document.getElementById(id);
    var newX = pivotX + (pivotX - e.clientX) * xfactor;
    var newY = pivotY + (pivotY - e.clientY) * yfactor;
    move(elem, Math.min(newX, maxX), Math.min(newY, maxY));
}
function moveCanvi(e, canvi) {
    for (var i = 0; i < canvi.length; i++) {
        moveByPivot(e, canvi[i]);
    }
}
function moveByPivot(e, canv) {
    var pivotX = xpercentToFloat(canv.getAttribute("data-pivotX"));
    var pivotY = ypercentToFloat(canv.getAttribute("data-pivotY"));
    var xfactor = canv.getAttribute("data-xfactor");
    var yfactor = canv.getAttribute("data-yfactor");
    var newX = pivotX + (pivotX - e.clientX) * xfactor;
    var newY = pivotY + (pivotY - e.clientY) * yfactor;
    var maxX = canv.getAttribute("data-maxX") != null
        ? xpercentToFloat(canv.getAttribute("data-maxX"))
        : 0;
    var maxY = canv.getAttribute("data-maxY") != null
        ? ypercentToFloat(canv.getAttribute("data-maxY"))
        : 0;
    newX *= recipX;
    newY *= recipY;
    maxX *= recipX;
    maxY *= recipY;
    if (maxX) {
        newX = Math.min(newX, maxX);
    }
    if (maxY) {
        newY = Math.min(newY, maxY);
    }
    move(canv, newX, newY);
}
function xpercentToFloat(attr) {
    return window.innerWidth * (parseFloat(attr) / 100);
}
function ypercentToFloat(attr) {
    return window.innerHeight * (parseFloat(attr) / 100);
}
