'use strict';
const { getCollection } = require('./db')

const hello = async (event) => {
  const test = await getCollection('test')
  const response = await test.insert({"hello":"DocumentDB"})
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Queried',
        response
      },
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

module.exports = {
  hello,
}
