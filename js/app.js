//////////////////////////////////////////////////////////////////////////////
////////////////////////////////   D O M   ///////////////////////////////////
//////////////////////////////////////////////////////////////////////////////


// TRANSPORT CONTROLS
const playBtn = document.getElementById("play");
const stopBtn = document.getElementById("stop");
const descriptionBox = document.getElementsByClassName("demonstration");

playBtn.addEventListener("click", () => {
	if (!song.isPlaying()){
		song.loop();
		hasBegunPlaying = true;
		beatCounter = -1;
		hitPlayTimestamp = Date.now();
		descriptionBox[0].style.opacity = 0;
	} else { return; }	
});

stopBtn.addEventListener("click", () => {
	song.stop();
	hasBegunPlaying = false;
	beatCounter = undefined; // re-set beatCounter to undefined to trigger default case in switch
	clear();
	background(0);
	descriptionBox[0].style.opacity = 1;
});

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
let beatCounter = undefined;
let img;
let pastBuffer, padding, barWidth;

function preload(){
	// song = loadSound("../audio/song.mp3"); // 129 bpm
	song = loadSound("https://raw.githubusercontent.com/agohorel/aleph-site/master/audio/song.mp3"); // 129 bpm
}

function setup(){
	canvasDiv = document.getElementById("p5-container");
	pixelDensity(1); // force 1:1 pixel density on high DPI screens (mobile)
	w = canvasDiv.offsetWidth;
	h = canvasDiv.offsetHeight;
	cnv = createCanvas(w, h);
	cnv.parent('p5-container');
	background(0);

	amplitude = new p5.Amplitude();
	fft = new p5.FFT();

	// put modes to cycle through here (this determines the order)
	modes = [wave, spectrumBars, mandala, spec];
	// modes = [spectrumBars];

	analyzeAudio(); // run initially so spectrum.length, etc. is not undefined
	img = createImage(spectrum.length, 1);

	pastBuffer = new Array(40);
	padding = 1;
	barWidth = width / (pastBuffer.length * padding);
}

