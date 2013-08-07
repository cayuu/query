var query = require('../../lib/index.js');
var expect = require('expect.js');

// Currently `query` expects an adapter() to return an `.exec()` method
var adapterStub = function() { return { exec: function(){} }; };

beforeEach( function(){
  query.reset();
});

it('should return a new query object with query()', function() {
  var q1 = query();
  var q2 = query();
  expect( q1 ).to.not.equal( q2 );
  expect( q1 ).to.be.an( 'object' );
  expect( q1 ).to.not.be.empty();
});

it('should enable setting an adapter via query(\'adapter\')', function() {
  // Check the adapterClass method is available
  expect( query.adapterClass ).to.be.ok();
  // Attempt to instantiate the adapter stub (will fail if not ok)
  query.adapterClass( adapterStub );
});

it('should return query class on setting .adapterClass()', function() {
  var q = query.adapterClass( adapterStub );
  expect( q ).to.be.a( Function );
});

it('should set an adapter using .use(\'adapter\')', function() {
  query.adapterClass( adapterStub );
  var q = query().use('whatever');
  expect( q.adapter ).to.be.ok();
});

it('should fail setting adapter if adapterClass not provided', function() {
  // Reset our adapter class
  query.adapterClass();
  var err;
  try {
    var q = query('someinterface');
    expect(q).to.be( undefined );
  }
  catch( e ) {
    err = e;
  }
  expect( err ).to.be.an( Error );
  expect( err.message ).to.match( /requires.*adapterClass/ );
});


describe('.select(fields)', function() {
  it('should set single `fields` on .select(fields)', function() {
    var q = query().select('id');
    expect( q.fields ).to.have.length(1);
    expect( q.fields[0] ).to.be( 'id' );
  });

  it('should fail .select(fields) if no fields passed', function() {
    var err;
    try {
      var q = query().select();
      expect(q).to.be( undefined );
    }
    catch(e) {
      err = e;
    }
    expect( err ).to.be.an( Error );
    expect( err.message ).to.match( /select.*fields/ );
  });

  it('should shallow decompose array and literal `fields`', function() {
    var q = query().select( '1', ['2', '3'], ['4'] );
    expect( q.fields ).to.have.length( 4 );
    expect( q.fields ).to.eql( ['1', '2', '3', '4'] );
  });
});
