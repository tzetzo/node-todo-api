//const {mongoose} = require('../db/mongoose'); //OR
const mongoose = require('mongoose');

//create a Mongoose Model for the Documents we will store; creates a constructor function;
const Todo = mongoose.model('Todo', { // Mongoose will auto create a Collection todos on first Document save if the Collection does not exist; second argument is the Schema
  text: { //field
    type: String, //Mongoose typecasts boolean and numbers to strings when a string is expected!
    required: true, //validator
    minlength: 1, //validator
    trim: true  //validator
  }, //https://mongoosejs.com/docs/validation.html
  completed: {  //field
    type: Boolean,  //validation
    default: false  //default when creating docs; changed with app.patch()
  },
  completedAt: {  //field
    type: Number, //validation
    default: null //default when creating docs; changed with app.patch()
  },
  // used to Associate the todos with the user id – To make the todos endpoints private
  // that way users can access only todos they created
  //(099 lesson)
  _creator: { //field with the User._id who created the Todo
    type: mongoose.Schema.Types.ObjectId, //validation; https://mongoosejs.com/docs/schematypes.html#objectids
    required: true //validator
  }
});

module.exports = {Todo};
// //create new instance of Todo:
// const newTodo = new Todo({
//   text: 'Something to do' //Mongoose typecasts boolean and numbers to strings when a string is expected!
// })
//
// //save to MongoDB database:
// newTodo.save()
// .then((doc) => {
//   console.log(JSON.stringify(doc,null,2));
// })
// .catch((err) => {
//   console.log('Unable to save todo');
// });
