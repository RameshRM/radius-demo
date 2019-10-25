'use strict';
const DataStore = require('parental-ctrl-db');
const async = require('async');
const EntityModels = undefined;

module.exports = function(options) {
  let dbConn;
  return function(req, res, next) {
    if (dbConn) {
      req.ServerDb = dbConn.mongoose.conn;
      req.NativeServerDb = dbConn.native;

      req._db = {
        conn: dbConn.mongoose.conn,
        native: dbConn.native
      };
      return next();
    }
    async.parallel({
      native: native.bind(this),
      mongoose: function(next) {
        const ServerDb = require('parental-ctrl-db');
        ServerDb.setup({
          connection_string: process.env.CONNECTION_STRING || 'localhost:27017',

        }, function(err, result) {
          return next(undefined, {
            conn: ServerDb
          });

        });


      }
    }, function(err, result) {

      dbConn = result;
      req.ServerDb = result.mongoose.conn;
      req.NativeServerDb = result.native;
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
  const url = process.env.CONNECTION_STRING || 'mongodb://localhost:27017';

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
