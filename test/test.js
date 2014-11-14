var expect = require('chai').expect,
  sinon = require('sinon');

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

    it('should add hashkey property with the same type as specified in call params', function() {
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

    it('should add rangekey property of type number', function() {
      var expected = {
        key: 'KEY',
        value: '42',
        type: 'N',
        comparisonOp: 'COMPARISONOP'
      };
      expect(this.jedlik.rangekey(expected.key, 42, expected.comparisonOp)._data.rangekey).to.deep.equal(expected);
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
        .attribute('attribute1', 'STR', 'PUT')
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

  it('should return a valid json for query with start key (no range key)', function() {
    expect(this.jedlik
      .tablename('tablename')
      .hashkey('hashkey', 'hashkeyvalue')
      .starthashkey('starthashkey', 'starthashkeyvalue')
      .attributes(['attribute1', 'attribute2']).query()).to.deep.equal(require('./fixtures/query_with_startkey_hash_only'));
  });

  it('should return a valid json for query with start key', function() {
    expect(this.jedlik
      .tablename('tablename')
      .hashkey('hashkey', 'hashkeyvalue')
      .rangekey('rangekey', 'rangekeyvalue')
      .starthashkey('starthashkey', 'starthashkeyvalue')
      .startrangekey('startrangekey', 'startrangekeyvalue')
      .attributes(['attribute1', 'attribute2']).query()).to.deep.equal(require('./fixtures/query_with_startkey'));
  });

  it('should return a valid json for query with sort', function() {
    expect(this.jedlik
      .tablename('tablename')
      .hashkey('hashkey', 'hashkeyvalue')
      .rangekey('rangekey', 'rangekeyvalue', 'BEGINS_WITH')
      .attributes(['attribute1', 'attribute2'])
      .ascending(true)
      .query()).to.deep.equal(require('./fixtures/query_with_sort'));
  });

  it('should return a valid json for query with descending sort', function() {
    expect(this.jedlik
      .tablename('tablename')
      .hashkey('hashkey', 'hashkeyvalue')
      .rangekey('rangekey', 'rangekeyvalue', 'BEGINS_WITH')
      .attributes(['attribute1', 'attribute2'])
      .ascending(false)
      .query()).to.deep.equal(require('./fixtures/query_with_sort_descending'));
  });

  it('should return a valid json for query with select', function() {
    expect(this.jedlik
      .tablename('tablename')
      .hashkey('hashkey', 'hashkeyvalue')
      .rangekey('rangekey', 'rangekeyvalue', 'BEGINS_WITH')
      .select('COUNT').query()).to.deep.equal(require('./fixtures/query_with_select'));
  });

  it('should return a valid json for query with select no rangekey', function() {
    expect(this.jedlik
      .tablename('tablename')
      .hashkey('hashkey', 'hashkeyvalue')
      .select('COUNT').query()).to.deep.equal(require('./fixtures/query_with_select_no_rangekey'));
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
  });

  it('should return a valid json for put without rangekey', function() {
    var fixtureWithoutRangekey = require('./fixtures/put');
    delete fixtureWithoutRangekey.Item.rangekey;

    expect(this.jedlik
      .tablename('tablename')
      .hashkey('hashkey', 'hashkeyvalue')
      .attribute('attribute1', 'STR')
      .attribute('attribute2', 1234)
      .put()).to.deep.equal(fixtureWithoutRangekey);
  })

  describe('createTable', function() {
    it('should return a valid json for createTable when only hashkey is used', function() {
      expect(this.jedlik
        .tablename('tablename')
        .hashkey('hashkey', null, 'S')
        .createTable()).to.deep.equal(require('./fixtures/createTable_hash'));
    });

    it('should return a valid json for createTable when both hashkey and rangekey are used', function() {
      expect(this.jedlik
        .tablename('tablename')
        .hashkey('hashkey', null, 'S')
        .rangekey('rangekey', null, null, 'N')
        .createTable()).to.deep.equal(require('./fixtures/createTable_range'));
    });

    it('should throw an error if user tries to call create table without calling "hashkey" method first', function() {
      var tablename = this.jedlik.tablename('tablename')
      var createTable = tablename.createTable.bind(tablename);

      expect(createTable).to.
      throw('Setup hash key using "hashkey" method to create a new table');
    });

    it('should return a valid json for createTable with provision throughput set if it is present', function() {
      expect(this.jedlik
        .tablename('tablename')
        .hashkey('hashkey', null, 'S')
        .throughput({
          read: 5,
          write: 7
        })
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

    it('should accept a tablename and items (single table format)', function() {
      expect(this.jedlik
        .tablename('tablename')
        .item({
          key1: 1,
          key2: "value2"
        })
        .item({
          key3: "value3",
          key4: "value4"
        })
        .batchWrite()).to.deep.equal(require('./fixtures/batchwrite'));
    });
    
    it('should accept items, same table, multi-table format', function() {
      expect(this.jedlik
        .item({
          tablename: 'tablename',
          key1: 1,
          key2: "value2"
        })
        .item({
          tablename: 'tablename',
          key3: "value3",
          key4: "value4"
        })
        .batchWrite()).to.deep.equal(require('./fixtures/batchwrite'));
    });
    
    it('should accept items, different table, multi-table format', function() {
      expect(this.jedlik
        .item({
          tablename: 'tablename1',
          key1: 1,
          key2: "value2"
        })
        .item({
          tablename: 'tablename1',
          key3: "value3",
          key4: "value4"
        })
        .item({
          tablename: 'tablename2',
          key5: 5,
          key6: "value6"
        })
        .item({
          tablename: 'tablename2',
          key7: "value7",
          key8: "value8"
        })
        .batchWrite()).to.deep.equal(require('./fixtures/batchwritemultitable'));
    });

  });

  describe('batchGet', function() {
    it('should accept items single-table format', function() {
      expect(this.jedlik
        .tablename('tablename1')
        .item({
          key1: 1,
          key2: "value2"
        })
        .item({
          key3: 3,
          key4: "value4"
        })
        .batchGet()).to.deep.equal(require('./fixtures/batchget'));
    });
    it('should accept items multi-table format', function() {
      expect(this.jedlik
        .item({
          tablename: 'tablename1',
          key1: 1,
          key2: "value2"
        })
        .item({
          tablename: 'tablename1',
          key3: 3,
          key4: "value4"
        })
        .batchGet()).to.deep.equal(require('./fixtures/batchget'));
    });
    
    it('should accept items with different table names multi-table', function() {
      expect(this.jedlik
        .item({
          tablename: 'tablename1',
          key1: 1,
          key2: "value2"
        })
        .item({
          tablename: 'tablename2',
          key3: 3,
          key4: "value4"
        })
        .item({
          tablename: 'tablename2',
          key5: 5
        })
        .batchGet()).to.deep.equal(require('./fixtures/batchgetmultitable'));
    });
  });

  describe('mapItem', function() {

    it('should convert from DynamoDB syntax to JavaScript object syntax', function() {
      var item = {
        a: {
          N: "1"
        },
        b: {
          S: "a"
        },
        c: {
          N: "1.1"
        },
        d: {
          SS: ["a", "b"]
        }
      };

      var expected = {
        a: 1,
        b: "a",
        c: 1.1,
        d: ["a", "b"]
      };

      var actual = this.jedlik.mapItem(item);
      expect(actual.a).to.equal(expected.a);
      expect(actual.b).to.equal(expected.b);
      expect(actual.c).to.equal(expected.c);
      expect(actual.d[0]).to.equal(expected.d[0]);
      expect(actual.d[1]).to.equal(expected.d[1]);
    });

    it('should return expected json with omitted keys', function() {
      var item = {
        a: {
          N: "1"
        },
        b: {
          S: "a"
        },
        c: {
          N: "1.1"
        },
        d: {
          SS: ["a", "b"]
        }
      };

      var expected = {
        b: "a",
        d: ["a", "b"]
      };

      var actual = this.jedlik.mapItem(item, ['a', 'c']);
      expect(actual.a).to.equal(expected.a);
      expect(actual.b).to.equal(expected.b);
      expect(actual.c).to.equal(expected.c);
      expect(actual.d[0]).to.equal(expected.d[0]);
      expect(actual.d[1]).to.equal(expected.d[1]);
    });
  });

  describe('mapItems', function() {

    beforeEach(function() {
      sinon.stub(this.jedlik, 'mapItem');
    });

    afterEach(function() {
      if (this.jedlik.mapItem.restore) {
        this.jedlik.mapItem.restore();
      }
    });

    it('should call mapItem items.length times producing the expected json', function() {
      var item = {
        a: {
          N: "1"
        },
        b: {
          S: "a"
        },
        c: {
          N: "1.1"
        },
        d: {
          SS: ["a", "b"]
        }
      };
      var items = [item, item];
      var expected = {
        a: 1,
        b: "a",
        c: 1.1,
        d: ["a", "b"]
      };
      this.jedlik.mapItem.returns(expected);

      var result = this.jedlik.mapItems(items);
      expect(this.jedlik.mapItem.callCount).to.equal(2);
      expect(result).to.deep.equal([expected, expected])
    });

    it('should call mapItem items.length times producing the expected json when passing keys to omit', function() {
      this.jedlik.mapItem.restore();
      var item = {
        a: {
          N: "1"
        },
        b: {
          S: "a"
        },
        c: {
          N: "1.1"
        },
        d: {
          SS: ["a", "b"]
        }
      };
      var items = [item, item];
      var expected = {
        b: "a",
        d: ["a", "b"]
      };

      var result = this.jedlik.mapItems(items, ['a', 'c']);
      expect(result).to.deep.equal([expected, expected])
    });
  });

});
