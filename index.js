const cluster = require('cluster');
const cpuLength = require('os').cpus().length;
const http = require('http');

const express = require('express');

if (cluster.isMaster) {
  for (let i = 0; i < cpuLength; i++) {
    cluster.fork();
  }

} else {
  const server = express();

  server.listen(8080, function(err) {
    console.log('Server Running on Port ', 8080, err);
    require('./radius').setup();
  });

  server.get('/', function(req, res) {
    return res.send({
      hello: 'world',
      now: new Date(),
      headers: {
        req: req.headers
      }
    });
  });

  console.log('Server Started');
}
