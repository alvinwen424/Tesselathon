// Any copyright is dedicated to the Public Domain.
// http://creativecommons.org/publicdomain/zero/1.0/

/*********************************************
This basic accelerometer example logs a stream
of x, y, and z data from the accelerometer
*********************************************/

var tessel = require('tessel');
var accel = require('accel-mma84').use(tessel.port['A']);
var path = require('path');
var av = require('tessel-av');
var mp3 = path.join(__dirname, 'cassio.mp3');
var os = require('os');
var enableDestroy = require('server-destroy');
var http = require('http');
var port = 8000;
var camera = new av.Camera();
var sound = new av.Player(mp3);

// Initialize the accelerometer.
accel.on('ready', function () {
  console.log('ready')
  var off = true;
  var nopicture = true;
  var server;
  // Stream accelerometer data
  accel.on('data', function (xyz) {
    if (xyz[2] > .40 && off) {
      if (server) {
      //enableDestroy(server)
      server.close();
    };
      off = false;
      tessel.led[2].on();
      tessel.led[3].on();
      console.log('above thhreshold')
      sound.play();


      //if(nopicture){
      server = http.createServer((request, response) => {
        response.writeHead(200, {
          'Content-Type': 'image/jpg'
        });

        camera.capture().pipe(response);

      })
      server.listen(port, () => console.log(`http://${os.hostname()}.local:${port}`));

      setTimeout(function () {
        tessel.led[2].off();
        tessel.led[3].off();
        console.log('awaiting response');

        off = true;
      }, 2000)
    }


    // 'x:', xyz[0].toFixed(2),
    // 'y:', xyz[1].toFixed(2),
    // 'z:', xyz[2].toFixed(2)
  });

});

accel.on('error', function (err) {
  console.log('Error:', err);
});