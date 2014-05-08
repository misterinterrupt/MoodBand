//SETUP ENVIRONMENT SETENV
var SerialPort = require("serialport").SerialPort;
var serialPort = new SerialPort("/dev/tty.usbserial-A102JUY2", {
   baudrate: 57600
  }, true); // this is the openImmediately flag [default is true]
var TIMING_DELAY = 100
var headset = 'neurosky'

var stateOfMind = {"attention": 0,
                   "meditation": 0, 
                   "bored": 1,
                   "frust": 1,
                   "med": 1,
                   "excite": 0};

//MAIN FUNCTION MFE
function main() {
	console.log('serial port open at 57600');

	var dat = generateMoodChange()
	updateStateOfMind(dat)

	//calculate pixel values from moods
	var rgbArray; // will be 36 long for the 12px face
	if (headset === 'neurosky') { //hardcoded at top
	  rgbArray = pixelsFromMindwave();
	} else if (headset === 'emotiv') {
	  rgbArray = pixelsFromEmotiv();
	}
	//write array to buffer
	var buf = new Buffer(36);
	for (var i = 0; i < 36; i++) {
	  if (rgbArray[i]) {
	    // console.log("about to put " + rgbArray[i] + " in a buffer");
	    buf.writeUInt8(rgbArray[i], i);
	  } else {
	    // console.log("about to put " + 0 + " in a buffer");
	    buf.writeUInt8(0, i);
	  }

	// send serial data to arduino
	serialPort.write(buf, function(err, results) {
	  console.log('err ' + err);
	  console.log('results ' + results);
	});

    setTimeout(main, TIMING_DELAY);
}

function generateMoodChange(){
   var step_size = 0.02;
   var maxVal = 0.75
   var minVal = 0.0
   return "{\"attention\": " + constrain(stateOfMind.attention + (Math.random() <= 0.5 ? -step_size : step_size ), minVal, maxVal) + "," + 
                 "\"meditation\": " + constrain(stateOfMind.meditation + (Math.random() <= 0.5 ? -step_size : step_size ), minVal, maxVal) + "," + 
                 "\"bored\": " + constrain(stateOfMind.bored + (Math.random() <= 0.5 ? -step_size : step_size ), minVal, maxVal) + "," +
                 "\"frust\": " + constrain(stateOfMind.frust + (Math.random() <= 0.5 ? -step_size : step_size ), minVal, maxVal) + "," +
                 "\"med\": " + constrain(stateOfMind.med + (Math.random() <= 0.5 ? -step_size : step_size), minVal, maxVal) + "," +
                 "\"excite\": " + constrain(stateOfMind.excite + (Math.random() <= 0.5 ? -step_size : step_size ), minVal, maxVal) + "}"
}


function constrain(a,n,x){
	return (a <= n ? n : (a >= x ? x : a));
}




// HELPER FUNCTIONS
function updateStateOfMind(json) {
  // All values vary over (0, 1)
  if(json.eSense){
    if (json.eSense.attention) {
      stateOfMind.attention = json.eSense.attention / 100;
    }
    if (json.eSense.meditation) {
      stateOfMind.meditation = json.eSense.meditation / 100;
    }
  }
  if (json.bored) {
    stateOfMind.bored = json.bored;
  }
  if (json.frust) {
    stateOfMind.frust = json.frust;
  }
  if (json.med) {
    stateOfMind.med = json.med;
  }
  if (json.excite) {
    stateOfMind.excite = json.excite;
  }
}







function pixelsFromMindwave() {
  //pixel 0: first pixel in attention meter (px 15 is max)
  //pixel 35: first pixel in meditation meter (px 16 is max)
  //attention is yellow, meditation is blue
  //one pixel is always lit
  var pixels = [];
  var attentionPixels = 6 * stateOfMind.attention;
  var meditationPixels = 6 * stateOfMind.meditation;
  for (var i = 0; i < attentionPixels; i++) {
    pixels[i * 3] = 127;
    pixels[i * 3 + 1] = 127;
    pixels[i * 3 + 2] = 0;
  }
  for (var i = 0; i < meditationPixels; i++) {
    pixels[33 - i * 3] = 0;
    pixels[34 - i * 3] = 0;
    pixels[35 - i * 3] = 255;
  }
  return pixels;
}
function pixelsFromEmotiv() {
  var pixels = []
  var boredPx = 3 * stateOfMind.bored;
  var frustPx = 3 * stateOfMind.frust;
  var medPx = 3 * stateOfMind.med;
  var excitePx = 3 * stateOfMind.excite;

  for (var i = 0; i < 3; i++) {
    pixels[i * 3] = 0;
    pixels[i * 3 + 1] = Math.floor(Math.max(10, stateOfMind.bored * 255));
    pixels[i * 3 + 2] = 0;

    pixels[9 + i * 3] = Math.floor(Math.max(10, stateOfMind.frust * 255));
    pixels[9 + i * 3 + 1] = 0;
    pixels[9 + i * 3 + 2] = 0;

    pixels[18 + i * 3] = 0;
    pixels[18 + i * 3 + 1] = 0;
    pixels[18 + i * 3 + 2] = Math.floor(Math.max(10, stateOfMind.med * 255));
 
    pixels[27 + i * 3] = Math.floor(Math.max(5, (stateOfMind.excite * 255) / 2));
    pixels[27 + i * 3 + 1] = Math.floor(Math.max(5, (stateOfMind.excite * 255) / 2));
    pixels[27 + i * 3 + 2] = 0;
  }
}
