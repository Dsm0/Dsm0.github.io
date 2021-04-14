const w = window.innerWidth,
	h = window.innerHeight,
	centerX = w / 2,
	centerY = h / 2;

var mirrors = 2,
	size = 20;
let pg,
	c,
	cursor,
	mouseDown = false,
	ctrl = false,
	shift = false,
	tX = 0,
	tY = 0;

const minMirrors = 2,
	maxMirrors = 100,
	minSize = 15,
	maxSize = 200;

function preload() {
	cursor = loadImage("/assets/cursor2.svg");
}

function setup() {
	c = createCanvas(w, h);
	pg = createGraphics(w, h);
	pg2 = createGraphics(w, h);

	pg.translate(centerX, centerY);
	pg2.translate(centerX, centerY);
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
	if (shift) {
		pg.translate(tX, tY);
		pg2.translate(tX, tY);
		pg2.circle(0,0,5);
	}
	if (ctrl) {
		pg2.circle(cX + size * 0.25, cY + size * 0.5, size * 1.5);
	}
	for (i = 0; i < mirrors + 1; i++) {
		if (mouseDown) {
			pg.image(cursor, cX, cY, size, size * 1.5);
			pg.rotate((2 * PI) / mirrors);
		}
		pg2.image(cursor, cX, cY, size, size * 1.5);
		pg2.rotate((2 * PI) / mirrors);
	}


	pg.pop();
	pg2.pop();



	image(pg2, 0, 0, w, h);
}

function value_limit(val, min, max) {
	return val < min ? min : val > max ? max : val;
}

function mouseWheel(e) {
	mirrors = value_limit(mirrors + e.deltaX, minMirrors, maxMirrors);

	size = value_limit(size - e.deltaY, minSize, maxSize);
}

function mousePressed() {
	mouseDown = true;
}

function mouseReleased() {
	mouseDown = false;
}

function keyTyped() {
	switch (key) {
		case " ":
			pg.clear();
			tX = 0;
			tY = 0;
			break;
	}
}

function keyPressed() {
	switch (keyCode) {
		case 17:
			ctrl = true;
			break;
		case 16:
			shift = true;
			let cX = mouseX - centerX,
				cY = mouseY - centerY;
			tX = cX;
			tY = cY;
			break;
	}
}

function keyReleased() {
	switch (keyCode) {
		case 17:
			ctrl = false;
			break;
		case 16:
			shift = false;
			tX = 0;
			tY = 0;
			break;
	}
}
