'use strict';
const DataStore = require('app-manifest-store').DataStore;
const async = require('async');
const EntityModels = require('app-manifest-store').EntityModels;

module.exports = function(options) {
  let dbConn;
  return function(req, res, next) {
    if (dbConn) {
      req._db = {
        conn: dbConn.mongoose.conn,
        models: EntityModels,
        native: dbConn.native
      };
      return next();
    }
    async.parallel({
      native: native.bind(this),
      mongoose: function(next) {
        return getDbConnector(options, function(err, resp) {
          dbConn = resp;
          req._db = {
            conn: dbConn,
            models: EntityModels
          };
          return next(undefined, {
            conn: dbConn,
            models: EntityModels
          });
        });

      }
    }, function(err, result) {
      dbConn = result;
      return next();
    });
  }
};


function getDbConnector(options, callback) {
  return new DataStore({
    DB_CONN_STR: options.DB_CONN_STR
  }).connector({
    DB_CONN_STR: options.DB_CONN_STR
  }).call(this, options, callback);
  return dbConnectorFn(options, callback);
}


function native(next) {
  const MongoClient = require('mongodb').MongoClient;
  const assert = require('assert');

  // Connection URL
  const url = 'mongodb://localhost:27017';

  // Database Name
  const dbName = 'myproject';

  // Create a new MongoClient
  const client = new MongoClient(url, {
    poolSize: 50
  });
  // Use connect method to connect to the Server
  client.connect(function(err) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db('test');
    return next(undefined, db);

    const col = db.collection('faults');
    col.find({
      type: 'http_status_code'
    }).toArray(function(err, docs) {

    });

  });

}

// native(function() {
//
// });
