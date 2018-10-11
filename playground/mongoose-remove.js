//can be independantly executed with "node playground/mongoose-remove.js"

const {ObjectID} = require('mongodb');

const {mongoose} = require('../server/db/mongoose');
const {Todo} = require('../server/models/todo');
const {User} = require('../server/models/user');

//remove all documents in the todos collection
// Todo.remove({}).then((result) => {
//   console.log(result);
// });

//returns the removed document
// Todo.findOneAndRemove({_id: "5b7af1648583b443142c3e87"}).then((doc) => {
//   console.log(doc);
// });

//returns the removed document
// Todo.findByIdAndRemove('5b7af1db8583b443142c3e88').then((doc) => {
//   console.log(doc);
// });
