//091 lesson

const {User} = require('../models/user');

//middleware function for authentication
const authenticate = (req, res, next) => {  //with middleware we always get these arguments
    //get the token:
    const token = req.header('x-auth');

    //call a custom Model method that verifies the user token, finds the user & returns it;
    User.findByToken(token) //if then() is used it means findByToken immediately returns new Promise
    .then((user) => { //user returned
      //console.log(user);
        if(!user) { //fired when token was valid but no user found with that token
          // res.status(401).send(); OR:
            return Promise.reject(); //will fire the catch below
        }

        //assign the user object & the token to the request object so it
        //can be accessed inside the callback of the route function that used the authenticate middleware
        req.user = user;
        req.token = token; //only used inside the logout endpoint app.delete('/users/me/token'...)

        next(); //allows the callback function of the route function to be called
    }).catch((e) => { //fired when token was invalid or no token provided
        res.status(401).send();
        //we dont call next(); so that the endpoint callback doesnt execute
    });
};

module.exports = {authenticate};
