const	w = window.innerWidth,
		h = window.innerHeight,
		centerX = w/2,
		centerY = h/2;
var mirrors = 2, size = 20;
let pg, c, cursor, ah = false,ctrl=false;

const minMirrors = 2,
	maxMirrors = 100,
    minSize = 15,
	maxSize = 200;

function preload(){
	cursor = loadImage("/assets/cursor2.svg");
}

function setup() {
  c = createCanvas(w, h);
  pg = createGraphics(w, h);
  pg2 = createGraphics(w, h);

  pg.translate(centerX, centerY)
  pg2.translate(centerX, centerY)
pg2.noFill();
pg2.strokeWeight(2);
}

function draw() {
  pg2.clear();
  clear();
  image(pg, 0, 0, w, h);
  let cX = mouseX - centerX,
      cY = mouseY - centerY;

  pg.push();
  pg2.push();


  for (i = 0; i < mirrors + 1; i++) {
    if (ah) {
	  pg.image(cursor,cX, cY,size,size*1.5)
      pg.rotate(2 * PI / mirrors);
    }
    pg2.image(cursor,cX, cY,size,size*1.5)
    pg2.rotate(2 * PI / mirrors);
  }
  pg.pop();
  pg2.pop();

	if(ctrl){
	  pg2.circle(cX+size*0.25, cY+size*0.5,size*1.5)
	}

  image(pg2, 0, 0, w, h);

}

function value_limit(val, min, max) {
  return val < min ? min : (val > max ? max : val);
}

function mouseWheel(e) {
  mirrors = value_limit(mirrors+e.deltaX,minMirrors,maxMirrors);

  size = value_limit(size-e.deltaY,minSize,maxSize);
}

function mousePressed() {
  ah = true;
}

function mouseReleased() {
  ah = false;
}


function keyTyped(){
	console.log(key);
	switch(key){
		case " ":
			pg.clear();
			break;
	}
}

function keyPressed(){
	if(keyCode == 17){
		ctrl = true;
	}
}

function keyReleased(){
	if(keyCode == 17){
		ctrl = false;
	}
}
