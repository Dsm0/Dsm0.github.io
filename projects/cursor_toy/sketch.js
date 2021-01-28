const	w = window.innerWidth,
		h = window.innerHeight,
		centerX = w/2,
		centerY = h/2;
var mirrors = 2;
let pg, c, cursor, ah = false;


const min = 1

function preload(){
	cursor = loadImage("/assets/cursor2.svg");
}

function setup() {
  let c = createCanvas(w, h);
  pg = createGraphics(w, h);
  pg2 = createGraphics(w, h);

  pg.translate(centerX, centerY)
  pg2.translate(centerX, centerY)
}

function draw() {
  clear();
  image(pg, 0, 0, w, h);
  pg2.clear();
  let cX = mouseX - centerX,
      cY = mouseY - centerY;

  pg.push();
  pg2.push();
  for (i = 0; i < mirrors + 1; i++) {
    if (ah) {
	  pg.image(cursor,cX, cY,20,30)
      pg.rotate(2 * PI / mirrors);
    }
    pg2.image(cursor,cX, cY,20,30)
    pg2.rotate(2 * PI / mirrors);
  }
  pg.pop();
  pg2.pop();

  image(pg2, 0, 0, w, h);
}

function mouseWheel(e) {
  mirrors -= e.delta;
  if (mirrors < min) {
    mirrors = min;
  }
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
