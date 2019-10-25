'use strict';

const radius = require('radius');
const dgram = require("dgram");
const secret = 'testing123';
const server = dgram.createSocket("udp4");

module.exports.setup = function setup(pid, Metrics) {

  const CargoProcessor = require('./radius-msg-cargo');

  server.on("message", function(msg, rinfo) {
    Metrics.addSeries({
      status: 'Stop',
      address: rinfo.address
    });

    var code, username, password, packet;
    packet = radius.decode({
      packet: msg,
      secret: secret

    });



    if (Date.now() % 13 === 0) {
      // console.log(packet);
    }

    console.log(packet.code);
    var response = radius.encode_response({
      packet: packet,
      code: 'Accounting-Response',
      secret: 'testing123'
    });

    server.send(response, 0, response.length, rinfo.port, rinfo.address,
      function(err, bytes) {

        if (err) {
          console.log('Error sending response to ', rinfo);
        }
        CargoProcessor.enqueue({
          id: Date.now(),
          packet: packet.attributes
        });
        Metrics.addSeries({
          status: 'Sent'
        });

      });

  });

  server.on("listening", function() {
    var address = server.address();
    console.log("radius server listening " + address.address + ":" +
      address.port);
  });

  server.bind(1813);

};
