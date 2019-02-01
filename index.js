function Jedlik() {
  this._data = {
    attributes: {},
    items: [],
    localSecondaryIndexes: [],
    expected: []
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
    AttributeValueList: [{}],
    ComparisonOperator: 'EQ'
  };

  json.KeyConditions[this._data.hashkey.key].AttributeValueList[0][this._data.hashkey.type] = this._data.hashkey.value.toString();

  if (this._data.rangekey) {
    json.KeyConditions[this._data.rangekey.key] = {
      AttributeValueList: [{}],
      ComparisonOperator: this._data.rangekey.comparisonOp
    };

    json.KeyConditions[this._data.rangekey.key].AttributeValueList[0][this._data.rangekey.type] = this._data.rangekey.value.toString();
  }

  if (this._data.rangekeyBetween) {
    json.KeyConditions[this._data.rangekeyBetween.key] = {
      AttributeValueList: [{}, {}],
      ComparisonOperator: 'BETWEEN'
    }
    json.KeyConditions[this._data.rangekeyBetween.key].AttributeValueList[0][this._data.rangekeyBetween.type] = this._data.rangekeyBetween.valueFrom;
    json.KeyConditions[this._data.rangekeyBetween.key].AttributeValueList[1][this._data.rangekeyBetween.type] = this._data.rangekeyBetween.valueTo;
  }

  this.addIfExists('TableName', 'tablename', json);

  if (!this._data.select) {
    this.addIfExists('AttributesToGet', 'attributes', json);
  }

  if (this._data.starthashkey) {
    json.ExclusiveStartKey = {}
    json.ExclusiveStartKey[this._data.starthashkey.key] = {};
    json.ExclusiveStartKey[this._data.starthashkey.key][this._data.starthashkey.type] = this._data.starthashkey.value.toString();

    if (this._data.startrangekey) {
      json.ExclusiveStartKey[this._data.startrangekey.key] = {};
      json.ExclusiveStartKey[this._data.startrangekey.key][this._data.startrangekey.type] = this._data.startrangekey.value.toString();
    }
  }

  this.addIfExists('Limit', 'limit', json);
  this.addIfExists('Select', 'select', json);
  this.addIfExists('IndexName', 'localIndexName', json);

  if (this._data.ascending === false) {
    json.ScanIndexForward = false;
  }

  return json;
};

