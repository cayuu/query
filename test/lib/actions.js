var query = require('../../lib/index.js');
var expect = require('expect.js');

describe('Action methods', function() {

  beforeEach( function(){
    query.reset();
  });

  // ## .create( payload, cb )
  describe('.create( payload [, cb] )', function() {

    it('should fail if no .from(model) is set', function() {
      var cb = function( err, res ) {
        expect( err ).to.be.an( Error );
        expect( res ).to.be( undefined );
        // Loosely check that the error message indicts "select"
        expect( err.message ).to.match( /from/ );
      };
      query().create('record', cb);
    });

    it('should fail if callback not a function', function() {
      var err;
      try {
        query().from('boop').create('payload', 'fakefunction');
      }
      catch( e ) {
        err = e;
      }
      expect( err ).to.be.an( Error );
      expect( err.message ).to.match( /requires.*Function/ );
    });

    it('should callback with `query` object on success', function() {
      var cb = function( err, res ) {
        expect( err ).to.not.be.ok();
        expect( res ).to.not.be.empty();
        expect( res.action ).to.be( 'create' );
        expect( res.inputs[0] ).to.be( 'record' );
      };
      query().from('something').create('record', cb);
    });

    it('should store multiple payloads on create', function() {
      var cb = function( err, res ) {
        expect( res.inputs.length ).to.be( 3 );
        expect( res.inputs ).to.eql(['a','b',3]);
      };
      query().from('something').create(['a','b',3], cb);
    });

    it('should return query object if no callback', function() {
      var q = query().from('anything').create('hello');
      expect( q ).to.not.be.empty();
      expect( q.inputs[0] ).to.be( 'hello' );
    });
  });


  // ## .find()
  describe('.find( [identifiers] [, cb] )', function() {

    it('should return a `find` action query() if no params', function(){
      var q = query().find();
      expect( q ).to.not.be.empty();
      expect( q.identifiers ).to.have.length( 0 );
      expect( q.action ).to.be( 'find' );
    });

    it('should set find identifiers if passed', function() {
      // Test literal is pushed onto .fields array
      var q = query().find('moop');
      expect( q.identifiers ).to.have.length( 1 );
      // Check item array
      q = query().find(['moop','smee']);
      expect( q.identifiers ).to.have.length( 2 );
    });

    it('should run a callback if one is passed', function() {
      var cb = function(err, res) {
        // Check that no error was thrown
        expect( err ).to.not.be.ok();
        expect( res ).to.not.be.empty();
        expect( res.identifiers ).to.contain( 'moop' );
        // Ensure the 'callback' wasn't added as a field
        expect( res.identifiers ).to.have.length( 1 );
      };
      query().from('anything').find('moop', cb);
    });

    it('should fail a callback find if no .from(model) set', function() {
      var cb = function(err, res) {
        // Check that no error was thrown
        expect( res ).to.be( undefined );
        expect( err ).to.be.an( Error );
        expect( err.message ).to.match( /from/ );
      };
      query().find('moop', cb);
    });

    it('should fail if callback is passed but not a function', function() {
      var err;
      try {
        var q = query().from('me').find( 'moo', 'moo2' );
        expect( q ).to.be( undefined );
      }
      catch( e ) { err = e; }
      expect( err ).to.be.an( Error );
      expect( err.message ).to.match( /find.*function/ );
    });
  });


  describe('.destroy(id [, cb])', function() {

    it('should fail if not passed an `id`', function() {
      try {
        var q = query().destroy();
        expect(q).to.be( undefined );
      }
      catch(e) {
        expect( e ).to.be.an( Error );
        // Check the error message indicates a "requires"
        expect( e.message ).to.match( /requires/ );
      }
    });

    it('should set the destroy action when passed `id`', function() {
      var q = query().destroy('abc');
      expect( q.action ).to.be('delete');
    });
  });


  describe('.done(cb)', function() {

    it('should fail if no callback provided', function() {
      var err;
      try {
        query().done();
      }
      catch( e ) {
        err = e;
      }
      expect( err ).to.be.an( Error );
      expect( err.message ).to.match( /requires/ );
    });

    it('should return an error if no .from(model) set', function() {
      try {
        query().done( function(err){
          expect( err ).to.be.an( Error );
          expect( err.message ).to.match( /from/ );
        });
      }
      catch( e ) {
        // Should never get here. Make sure of that.
        expect( e ).to.be( undefined );
      }
    });

    it('should return an error if no `action` set', function() {
      try {
        query().from('anything').done( function(err){
          expect( err ).to.be.an( Error );
          expect( err.message ).to.match( /action/ );
        });
      }
      catch( e ) {
        // Should never get here. Make sure of that.
        expect( e ).to.be( undefined );
      }
    });

    it('should callback with query object if no adapter', function() {
      var cb = function( err, res ) {
        expect( err ).to.not.be.ok();
        expect( res ).to.not.be.empty();
        expect( res.action ).to.be('create');
      };

      query().from('anything').create('obj').done( cb );
    });

    it('should .exec( query, cb ) adapter if one provided', function() {
      // Stub adapter
      var adapter = function(){
        return {
          exec:function(query,cb) {
            expect( query ).to.not.be.empty();
            expect( query.resource ).to.be( 'anything' );
            expect( cb ).to.be.ok();
          }
        };
      };

      var cb = function(err, res) {};

      // Set the adapter class to our stub
      query.adapterClass( adapter );
      // Init the query
      var q = query('testadapter').from('anything').find('me');
      // Ensure the adapter is set
      expect( q.adapter ).to.be.ok();
      // Run the query through the adapter
      q.done(cb);
    });

  });

});
