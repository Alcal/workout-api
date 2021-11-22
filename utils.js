const buildResponse = (body, status = 200) =>
  ({
    statusCode: status,
    body: JSON.stringify(
      body,
      null,
      2
    ),
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }
  })

module.exports = {
  buildResponse
}