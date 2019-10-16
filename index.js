const cluster = require('cluster');
const os = require('os');
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

  server.get('/_stats', function(req, res) {
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    return res.send({
      memory: Math.round(used * 100) / 100,
      cpus: os.cpus()
    });
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
