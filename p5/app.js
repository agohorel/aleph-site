let canvasDiv;
let cnv;

function setup(){
	canvasDiv = document.getElementById("p5-container");
	let w = canvasDiv.offsetWidth;
	let h = canvasDiv.offsetHeight;
	cnv = createCanvas(w, h);
	cnv.parent('p5-container');
}

function draw(){
	background(0);
	fill(255, 0, 0);
	rect(mouseX, mouseY, 50, 50);
}

function windowResized() {
	w = canvasDiv.offsetWidth;
	h = canvasDiv.offsetHeight;
	resizeCanvas(w, h);
}