const MongoClient = require('mongodb').MongoClient

const { DB_NAME } = process.env

//Create a MongoDB client, open a connection to DocDB; as a replica set,
//  and specify the read preference as secondary preferred

const getCollection = async (collectionName) => {
  const collection = await new Promise((resolve, reject) => {
    MongoClient.connect(
      process.env.DB_CONNECTION_STRING,
      { useNewUrlParser: true },
      (err, client) => {
        if(err) reject(err);
        db = client.db(DB_NAME);
        resolve(db.collection(collectionName));
      }
    );
  }).catch(err => { throw err })
  return collection
}

module.exports = {
  getCollection,
}