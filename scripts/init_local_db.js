/*
  Utility script used only for the local setup of the dynamo db table.
  Creates a table with the id key to be used to store the already processed snapshots.
*/

var AWS = require("aws-sdk");

AWS.config.update({
    region: "local",
    endpoint: "http://localhost:8000"
  });

const dynamodb = new AWS.DynamoDB();

var params = {
    AttributeDefinitions: [
      {
        AttributeName: "snapshotSpace",
        AttributeType: "S"
      },
      {
        AttributeName: "publishedTimestamp",
        AttributeType: "N"
      },
    ],
    KeySchema: [
      {
        AttributeName: "snapshotSpace",
        KeyType: "HASH"
      },
      {
        AttributeName: "publishedTimestamp",
        KeyType: "RANGE"
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1
    },
    TableName: "snapshots"
  };
  
dynamodb.createTable(params, 
  (err, data) => {
    if (err) {console.log("Error", err); } 
    else { console.log("Created table", data); }
});