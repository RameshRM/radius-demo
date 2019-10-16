'use strict';

const SuperAgent = require('superagent');

module.exports.act = act;

function act(options, next) {
  let urlPath = process.env.URL_PATH || 'http://localhost:3333';

  SuperAgent.post(urlPath).query(options).timeout(100).retry(2)
    .end(function(err, resp) {
      return next(undefined, {
        status: resp && resp.statusCode
      });
    });
}
