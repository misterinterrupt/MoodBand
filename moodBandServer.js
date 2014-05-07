//var SerialPort = require("serialport").SerialPort;
// var serialPort = new SerialPort("/dev/tty.TinyBT-75D3-RNI-SPP", {
//var serialPort = new SerialPort("/dev/tty.usbserial-A102JUZE", {
//   baudrate: 57600
//  }, true); // this is the openImmediately flag [default is true]

var headset = 'neurosky';

var http = require('http'),
    net = require('net'),
    serverIP = '10.0.1.86',
    socketIP = '127.0.0.1',
    serverPort = '80',
    socketPort = '13854',
    sockOpts = {
      host:socketIP,
      port:socketPort
    },
    sockAuth = {
      "appName": "MoodBand", 
      "appKey": "deadbeefdeadbeefdeadbeefdeadbeefdeadbeef"
    },
    sockParams = {
      "enableRawOutput": false,
      "format": "Json"
    },
    sockBuffer = "";

  var processBuffer = function processBuffer() {

  }

  var onSocketData = function onSocketData(data) {

      var nextBuff = data.toString('ascii');
      var packets = (sockBuffer + nextBuff).split("\r");
      console.log(packets);
      for(var i=0; i < packets.length; i++){
        if(i === (packets.length - 1)) {
          sockBuffer = packets[i];
        } else {
          console.log(JSON.parse(packets[i]));
        }
      }
    },
    onSocketConnect = function onSocketConnect() {
      //'connect' listener
      console.log('sock sniffed');
      var sockAuthString = JSON.stringify(sockAuth),
          sockOptsString = JSON.stringify(sockOpts);


      console.log(sockAuthString, Buffer.byteLength(sockAuthString,  'ascii'));
      console.log(sockOptsString, Buffer.byteLength(sockOptsString,  'ascii'));
      
      var authBuff = new Buffer(Buffer.byteLength(sockAuthString, 'ascii'));
      var optsBuff = new Buffer(Buffer.byteLength(sockOptsString, 'ascii'));


      for(var i=0; i < sockAuthString.length; i++) {
        authBuff.fill(sockAuthString.charAt(i), i);
      }

      for(var j=0; j < sockOptsString.length; j++) {
        optsBuff.fill(sockOptsString.charAt(j), j);
      }

      console.log("authBuff: ", authBuff.toString('ascii', 0, authBuff.length));
      console.log("optsBuff: ", optsBuff.toString('ascii', 0, optsBuff.length));
      
      socket.write(authBuff, "ascii", function() { console.log("wrote authBuff"); console.log(arguments);});
      socket.write(optsBuff, "ascii", function() { console.log("wrote optsBuff"); console.log(arguments);});
      socket.on('data', onSocketData);
    };

  var socket = new net.connect(sockOpts, onSocketConnect);


var stateOfMind = {"attention": 0,
                   "meditation": 0, 
                   "bored": 0,
                   "frust": 0,
                   "med": 0,
                   "excite": 0};

function updateStateOfMind(json) {
  // All values vary over (0, 1)
  if (json.eSense.attention) {
    stateOfMind.attention = json.eSense.attention / 100;
  }
  if (json.eSense.meditation) {
    stateOfMind.meditation = json.eSense.meditation / 100;
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

  for (var i = 0; i < boredPx; i++) {
    pixels[i * 3] = 0;
    pixels[i * 3 + 1] = 255;
    pixels[i * 3 + 2] = 0;
  }
  for (var i = 0; i < frustPx; i++) {
    pixels[9 + i * 3] = 255;
    pixels[9 + i * 3 + 1] = 0;
    pixels[9 + i * 3 + 2] = 0;
  }
  for (var i = 0; i < medPx; i++) {
    pixels[18 + i * 3] = 0;
    pixels[18 + i * 3 + 1] = 0;
    pixels[18 + i * 3 + 2] = 255;
  }
  for (var i = 0; i < excitePx; i++) {
    pixels[27 + i * 3] = 127;
    pixels[27 + i * 3 + 1] = 127;
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
  allThePixelThings();

  var options = {
    hostname: serverIP,
    port: 8080,
    path: '/neural',
    method: 'GET'
  };


  var onReqData = function(chunk) {
    var dat = JSON.parse(chunk);
    updateStateOfMind(dat);

    var rgbArray; // will be 36 long for the 12px face
    if (headset === 'neurosky') { //hardcoded at top
      rgbArray = pixelsFromMindwave();
    } else if (headset === 'emotiv') {
      rgbArray = pixelsFromEmotiv();
    }

    var buf = new Buffer(36);
    for (var i = 0; i < 36; i++) {
      if (rgbArray[i]) {
        console.log("about to put " + rgbArray[i] + " in a buffer");
        buf.writeUInt8(rgbArray[i], i);
      } else {
        console.log("about to put " + 0 + " in a buffer");
        buf.writeUInt8(0, i);
      }
    }

    // send serial data to arduino
    serialPort.write(buf, function(err, results) {
      console.log('err ' + err);
      console.log('results ' + results);
    });

    setTimeout(makeRequest, 0);
  };

  var reqCallback = function(res){
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', onReqData);
  };

  function makeRequest() {
    var req = http.request(options, reqCallback);

    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });
    req.end();
  }

  // makeRequest();

};

//serialPort.open(init, false);
