//var SerialPort = require("serialport").SerialPort;
// var serialPort = new SerialPort("/dev/tty.TinyBT-75D3-RNI-SPP", {
//var serialPort = new SerialPort("/dev/tty.usbserial-A102JUY2", {
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
      "enableRawOutput": true,
      "format": "Json"
    },
    lastBuffer,
    nextBuffer;

var SYNC_BYTE = 0xaa,
    EXCODE_BYTE = 0x55,
    POOR_SIGNAL_BYTE = 0x02,
    ATTENTION_BYTE = 0x04,
    MEDITATION_BYTE = 0x05,
    BLINK_STRENGTH_BYTE = 0x16,
    RAW_EEG_BYTE = 0x80,
    ASIC_EEG_BYTE = 0x83;

  var processBuffer = function processBuffer(rawData) {
    
    console.log("processing");
    var rawEegTimeSent = (new Date()).getTime();
    var payLoadLength, packet, checkSum, checkSumExpected, parsedData, rawEeg, eegTick,
        payLoad, extendedCodeLevel, code, bytesParsed, dataLength, dataValue;

    for (var i = 0, l = rawData.length; i < l; i++) {
      console.log("rawData.length ", rawData.length + "\n");

      if (typeof rawData[i] === 'undefined' || typeof rawData[i+1] === 'undefined' || typeof rawData[i+2] === 'undefined') {
        return;
      }

      //console.log(rawData.readUInt8(i).toString(16) + " - " + rawData.readUInt8(i+1).toString(16) + " " + rawData.readUInt8(i+2).toString(16));

      payLoadLength = parseInt(socket.bytesRead, 10) - 5;
      console.log("iteration " + i + " with payLoadLength " + payLoadLength);

      if (rawData[i] === SYNC_BYTE && rawData[i+1] === SYNC_BYTE && payLoadLength < 170) {

        console.log("slicing packet at "+ i + "for " + (i + payLoadLength + 5));
        packet = rawData.slice(i, i + payLoadLength + 5);

        checkSumExpected = packet[packet.length - 1];
        payLoad = packet.slice(3, -1);
        checkSum = 0;
        payLoad = payLoad.toJSON();
        payLoad.forEach(function(e) { checkSum += e });
        checkSum &= 0xFF;
        checkSum = ~checkSum & 0xFF;

        // console.log('checkSum: ', checkSum);
        // console.log('checkSumExpected: ', checkSumExpected);

        if (true) {
          bytesParsed = 0;
          parsedData = {};
          while (bytesParsed < payLoadLength) {
            extendedCodeLevel = 0;
            while( payLoad[bytesParsed] === EXCODE_BYTE ) {
              extendedCodeLevel++; bytesParsed++;
            }
            code = payLoad[bytesParsed++];
            console.log("code: ", code.toString(16));
            dataLength = code & 0x80 ? payLoad[bytesParsed++] : 1;
            if (dataLength === 1) {
              dataValue = payLoad[bytesParsed];
            }
            else {
              dataValue = [];
              for(var j = 0; j < dataLength; j++ ) {
                dataValue.push(payLoad[bytesParsed + j]);
              }
            }
            bytesParsed += dataLength;

            console.log("dataValue: " + dataValue);
            
            if (extendedCodeLevel === 0) {
              switch (code) {
                case POOR_SIGNAL_BYTE:
                  parsedData.poorSignal = dataValue;
                  break;
                case ATTENTION_BYTE:
                  parsedData.attention = dataValue;
                  break;
                case MEDITATION_BYTE:
                  parsedData.meditation = dataValue;
                  break;
                case BLINK_STRENGTH_BYTE:
                  parsedData.blinkStrength = dataValue;
                  break;
                case RAW_EEG_BYTE:
                  eegTick = (new Date()).getTime()
                  if (eegTick - rawEegTimeSent > 200){
                    rawEegTimeSent = eegTick;
                    rawEeg = dataValue[0] * 256 + dataValue[1];
                    rawEeg = rawEeg >=32768 ? rawEeg - 65536 : rawEeg;
                    parsedData.rawEeg = rawEeg;
                  }
                  break;
                case ASIC_EEG_BYTE:
                  parsedData.delta = dataValue[0] * 256 * 256 + dataValue[1] * 256 + dataValue[2];
                  parsedData.theta = dataValue[3] * 256 * 256 + dataValue[4] * 256 + dataValue[5];
                  parsedData.lowAlpha = dataValue[6] * 256 * 256 + dataValue[7] * 256 + dataValue[8];
                  parsedData.highAlpha = dataValue[9] * 256 * 256 + dataValue[10] * 256 + dataValue[11];
                  parsedData.lowBeta = dataValue[12] * 256 * 256 + dataValue[13] * 256 + dataValue[14];
                  parsedData.highBeta = dataValue[15] * 256 * 256 + dataValue[16] * 256 + dataValue[17];
                  parsedData.lowGamma = dataValue[18] * 256 * 256 + dataValue[19] * 256 + dataValue[20];
                  parsedData.highGamma = dataValue[21] * 256 * 256 + dataValue[22] * 256 + dataValue[23];
                  break;
                default:
                  break;

              }
            }
          }

          if (Object.keys(parsedData).length) {
            console.log('data', parsedData);
          }

        }

        i = i + payLoadLength + 3;
      }

    }

  }

  var onSocketData = function onSocketData( data ) {

      // var sockOptsString = JSON.stringify(sockParams);
      // console.log(sockOptsString, sockOptsString.length);
      // var optsBuff = new Buffer(sockOptsString.length);
      // for(var k=0; k < sockOptsString.length; k++) {
      //   optsBuff[k]= sockOptsString.charCodeAt(k);
      // }
      // console.log("optsBuff: ", optsBuff);
      // socket.write(optsBuff);

      processBuffer(data);
      // // stuff to add to the last one or garbage
      // // stuff that is in the next one
      // var last2Sync = null;
      // for(var i=0; i < data.length; i++) {
      //   // console.log("data["+i+"] = ", data[i]);
      //   // console.log("data["+(i+1)+"] = ", data[i+1]);
      //   // console.log("SYNC_BYTE: ", SYNC_BYTE);
      //   // if we see a double sync
      //   if((data[i] === SYNC_BYTE) && (data[i+1] === SYNC_BYTE)) {
      //     last2Sync = i;
      //   }
      // }
      // console.log("last2Sync: " + last2Sync);

      // // if the last sync bytes were at the beginning, save the whole thing as the last buffer
      // if(last2Sync === 0) {
      //   lastBuffer = data;
      //   return;
      // }


      // // if there were no sync bytes, make one buffer and concat it to the last buffer
      // if(last2Sync === null) {
      //   lastBuffer = lastBuffer.concat(data);
      //   return;
      // }

      // // check if lastbuffer has a sync byte
      // if()

      // // make two or more buffers from splitting on any sync bytes
      // var splitskies = data.split(last2Sync);

      // // if there are 2 buffers, concat the first to the last buffer and parse it
      // console.log("splitskies: ", splitskies);

      // if(splitskies.length > 1) {
      //   for(var j=0; j<splitskies.length; j++) {
      //     if(j===0) {
      //       lastBuffer = lastBuffer.concat(splitskies[j]);
      //       processBuffer(lastBuffer);
      //     }
      //     // save the last one in the next buffer
      //     if(j===splitskies.length-1) {
      //       nextBuffer = splitskies[j];
      //     }
      //     // other (probably smaller) packets should be processed
      //     processBuffer(splitskies[j]);
      //   }
      // } else {
      //   processBuffer(splitskies[0]);
      // }
    },
    onSocketConnect = function onSocketConnect() {
      //'connect' listener
      console.log('sock sniffed / connected :: args :: ', arguments);
      // var sockAuthString = JSON.stringify(sockAuth);
      // console.log(sockAuthString, sockAuthString.length);
      // var authBuff = new Buffer(sockAuthString.length);
      // for(var i=0; i < sockAuthString.length; i++) {
      //   authBuff[i] = sockAuthString.charCodeAt(i);
      // }
      // console.log("authBuff: ", authBuff.toString('ascii', 0, authBuff.length));
      // socket.write(authBuff, "utf8", function() { console.log("wrote authBuff"); console.log(arguments);});
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
