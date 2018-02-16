// handler.js
const uuid = require('uuid/v4')

const AWS = require('aws-sdk');

const NAMES_TABLE = process.env.NAMES_TABLE;
const dynamoDb = new AWS.DynamoDB.DocumentClient();


module.exports.saveQuestion = (event, context, callback) => {
  let response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  };
  const content = event.queryStringParameters && event.queryStringParameters.content;
  console.log(`Request to question with content ${content}`);

  if (!content) {
    callback(null, {
      statusCode: 400
    })
  }

  const id = uuid()

  const params = {
    TableName: NAMES_TABLE,
    Item: {
      content,
      id
    },
  }

  dynamoDb.put(params, (error) => {
    if (error) {
      console.log(error);
      response.statusCode = 400;
      response.body = JSON.stringify({ error: "Could not save name" })

      callback(null, response);
    }
    response.body = JSON.stringify({ id, content })
    callback(null, response);
  });
}

module.exports.getQuestion = (event, context, callback) => {
  let response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  };

  const id = event.queryStringParameters && event.queryStringParameters.id;

  if (!id) {
    callback(null, {
      statusCode: 400
    })
  }

  console.log(`Request to retrieve question with id ${id}`);

  const params = {
    TableName: NAMES_TABLE,
    Key: {
      id
    },
  }

  dynamoDb.get(params, (error, result) => {
    if (error) {
      console.log(error);
      response.statusCode = 400;
      response.body = JSON.stringify({ error: "Could not retrieve question" })

      callback(null, response);
    }
    if (result.Item) {
      const {content, id } = result.Item;
      response.body = JSON.stringify({ content, id })

      callback(null, response);
    } else {
      response.statusCode = 400;
      response.body = JSON.stringify({ error: "Question does not exist" })

      callback(null, response);
    }
  });
}
