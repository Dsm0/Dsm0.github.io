var mainText = document.getElementById("mover");

function move(moveme, x_pos, y_pos) {
    // var d = document.getElementById(moveme);
    var newPosX = x_pos;
    var newPosY = y_pos;
    moveme.style.position = "absolute";
    moveme.style.left = newPosX+'px';
    moveme.style.top = newPosY+'px';

}

function moveElemBy(id,xoffset=0, yoffset=0, xfactor=1,yfactor=1){
  var movee = document.getElementById(id);
  var woffsetX = window.innerWidth - movee.offsetWidth/2;
  var woffsetY = window.innerHeight - movee.offsetHeight/2;
  move(movee,(woffsetX + xoffset)*xfactor,(woffsetY  + yoffset)*yfactor);
}

function moveElemByMouse(e,id,xoffset=0, yoffset=0, xfactor=1,yfactor=1){
  moveElemBy(id, (xoffset - e.clientX)*xfactor,(yoffset - e.clientY)*yfactor);
}

function checkerBoard(id,boardWidth,boardHeight,width=200,height=200){
  var c = document.getElementById(id);
  var cln = c.cloneNode(true);
  document.getElementById(id).appendChild(cln);
}

// function moveText(e){
//   moveElemBy(e,"mover",1,1);
// }

// function moveEmail(e){
//   moveElemBy(e,"email",1,1);
// }

// function moveCanvas(e){
//   moveElemBy(e,"canvas",2,1);
// }



// function removeAllChildren(id){
//     var elem = document.getElementById(id);
//     while (elem.firstChild != null) {
//       elem.removeChild(elem.lastChild);
//     }
//   }

// function moveText(e){
//     var movr = document.getElementById("mover");
//     var offsetX = window.innerWidth - movr.offsetWidth/2;
//     var offsetY = window.innerHeight - movr.offsetHeight/2;
//     move("mover",offsetX - e.clientX,offsetY - e.clientY);
// }

// function moveCanvas(e){
//     var canv = document.getElementById("canvas");
//     var offsetX = window.innerWidth - canv.width/2;
//     var offsetY = window.innerHeight - canv.height/2;
//     move(canv,(offsetX - e.clientX)*3 ,(offsetY - e.clientY)*3;
// }

