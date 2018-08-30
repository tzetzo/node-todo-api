const mongoose = require('mongoose');

//create a Mongoose Model for the Documents we will store; creates a constructor function;
const Todo = mongoose.model('Todo', { // Mongoose will auto create a Collection todos; second argument is the Schema
  text: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  }, //https://mongoosejs.com/docs/validation.html
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Number,
    default: null
  },
  _creator: { //the ID of the User who created the Todo
    type: mongoose.Schema.Types.ObjectId,
    required: true,
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
