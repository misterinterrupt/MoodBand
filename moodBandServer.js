var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("/dev/tty.usbserial-A102JUZE", {
  baudrate: 57600
}, true); // this is the openImmediately flag [default is true]



var init = function () {
  console.log('serial port open at 57600');

  var http = require('http');

  var serverIP = '10.0.1.86';

  var options = {
    hostname: serverIP,
    port: 8080,
    path: '/neural',
    method: 'GET'
  };
  var i = 0.0

  var onReqData = function(chunk) {
    var dat = JSON.parse(chunk);
    dat.bored = ((i+= 0.1)%1);
    dat.frust = ((i+= 0.1)%1);
    dat.med = ((i+= 0.1)%1);
    dat.excite = ((i+= 0.1)%1);
    console.log(dat);
    var buf = new Buffer(4);
    buf.writeUInt8(Math.floor(dat.bored*255.), 0);
    buf.writeUInt8(Math.floor(dat.frust*255.), 1);
    buf.writeUInt8(Math.floor(dat.med*255.), 2);
    buf.writeUInt8(Math.floor(dat.excite*255.), 3);
    console.log(buf);

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

  makeRequest();

};

serialPort.open(init, false);
