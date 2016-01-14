var AWS = require('aws-sdk');
AWS.config.region = 'ap-northeast-1';

var host = process.env.DYNAMODB_PORT_8000_TCP_ADDR || 'localhost';
console.log('DynamoDB Host: '+host);
var db = new AWS.DynamoDB({endpoint: new AWS.Endpoint('http://'+host+':8000')});

var winesTableName = 'wines';

db.listTables(function(err, data) {
  var found = false;
  data.TableNames.map(function (name) {
    found |= (name == winesTableName);
  });
  if (! found) {
    var params = {
      TableName: winesTableName,
      AttributeDefinitions: [{
          AttributeName: 'ID',
          AttributeType: 'S'
      }],
      KeySchema: [{
          AttributeName: 'ID',
          KeyType: 'HASH'
      }],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      }
    };
    db.createTable(params, function(err, data) {
      if (err) console.log(err, err.stack);
      else     console.log(data);
    });
  }
});

exports.findById = function(req, res) {
    var id = req.params.id;
    var params = {
      TableName: winesTableName,
      Key: {
        ID: {S: id}
      }
    };
    db.getItem(params, function(err, data) {
      if (err) res.status(500).send(err.stack);
      else     res.json(data.Item);
    });
};

exports.findAll = function(req, res) {
    var params = {
      TableName: winesTableName,
      Select: "ALL_ATTRIBUTES"
    };
    db.scan(params, function(err, data) {
      if (err) res.status(500).send(err.stack);
      else     res.json({
        items: data.Items,
        count: data.Count
      });
    });
};

exports.addWine = function(req, res) {
    var wine = req.body,
        id = wine.id ? wine.id : new Date().getTime(),
        name = wine.name ? wine.name : 'Wine '+id,
        price = wine.price ? wine.price : 0;
    var params = {
      TableName: winesTableName,
      Item: {
        ID: {S: ''+id},
        Name: {S: ''+name},
        Price: {N: ''+price}
      }
    };
    db.putItem(params, function(err, data) {
      if (err) res.status(500).send(err.stack);
      else     res.json(data)
    });
}

exports.updateWine = function(req, res) {
    var wine = req.body,
        id = req.params.id;
    var params = {
      TableName: winesTableName,
      Key: {
        ID: {S: ''+id}
      },
      AttributeUpdates: {},
      ReturnValues: 'UPDATED_NEW'
    };
    if (wine && wine.name) {
      params.AttributeUpdates.Name = {
        Action: 'PUT',
        Value: {S: ''+wine.name}
      };
    }
    if (wine && wine.price) {
      params.AttributeUpdates.Price = {
        Action: 'PUT',
        Value: {N: ''+wine.price}
      };
    }
    db.updateItem(params, function(err, data) {
      if (err) res.status(500).send(err.stack);
      else     res.json(data);
    });
}

exports.deleteWine = function(req, res) {
    var id = req.params.id;
    var params = {
      TableName: winesTableName,
      Key: {
        ID: {S: ''+id}
      },
      ReturnValues: 'ALL_OLD'
    };
    db.deleteItem(params, function(err, data) {
      if (err) res.status(500).send(err.stack);
      else     res.json(data);
    });
}
