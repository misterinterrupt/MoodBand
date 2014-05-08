var SerialPort = require("serialport").SerialPort;
// var serialPort = new SerialPort("/dev/tty.TinyBT-75D3-RNI-SPP", {
var serialPort = new SerialPort("/dev/tty.usbserial-A102JUY2", {
   baudrate: 57600
  }, true); // this is the openImmediately flag [default is true]

var headset = 'neurosky';
var demomode = false;

var http = require('http')
var net = require('net')
var serverIP = '10.0.1.86'
var socketIP = '127.0.0.1'
var serverPort = '80'
var socketPort = '13854'
var sockOpts = {
      host:socketIP,
      port:socketPort
    }
var sockAuth = {
      "appName": "MoodBand", 
      "appKey": "deadbeefdeadbeefdeadbeefdeadbeefdeadbeef"
    }
var sockParams = {
      "enableRawOutput": "true",
      "format": "Json"
    }
var sockBuffer = ""
                                                                                              
var onSocketData = function onSocketData(data) {
  console.log("onSOcketData Entered")
  var sockOptsString = JSON.stringify(sockParams);
  console.log(sockOptsString, Buffer.byteLength(sockOptsString, 'ascii'));
  var optsBuff = new Buffer(Buffer.byteLength(sockOptsString, 'ascii'));
  for(var j=0; j < sockOptsString.length; j++) {
    optsBuff.fill(sockOptsString.charAt(j), j);
  }
  console.log("optsBuff: ", optsBuff.toString('ascii', 0, optsBuff.length));
  socket.write(optsBuff, "ascii", function() { console.log("wrote optsBuff"); console.log(arguments);});

  var nextBuff = data.toString('ascii');
  var packets = (sockBuffer + nextBuff).split("\r");
  console.log(packets);
    
  console.log(sockAuthString, Buffer.byteLength(sockAuthString, 'ascii'));
  var authBuff = new Buffer(Buffer.byteLength(sockAuthString, 'ascii'));
    
  for(var i=0; i < packets.length; i++) {
    if((packets.length > 0) && (i === (packets.length - 1))) {
      sockBuffer = packets[i];
      console.log("next");
    }
      try {
	console.log(JSON.parse(packets[i]));
      } catch(e) {
	
      } 
    }
  }

var onSocketConnect = function onSocketConnect() {
  //'connect' listener
  console.log('sock sniffed');
  var sockAuthString = JSON.stringify(sockAuth);

  console.log(sockAuthString, Buffer.byteLength(sockAuthString, 'ascii'));
  
  var authBuff = new Buffer(Buffer.byteLength(sockAuthString, 'ascii'));

  console.log("authBuff: ", authBuff.toString('ascii', 0, authBuff.length));
    
  socket.write(authBuff, "ascii", function() { console.log("wrote authBuff"); console.log(arguments);});
  socket.on('data', onSocketData);
  }

var stateOfMind = {"attention": 0,
                   "meditation": 0, 
                   "bored": .5,
                   "frust": .25,
                   "med": .8,
                   "excite": .2};

function updateStateOfMind(json) {
  console.log("updateStateOfMind Entered")
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

function pixelsOff() {
  return [0,0,0,0,0,0,
          0,0,0,0,0,0,
          0,0,0,0,0,0,
          0,0,0,0,0,0,
          0,0,0,0,0,0,
          0,0,0,0,0,0]
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

  /* TODO
  no longer needed if we pass pixel colors right:
  console.log(dat);
  buf.writeUInt8(Math.floor(dat.bored*255.), 0);
  buf.writeUInt8(Math.floor(dat.frust*255.), 1);
  buf.writeUInt8(Math.floor(dat.med*255.), 2);
  buf.writeUInt8(Math.floor(dat.excite*255.), 3);
  console.log(buf);
  */

  return pixels;
}

var init = function () {
  console.log('serial port open at 57600');

  var options = {
    hostname: serverIP,
    port: 8080,
    path: '/neural',
    method: 'GET'
  };

var onReqData = function(chunk) {
  console.log("reqData Entered")
  var dat = JSON.parse(chunk);
  updateStateOfMind(dat);

  var rgbArray; // will be 36 long for the 12px face
  if (headset === 'neurosky') { //hardcoded at top
    rgbArray = pixelsFromMindwave();
  } else if (headset === 'emotiv') {
    rgbArray = pixelsFromEmotiv();
  } else if (headset == 'off') {
    rgbArray = pixelsOff();
  }

  var buf = new Buffer(36);
  for (var i = 0; i < 36; i++) {
    if (rgbArray[i]) {
  //        console.log("about to put " + rgbArray[i] + " in a buffer");
      buf.writeUInt8(rgbArray[i], i);
    } else {
  //        console.log("about to put " + 0 + " in a buffer");
      buf.writeUInt8(0, i);
    }
  }
  console.log(buf);

  // send serial data to arduino
  serialPort.write(buf, function(err, results) {
    console.log('BEAR err ' + err);
    console.log('results ' + results);
  });

  setTimeout(makeRequest, 50);
}

var reqCallback = function(res){
  console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  res.on('data', onReqData);
}

function constrain(a,n,x){
  return (a <= n ? n : (a >= x ? x : a));
}

function makeRequest() {
  console.log("makeRequest Entered")
  var req = http.request(options, reqCallback);

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });
  req.end();
  if(demomode) {
    onReqData(    "{\"attention\": " + constrain(stateOfMind.attention + (Math.random() <= 0.5 ? -0.05 : 0.05), 0.0, 0.75) + "," + 
		   "\"meditation\": " + constrain(stateOfMind.meditation + (Math.random() <= 0.5 ? -0.05 : 0.05), 0.0, 0.75) + "," + 
		   "\"bored\": " + constrain(stateOfMind.bored + (Math.random() <= 0.5 ? -0.05 : 0.05), 0.0, 0.75) + "," +
		   "\"frust\": " + constrain(stateOfMind.frust + (Math.random() <= 0.5 ? -0.05 : 0.05), 0.0, 0.75) + "," +
		   "\"med\": " + constrain(stateOfMind.med + (Math.random() <= 0.5 ? -0.05 : 0.05), 0.0, 0.75) + "," +
		   "\"excite\": " + constrain(stateOfMind.excite + (Math.random() <= 0.5 ? -0.05 : 0.05), 0.0, 0.75) + "}")
  }
}

  makeRequest();
};

serialPort.open(init, false);
