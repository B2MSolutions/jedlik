# jedlik

[![Build Status](https://secure.travis-ci.org/B2MSolutions/jedlik.png)](http://travis-ci.org/B2MSolutions/jedlik)
[![David Dependency Overview](https://david-dm.org/B2MSolutions/jedlik.png "David Dependency Overview")](https://david-dm.org/B2MSolutions/jedlik)

## Description
Jedlik is a fluent syntax generator for Amazon's DynamoDB.

## Why Jedlik?
Ányos Jedlik was a Hungarian inventor and engineer.
His best known invention is the principle of [dynamo self-excitation](http://en.wikipedia.org/wiki/%C3%81nyos_Jedlik#Dynamo_invention)

## Example

Jedlik uses a fluent interface to produce DynamobDB query syntax:

```javascript

var Jedlik = require('jedlik'), jedlik = new Jedlik();

var query = jedlik
  .tablename('table_name')
  .hashkey('hash', 'hashvalue')
  .rangekey('range', 'rangevalue', 'BEGINS_WITH')
  .get(['attributes', 'attribute'])
  .query;

```
## Methods

### tablename

The name of the table containing the requested items.

### hashkey

Accepts a key, a value and an optional `ComparisonOperator` which defaults to `EQ`

### rangekey

Same as [hashkey](#hashkey).

### rangekeyBetween
Add rangekey BETWEEN condition

`.rangekeyBetween([keyName], [fromValue], [toValue])`

Use only with `query`

### get

Accepts an array of attributes to get.

### query

Returns the constructed JSON query.

### put

Returns the constructed JSON putItem.

### expected
Add Expected condition for UpdateItem(`.update()`)

`.expected([keyName], [expectedValue], [comparisonOperator])`

Use only with `update`
