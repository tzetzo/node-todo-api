//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

var obj = new ObjectID();
console.log(obj);

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => { //connect to the DB; url where DB lives - amazon/heroku/localhost url
  if(err){
    return console.log('Unable to connect to MongoDB server');
  }
  console.log('Connected to MongoDB server');

  // db.collection('Todos').insertOne({  //Todos collection will be auto created along with the DB TodoApp
  //   text: 'Something to do',  //insert document into MongoDB DB
  //   completed: false
  // }, (err, result) => {
  //   if(err){
  //     return console.log('Unable to insert todo', err);
  //   }
  //   console.log(JSON.stringify(result.ops,undefined,2));
  // });

  db.collection('Users').insertOne({  //Todos collection will be auto created along with the DB TodoApp
    //_id: 123  //can be provided manually; otherwise MongoDB auto generates it
    name: 'Tzvetan',  //insert document into MongoDB DB
    age: 40,
    location: 'Sofia'
  }, (err, result) => {
    if(err){
      return console.log('Unable to insert user', err);
    }
    console.log(JSON.stringify(result.ops[0]._id.getTimestamp(),null,2)); //result.ops[0]._id.getTimestamp()
  });

  db.close(); //closes the MongoDB connection
});
