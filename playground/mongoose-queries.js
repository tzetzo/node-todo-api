//can be independantly executed with "node playground/mongoose-queries.js"

//https://mongoosejs.com/docs/queries.html

const {ObjectID} = require('mongodb');

const {mongoose} = require('../server/db/mongoose');  //used by all Mongoose queries behind the scenes! - todo.save(), Todo.find() etc.
const {Todo} = require('../server/models/todo');
const {User} = require('../server/models/user');

// const id = '5b79797454720c07801a7757';
// validate ID before running the queries
// if (!ObjectID.isValid(id)) {
//   console.log('ID not valid');
// }

// Todo.find({_id: id})  //Mongoose auto converts the id to ObjectID!; returns array of document objects or empty array; in this case it will return 1 document since we query by ID!
// .then((docs) => { console.log(docs) })
// .catch((err) => { console.log(err) });
//
// Todo.findOne({_id: id}) //returns a document object or null
// .then((doc) => { console.log(doc) })
// .catch((err) => { console.log(err) });

// Todo.findById(id) //returns a document object or null
// .then((doc) => {
//   if (!doc) { //check if null is returned; happens when valid ID format is used but the ID is not in the DB!
//     return console.log('Id not found');
//   }
//   console.log(doc);
// })
// .catch((err) => { console.log('ID not valid') }); //when invalid ID format is used


User.findById('5b86ed5e0172c22e48d64187') //returns a document object or null
.then((doc) => {
  if (!doc) { //check if null is returned
    return console.log('ID not found');
  }
  console.log(JSON.stringify(doc,null,2));
  // mongoose.disconnect();
})
.catch((err) => { console.log('ID not valid') });
