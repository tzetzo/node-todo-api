const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'User email required'],
    minlength: 1,
    trim: true,
    unique: true,  //makes sure there are no Documents with the same email in the Collection
    validate: {   //Custom validation: https://mongoosejs.com/docs/validation.html
      validator: (v) => { //OR validator: validator.isEmail
        return validator.isEmail(v);  //use the validator library -> https://www.npmjs.com/package/validator
      },
      message: props => `${props.value} is not a valid email!`
    }  //https://mongoosejs.com/docs/validation.html
  },
  password: {
    type: String,
    required: [true, 'User password required'],
    minlength: 6
  },
  tokens: [{  //each object in the tokens array will be a login token – one for when loggedin from mobile phone, one for when loggedin from desktop etc.
    access: { //access will equal the string "auth"
      type: String,
      required: true
    },
    token: {  //token will equal the token generated with jwt.sign(data, 'salt_secretstring');
      type: String,
      required: true
    }
  }]
});

//method to exclude the password & token from the response object(token will only be sent as a Header);
//that way you dont need to use include _.pick(user, ['_id', 'email']) every time you use res.send(user)
UserSchema.methods.toJSON = function () { //we override the mongoose toJSON method here!
  const user = this;
  //const userObject = user.toObject();

  return _.pick(user, ['_id', 'email']);
};

//Instance method; for generating & hashing the Token for each individual User; accessed in script.js as user.generateAuthToken()
UserSchema.methods.generateAuthToken = function () {  //instance method used by individual document instances; this will represent every individual user instance
  var user = this;
  const access = 'auth';

  const token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString(); //using the unique _id property of the user created by MongoDB
  user.tokens = user.tokens.concat([{access, token}]);  //OR [...user.tokens, {access, token}]

  //save the user with the newly generated Token in the MongoDB
  return user.save().then((doc) => {
    return token;
  });
};

//Model method; for verifying the user Token; accessed in authenticate.js as User.findByToken()
UserSchema.statics.findByToken = function (token) {
  var User = this;
  var decoded;

  try {
      decoded = jwt.verify(token, 'abc123'); //makes sure the token was not modified
  } catch (e) {
      // return new Promise((res,rej) => {
      //   reject();
      // }) OR:
      return Promise.reject();
  }

  return User.findOne({
    _id: decoded._id,       //jwt.io to see what properties your decoded token has; the key is the property of the document we are quering against
    'tokens.token': token,  //quotes needed when quering a nested property of the document
    'tokens.access': decoded.access  //'auth'
  })
};

//Model method; for verifying the user email & password; accessed in /users/login
UserSchema.statics.findByCredentials = function (email, password) {
    const User = this;

    return User.findOne({ email }).then((user) => {
        if(!user){
          return Promise.reject();
        }

        return new Promise((resolve, reject) => {
          //verify password provided corresponds to password for that email in MongoDB
            bcrypt.compare(password, user.password, (err, res) => {
              if(res){
                  resolve(user);
              } else {
                  reject();
              }
            });
        });
    });
};

//hash the user password before saving it to the MongoDB
UserSchema.pre('save', function(next) { //using mongoose middleware; runs the callback before we save a doc to the MongoDB -> https://mongoosejs.com/docs/middleware.html
  var user = this;

  if (user.isModified('password')) {  //only hash the password if it was modified(user requested to change it throught a request or the user signs up for the first time)
      bcrypt.genSalt(10, (err, salt) => {  //number of rounds to generate the salt
        bcrypt.hash(user.password, salt, (err, hash) => {
          user.password = hash; //override the plain text password with hashed password
          next();
        });
      });
  } else {
      next();
  }

});

//create a Mongoose Model for the Documents we will store; creates a constructor function;
const User = mongoose.model('User', UserSchema);  // Mongoose will auto create a Collection users; second argument is the Schema

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
