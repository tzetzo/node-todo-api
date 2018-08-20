//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => { //connect to the DB; url where DB lives - amazon/heroku/localhost url
  if(err){
    return console.log('Unable to connect to MongoDB server');
  }
  console.log('Connected to MongoDB server');

  // db.collection('Users').deleteMany({name: 'Tzvetan'})
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

  db.collection('Users').findOneAndDelete({_id: new ObjectID("5b765a1270423b1ee8e3640d")}) //returns the Document after deleting it
  .then((result) => {
    console.log(result);
  })
  .catch((err) => {
    console.log('Unable to find documents with that name',err);
  })

  //db.close(); //closes the MongoDB connection
});
