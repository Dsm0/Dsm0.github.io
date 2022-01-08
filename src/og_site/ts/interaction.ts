declare var p5: any; // stupid fix for "Cannot find name 'p5'"

const blurbDiv = document.getElementById("blurb");

const p5Canvi: HTMLCollectionOf<Element> = document.getElementsByClassName(
  "p5Canvas"
);

function initP5(p5Obj) {
  var div = document.getElementById(p5Obj.divId);
  console.log("AHHHHHHH")
  div.setAttribute("data-blurb", p5Obj.blurb);
  return new p5(p5Obj.sketch);
}

var initScripts = function (e) {
  let loadedP5s = p5Objs.map(initP5);

  for (var i = 0; i < p5Canvi.length; i++) {
    const p5Canv = <HTMLCanvasElement>p5Canvi[i];
    p5Canv.onmouseover = (_) => {
        blurbDiv.innerHTML = p5Canv.getAttribute("data-blurb");
    };
    p5Canv.onmouseleave = (_) => {
      blurbDiv.innerHTML = "";
    };
  }

  window.scrollTo(0, 0);

};
