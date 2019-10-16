'use strict';

const Assert = require('assert');

describe('Should work Cargo', function() {
  const CargoProcessor = require('../radius-msg-cargo');
  const AppServer = require('express')();
  this.timeout(20000);

  AppServer.get('/', function(req, res){
    console.log('Query',req.query);
  });

  AppServer.post('/', function(req, res){
    // console.log('Query',req.query);
  });

  before(function(done) {
    AppServer.listen(3333);
    done();
  });

  it('Should work with Cargo Tasks', function(done) {
    Assert.ok(true);
    Assert.ok(CargoProcessor);

    console.log(CargoProcessor);

    for(var i=0;i<1000000; i++){
      CargoProcessor.enqueue({
        id: Date.now(),
        dt: new Date()
      });
    }

    done();
  });
});
