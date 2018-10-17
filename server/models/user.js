//const {mongoose} = require('../db/mongoose'); //OR
const mongoose = require('mongoose'); //used for creating the Model & Schema

const validator = require('validator'); //used for email validation
const jwt = require('jsonwebtoken');  //used for the token generation
const _ = require('lodash');
const bcrypt = require('bcryptjs'); //used for password hashing - salt integrated

// example user document:
// {
//   email: 'tzetzo@yahoo.com',
//   password: 'yn38yn38zslagcwpevo',
//   tokens: [
//     {access:'auth', token:'ngoveiwjfvqvrvwrgw'} //login token object; // access specifies the token type - "auth" for authentication in this case; in the future we might decide to have a token for email or resetting a password access:'email'/'passwordreset'
//   ]
// }

// 1. define a Schema,
// 2. define our custom methods on the Schema &
// 3. create the Model
const UserSchema = new mongoose.Schema({ //088 lesson
  email: {
    type: String, //Mongoose typecasts boolean and numbers to strings when a string is expected!
    required: [true, 'User email required'],  //validator
    minlength: 1, //validator
    trim: true,
    unique: true,  //makes sure there are no Documents with the same email in the Collection
    validate: {   //Custom validation: https://mongoosejs.com/docs/validation.html
      validator: (v) => { //OR validator: validator.isEmail //088 lesson
        return validator.isEmail(v);  //use the validator library -> https://www.npmjs.com/package/validator
      },
      message: props => `${props.value} is not a valid email!`
    }  //https://mongoosejs.com/docs/validation.html
  },
  password: { //needed for signup & login
    type: String,
    required: [true, 'User password required'],
    minlength: 6
  },
  tokens: [{  //each object in the tokens array will be a login token – one for when loggedin from mobile phone, one for when loggedin from desktop etc.
    access: {// access specifies the token type - "auth" for authentication in this case;
      type: String,//in the future we might decide to have a token for email or resetting a password access:'email'
      required: true
    },
    token: {  //token will equal the token generated with jwt.sign(data, 'salt_secretstring');
      type: String, //token is needed for after user loggedin for subsequent CRUD HTTP requests
      required: true
    }
  }]
});

//Instance method - methods object used - called on individual user document; exclude the password & token from the response object(token will only be sent as a Header);
//that way you dont need to use include _.pick(user, ['_id', 'email']) every time you use res.send(user);
//this method determines what exactly is sent back to the browser when Mongoose Model is converted to JSON:
//used for both app.post('/users'...) & app.post('/users/login'...) endpoints
//090 lesson
UserSchema.methods.toJSON = function () { //we override the mongoose toJSON method here! //090 lesson
  const user = this;  //the reason we dont use arrow function here!
  //const userObject = user.toObject();
  //return _.pick(userObject, ['_id', 'email']);
  return _.pick(user, ['_id', 'email']);
};

//Instance method - methods object used - called on individual user document;
//for generating & hashing the Token for each individual User;
//used for both app.post('/users'...) & app.post('/users/login'...) endpoints
//090 lesson
UserSchema.methods.generateAuthToken = function () {  //instance method used by individual document instances; this will represent every individual user instance
    const user = this;  //the reason we dont use arrow function here! //090 lesson //lowercase user to signify we refer to individual user
    return new Promise((resolve,reject) => {

          const access = 'auth';  //used to identify the type of token; see UserSchema

          //generate a token with jsonwebtoken library; token data with salt are hashed; token data is the payload of the token(https://jwt.io):
          const token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString(); //using the unique _id property of the user created by MongoDB; //process.env.JWT_SECRET environment variable set inside config.json; 090 lesson; toString() might not be necessary since it is already a string!
          //update user document tokens array(dont use push() since there is inconsistency in MongoDB versions):
          user.tokens = user.tokens.concat([{access, token}]);  //OR [...user.tokens, {access, token}]

          //save the user with the newly generated Token in the MongoDB
          user.save()
          .then((doc) => {
              resolve(token);
          }).catch((err) => {
              reject(err);
          });

    });
};

//Instance method - methods object used - called on individual user document;
//used in logout app.delete('/users/me/token'...) only
//097 lesson
UserSchema.methods.removeToken = function (token) {  //instance method used by individual document instances; this will represent every individual user instance
    const user = this;  //the reason we dont use arrow function here!
    return new Promise((resolve,reject) => {

        //User.update({ email: 'new@test.com' //updates the email
        //User.update({ _id: user._id}, { __v: 777  //updates __v to 777 for the user with the given _id
        user.update({
          $pull: {        //removes items from an array that match certain criteria
            tokens: {token}   //pull & delete from the tokens array any object that has a token property equal to the token argument passed
          }
        }).then(() => {
            resolve();
        }).catch(() => {
            reject();
        })

    });
};

//our custom Model method - statics object used; verifies the user token, finds the user & returns it;
//used only by the authenticate.js middleware
//091 lesson
UserSchema.statics.findByToken = function (token) {
    const User = this;  //the reason we dont use arrow function here! uppercase User to signify we refer to the Model
    return new Promise((resolve,reject) => {

          //make sure the token was not modified
          jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => { //environment variable set inside config.json
              if(err){
                reject();
              }

              User.findOne({
                _id: decoded._id,       //jwt.io to see what properties your decoded token has; the key is the property of the document we are quering against
                'tokens.token': token,  //quotes needed when quering a nested property of the document
                'tokens.access': decoded.access  //'auth'
              })
              .then((user) => {
                  if(!user){
                      reject();
                  }
                  resolve(user);
              });
          });

    });
};

//Model method - statics object used; for verifying the user email & password;
//used in app.post('/users/login'...) only
//095 lesson
UserSchema.statics.findByCredentials = function (email, password) {
    const User = this;  //the reason we dont use arrow function here!
    return new Promise((resolve, reject) => {

          User.findOne({ email }) //asynchronous call which we retrieve with then()
          .then((user) => {
              if(!user){
                  reject();
              }

              //verify password provided corresponds to hashed password for that user in MongoDB
              bcrypt.compare(password, user.password, (err, res) => {
                  if(res){
                      resolve(user);
                  } else {
                      reject();
                  }
              });
          })
          .catch((err) => {
            reject();
          });

    });
};

//hash the user password before saving it to the MongoDB; only used in signup @ app.post('/users'...)
//Mongoose middleware - https://mongoosejs.com/docs/middleware.html
//092 lesson
UserSchema.pre('save', function(next) { //runs the callback before we save a doc to the MongoDB
  var user = this;  //the reason we dont use arrow function here!

  if (user.isModified('password')) {  //only hash the password if it was modified(user requested to change it throught a request or the user signs up for the first time)
      bcrypt.genSalt(10, (err, salt) => {  //number of rounds to generate the salt; the bigger the number the more time it takes
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
const User = mongoose.model('User', UserSchema);  // Mongoose will auto create a Collection users on first Document save ifthe Collection does not exist; second argument is the Schema

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
