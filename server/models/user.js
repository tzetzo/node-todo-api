const mongoose = require('mongoose');

//create a Mongoose Model for the Documents we will store; creates a constructor function;
const User = mongoose.model('User', { // Mongoose will auto create a Collection todos; second argument is the Schema
  username: {type: String},
  password: {type: String},
  email: {type: String, required: true, minlength: 1, trim: true}, //https://mongoosejs.com/docs/validation.html
});

module.exports = {User};

//create new instance of Todo:
// const newUser = new User({
//   email: 'tzvetanmarinov@yahoo.com' //Mongoose typecasts boolean and numbers to strings when a string is expected!
// })
//
// //save to MongoDB database:
// newUser.save()
// .then((doc) => {
//   console.log(JSON.stringify(doc,null,2));
// })
// .catch((err) => {
//   console.log('Unable to save todo');
// });
