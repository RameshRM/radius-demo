'use strict';

const SuperAgent = require('superagent');

module.exports.act = act;

function act(options, next) {
  let urlPath = process.env.URL_PATH || 'http://localhost:8080/process';

  if (Date.now() % 13 === 0) {
    // console.log(options);
  }

  SuperAgent.post(urlPath).send(options).timeout(100).retry(0)
    .end(function(err, resp) {
      return next(undefined, {
        status: resp && resp.statusCode
      });
    });
}
