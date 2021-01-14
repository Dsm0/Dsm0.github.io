let startDate = new Date();
let startTime = startDate.getTime();
// THIS FUNCTION CALCULATES THE SECONDS ELAPSED SINCE THE PAGE WAS LOADED
// https://www.webdeveloper.com/d/3153-how-much-time-has-elapsed-since-loading-this-web-page
let scaleX = window.innerWidth / 1920;
let scaleY = window.innerHeight / 956;
let recipX = 1 / scaleX;
let recipY = 1 / scaleY;
function seconds_elapsed() {
    let date_now = new Date();
    let time_now = date_now.getTime();
    let time_diff = time_now - startTime;
    let seconds_elapsed = Math.floor(time_diff / 1000);
    return seconds_elapsed;
}
function move(moveme, x_pos, y_pos) {
    moveme.style.left = parseFloat(x_pos) + "px";
    moveme.style.top = parseFloat(y_pos) + "px";
}
function moveElemBy(id, xoffset, yoffset) {
    let movee = document.getElementById(id);
    let x0 = parseInt(movee.style.left);
    let y0 = parseInt(movee.style.top);
    move(movee, Math.abs(x0 - xoffset), Math.abs(y0 - yoffset));
}
function moveElemByMouse(e, id, pivotX, pivotY, xfactor = 1, yfactor = 1) {
    let elem = document.getElementById(id);
    move(elem, pivotX + (pivotX - e.clientX) * xfactor, pivotY + (pivotY - e.clientY) * yfactor);
}
function moveElemByMouseMax(e, id, pivotX, pivotY, xfactor = 1, yfactor = 1, maxX = centerX * recipX, maxY = centerY * recipY) {
    let elem = document.getElementById(id);
    let newX = pivotX + (pivotX - e.clientX) * xfactor;
    let newY = pivotY + (pivotY - e.clientY) * yfactor;
    move(elem, Math.min(newX, maxX), Math.min(newY, maxY));
}
function moveCanvi(e, canvi) {
    for (var i = 0; i < canvi.length; i++) {
        moveByPivot(e, canvi[i]);
    }
}
function moveByPivot(e, canv) {
    let pivotX = xpercentToFloat(canv.getAttribute("data-pivotX"));
    let pivotY = ypercentToFloat(canv.getAttribute("data-pivotY"));
    let canvi = 6;
    let xfactor = 2.5;
    // canv.getAttribute("data-xfactor");
    let yfactor = 1;
    // canv.getAttribute("data-yfactor");
    let newX = pivotX + (pivotX - e.clientX) * xfactor;
    let newY = pivotY + (pivotY - e.clientY) * yfactor;
    let maxX = canv.getAttribute("data-maxX") != null
        ? xpercentToFloat(canv.getAttribute("data-maxX"))
        : 0;
    let maxY = canv.getAttribute("data-maxY") != null
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