Jedlik.prototype.update = function() {

  var json = {
    AttributeUpdates: {},
    Key: {}
  };

  Object.keys(this._data.attributes).forEach(function(key) {
    var attributeToUpdate = this._data.attributes[key];

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

  if (this._data.expected.length > 0){
    json.Expected = {};
  }

  this._data.expected.forEach(function (expectation) {
    json.Expected[expectation.key] = {
      AttributeValueList: [{}],
      ComparisonOperator: expectation.comparisonOp
    };
    json.Expected[expectation.key].AttributeValueList[0][expectation.type] = expectation.value;
  });

  this.addIfExists('TableName', 'tablename', json);
  this.addIfExists('ReturnValues', 'returnvals', json);

  return json;
};

Jedlik.prototype.put = function() {

  var json = {
    Item: {}
  };

  Object.keys(this._data.attributes).forEach(function(key) {
    var attributeToUpdate = this._data.attributes[key];

    json.Item[key] = {};
    json.Item[key][attributeToUpdate.type] = attributeToUpdate.value;
  }.bind(this));

  json.Item[this._data.hashkey.key] = {};
  json.Item[this._data.hashkey.key][this._data.hashkey.type] = this._data.hashkey.value;

  if (this._data.rangekey) {
    json.Item[this._data.rangekey.key] = {};
    json.Item[this._data.rangekey.key][this._data.rangekey.type] = this._data.rangekey.value;
  }

  this.addIfExists('TableName', 'tablename', json);

  return json;
};

Jedlik.prototype.tablename = function(tablename) {
  this._data.tablename = tablename;
  return this;
};

var getType = function(value) {
  if (value == null) {
    return 'NULL';
  }

  if (Array.isArray(value)) {
    return (value.length === 0 || typeof value[0] == 'object') ? 'L' : 'SS';
  }

  return (typeof value == 'object') ? 'M' : Number.isFinite(value) ? 'N' : 'S';
};

var getValue = function(value) {
  if (value == null) {
    return true;
  }

  if (Array.isArray(value)) {
    if (value.length === 0 || typeof value[0] == 'object') {
      var result = [];
      value.forEach(function(item) {
        result.push({ M: getValue(item) });
      });
      return result;
    } else {
      return value;
    }
  }

  if (typeof value == 'object') {
    var result = {},
      itemKeys = Object.keys(value);

    itemKeys.forEach(function(key) {
      var item = value[key];
      result[key] = {};
      result[key][getType(item)] = getValue(item);
    });
    return result;
  }

  return value.toString();
};

Jedlik.prototype.hashkey = function(key, value, type) {
  this._data.hashkey = {
    key: key,
    value: value,
    type: type || getType(value)
  };
  return this;
};

Jedlik.prototype.starthashkey = function(key, value, type) {
  this._data.starthashkey = {
    key: key,
    value: value,
    type: type || getType(value)
  };
  return this;
};

Jedlik.prototype.startrangekey = function(key, value, type) {
  this._data.startrangekey = {
    key: key,
    value: value,
    type: type || getType(value)
  };
  return this;
};

Jedlik.prototype.rangekey = function(key, value, comparisonOp, type) {
  this._data.rangekey = {
    key: key,
    value: value && getValue(value),
    type: type || getType(value),
    comparisonOp: comparisonOp || 'EQ'
  };
  return this;
};

Jedlik.prototype.localSecondaryIndex = function(indexName, key, type, projectionType) {
  this._data.localSecondaryIndexes.push({
    indexName: indexName,
    key: key,
    type: type,
    projectionType: projectionType
  });

  return this;
};

Jedlik.prototype.localIndexName = function(indexName) {
  this._data.localIndexName = indexName;
  return this;
};

Jedlik.prototype.rangekeyBetween = function(key, valueFrom, valueTo) {
  this._data.rangekeyBetween = {
    key: key,
    valueFrom: valueFrom && getValue(valueFrom),
    valueTo: valueTo && getValue(valueTo),
    type: getType(valueFrom)
  };
  return this;
};

Jedlik.prototype.limit = function(limit) {
  this._data.limit = limit;
  return this;
};

Jedlik.prototype.select = function(select) {
  this._data.select = select;
  return this;
};

Jedlik.prototype.ascending = function(ascending) {
  this._data.ascending = ascending;
  return this;
};

Jedlik.prototype.attributes = function(attributes) {
  this._data.attributes = attributes;
  return this;
};

Jedlik.prototype.billingmode = function(billingmode) {
  this._data.billingmode = billingmode;
  return this;
};

Jedlik.prototype.throughput = function(throughput) {
  this._data.throughput = throughput;
  return this;
};

Jedlik.prototype.attribute = function(key, value, action) {
  if (value == null) {
    return this;
  }

  return this.nullableAttribute(key, value, action);
}

Jedlik.prototype.nullableAttribute = function(key, value, action) {
  this._data.attributes[key] = {
    value: getValue(value),
    type: getType(value),
    action: action || 'PUT'
  };
  return this;
};

Jedlik.prototype.returnvals = function(returnvalsType) {
  this._data.returnvals = returnvalsType;
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

Jedlik.prototype.createTable = function() {
  var throughput = {
    ReadCapacityUnits: (this._data.throughput && this._data.throughput.read) || 1,
    WriteCapacityUnits: (this._data.throughput && this._data.throughput.write) || 1
  };

  var json = {
    AttributeDefinitions: [],
    KeySchema: [],
    TableName: this._data.tablename
  };

  if (this._data.billingmode) {
    json.BillingMode = this._data.billingmode;
  }

  if (this._data.billingmode !== "PAY_PER_REQUEST") {
    json.ProvisionedThroughput = throughput;
  }

  if (this._data.hashkey) {
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

  if (this._data.rangekey) {
    json.AttributeDefinitions.push({
      AttributeName: this._data.rangekey.key,
      AttributeType: this._data.rangekey.type
    });
    json.KeySchema.push({
      AttributeName: this._data.rangekey.key,
      KeyType: 'RANGE'
    });
  }

  if (this._data.localSecondaryIndexes[0]) {
    json.LocalSecondaryIndexes = [];
    this._data.localSecondaryIndexes.map(function(localSecondaryIndex) {
      json.AttributeDefinitions.push({
        AttributeName: localSecondaryIndex.key,
        AttributeType: localSecondaryIndex.type
      });
      json.LocalSecondaryIndexes.push({
        IndexName: localSecondaryIndex.indexName,
        KeySchema:[
          {AttributeName: this._data.hashkey.key, KeyType: 'HASH' },
          {AttributeName: localSecondaryIndex.key, KeyType: 'RANGE' }
        ],
        Projection: {
          ProjectionType: localSecondaryIndex.projectionType
        }
      });

    }.bind(this));
  }

  return json;
};

Jedlik.prototype.item = function(item) {
  this._data.items.push(item);
  return this;
};

Jedlik.prototype.batchWrite = function() {
  var json = {
    RequestItems: {}
  };

  var that = this;
  this._data.items.forEach(function(item) {
    var tablename = item.tablename || that._data.tablename;

    if (!json.RequestItems[tablename]) {
      json.RequestItems[tablename] = []
    }

    var itemDDB = {
      PutRequest: {
        Item: {}
      }
    };

    Object.keys(item).forEach(function(key) {
      if (key !== 'tablename') {
        var value = item[key];
        itemDDB.PutRequest.Item[key] = {};
        itemDDB.PutRequest.Item[key][getType(value)] = value.toString();
      }
    });

    json.RequestItems[tablename].push(itemDDB);
  })

  return json;
};

Jedlik.prototype.expected = function (key, value, comparisonOp) {
  this._data.expected.push({
    key: key,
    value: value && getValue(value),
    type: getType(value),
    comparisonOp: comparisonOp
  });
  return this;
};

Jedlik.prototype.batchGet = function() {
  var json = {
    RequestItems: {}
  };

  var that = this;
  this._data.items.forEach(function(item) {
    var tablename = item.tablename || that._data.tablename;

    if (!json.RequestItems[tablename]) {
      json.RequestItems[tablename] = {
        Keys: []
      }
    }

    var key = {};
    Object.keys(item).forEach(function(k) {
      if (k !== 'tablename') {
        key[k] = {};
        var value = item[k];
        key[k][getType(value)] = value.toString();
      };

    });

    json.RequestItems[tablename].Keys.push(key);
  });

  return json;
};

Jedlik.prototype.mapItem = function(item, keysToOmit) {
  var self = this;
  var ret = {},
  keysToOmit = keysToOmit || [];
  var itemKeys = Object.keys(item);

  for (var i = 0; i < itemKeys.length; i++) {
    var key = itemKeys[i];

    if (keysToOmit.indexOf(key) === -1) {
      var valueObj = item[key],
        type = Object.keys(valueObj)[0],
        value = valueObj[type];

      if (type == 'L') {
        ret[key] = [];

        value.forEach(function(valueObj) {
          var type = Object.keys(valueObj)[0],
            value = valueObj[type];

        ret[key].push(
          type === 'NULL' ? null :
          type === 'M' ? self.mapItem(value) :
          type === 'N' ? parseFloat(value, 10) :
          value);
        });
      } else {
        ret[key] =
          type === 'NULL' ? null :
          type === 'M' ? self.mapItem(value) :
          type === 'N' ? parseFloat(value, 10) :
          value;
      }
    }
  }

  return ret;
};

Jedlik.prototype.mapItems = function(items, keysToOmit) {
  var self = this;
  return items.map(function(item) {
    return self.mapItem(item, keysToOmit);
  });
};

Jedlik.prototype.getItem = function() {
  var json = {
    Key: {}
  };

  if (Array.isArray(this._data.attributes)) {
    json.AttributesToGet = this._data.attributes;
  }

  json.Key[this._data.hashkey.key] = {};
  json.Key[this._data.hashkey.key][this._data.hashkey.type] = this._data.hashkey.value;

  if (this._data.rangekey) {
    json.Key[this._data.rangekey.key] = {};
    json.Key[this._data.rangekey.key][this._data.rangekey.type] = this._data.rangekey.value;
  }

  this.addIfExists('TableName', 'tablename', json);
  return json;
};

module.exports = Jedlik;
