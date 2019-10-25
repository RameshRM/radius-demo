'use strict';

const Prometheus = require('prom-client');

const seriesCounter = new Prometheus.Counter({
  name: 'message',
  help: 'Number of messages ',
  labelNames: ['status', 'address']
});


/**
 * Enable metrics endpoint
 */
module.exports.addSeries = addSeries;

module.exports.App = function Metrics(App) {

  const httpRequestDurationMicroseconds = new Prometheus.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['route'],
    // buckets for response time from 0.1ms to 500ms
    buckets: [0.10, 5, 15, 50, 100, 200, 300, 400, 500]
  });

  const db_requestDuration = new Prometheus.Histogram({
    name: 'db_request',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['operation'],
    // buckets for response time from 0.1ms to 500ms
    buckets: [0.10, 5, 15, 50, 100, 200, 300, 400, 500]
  });

  App.get('/metrics', Handler);
  App.get('/admin/actuator/prometheus', Handler);
  App.use(function(req, res, next) {
    req._start = Date.now();
    req.addSeries = addSeries;
    req.dbDuration = function(label, timeInMs) {

      db_requestDuration
        .labels(label)
        .observe(timeInMs);
    };
    return next();
  });



  App.use(function(req, res, next) {
    var _send = res.send;

    res.send = function(data) {
      httpRequestDurationMicroseconds
        .labels(req.path)
        .observe(Date.now() - req._start);
      _send.apply(res, arguments);
    };

    return next();
  });

  return App;
};

function Handler(req, res) {
  res.set('Content-Type', Prometheus.register.contentType);
  res.end(Prometheus.register.metrics());
};


module.exports.StatusCodes = {
  ACCEPTED: 202,
  ERR: 500,
  OK: 200,
  CREATED: 201,
  NOCONTENT: 204

};

function tryGetGauge() {
  let gauge;

  return function() {
    if (gauge) {
      return gauge;
    } else {
      gauge = new Prometheus.Counter({
        name: 'mf_series',
        help: 'Total number of checkouts',
        labelNames: ['status', 'name', 'id', 'label']
      });
    }
    return gauge;
  };

}

function addSeries(args) {
  if (Date.now() % 13 === 0) {
    console.log(args);
  }

  seriesCounter.inc(args);

}
