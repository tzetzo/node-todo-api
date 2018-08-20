//https://mongoosejs.com/docs/queries.html

const {ObjectID} = require('mongodb');

const {mongoose} = require('../server/db/mongoose');
const {Todo} = require('../server/models/todo');
const {User} = require('../server/models/user');

// const id = '5b79797454720c07801a7757';
//validate ID
// if (!ObjectID.isValid(id)) {
//   console.log('ID not valid');
// }

// Todo.find({_id: id})  //returns array of document objects or empty array
// .then((docs) => { console.log(docs) })
// .catch((err) => { console.log(err) });
//
// Todo.findOne({_id: id}) //returns a document object or null
// .then((doc) => { console.log(doc) })
// .catch((err) => { console.log(err) });

// Todo.findById(id) //returns a document object or null
// .then((doc) => {
//   if (!doc) { //check if null is returned
//     return console.log('Id not found');
//   }
//   console.log(doc);
// })
// .catch((err) => { console.log('ID not valid') });


User.findById('5b77e25c6791752748062cef') //returns a document object or null
.then((doc) => {
  if (!doc) { //check if null is returned
    return console.log('ID not found');
  }
  console.log(JSON.stringify(doc,null,2));
  // mongoose.disconnect();
})
.catch((err) => { console.log('ID not valid') });
