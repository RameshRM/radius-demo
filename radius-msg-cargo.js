'use strict';

const Async = require('async');
const Cargo = buildCargo();

const msgActor = require('./radius-msg-actor');

function enqueue(msgPacket, next) {
  if (!msgPacket) {
    return;
  }
  if (next) {
    Cargo.push(msgPacket, next);
  } else {
    Cargo.push(msgPacket, function(err, resp) {

    });
  }
}


module.exports.enqueue = enqueue;

function buildCargo() {
  let cargo = Async.cargo(function(tasks, next) {

    return Async.mapLimit(tasks, 10, function(task, next) {
      return msgActor.act(task, next);
    }, next);
    return next();
  });
  cargo.drain(function() {
    console.log('Messages are complete and drained');
  });
  cargo.empty(function empty() {
    console.log('Messages are complete and empty');
  });
  cargo.error(function error(err) {
    console.log('Cargo has Errored ', err && err.message);
  });
  return cargo;
}
