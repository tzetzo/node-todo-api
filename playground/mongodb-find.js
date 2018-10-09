//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => { //connect to the DB; url where DB lives - amazon/heroku/localhost url
  if(err){
    return console.log('Unable to connect to MongoDB server');  //prevent the rest of the function from executing
  }
  console.log('Connected to MongoDB server');

  // db.collection('Todos').find({ //find returns a Cursor Object; http://mongodb.github.io/node-mongodb-native/3.1/api/Cursor.html
  //   _id: new ObjectID('5b76692670faa13f2190fa7a')    //OR {name: 'Tzvetan'}
  // }).toArray()
  // .then((docs) => {
  //   console.log('Todos');
  //   console.log(JSON.stringify(docs,null,2));
  // })
  // .catch((err) => {
  //   console.log('Unable to find documents',err);
  // })


  // db.collection('Todos').find().count() //will return the number of documents in the collection
  // .then((count) => {
  //   console.log(`Todos count: ${count}`);
  // })
  // .catch((err) => {
  //   console.log('Unable to count documents',err);
  // })

  db.collection('Users').find({name: "Tzvetan"}).toArray() //will return all documents with this field/key value pair
  .then((docs) => {
    console.log(JSON.stringify(docs,null,2));
  })
  .catch((err) => {
    console.log('Unable to find documents with that name',err);
  })

  db.close(); //closes the MongoDB connection
});
