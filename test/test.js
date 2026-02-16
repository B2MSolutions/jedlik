var expect = require('chai').expect,
  sinon = require('sinon');

describe('lib', function() {
  var jedlik;

  beforeEach(function() {
    lib = require('../index');
    jedlik = new(lib);
  });

  it('should export a function', function() {
    expect(lib).to.be.a('function');
  });

  it('should hold a query property', function() {
    expect(jedlik.query).to.be.a('function');
  });

  describe('tablename', function() {
    it('should have a tablename property set', function() {
      var name = 'TABLENAME';
      expect(jedlik.tablename(name)._data.tablename).to.equal('TABLENAME');
    });
  });

  describe('hashkey', function() {
    it('should add hashkey property', function() {
      var expected = {
        key: 'KEY',
        value: 'VALUE',
        type: 'S'
      };
      expect(jedlik.hashkey(expected.key, expected.value)._data.hashkey).to.deep.equal(expected);
    });

    it('should add hashkey property without value as string', function() {
      var expected = {
        key: 'KEY',
        value: undefined,
        type: 'S'
      };
      expect(jedlik.hashkey(expected.key)._data.hashkey).to.deep.equal(expected);
    });

    it('should add hashkey property with the same type as specified in call params', function() {
      var expected = {
        key: 'KEY',
        value: 'VALUE',
        type: 'N'
      };
      expect(jedlik.hashkey(expected.key, expected.value, 'N')._data.hashkey).to.deep.equal(expected);
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
      expect(jedlik.rangekey(expected.key, expected.value)._data.rangekey).to.deep.equal(expected);
    });

    it('should add rangekey property', function() {
      var expected = {
        key: 'KEY',
        value: 'VALUE',
        type: 'S',
        comparisonOp: 'COMPARISONOP'
      };
      expect(jedlik.rangekey(expected.key, expected.value, expected.comparisonOp)._data.rangekey).to.deep.equal(expected);
    });

    it('should add rangekey property without value as string', function() {
      var expected = {
        key: 'KEY',
        value: undefined,
        type: 'S',
        comparisonOp: 'EQ'
      };
      expect(jedlik.rangekey(expected.key)._data.rangekey).to.deep.equal(expected);
    });

    it('should add rangekey property with the same type as specified in call params', function() {
      var expected = {
        key: 'KEY',
        value: 'VALUE',
        type: 'B',
        comparisonOp: 'COMPARISONOP'
      };
      expect(jedlik.rangekey(expected.key, expected.value, expected.comparisonOp, 'B')._data.rangekey).to.deep.equal(expected);
    });

    it('should add rangekey property of type number', function() {
      var expected = {
        key: 'KEY',
        value: '42',
        type: 'N',
        comparisonOp: 'COMPARISONOP'
      };
      expect(jedlik.rangekey(expected.key, 42, expected.comparisonOp)._data.rangekey).to.deep.equal(expected);
    });
  });

  describe('attributes', function() {
    it('should add the attributes property', function() {
      var attributesToGet = ['a', 'b', 'c'];
      expect(jedlik.attributes(attributesToGet)._data.attributes).to.deep.equal(attributesToGet);
    });
  });

  describe('limit', function() {
    it('should add limit property', function() {
      expect(jedlik.limit(42)._data.limit).to.deep.equal(42);
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
        },
        attribute4: {
          value: { a: { N: '123' }, b: { S: 'STR' }, c: { S: 'true' }},
          type: 'M',
          action: 'PUT'
        },
        attribute5: {
          value: [ { M: { a: { N: '1' }, b: { S: 'S1' } } }, { M: { a: { N: '2' }, b: { S: 'S2' }, c: { S: 'true' } } } ],
          type: 'L',
          action: 'PUT'
        },
        attribute6: {
          value: 'true',
          type: 'S',
          action: 'PUT'
        },
        attribute7: {
          value: [ { NULL: true }, { S: 's1' }, { S: 's2' } ],
          type: 'L',
          action: 'PUT'
        }
      };
      expect(jedlik
        .attribute('attribute1', 'STR', 'PUT')
        .attribute('attribute2', 1234)
        .attribute('attribute3', ['s1', 's2'])
        .attribute('attribute4', {a:123, b:'STR', c:true})
        .attribute('attribute5', [{a:1, b:'S1'}, {a:2, b:'S2', c:true}])
        .attribute('attribute6', true)
        .attribute('attribute7', [null, 's1', 's2'])
        ._data.attributes).to.deep.equal(expected);
    });

    it('should add attribute property if boolean support', function() {
      jedlik = new(lib)(true);

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
        },
        attribute4: {
          value: { a: { N: '123' }, b: { S: 'STR' }, c: { BOOL: true } },
          type: 'M',
          action: 'PUT'
        },
        attribute5: {
          value: [ { M: { a: { N: '1' }, b: { S: 'S1' } } }, { M: { a: { N: '2' }, b: { S: 'S2' }, c: { BOOL: true } } } ],
          type: 'L',
          action: 'PUT'
        },
        attribute6: {
          value: true,
          type: 'BOOL',
          action: 'PUT'
        },
        attribute7: {
          value: [ { NULL: true }, { S: 's1' }, { S: 's2' } ],
          type: 'L',
          action: 'PUT'
        }
      };
      expect(jedlik
        .attribute('attribute1', 'STR', 'PUT')
        .attribute('attribute2', 1234)
        .attribute('attribute3', ['s1', 's2'])
        .attribute('attribute4', {a:123, b:'STR', c:true})
        .attribute('attribute5', [{a:1, b:'S1'}, {a:2, b:'S2', c:true}])
        .attribute('attribute6', true)
        .attribute('attribute7', [null, 's1', 's2'])
        ._data.attributes).to.deep.equal(expected);
    });

    it('should not throw if the value is undefined or null', function() {
      var item = {};
      jedlik.attribute('attribute1', item['Key not exists'] , 'PUT');
    });

    it('should not add the attribute if the value is undefined or null', function() {
      expect(jedlik.attribute('attribute4', null, 'PUT')._data.attributes).to.deep.equal({});
      expect(jedlik.attribute('attribute4', undefined, 'PUT')._data.attributes).to.deep.equal({});
    });

    it('should add the attribute with false value', function() {
      expect(jedlik.attribute('attribute4', false, 'PUT')._data.attributes).to.deep.equal({
        attribute4: {
          action: 'PUT',
          type: 'S',
          value: 'false'
        }
      });
    });

    it('should add array attribute with zero length as list', function() {
      expect(jedlik.attribute('attribute4', [], 'PUT')._data.attributes).to.deep.equal({
        attribute4: {
          action: 'PUT',
          type: 'L',
          value: []
        }
      });
    });

    it('should add nullable attribute property', function() {
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
        },
        attribute4: {
          value: { a: { N: '123' }, b: { S: 'STR' }, c: { S: 'true' } },
          type: 'M',
          action: 'PUT'
        },
        attribute5: {
          value: [ { M: { a: { N: '1' }, b: { S: 'S1' } } }, { M: { a: { N: '2' }, b: { S: 'S2' }, c: { S: 'true' } } } ],
          type: 'L',
          action: 'PUT'
        },
        attribute6: {
          value: true,
          type: 'NULL',
          action: 'PUT'
        },
        attribute7: {
          value: true,
          type: 'NULL',
          action: 'PUT'
        },
        attribute8: {
          value: 'true',
          type: 'S',
          action: 'PUT'
        },
        attribute9: {
          value: [ { NULL: true }, { S: 's1' }, { S: 's2' } ],
          type: 'L',
          action: 'PUT'
        }
      };
      expect(jedlik
        .nullableAttribute('attribute1', 'STR', 'PUT')
        .nullableAttribute('attribute2', 1234)
        .nullableAttribute('attribute3', ['s1', 's2'])
        .nullableAttribute('attribute4', {a:123, b:'STR', c:true})
        .nullableAttribute('attribute5', [{a:1, b:'S1'}, {a:2, b:'S2', c:true}])
        .nullableAttribute('attribute6', null)
        .nullableAttribute('attribute7', undefined)
        .nullableAttribute('attribute8', true)
        .nullableAttribute('attribute9', [null, 's1', 's2'])
        ._data.attributes).to.deep.equal(expected);
    });

    it('should add nullable attribute property if boolean support', function() {
      jedlik = new(lib)(true);

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
        },
        attribute4: {
          value: { a: { N: '123' }, b: { S: 'STR' }, c: { BOOL: true } },
          type: 'M',
          action: 'PUT'
        },
        attribute5: {
          value: [ { M: { a: { N: '1' }, b: { S: 'S1' } } }, { M: { a: { N: '2' }, b: { S: 'S2' }, c: { BOOL: true } } } ],
          type: 'L',
          action: 'PUT'
        },
        attribute6: {
          value: true,
          type: 'NULL',
          action: 'PUT'
        },
        attribute7: {
          value: true,
          type: 'NULL',
          action: 'PUT'
        },
        attribute8: {
          value: true,
          type: 'BOOL',
          action: 'PUT'
        },
        attribute9: {
          value: [ { NULL: true }, { S: 's1' }, { S: 's2' } ],
          type: 'L',
          action: 'PUT'
        }
      };
      expect(jedlik
        .nullableAttribute('attribute1', 'STR', 'PUT')
        .nullableAttribute('attribute2', 1234)
        .nullableAttribute('attribute3', ['s1', 's2'])
        .nullableAttribute('attribute4', {a:123, b:'STR', c:true})
        .nullableAttribute('attribute5', [{a:1, b:'S1'}, {a:2, b:'S2', c:true}])
        .nullableAttribute('attribute6', null)
        .nullableAttribute('attribute7', undefined)
        .nullableAttribute('attribute8', true)
        .nullableAttribute('attribute9', [null, 's1', 's2'])
        ._data.attributes).to.deep.equal(expected);
    });
  });

  it('should return a valid json for query', function() {
    expect(jedlik
      .tablename('tablename')
      .hashkey('hashkey', 'hashkeyvalue')
      .rangekey('rangekey', 'rangekeyvalue', 'BEGINS_WITH')
      .attributes(['attribute1', 'attribute2']).query()).to.deep.equal(require('./fixtures/query'));
  });

  it('should return a valid json for query with start key (no range key)', function() {
    expect(jedlik
      .tablename('tablename')
      .hashkey('hashkey', 'hashkeyvalue')
      .starthashkey('starthashkey', 'starthashkeyvalue')
      .attributes(['attribute1', 'attribute2']).query()).to.deep.equal(require('./fixtures/query_with_startkey_hash_only'));
  });

  it('should return a valid json for query with start key', function() {
    expect(jedlik
      .tablename('tablename')
      .hashkey('hashkey', 'hashkeyvalue')
      .rangekey('rangekey', 'rangekeyvalue')
      .starthashkey('starthashkey', 'starthashkeyvalue')
      .startrangekey('startrangekey', 'startrangekeyvalue')
      .attributes(['attribute1', 'attribute2']).query()).to.deep.equal(require('./fixtures/query_with_startkey'));
  });

  it('should return a valid json for query with sort', function() {
    expect(jedlik
      .tablename('tablename')
      .hashkey('hashkey', 'hashkeyvalue')
      .rangekey('rangekey', 'rangekeyvalue', 'BEGINS_WITH')
      .attributes(['attribute1', 'attribute2'])
      .ascending(true)
      .query()).to.deep.equal(require('./fixtures/query_with_sort'));
  });

  it('should return a valid json for query with descending sort', function() {
    expect(jedlik
      .tablename('tablename')
      .hashkey('hashkey', 'hashkeyvalue')
      .rangekey('rangekey', 'rangekeyvalue', 'BEGINS_WITH')
      .attributes(['attribute1', 'attribute2'])
      .ascending(false)
      .query()).to.deep.equal(require('./fixtures/query_with_sort_descending'));
  });

  it('should return a valid json for query with select', function() {
    expect(jedlik
      .tablename('tablename')
      .hashkey('hashkey', 'hashkeyvalue')
      .rangekey('rangekey', 'rangekeyvalue', 'BEGINS_WITH')
      .select('COUNT').query()).to.deep.equal(require('./fixtures/query_with_select'));
  });

  it('should return a valid json for query with select no rangekey', function() {
    expect(jedlik
      .tablename('tablename')
      .hashkey('hashkey', 'hashkeyvalue')
      .select('COUNT').query()).to.deep.equal(require('./fixtures/query_with_select_no_rangekey'));
  });

  it('should return a valid json for update', function() {
    expect(jedlik
      .tablename('tablename')
      .hashkey('hashkey', 'hashkeyvalue')
      .rangekey('rangekey', 'rangekeyvalue')
      .attribute('attribute1', 'STR', 'PUT')
      .attribute('attribute2', 1234)
      .update()).to.deep.equal(require('./fixtures/update'));
  });

  it('should return a valid json for update with return values', function() {
    expect(jedlik
      .tablename('tablename')
      .hashkey('hashkey', 'hashkeyvalue')
      .rangekey('rangekey', 'rangekeyvalue')
      .attribute('attribute1', 'STR', 'PUT')
      .attribute('attribute2', 1234)
      .returnvals('ALL_OLD')
      .update()).to.deep.equal(require('./fixtures/update-with-return-values'));
  });

  it('should return a valid json for update', function() {
    expect(jedlik
      .tablename('tablename')
      .hashkey('hashkey', 'hashkeyvalue')
      .rangekey('rangekey', 'rangekeyvalue')
      .attribute('attribute1', 'STR', 'PUT')
      .attribute('attribute2', 1234)
      .update()).to.deep.equal(require('./fixtures/update'));
  })

  it('should return a valid json where range key is not needed for update', function() {
    expect(jedlik
      .tablename('tablename')
      .hashkey('hashkey', 'hashkeyvalue')
      .attribute('attribute1', 'STR', 'PUT')
      .attribute('attribute2', 1234)
      .update()).to.deep.equal(require('./fixtures/update-without-rangekey'));
  });

  it('should return a valid json for put', function() {
    expect(jedlik
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

    expect(jedlik
      .tablename('tablename')
      .hashkey('hashkey', 'hashkeyvalue')
      .attribute('attribute1', 'STR')
      .attribute('attribute2', 1234)
      .put()).to.deep.equal(fixtureWithoutRangekey);
  });

  describe('createTable', function() {
    it('should return a valid json for createTable when only hashkey is used', function() {
      expect(jedlik
        .tablename('tablename')
        .hashkey('hashkey', null, 'S')
        .createTable()).to.deep.equal(require('./fixtures/createTable_hash'));
    });

    it('should return a valid json for createTable when both hashkey and rangekey are used', function() {
      expect(jedlik
        .tablename('tablename')
        .hashkey('hashkey', null, 'S')
        .rangekey('rangekey', null, null, 'N')
        .createTable()).to.deep.equal(require('./fixtures/createTable_range'));
    });

    it('should return a valid json for createTable with Local secondary index', function() {
      expect(jedlik
        .tablename('tablename')
        .hashkey('hashkey', null, 'S')
        .rangekey('rangekey', null, null, 'N')
        .localSecondaryIndex('indexName', 'attributeName', 'S', 'KEYS_ONLY')
        .createTable()).to.deep.equal(require('./fixtures/createTable_localSecondaryIndex'));
    });
    
    it('should return a valid json for createTable with two Local secondary index', function() {
      expect(jedlik
        .tablename('tablename')
        .hashkey('hashkey', null, 'S')
        .rangekey('rangekey', null, null, 'N')
        .localSecondaryIndex('indexName', 'attributeName', 'S', 'KEYS_ONLY')
        .localSecondaryIndex('indexName2', 'attributeName2', 'N', 'ALL')
        .createTable()).to.deep.equal(require('./fixtures/createTable_twoLocalSecondaryIndex'));
    });
    
    it('should throw an error if user tries to call create table without calling "hashkey" method first', function() {
      var tablename = jedlik.tablename('tablename')
      var createTable = tablename.createTable.bind(tablename);

      expect(createTable).to.
      throw('Setup hash key using "hashkey" method to create a new table');
    });

    it('should return a valid json for createTable with PROVISIONED billing mode set if it is present', function() {
      expect(jedlik
        .tablename('tablename')
        .hashkey('hashkey', null, 'S')
        .billingmode('PROVISIONED')
        .createTable()).to.deep.equal(require('./fixtures/createTable_provisioned'));
    });

    it('should return a valid json for createTable with PAY_PER_REQUEST billing mode set if it is present', function() {
      expect(jedlik
        .tablename('tablename')
        .hashkey('hashkey', null, 'S')
        .billingmode('PAY_PER_REQUEST')
        .createTable()).to.deep.equal(require('./fixtures/createTable_payPerRequest'));
    });

    it('should return a valid json for createTable with provision throughput set if no billing mode', function() {
      expect(jedlik
        .tablename('tablename')
        .hashkey('hashkey', null, 'S')
        .throughput({
          read: 5,
          write: 7
        })
        .createTable()).to.deep.equal(require('./fixtures/createTable_throughput'));
    });

    it('should return a valid json for createTable with provision throughput set if billing mode is PROVISIONED', function() {
      expect(jedlik
        .tablename('tablename')
        .hashkey('hashkey', null, 'S')
        .billingmode('PROVISIONED')
        .throughput({
          read: 5,
          write: 7
        })
        .createTable()).to.deep.equal(require('./fixtures/createTable_provisionedThroughput'));
    });

    it('should return a valid json for createTable without provision throughput if billing mode is PAY_PER_REQUEST', function() {
      expect(jedlik
        .tablename('tablename')
        .hashkey('hashkey', null, 'S')
        .billingmode('PAY_PER_REQUEST')
        .throughput({
          read: 5,
          write: 7
        })
        .createTable()).to.deep.equal(require('./fixtures/createTable_payPerRequest'));
    });
  });

  it('should return a valid json for delete when only hashkey is used', function() {
    expect(jedlik
      .tablename('tablename')
      .hashkey('hashkey', 'hashkeyvalue')
      .del()).to.deep.equal(require('./fixtures/delete_hash'));
  });

  it('should return a valid json for delete when both hashkey and rangekey are used', function() {
    expect(jedlik
      .tablename('tablename')
      .hashkey('hashkey', 'hashkeyvalue')
      .rangekey('rangekey', 'rangekeyvalue')
      .del()).to.deep.equal(require('./fixtures/delete_range'));
  });

  describe('getItem', function() {
    it('should return a valid json for getItem', function() {
      expect(jedlik
             .tablename('tablename')
             .hashkey('hashkey', 'hashkeyvalue')
             .rangekey('rangekey', 'rangekeyvalue')
             .attributes(['first', 'second'])
             .getItem()).to.deep.equal(require('./fixtures/get_item'));
    });

    it('should return a valid json for getItem when attributes were not set', function() {
      var query = jedlik
            .tablename('tablename')
            .hashkey('hashkey', 'hashkeyvalue')
            .getItem();

      expect(query.AttributesToGet).to.be.undefined;
    });
  });


  describe('batchwrite', function() {

    it('should accept a tablename and items (single table format)', function() {
      expect(jedlik
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
      expect(jedlik
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
      expect(jedlik
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
      expect(jedlik
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
      expect(jedlik
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
      expect(jedlik
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

      var actual = jedlik.mapItem(item);
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

      var actual = jedlik.mapItem(item, ['a', 'c']);
      expect(actual.a).to.equal(expected.a);
      expect(actual.b).to.equal(expected.b);
      expect(actual.c).to.equal(expected.c);
      expect(actual.d[0]).to.equal(expected.d[0]);
      expect(actual.d[1]).to.equal(expected.d[1]);
    });
  });

  describe('mapItems', function() {

    beforeEach(function() {
      sinon.stub(jedlik, 'mapItem');
    });

    afterEach(function() {
      if (jedlik.mapItem.restore) {
        jedlik.mapItem.restore();
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
        },
        e: {
          M: { c: { S: "a"}, d: { N: "1"} }
        },
        f: {
          L: [
            { N: "1" },
            { N: "1.1" }
          ]
        },
        g: {
          L: [
            { S: "a" },
            { S: "b" }
          ]
        },
        h: {
          L: [
            { M: { c: { S: "a"}, d: { N: "1"} } },
            { M: { c: { S: "b"}, d: { N: "1.2"} } }
          ]
        },
        i: {
          NULL: true
        },
        j: {
          L: [
            { NULL: true }
          ]
        }
      };
      var items = [item, item];
      var expected = {
        a: 1,
        b: "a",
        c: 1.1,
        d: ["a", "b"],
        e: { c:"a", d:1 }, 
        f: [1, 1.1],
        g: ["a", "b"],
        h: [{ c:"a", d:1 }, { c:"b", d:1.2 }],
        i: null,
        j: [null]
      };
      jedlik.mapItem.returns(expected);

      var result = jedlik.mapItems(items);
      expect(jedlik.mapItem.callCount).to.equal(2);
      expect(result).to.deep.equal([expected, expected])
    });

    it('should call mapItem items.length times producing the expected json when passing keys to omit', function() {
      jedlik.mapItem.restore();
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
        },
        e: {
          M: { c: { S: "a"}, d: { N: "1"} }
        },
        f: {
          L: [
            { N: "1" },
            { N: "1.1" }
          ]
        },
        g: {
          L: [
            { S: "a" },
            { S: "b" }
          ]
        },
        h: {
          L: [
            { M: { c: { S: "a"}, d: { N: "1"} } },
            { M: { c: { S: "b"}, d: { N: "1.2"} } }
          ]
        },
        i: {
          NULL: true
        },
        j: {
          L: [
            { NULL: true }
          ]
        }
      };
      var items = [item, item];
      var expected = {
        b: "a",
        d: ["a", "b"],
        e: { c:"a", d:1 },
        f: [1, 1.1],
        g: ["a", "b"],
        h: [{ c:"a", d:1 }, { c:"b", d:1.2 }],
        i: null,
        j: [null]
      };

      var result = jedlik.mapItems(items, ['a', 'c']);
      expect(result).to.deep.equal([expected, expected])
    });
  });

  describe('keycondition', function() {

    it('should add to KeyConditions for BETWEEN', function() {
      var query = jedlik
        .tablename('tablename')
        .hashkey('hashkey', 'hashkeyvalue')
        .rangekeyBetween('key', 'valueFrom', 'valueTo')
        .query();
      expect(query).to.deep.equal(require('./fixtures/query-rangekey-between'));
    });

  });

  describe('expected', function() {
    
    it('should add itself to update', function() {
      var query = jedlik
        .tablename('tablename')
        .hashkey('hashkey', 'hashkeyvalue')
        .rangekey('rangekey', 123)
        .expected('hashkey', 'hashkeyvalue', 'NE')
        .expected('rangekey', 123, 'NE')  
        .update();
      expect(query).to.deep.equal(require('./fixtures/update-with-expected'));
    });
  });

  describe('query for local index', function() {
    
    it('should add itself to update', function() {
      var query = jedlik
            .tablename('tablename')
            .hashkey('hashkey', 'hashkeyvalue')
            .rangekey('rangekey', 123)
            .localIndexName('local-index')
            .attributes(['first', 'second'])
            .query();

      expect(query).to.deep.equal(require('./fixtures/query_with_local_index'));
    });
  });
});
