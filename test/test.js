var expect = require('chai').expect;

describe('lib', function() {

  beforeEach(function() {
    this.lib = require('../index');
    this.jedlik = new(this.lib);
  });

  it('should export a function', function() {
    expect(this.lib).to.be.a('function');
  });

  it('should hold a query property', function() {
    expect(this.jedlik.query).to.be.a('function');
  });

  describe('tablename', function() {
    it('should have a tablename property set', function() {
      var name = 'TABLENAME';
      expect(this.jedlik.tablename(name)._data.tablename).to.equal('TABLENAME');
    });
  });

  describe('hashkey', function() {
    it('should add hashkey property', function() {
      var expected = {
        key: 'KEY',
        value: 'VALUE',
        type: 'S'
      };
      expect(this.jedlik.hashkey(expected.key, expected.value)._data.hashkey).to.deep.equal(expected);
    });

    it('should add hashkey property with the same type as specified in call params', function () {
      var expected = {
        key: 'KEY',
        value: 'VALUE',
        type: 'N'
      };
      expect(this.jedlik.hashkey(expected.key, expected.value, 'N')._data.hashkey).to.deep.equal(expected);
    });
  });

  describe('rangekey', function() {
    it('should add rangekey property (no comparison op)', function() {
      var expected = {
        key: 'KEY',
        value: 'VALUE',
        type: 'S',
        comparisonOp: 'EQ'
      };
      expect(this.jedlik.rangekey(expected.key, expected.value)._data.rangekey).to.deep.equal(expected);
    });

    it('should add rangekey property', function() {
      var expected = {
        key: 'KEY',
        value: 'VALUE',
        type: 'S',
        comparisonOp: 'COMPARISONOP'
      };
      expect(this.jedlik.rangekey(expected.key, expected.value, expected.comparisonOp)._data.rangekey).to.deep.equal(expected);
    });

    it('should add rangekey property with the same type as specified in call params', function() {
      var expected = {
        key: 'KEY',
        value: 'VALUE',
        type: 'B',
        comparisonOp: 'COMPARISONOP'
      };
      expect(this.jedlik.rangekey(expected.key, expected.value, expected.comparisonOp, 'B')._data.rangekey).to.deep.equal(expected);
    });
  });

  describe('attributes', function() {
    it('should add the attributes property', function() {
      var attributesToGet = ['a', 'b', 'c'];
      expect(this.jedlik.attributes(attributesToGet)._data.attributes).to.deep.equal(attributesToGet);
    });
  });

  describe('limit', function() {
    it('should add limit property', function() {
      expect(this.jedlik.limit(42)._data.limit).to.deep.equal(42);
    });
  });

  describe('attribute', function() {
    it('should add attribute property', function() {
      var expected = {
        attribute1: {
          value: 'STR',
          type: 'S',
          action: 'PUT'
        },
        attribute2: {
          value: '1234',
          type: 'N',
          action: 'PUT'
        },
        attribute3: {
          value: ['s1', 's2'],
          type: 'SS',
          action: 'PUT'
        }
      };
      expect(this.jedlik
        .attribute('attribute1', 'STR','PUT' )
        .attribute('attribute2', 1234)
        .attribute('attribute3', ['s1', 's2'])
        ._data.attributes).to.deep.equal(expected);
    });
  });

  xit('should have a fluent api', function() {
    function getMethods(obj) {
      var result = [];
      for (var id in obj) {
        try {
          if (typeof(obj[id]) == "function") {
            result.push(id);
          }
        } catch (err) {}
      }
      return result;
    }

    getMethods(new(this.lib)()).forEach(function(method) {
      if (method == 'query') {
        return;
      }

      expect(this.jedlik[method](1, 1)).to.equal(this.jedlik);
    }.bind(this));
  });

  it('should return a valid json for query', function() {
    expect(this.jedlik
      .tablename('tablename')
      .hashkey('hashkey', 'hashkeyvalue')
      .rangekey('rangekey', 'rangekeyvalue', 'BEGINS_WITH')
      .attributes(['attribute1', 'attribute2']).query()).to.deep.equal(require('./fixtures/query'));
  });

  it('should return a valid json for update', function() {
    expect(this.jedlik
      .tablename('tablename')
      .hashkey('hashkey', 'hashkeyvalue')
      .rangekey('rangekey', 'rangekeyvalue')
      .attribute('attribute1', 'STR', 'PUT')
      .attribute('attribute2', 1234)
      .update()).to.deep.equal(require('./fixtures/update'));
  });

  it('should return a valid json for update with return values', function() {
    expect(this.jedlik
      .tablename('tablename')
      .hashkey('hashkey', 'hashkeyvalue')
      .rangekey('rangekey', 'rangekeyvalue')
      .attribute('attribute1', 'STR', 'PUT')
      .attribute('attribute2', 1234)
      .returnvals('ALL_OLD')
      .update()).to.deep.equal(require('./fixtures/update-with-return-values'));
  });

  it('should return a valid json for update', function() {
    expect(this.jedlik
      .tablename('tablename')
      .hashkey('hashkey', 'hashkeyvalue')
      .rangekey('rangekey', 'rangekeyvalue')
      .attribute('attribute1', 'STR', 'PUT')
      .attribute('attribute2', 1234)
      .update()).to.deep.equal(require('./fixtures/update'));
  })

  it('should return a valid json where range key is not needed for update', function() {
    expect(this.jedlik
      .tablename('tablename')
      .hashkey('hashkey', 'hashkeyvalue')
      .attribute('attribute1', 'STR', 'PUT')
      .attribute('attribute2', 1234)
      .update()).to.deep.equal(require('./fixtures/update-without-rangekey'));
  });
  
  it('should return a valid json for put', function() {
    expect(this.jedlik
      .tablename('tablename')
      .hashkey('hashkey', 'hashkeyvalue')
      .rangekey('rangekey', 'rangekeyvalue')
      .attribute('attribute1', 'STR')
      .attribute('attribute2', 1234)
      .put()).to.deep.equal(require('./fixtures/put'));
  })

  describe('createTable', function () {
    it('should return a valid json for createTable when only hashkey is used', function () {
      expect(this.jedlik
        .tablename('tablename')
        .hashkey('hashkey', null, 'S')
        .createTable()).to.deep.equal(require('./fixtures/createTable_hash'));
    });

    it('should return a valid json for createTable when both hashkey and rangekey are used', function () {
      expect(this.jedlik
        .tablename('tablename')
        .hashkey('hashkey', null, 'S')
        .rangekey('rangekey', null, null, 'N')
        .createTable()).to.deep.equal(require('./fixtures/createTable_range'));
    });

    it('should throw an error if user tries to call create table without calling "hashkey" method first', function () {
      var tablename = this.jedlik.tablename('tablename')
      var createTable = tablename.createTable.bind(tablename);

      expect(createTable).to.throw('Setup hash key using "hashkey" method to create a new table');
    });

    it('should return a valid json for createTable with provision throughput set if it is present', function () {
      expect(this.jedlik
        .tablename('tablename')
        .hashkey('hashkey', null, 'S')
        .throughput({read: 5, write: 7})
        .createTable()).to.deep.equal(require('./fixtures/createTable_throughput'));
    });
  });

  it('should return a valid json for delete', function() {
    expect(this.jedlik
      .tablename('tablename')
      .hashkey('hashkey', 'hashkeyvalue')
      .rangekey('rangekey', 'rangekeyvalue')
      .del()).to.deep.equal(require('./fixtures/delete'));
  });

  describe('batchwrite', function() {

    it('should accept more a tablename and attributes', function() {
      expect(this.jedlik
        .tablename('tablename')
        .attribute('key1', 'value1')
        .attribute('key2', 'value2')
        .batchWrite()).to.deep.equal(require('./fixtures/batchwrite'));
    });

  });

});


