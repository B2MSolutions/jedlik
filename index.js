function SweetenDDB() {
  this.query = {};
}

SweetenDDB.prototype.tablename = function(tablename) {
  this.query.TableName = tablename;
  return this;
};

function handleKey(key, value, comparisonOp) {
  this.query.KeyConditions = this.KeyConditions || {};
  this.query.KeyConditions[key] = {
    AttributeValueList: [{
        S: value
      }
    ],
    ComparisonOperator: comparisonOp || 'EQ'
  };
}

SweetenDDB.prototype.hashkey = function() {
  handleKey.apply(this, Array.prototype.slice.call(arguments));
  return this;
};

SweetenDDB.prototype.rangekey = function() {
  handleKey.apply(this, Array.prototype.slice.call(arguments));
  return this;
};

SweetenDDB.prototype.get = function(attributes) {
  this.query.AttributesToGet = attributes;
  return this;
};

module.exports = SweetenDDB;
