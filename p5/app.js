//////////////////////////////////////////////////////////////////////////////
////////////////////////////////   D O M   ///////////////////////////////////
//////////////////////////////////////////////////////////////////////////////


// TRANSPORT CONTROLS
const playBtn = document.getElementById("play");
const stopBtn = document.getElementById("stop");

playBtn.addEventListener("click", () => {
	if (!song.isPlaying()){
		song.loop();
		hasBegunPlaying = true;
		quarterNoteCounter = 0;
		hitPlayTimestamp = Date.now();
	} else { return; }	
});

stopBtn.addEventListener("click", () => {
	song.stop();
	hasBegunPlaying = false;
	quarterNoteCounter = undefined; // re-set quarterNoteCounter to undefined to trigger default case in switch
	clear();
	background(0);
});

// SKETCH DESCRIPTION BOX

const sketchName = document.getElementById("demonstration__text--sketchName");
const sketchDescription = document.getElementById("demonstration__text--description");



//////////////////////////////////////////////////////////////////////////////
////////////////////////////    P5 MAIN    ///////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

p5.disableFriendlyErrors = true;

let canvasDiv, w, h, cnv;

let fft, amplitude, spectrum, waveform, volume, leftVol, rightVol, bass, mid, high, song;
let volEased = 0.001, leftVolEased = 0.001, rightVolEased = 0.001;
let hitPlayTimestamp, currentTime, ellapsedTime;
let modes = [];
let hasBegunPlaying = false;
let quarterNoteCounter = undefined;

function preload(){
	song = loadSound("../audio/song.mp3"); // 129 bpm
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

	// put modes to cycle through here
	// modes = [wave, spectrumBars, spec, mandala];
	// modes = [spectrumBars];

	modes = [{
		sketch: wave,
		name: "waveform",
		description: "this is a simple waveform"
	}, 
	{
		sketch: spectrumBars,
		name: "spectrum bars",
		description: "this sketch uses the spectrum to draw rectangles"
	},
	{
		sketch: spec,
		name: "spectrum",
		description: "this is a simple spectrum"
	},
	{
		sketch: mandala,
		name: "mandala",
		description: "this sketch uses audio properties to translate and color simple lines and dots into a mandala-like pattern"
	}
	]
}

function draw(){
	analyzeAudio();

	currentTime = Date.now();
	ellapsedTime = currentTime - hitPlayTimestamp;

	// magic num. 20 is 60fps = 16.667ms frametime rounded up to 20 (this seems janky but it seems to work pretty well?)
	if (hasBegunPlaying && ellapsedTime % bpmToMs(129) < 20) {
		quarterNoteCounter++; // re-enable to cycle through modes
		resetParams();
	}

	if (quarterNoteCounter >= modes.length){
		quarterNoteCounter = 0;
	}

	switch(quarterNoteCounter){
		case 0:
			modes[0].sketch();
		break;
		case 1:
			modes[1].sketch();
		break;
		case 2:
			modes[2].sketch();
		break;
		case 3:
			modes[3].sketch();
		break;
		default:
			runBoids();
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
	rightVol = amplitude.getLevel(1);

	bass = fft.getEnergy("bass");
	mid = fft.getEnergy("mid");
	high = fft.getEnergy("treble");

	smoother(volume, leftVol, rightVol, .5);
}

function smoother(volume, leftVol, rightVol, easing){
	let scaler = 1;

	let target = volume * scaler;
	let diff = target - volEased;
	volEased += diff * easing;

	let targetL = leftVol * scaler;
	let diffL = targetL - leftVolEased;
	leftVolEased += diffL * easing;

	let targetR = rightVol * scaler;
	let diffR = targetR - rightVolEased;
	rightVolEased += diffR * easing;
}

function bpmToMs(bpm) {
	return 60000 / bpm * 2; // 1/2 notes at given tempo
}

function resetParams(){
	clear(); // clear the canvas to make sure remnants of prior sketches don't remain
	rectMode(CORNER);
	background(0);
}

//////////////////////////////////////////////////////////////////////////////
////////////////////////////   B O I D S   ///////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

let flock = [];
let num_boids = 15;

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
////////////////////////////   SPECTRUM    ///////////////////////////////////
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
////////////////////////////   WAVEFORM    ///////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

function wave() {
	colorMode(RGB);
	fill(0, 100 - map(volume, 0, 1, 0, 100));
	noStroke();
	rect(0, 0, w, h);

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

//////////////////////////////////////////////////////////////////////////////
//////////////////////////   SPECTRUM BARS   /////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

function spectrumBars(){
	colorMode(RGB);
	rectMode(CENTER);
	background(255);
	noStroke();

	for (let i = 0; i < spectrum.length; i++){
		// let x = map(spectrum[i], 0, 255, 0, width);
		let y = map(spectrum[i], 0, 255, 0, height);
		fill(random(spectrum[i]));
		rect(width/2 - 500, y, 500, spectrum[i]);
		rect(width/2 + 500, y, 500, spectrum[i]);
	}
}

//////////////////////////////////////////////////////////////////////////////
////////////////////////////    MANDALA    ///////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

function mandala(){
	colorMode(HSB);
	background(255);
	translate(width/2, height/2);
	drawMandala(16, width*.45, .002);
	drawMandala(32, width*.35, -.004);
	drawMandala(64, width*.25, .008);
}

function drawMandala(segments, radius, rotationScale){
	let saturationScale = map(leftVolEased, 0, 1, 75, 100);
	let brightnessScale = map(rightVolEased, 0, 1, 50, 100);
	
	rotate(frameCount * rotationScale);

	for (let i = 0; i < segments; i++){
		rotate(TWO_PI / segments);

		strokeWeight(volEased*7);
		stroke(bass, saturationScale, brightnessScale);
		line(bass, radius*volEased, 0, radius);
		stroke(mid, saturationScale, brightnessScale);
		line(mid, radius*volEased, 0, radius);
		stroke(high, saturationScale, brightnessScale);
		line(high, radius*volEased, 0, radius);

		strokeWeight(volEased*75);
		stroke(map(volEased, 0, 1, 0, 255));
		point(0, radius);
		stroke(bass, saturationScale, brightnessScale);
		point(bass, radius*volEased);
		stroke(mid, saturationScale, brightnessScale);
		point(mid, radius*volEased);
		stroke(high, saturationScale, brightnessScale);
		point(high, radius*volEased);
	}
}