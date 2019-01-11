const playBtn = document.getElementById("play");
const stopBtn = document.getElementById("stop");

playBtn.addEventListener("click", () => {
	song.loop();
});

stopBtn.addEventListener("click", () => {
	song.stop();
});

//////////////////////////////////////////////////////////////////////////////

p5.disableFriendlyErrors = true;

let canvasDiv, w, h, cnv;

let fft, amplitude, spectrum, waveform, volume, leftVol, rightVol, bass, mid, high, song;
let mode = "boids";

let flock = [];
let num_boids = 15;

function preload(){
	song = loadSound("../audio/song.mp3");
}

function setup(){
	canvasDiv = document.getElementById("p5-container");
	w = canvasDiv.offsetWidth;
	h = canvasDiv.offsetHeight;
	cnv = createCanvas(w, h);
	cnv.parent('p5-container');
	background(0);

	amplitude = new p5.Amplitude();
	fft = new p5.FFT();
}

function draw(){
	analyzeAudio();

	switch(mode){
		case "boids":
			runBoids();
		break;
		case "spectrum":
			spec();
		break;
		case "waveform":
			wave();
		break;
	}
}

function windowResized() {
	w = canvasDiv.offsetWidth;
	h = canvasDiv.offsetHeight;
	resizeCanvas(w, h);
	background(0);
}

function analyzeAudio(){
	spectrum = fft.analyze();
	waveform = fft.waveform(512);

	volume = amplitude.getLevel();
	leftVol = amplitude.getLevel(0);
	leftVol = amplitude.getLevel(1);

	bass = fft.getEnergy("bass");
	mid = fft.getEnergy("mid");
	high = fft.getEnergy("treble");
}

//////////////////////////////////////////////////////////////////////////////

function runBoids(){
	colorMode(HSB);

	if (flock.length < num_boids && frameCount % 2 === 0){
		flock.push(new Boid());
	}

	for (let boid of flock){
		boid.update();
		boid.edges();
		boid.lines(flock);
	}
}

class Boid {
	constructor(){
		this.position = createVector(random(width), random(height));
		this.radius = random(3, 6);
		this.hue = random(0, 180);
		this.saturation = random(0, 100);
		this.brightness = random(0, 100);
		this.velocity = p5.Vector.random2D();
		this.velocity.setMag(random(.01, 5));
		this.acceleration = createVector();
		this.maxSpeed = 10;
		this.perception = random(25, width/3);
		this.thickness = random(this.radius*.15, this.radius*.5);
		this.getsBrighter = true;
		this.getsBigger = true;
		this.maxRadius = random(6, 12);
		this.minRadius = random(1, 3);
	}

	edges(){
		if (this.position.x > width + this.radius){
			this.position.x = 0;
		} else if (this.position.x < -this.radius){
			this.position.x = width;
		}

		if (this.position.y > height + this.radius){
			this.position.y = 0;
		} else if (this.position.y < -this.radius){
			this.position.y = height;
		}
	}

	lines(boids){
		stroke(osc(this.hue, 360), osc(this.saturation, 100), osc(this.brightness, 100), osc(this.hue, 100));
		strokeWeight(this.thickness);
		let perceptionRadius = this.perception;
		for (let other of boids){
			let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
			// check if surrounding boids are within "perceivable" range and that "other" is not "me"/"this"
			if (d < perceptionRadius && d > perceptionRadius*.75 && other != this){
				rotate(radians(osc(this.hue), 360));
				line(this.position.x, this.position.y, other.position.x, other.position.y);
			}
		}
	}

	update(){
		this.position.add(this.velocity);
		this.velocity.add(this.acceleration);
		this.velocity.limit(this.maxSpeed);
		this.acceleration.set(0, 0); // reset acceleration after each update
		this.radius = osc(this.hue, 2);
		this.thickness = this.radius*.5;
		this.hue += .0001;
		this.saturation += random(.001, 1);
		this.brightness += random(.001, 1);
	}
}

function osc(angle, scalar){
	return abs(sin(radians(angle)) * scalar);
}

//////////////////////////////////////////////////////////////////////////////

function spec(){ 
	let r = bass, g = mid, b = high;
	background(0);
	noStroke();
	fill(r, g, b);
	 
	for (let i = 0; i < spectrum.length; i++){
		let x = map(i, 0, spectrum.length, 0, width*4);
	    let h = -height + map(spectrum[i], 0, 255, height, 0);
	    rect(x, height, width / spectrum.length*4, h);
	}
}

//////////////////////////////////////////////////////////////////////////////

let hasSwitchedDensity = false;

function wave() {
	if (!hasSwitchedDensity){
		pixelDensity(.5);
		background(0); // fixes white flash
		hasSwitchedDensity = true;	
	}
	
	colorMode(RGB);
	fill(0, 100 - map(volume, 0, 1, 0, 100));
	noStroke();
	rect(0, 0, w, h);

	if (frameCount % 2 === 0){
		copy(0, 0, w, h, -int(volume * 100), 0, w + int((volume * 200)), h);
	}
		
	colorMode(HSB);
	noFill();
	beginShape();
	stroke(bass, mid, high*1.25);
	strokeWeight(volume * 50);

	for (let i = 0; i< waveform.length; i++){
		let x = map(i, 0, waveform.length, 0, width);
		let y = map(waveform[i], -1, 1, 0, height);
		vertex(x,y);
	}
	endShape();
}