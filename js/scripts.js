var startDate = new Date();
var startTime = startDate.getTime();

// THIS FUNCTION CALCULATES THE SECONDS ELAPSED SINCE THE PAGE WAS LOADED
// https://www.webdeveloper.com/d/3153-how-much-time-has-elapsed-since-loading-this-web-page 

function seconds_elapsed ()
{
  var date_now = new Date ();
  var time_now = date_now.getTime ();
  var time_diff = time_now - startTime;
  var seconds_elapsed = Math.floor ( time_diff / 1000 );
  return ( seconds_elapsed ); 
}

function move(moveme, x_pos, y_pos) {
    moveme.style.left = x_pos+'px';
    moveme.style.top = y_pos+'px';
}

function moveElemBy(id,xoffset, yoffset){
  var movee = document.getElementById(id);
  var x0 = parseInt(movee.style.left);
  var y0 = parseInt(movee.style.top);
  console.log(x0,y0);
  move(movee,Math.abs(x0 - xoffset),Math.abs(y0 - yoffset));
}

function moveElemByMouse(e,id, pivotX, pivotY, xfactor=1,yfactor=1){
  var elem = document.getElementById(id);
  move(elem, pivotX + (pivotX - e.clientX)*xfactor,pivotY + (pivotY - e.clientY)*yfactor);
}