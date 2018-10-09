//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => { //connect to the DB; url where DB lives - amazon/heroku/localhost url
  if(err){
    return console.log('Unable to connect to MongoDB server');
  }
  console.log('Connected to MongoDB server');

  // db.collection('Users').deleteMany({name: 'Tzvetan'}) //the then() & catch() are not required!
  // .then((result) => {
  //   console.log(result);
  // })
  // .catch((err) => {
  //   console.log('Unable to find documents with that name',err);
  // })


  // db.collection('Todos').deleteOne({text: 'Eat lunch'})
  // .then((result) => {
  //   console.log(result);
  // })
  // .catch((err) => {
  //   console.log('Unable to find documents with that name',err);
  // })

  db.collection('Users').findOneAndDelete({_id: new ObjectID("5bbc9531c4c2d13e40b4d462")}) //returns the Document after deleting it
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
  })
  .catch((err) => {
    console.log('Unable to find documents with that name',err);
  })

  //db.close(); //closes the MongoDB connection
});
