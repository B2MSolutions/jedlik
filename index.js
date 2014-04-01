function Jedlik() {
  this.query = {};
}

Jedlik.prototype.tablename = function(tablename) {
  this.query.TableName = tablename;
  return this;
};

function handleKey(key, value, comparisonOp) {
  var type = Number.isFinite(value) ? 'N' : 'S';

  this.query.KeyConditions = this.query.KeyConditions || {};
  this.query.KeyConditions[key] = {
    AttributeValueList: [{}],
    ComparisonOperator: comparisonOp || 'EQ'
  };

  this.query.KeyConditions[key].AttributeValueList[0][type] = value.toString();
}

Jedlik.prototype.hashkey = function() {
  handleKey.apply(this, Array.prototype.slice.call(arguments));
  return this;
};

Jedlik.prototype.rangekey = function() {
  handleKey.apply(this, Array.prototype.slice.call(arguments));
  return this;
};

Jedlik.prototype.get = function(attributes) {
  this.query.AttributesToGet = attributes;
  return this;
};

module.exports = Jedlik;
