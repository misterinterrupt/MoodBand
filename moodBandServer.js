// var SerialPort = require("serialport").SerialPort
// var serialPort = new SerialPort("/dev/tty.TinyBT-75D3-RNI-SPP", {
//   baudrate: 57600
// }, true); // this is the openImmediately flag [default is true]

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
      "appKey": "MoodBand-FTW"
    },
    sockParams = {
      "enableRawOutput": true,
      "format": "Json"
    },
    sockBuffer = "",
    socket = new net.connect(sockOpts);

  var onSocketData = function onSocketConnect(data) {
      var nextBuff = data.toString('utf-8');
      sockBuffer += nextBuff;
      //var oneLine = processBuffer();
      console.log(nextBuff);
    },
    onSocketConnect = function onSocketConnect() {
      //'connect' listener
      console.log('sock sniffed');
      socket.write(JSON.stringify(sockAuth), "utf-8");
      socket.write(JSON.stringify(sockOpts), "utf-8");
      socket.on('data', onSocketData);
    };
  socket.on('connect', onSocketConnect);

var stateOfMind = {"attention": 0, 
                   "meditation": 0, 
                   "bored": 0,
                   "frust": 0,
                   "med": 0,
                   "excite": 0};

function updateStateOfMind(var json) {
  if (json.eSense.attention) {
    stateOfMind.attention = json.eSense.attention;
  }
  if (json.eSense.meditation) {
    stateOfMind.meditation = json.eSense.meditation;
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
  //pixel 0 shows the first pixel in the stack of attention pixels.
  //pixel 36
}

function pixelsFromEmotiv() {
  
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
    var dat = JSON.parse(chunk);
    var rgbArray = [];
    updateStateOfMind(dat);

    // TODO matty
    // if (data is coming from neurosky) {
    //   rgbArray = pixelsFromMindwave();
    // else if (data is coming from emotiv) {
    //   rgbArray = emotivBrainUpdate(dat);
    // }

    var buf = new Buffer(4);
    /* no longer needed if we pass pixel colors right:
    console.log(dat);
    buf.writeUInt8(Math.floor(dat.bored*255.), 0);
    buf.writeUInt8(Math.floor(dat.frust*255.), 1);
    buf.writeUInt8(Math.floor(dat.med*255.), 2);
    buf.writeUInt8(Math.floor(dat.excite*255.), 3);
    console.log(buf);
    */

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
