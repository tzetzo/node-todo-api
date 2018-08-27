const {User} = require('../models/user');

//middleware function for authentication
const authenticate = (req, res, next) => {
  const token = req.header('x-auth');

  //create a Model method
  User.findByToken(token).then((user) => {
    if(!user) { //fired when token was valid but no user found with that token
      // res.status(401).send(); OR:
        return Promise.reject(); //will fire the catch below
    }

    //assign the user object to the request object property user so it
    //can be used inside the callback of the route function that used the authenticate middleware
    req.user = user;
    //req.token = token;
    next(); //allows the callback function of the route function to be called
  }).catch((e) => { //fired when token was invalid or no token provided
    res.status(401).send();
  });
};

module.exports = {authenticate};
