'use strict';

module.exports = function() {
  const mongoose = require('mongoose');
  let conn = mongoose.createConnection('mongodb://localhost:27017', {
    server: {
      poolSize: 50
    }
  }, function(err) {

  });

  return function() {

  };
}
