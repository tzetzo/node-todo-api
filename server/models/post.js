const mongoose = require('mongoose');

//create a Mongoose Model for the Documents we will store; creates a constructor function;
const Post = mongoose.model('Post', { // Mongoose will auto create a Collection todos; second argument is the Schema
  title: {type: String, required: true, minlength: 1, trim: true}, //https://mongoosejs.com/docs/validation.html
  categories: {type: String, required: true, minlength: 1, trim: true},
  content: {type: String, required: true, minlength: 1, trim: true}
});

module.exports = {Post};
