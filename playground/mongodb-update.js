//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => { //connect to the DB; url where DB lives - amazon/heroku/localhost url
  if(err){
    return console.log('Unable to connect to MongoDB server');
  }
  console.log('Connected to MongoDB server');

  // db.collection('Todos').findOneAndUpdate({ //http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#findOneAndUpdate
  //     _id: new ObjectID('5b76b1f870faa13f2191162d')   //filter
  // },{
  //     $set: {completed: true} //https://docs.mongodb.com/manual/reference/operator/update/
  // },{
  //     returnOriginal: false
  // }).then((result) => {
  //   console.log(result);
  // });

  db.collection('Users').findOneAndUpdate({ //http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#findOneAndUpdate
      _id: new ObjectID("5b765751028bdd18b0b6de89")   //filter
  },{
      $set: {name: "Tzvetan"}, //https://docs.mongodb.com/manual/reference/operator/update/
      $inc: {age: 1}
  },{
      returnOriginal: false
  }).then((result) => {
    console.log(result);
  });

  db.close(); //closes the MongoDB connection
});
