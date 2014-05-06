var SerialPort = require("serialport").SerialPort;
var serialPort = new SerialPort("/dev/cu.usbserial-A102JUZE", {
  baudrate: 57600
});


serialPort.on("open", function () {
  console.log('open');

  serialPort.on('data', function(data) {
//    console.log('data received: ' + data);
  });

  serialPort.write('255', function(err, results) {
    console.log('err ' + err);
    console.log('results ' + results);
  });
});

var colorVals = [0x00,0x20,0x80,0xFF];

var buf = new Buffer(4);
buf.writeUInt8(colorVals[0],0);
buf.writeUInt8(colorVals[1],1);
buf.writeUInt8(colorVals[2],2);
buf.writeUInt8(colorVals[3],3);
serialPort.write(buf);

// test function doesn't work yet
/*
function colorSpin(colorVals)
{
var buf = new Buffer(4);
buf.writeUInt8(colorVals[0],0);
buf.writeUInt8(colorVals[1],1);
buf.writeUInt8(colorVals[2],2);
buf.writeUInt8(colorVals[3],3);

var temp = colorVals(0);
colorVals[0] = colorVals[1];
colorVals[1] = colorVals[2];
colorVals[2] = colorVals[3];
colorVals[3] = temp;
serialPort.write(buf);
return colorVals;
}
*/
