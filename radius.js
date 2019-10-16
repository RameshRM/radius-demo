'use strict';

const radius = require('radius');
const dgram = require("dgram");
const secret = 'radius_secret';
const server = dgram.createSocket("udp4");

module.exports.setup = function setup(workers) {

  const CargoProcessor = require('./radius-msg-cargo');

  server.on("message", function(msg, rinfo) {
    var code, username, password, packet;
    packet = radius.decode({
      packet: msg,
      secret: secret
    });

    if (packet.code != 'Access-Request') {
      console.log('unknown packet type: ', packet.code);
      return;
    }

    username = packet.attributes['User-Name'];
    password = packet.attributes['User-Password'];

    if (username == 'jlpicard' && password == 'beverly123') {
      code = 'Access-Accept';
    } else {
      code = 'Access-Reject';
    }

    var response = radius.encode_response({
      packet: packet,
      code: code,
      secret: secret
    });

    server.send(response, 0, response.length, rinfo.port, rinfo.address,
      function(err, bytes) {

        if (err) {
          console.log('Error sending response to ', rinfo);
        }
      });

    CargoProcessor.enqueue({
      id: Date.now(),
      packet: packet
    });
  });

  server.on("listening", function() {
    var address = server.address();
    console.log("radius server listening " + address.address + ":" +
      address.port);
  });

  server.bind(1813);

};
