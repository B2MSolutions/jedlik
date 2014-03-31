var expect = require('chai').expect;

describe('test setup', function() {

  it('works', function() {
    expect(42).to.equal(41 + 1);
  });

});

describe('lib', function() {

  beforeEach(function() {
    this.lib = require('./index');
    this.jedlik = new(this.lib);
  });

  it('should export a function', function() {
    expect(this.lib).to.be.a('function');
  });

  it('should hold a query property', function() {
    expect(this.jedlik).to.have.property('query');
  });

  describe('table', function() {

    it('should add the proper node to the query', function() {
      var name = 'asd';
      var expected = {
        TableName: name
      };
      expect(this.jedlik.tablename(name).query).to.deep.equal(expected);
    });

  });

  describe('hashkey and rangekey', function() {

    it('should add the proper node to the query', function() {
      var key = 'key',
        value = 'value';
      var expected = {
        KeyConditions: {
          key: {
            AttributeValueList: [{
                S: value
              }
            ],
            ComparisonOperator: 'EQ'
          }
        }
      };

      expect(this.jedlik.hashkey(key, value).query).to.deep.equal(expected);
    });

  });

  describe('get', function() {
    
    it('should add the proper node to the query', function() {
      var attributesToGet = ['a','b','c']; 
      var expected = {
        AttributesToGet: attributesToGet
      };  

      expect(this.jedlik.get(attributesToGet).query).to.deep.equal(expected);
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
    var evalMe = 'expect(jedlik)';
    getMethods(new(this.lib)()).forEach(function(method) {
      evalMe += '.' + method + '()';
    });
    eval.call(this, evalMe);

    //expect(new (this.lib)().tablename().hashkey().rangekey()

  });

});
