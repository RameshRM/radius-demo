const cluster = require('cluster');
const os = require('os');
const cpuLength = require('os').cpus().length;
const http = require('http');
const shell = require('shelljs');
const async = require('async');
const superagent = require('superagent');

const express = require('express');

if (process.env.cluster === 'true') {
  if (cluster.isMaster) {
    for (let i = 0; i < cpuLength; i++) {
      cluster.fork();
    }

  } else {
    setup();
  }

} else {
  setup();

}


function setup() {
  const Metrics = require('./Metrics');
  const server = Metrics.App(express());
  const dataStore = require('./data-store');
  server.use(function(req, res, next) {
    res.set('X_PID', process.pid);
    return next();
  });
  server.use(dataStore({
    DB_CONN_STR: 'mongodb://localhost:27017'
  }));
  server.listen(8080, function(err) {
    console.log('Server Running on Port ', 8080, err);
    require('./radius').setup(process.pid, Metrics);
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

  server.get('/generate', function(req, res) {
    if (process.env.noop) {
      return superagent.post('http://localhost:8080/process').end(function(
        err, resp) {
        return res.send({
          status: resp && resp.statusCode
        });
      });
      // return res.send({
      //   status: 200
      // });

    }
    shell.exec(
      'radclient -c 100000 -n 10000 -f start.data 127.0.0.1 acct password -q', {
        silent: true,
        async: true
      },
      function() {
        return res.send({
          status: 200
        });
      });

  });
  server.post('/process', function(req, res) {

    let entityModel = req._db.models.Utils.tryGetSchemaModel('Fault',
      req._db.models.Utils.Schemas().FaultEntity, req._db.conn);
    return async.parallel({
      mongoose: function(next) {
        let start = Date.now();
        return next();
        return req._db.models.Utils.Query.find(entityModel, {
            type: 'http_status_code'
          },
          function(err, resp) {
            req.addSeries({
              status: 'mongoose'
            });

            return next(undefined, resp)
          });

      },
      native: function(next) {
        let start = Date.now();
        // if (!req._db.native) {
        //   return next();
        // }
        return req._db.native.collection('faults').find({
          type: 'http_status_code'
        }).next(function(err, docs) {
          req.addSeries({
            status: 'native'
          });
          return next();
        });
      }
    }, function() {
      return res.send({
        status: 200
      });
    });



  });

  console.log('Server Started');

}
