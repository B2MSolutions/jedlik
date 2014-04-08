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

  describe('updateAttribute', function() {
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
        }      
      };
      expect(this.jedlik
        .updateAttribute('attribute1', 'STR','PUT' )
        .updateAttribute('attribute2', 1234)._data.attributesToUpdate).to.deep.equal(expected);
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
      .updateAttribute('attribute1', 'STR', 'PUT')
      .updateAttribute('attribute2', 1234)
      .update()).to.deep.equal(require('./fixtures/update'));
  });

});
