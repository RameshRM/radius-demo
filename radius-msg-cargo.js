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
  },100);
  cargo.drain(function() {

  });
  cargo.empty(function empty() {

  });
  cargo.error(function error(err) {

  });
  return cargo;
}
