function Jedlik() {
  this._data = {
    attributesToUpdate: {}
  };
  this.addIfExists = function(attributeName, fieldName, json) {
    if (this._data[fieldName]) {
      json[attributeName] = this._data[fieldName];
    }
  }.bind(this);

}

Jedlik.prototype.query = function() {

  var json = {
    KeyConditions: {}
  };

  json.KeyConditions[this._data.hashkey.key] = {
    AttributeValueList: [{}]
  };

  json.KeyConditions[this._data.hashkey.key].AttributeValueList[0][this._data.hashkey.type] = this._data.hashkey.value.toString();

  json.KeyConditions[this._data.rangekey.key] = {
    AttributeValueList: [{}],
    ComparisonOperator: this._data.rangekey.comparisonOp
  };

  json.KeyConditions[this._data.rangekey.key].AttributeValueList[0][this._data.rangekey.type] = this._data.rangekey.value.toString();

  this.addIfExists('TableName', 'tablename', json);
  this.addIfExists('AttributesToGet', 'attributes', json);
  this.addIfExists('Limit', 'limit', json);
  this.addIfExists('Limit', 'limit', json);

  return json;
};

Jedlik.prototype.update = function() {

  var json = {
    AttributeUpdates: {},
    Key: {
    }
  };

  Object.keys(this._data.attributesToUpdate).forEach(function(key) {
    var attributeToUpdate = this._data.attributesToUpdate[key];

    json.AttributeUpdates[key] = {
      Action: attributeToUpdate.action,
      Value: {}
    };
    json.AttributeUpdates[key].Value[attributeToUpdate.type] = attributeToUpdate.value;
  }.bind(this));

  json.Key[this._data.hashkey.key] = {};
  json.Key[this._data.hashkey.key][this._data.hashkey.type] = this._data.hashkey.value;

  if (this._data.rangekey) {
    json.Key[this._data.rangekey.key] = {};
    json.Key[this._data.rangekey.key][this._data.rangekey.type] = this._data.rangekey.value;
  }

  this.addIfExists('TableName', 'tablename', json);

  return json;
};

Jedlik.prototype.tablename = function(tablename) {
  this._data.tablename = tablename;
  return this;
};

var getType = function(value) {
  return Number.isFinite(value) ? 'N' : 'S';
};

Jedlik.prototype.hashkey = function(key, value, type) {
  this._data.hashkey = {
    key: key,
    value: value,
    type: type || getType(value)
  }
  return this;
};

Jedlik.prototype.rangekey = function(key, value, comparisonOp, type) {
  this._data.rangekey = {
    key: key,
    value: value,
    type: type || getType(value),
    comparisonOp: comparisonOp || 'EQ'
  }
  return this;
};

Jedlik.prototype.limit = function(limit) {
  this._data.limit = limit;
  return this;
};

Jedlik.prototype.attributes = function(attributes) {
  this._data.attributes = attributes;
  return this;
};

Jedlik.prototype.throughput = function (throughput) {
  this._data.throughput = throughput;
  return this;
};

Jedlik.prototype.updateAttribute = function(key, value, action) {
  this._data.attributesToUpdate[key] = {
    value: value.toString(),
    type: getType(value),
    action: action || 'PUT'
  };
  return this;
};

Jedlik.prototype.del = function() {
  var json = {
    Key: {}
  };

  json.Key[this._data.hashkey.key] = {};
  json.Key[this._data.hashkey.key][this._data.hashkey.type] = this._data.hashkey.value;

  json.Key[this._data.rangekey.key] = {};
  json.Key[this._data.rangekey.key][this._data.rangekey.type] = this._data.rangekey.value;

  this.addIfExists('TableName', 'tablename', json);

  return json;
};

Jedlik.prototype.createTable = function () {
  var throughput = {
    read: (this._data.throughput && this._data.throughput.read) || 1,
    write: (this._data.throughput && this._data.throughput.write) || 1
  };

  var json = {
    AttributeDefinitions: [],
    KeySchema: [],
    ProvisionedThroughput: {
      ReadCapacityUnits: throughput.read,
      WriteCapacityUnits: throughput.write
    },
    TableName: this._data.tablename
  };

  if(this._data.hashkey) {
    json.AttributeDefinitions.push({
      AttributeName: this._data.hashkey.key,
      AttributeType: this._data.hashkey.type
    });
    json.KeySchema.push({
      AttributeName: this._data.hashkey.key,
      KeyType: 'HASH'
    });
  } else {
    throw new Error('Setup hash key using "hashkey" method to create a new table');
  }

  if(this._data.rangekey) {
    json.AttributeDefinitions.push({
      AttributeName: this._data.rangekey.key,
      AttributeType: this._data.rangekey.type
    });
    json.KeySchema.push({
      AttributeName: this._data.rangekey.key,
      KeyType: 'RANGE'
    });
  }

  return json;
};

module.exports = Jedlik;