function draw(){
	analyzeAudio();

	currentTime = Date.now();
	ellapsedTime = currentTime - hitPlayTimestamp;

	// magic num 17 = target 60fps frametime (16.67) rounded up
	if (hasBegunPlaying && ellapsedTime % bpmToMs(129) < 17) {
		beatCounter++; // re-enable to cycle through modes
		resetParams();
		
		if (beatCounter >= modes.length){
			beatCounter = 0;
		}	
	}

	switch(beatCounter){
		case 0:
			modes[0]();
		break;
		case 1:
			modes[1]();
		break;
		case 2:
			modes[2]();
		break;
		case 3:
			modes[3]();
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
	return 60000 / bpm * 4; // whole notes at given tempo
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

function spec() {
	colorMode(HSB);
	background(0);
	noStroke();
	
	for (let i = 0; i < spectrum.length; i++){
		let hue = map(bass, 0, 255, 80, 200), 
			s = map(mid, 0, 255, 75, 100), 
			b = map(high, 0, 255, 50, 100);

		let x = map(i, 0, spectrum.length, 0, width*5);
	    let h = -height + map(spectrum[i], 0, 255, height, 0);

	    // make background tiles wider/sparser
	    if (i % 12 === 0){
	    	fill(hue-i*.125, s+i*.125, b-i*.25);
			rect(x, 0, width/spectrum.length*60+2, height);
	    }

	    // draw spectrum
	    fill(0, 0, map(volEased, 0, .5, 0, 100));
	    rect(x, height, width/spectrum.length*3, h);
	    
	}
}

//////////////////////////////////////////////////////////////////////////////
////////////////////////////   WAVEFORM    ///////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

function wave() {
	colorMode(HSB);
	background(0);
	noStroke();

	pastBuffer.splice(0, 1); // remove first volume entry
	pastBuffer.push(volume); // replace with new value

	for (let i = 0; i < pastBuffer.length; i++){
		let x = map(i, 0, pastBuffer.length, width, width/2);
		let barHeight = map(pastBuffer[i], 0, 1, 0, -height);
		let rainbow = map(i, 0, pastBuffer.length, 180, 360);
		let volScaled = map(volEased, 0, .5, 0, 100);
		
		fill(rainbow, 25 + volScaled, volScaled);
		
		// left bottom rects
		rect(x, height/2, barWidth*volEased, barHeight*(volEased*2));
		rect(x, height/2, barWidth*volEased, -barHeight*(volEased*2));

		// right bottom rects
		rect(width-x, height/2, barWidth*volEased, barHeight*(volEased*2));
		rect(width-x, height/2, barWidth*volEased, -barHeight*(volEased*2));

		push();
		colorMode(RGB);
		fill(75 - volScaled, volScaled*10);
		// left top rects
		rect(x, height/2, barWidth*volEased, barHeight*volEased);
		rect(x, height/2, barWidth*volEased, -barHeight*volEased);
		// right top rects
		rect(width-x, height/2, barWidth*volEased, barHeight*volEased);
		rect(width-x, height/2, barWidth*volEased, -barHeight*volEased);
		pop();
	}

}

//////////////////////////////////////////////////////////////////////////////
//////////////////////////   SPECTRUM BARS   /////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

function spectrumBars(){
	colorMode(RGB);
	noStroke();
	fill(0, 75 - map(volume, 0, 1, 0, 255));
	rect(0, 0, width, height);

	// only copy pixels every other frame
	if (frameCount % 2 === 0){
		// only copy first row of pixels (all subsequent rows are the same anyway)
		copy(0, 0, width, 1, -20, 0, width + 40, height);
	}
	
	img.loadPixels();

	for (let i = 0; i < spectrum.length; i+=4){
		let waveformScaled = map(waveform[i], -1, 1, 0, 255);
		let gradient = map(i, 0, spectrum.length, 0, 50);
		let waveformSpectrumAvg = spectrum[i] + (waveformScaled * 2) / 3;
		let bassScale = map(bass, 0, 255, 0, 1.5);
		let midScale = map(mid, 0, 255, 0, .25);
		let highScale = map(high, 0, 255, 0, 50);

		img.pixels[i] = red(waveformSpectrumAvg * bassScale + gradient - 50);
		img.pixels[i+1] = green(waveformSpectrumAvg * midScale);
		img.pixels[i+2] = blue(waveformSpectrumAvg * highScale);
		img.pixels[i+3] = alpha(waveformSpectrumAvg);
	}

	img.updatePixels();
	image(img, width/6, 0, width, height);

	push();
	translate(width - width/6, height);
	rotate(radians(180));
	image(img, 0, 0, width, height);
	pop();
}

//////////////////////////////////////////////////////////////////////////////
////////////////////////////    MANDALA    ///////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

function mandala(){
	colorMode(HSB);
	background(0);
	translate(width/2, height/2);
	drawMandala(16, width*.45, .002);
	drawMandala(20, width*.35, -.004);
	drawMandala(28, width*.25, .008);
}

function drawMandala(segments, radius, rotationScale){
	let saturationScale = map(leftVolEased, 0, 1, 75, 100);
	let brightnessScale = map(rightVolEased, 0, 1, 50, 100);
	
	rotate(frameCount * rotationScale);

	for (let i = 0; i < segments; i++){
		rotate(TWO_PI / segments);

		strokeWeight(volEased * width * .004);
		stroke(bass, saturationScale, brightnessScale);
		line(bass, radius*volEased, 0, radius);
		stroke(mid+50, saturationScale, brightnessScale);
		line(mid, radius*volEased, 0, radius);
		stroke(high-50, saturationScale, brightnessScale);
		line(high, radius*volEased, 0, radius);

		strokeWeight(volEased * width * .03);
		stroke(map(volEased, 0, 1, 0, 255));
		point(0, radius);
		stroke(bass, saturationScale, brightnessScale);
		point(bass, radius*volEased);
		stroke(mid+50, saturationScale, brightnessScale);
		point(mid, radius*volEased);
		stroke(high-50, saturationScale, brightnessScale);
		point(high, radius*volEased);
	}
}