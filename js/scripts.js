var mainText = document.getElementById("mover");

function move(moveme, x_pos, y_pos) {
    var d = document.getElementById(moveme);
    var newPosX = x_pos;
    var newPosY = y_pos;
    d.style.position = "absolute";
    d.style.left = newPosX+'px';
    d.style.top = newPosY+'px';

}


function removeAllChildren(id){
    var elem = document.getElementById(id);
    while (elem.firstChild != null) {
      elem.removeChild(elem.lastChild);
    }
  }

function moveText(e){
    var movr = document.getElementById("mover");
    var offsetX = window.innerWidth - movr.offsetWidth/2;
    var offsetY = window.innerHeight - movr.offsetHeight/2;
    move("mover",offsetX - e.clientX,offsetY - e.clientY);
}

function moveCanvas(e){
    var canv = document.getElementById("canvas");

    var offsetX = window.innerWidth - canv.width/2;
    var offsetY = window.innerHeight - canv.height/2;
    move("canvas",(offsetX - e.clientX)*3 ,offsetY - e.clientY)*3;
}

