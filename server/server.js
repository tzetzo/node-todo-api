// set our environment variables
// process.env.PORT/MONGODB_URI/JWT_SECRET before running the code:
require('./config/config.js');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser'); //middleware for enabling JSON requests; converts the JSON req in post requests to object
const cors = require('cors');
const bcrypt = require('bcryptjs');

const {ObjectID} = require('mongodb');  //used to validate Document's ID format! when finding/deleting/updating documents by ID

const {mongoose} = require('./db/mongoose'); //used by all Mongoose queries behind the scenes! - todo.save(), Todo.find() etc.
const {Todo} = require('./models/todo');  //import a Collection Model to find/update/delete Documents
const {User} = require('./models/user');  //import a Collection Model to find/update/delete Documents
const {Post} = require('./models/post');  //import a Collection Model to find/update/delete Documents
const {authenticate} = require('./middleware/authenticate'); //middleware needed for the authentication

const app = express();

const port = process.env.PORT;

app.use(bodyParser.json()); //middleware for enabling JSON requests; converts the JSON req in post requests to object
app.use(cors()); //middleware for removing "No 'Access-Control-Allow-Origin' header"



//endpoint to create & save document in MongoDB database
app.post('/todos', authenticate, (req,res) => { //bodyParser converts the JSON req to object

    //create new instance of Todo:
    const todo = new Todo({
      text: req.body.text,
      //associate the todo document with the user who created it:
      _creator: req.user._id  //accessed through authenticate.js
    });  //make sure only text is requested!;

    //save to MongoDB database:
    todo.save()
    .then((doc) => {
        //console.log(JSON.stringify(doc,null,2));
        res.send(doc);
    })
    .catch((err) => {
        res.status(400).send(err);  //httpstatuses.com
    });
});



//browser/postman requests to get all documents from MongoDB database
app.get('/todos', authenticate, (req,res) => {

    //find all todo documents who's _creator field value has the provided user ID:
    Todo.find({_creator: req.user._id}) //mongoose query; //req.user._id accessed through authenticate.js //https://mongoosejs.com/docs/queries.html
    .then((docs) => {
        //console.log(JSON.stringify(docs,null,2));
        res.send({docs}); //{docs} is equivalent to {docs: docs}; better way to return res instead of just an array
    })
    .catch((err) => {
        res.status(400).send(err);  //httpstatuses.com
    });
});



app.get('/todos/:id', authenticate, (req, res) => {
    //res.send(req.params);   //vs req.query, req.body
    //extract the ID request/route param from the URL:
    const id = req.params.id;
    //validate the ID format:
    if (!ObjectID.isValid(id)) {
      return res.status(400).send(); //bad request
    }
    //find the document with given ID & who's _creator field value has the provided user ID:
    Todo.findOne({_id: id, _creator: req.user._id}) //req.user._id accessed through authenticate.js
    .then((doc) => {
      if(!doc){ //null is returned when ID does not exist in the DB
        return res.status(404).send({status: 404, error: 'Not found'});  //not found
      }
      res.send({doc});  //gives us more flexibility as to what to send back like custom status etc;
    })
    .catch((err) => {
        res.status(400).send(); //intentionally not sending the error object
    })
});



app.delete('/todos/:id', authenticate, async (req, res) => {
    try {
        //extract the ID request/route param from the URL:
        const id = req.params.id;
        //validate the ID format
        if (!ObjectID.isValid(id)) {
          return res.status(400).send(); //bad request
        }
        //find & remove the document with given ID & who's _creator field value has the provided user ID:
        const doc = await Todo.findOneAndRemove({_id: id, _creator: req.user._id}); //req.user._id accessed through authenticate.js
        if(!doc){ //null is returned when ID does not exist in the DB
          return res.status(404).send();  //not found
        }
        res.send({doc});
    } catch (e) {
        res.status(400).send();
    }

    // const id = req.params.id;
    //
    // //validate the ID format
    // if (!ObjectID.isValid(id)) {
    //   return res.status(400).send(); //bad request
    // }
    // //remove the document
    // Todo.findOneAndRemove({_id: id, _creator: req.user._id}) //req.user._id accessed through authenticate.js
    // .then((doc) => {
    //   if(!doc){
    //     return res.status(404).send();  //not found
    //   }
    //   res.send({doc});
    // }).catch((err) => {
    //     res.status(400).send();
    // });
});



//update a resource/document
app.patch('/todos/:id', authenticate, (req, res) => { //bodyParser converts the JSON req to object
    const id = req.params.id;
    // console.log(req.body);  //req.body can be {text: 'some text here', completed: true, not_needed: 'text'}
    const body = _.pick(req.body, ['text', 'completed']); //only keep the text & copleted fields/properties thus avoiding other fields/properties we dont want them to send; body will be {text: 'some text here', completed: true}
    // console.log(body);
    //validate the ID format
    if (!ObjectID.isValid(id)) {
      return res.status(400).send(); //bad request
    }

    if(_.isBoolean(body.completed) && body.completed) {
      body.completedAt = new Date().getTime();
    } else {
      body.completed = false;
      body.completedAt = null;
    }

    Todo.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true}) //similar to returnOriginal from MongoDB-update //req.user._id accessed through authenticate.js
    .then((doc) => {
      if(!doc){
        return res.status(404).send();  //not found
      }
      res.send({doc});
    })
    .catch((e) => {
      res.status(400).send();
    })
});




//Signup user
app.post('/users', async (req,res) => { //bodyParser converts the JSON req to object
    try {
        const body = _.pick(req.body, ['email', 'password']); //returns an object with the email & password properties & values;
        //create new instance of User:
        const user = new User(body);
        //Mongoose middleware UserSchema.pre('save',...) is called behind the scenes before save() to hash the password;
        //save user document in MongoDB:
        await user.save();
        //generate Token & save it in the user document in MongoDB again:
        const token = await user.generateAuthToken();
        //UserSchema.methods.toJSON() is called behind the scenes to return
        //user document with only _id & email & the Token in the Headers:
        res.header('x-auth', token).send(user); //x-auth is a custom header;
    } catch (e) {
        res.status(400).send(e);  //httpstatuses.com
    }

    // const body = _.pick(req.body, ['email', 'password']); //returns an object with the email & password properties & values;
    //
    // //create new instance of User:
    // const user = new User(body);
    //
    // //UserSchema.pre() is called before save() to hash the password:
    // user.save()
    // .then(() => {
    //     //UserSchema.methods.generateAuthToken() is called to generate Token & save it in the user document in MongoDB:
    //     return user.generateAuthToken();
    // })
    // .then((token) => {
    //      //UserSchema.methods.toJSON() is called behind the scenes to return user document with only _id & email & the Token in the Headers:
    //     res.header('x-auth', token).send(user); //x-auth is a custom header name;
    // })
    // .catch((err) => {
    //     res.status(400).send(err);  //httpstatuses.com
    // });
});

//Login user with email & password already in MongoDB & obtaining a Token
app.post('/users/login', async (req,res) => { //this route is used for login existing users!; bodyParser converts the JSON req to object
    try {
        const body = _.pick(req.body, ['email', 'password']); //returns an object with the email & password properties & values;
        const {email, password} = body; //plain text password
        //find the user by email in mongoDB &
        //verify password correspnds to the hashed one in MongoDB for that user:
        const user = await User.findByCredentials(email, password);
        //generate Token & save it in the user document in MongoDB
        const token = await user.generateAuthToken();
        //UserSchema.methods.toJSON() is called behind the scenes to return
        //user document with only _id & email & the Token in the Headers:
        res.header('x-auth', token).send(user); //x-auth is a custom header;
    } catch (e) {
        res.status(400).send();
    }

    // const body = _.pick(req.body, ['email', 'password']); //returns an object with the email & password properties & values;
    // const {email, password} = body;
    // let loggedInUser;
    //
    // //find the user in mongoDB
    // User.findByCredentials(email, password) //should immediately return Promise object in order to be able to use the following then():
    // .then((user) => { //to be able to use then() here we return asynchronous code
    //   loggedInUser = user;
    //   return user.generateAuthToken();  //creates additional token to the one/s already created for that user
    // })
    // .then((token) => {
    //     res.header('x-auth', token).send(loggedInUser); //x-auth is a custom header; return the document containing only the _id & email to the browser -> the mongoose toJSON method overrided in user.js is used behind the scenes
    // })
    // .catch((e) => {
    //     res.status(400).send();
    // });
});

//Logout route; logout by deleting the Token;
app.delete('/users/me/token', authenticate, async (req, res) => {
    try {
        //delete the token from the user's tokens array:
        await req.user.removeToken(req.token);  //req.token is saved inside authenticate.js
        res.status(200).send();
    } catch (e) {
        res.status(400).send();
    }

    // req.user.removeToken(req.token)
    // .then(() => {
    //     res.status(200).send();
    // }).catch(() => {
    //     res.status(400).send();
    // });
});


//this endpoint is for testing the authentication only!
//endpoint for fetching the currently authenticated user
//need to provide valid x-auth token; will find associated user & send it back
app.get('/users/me', authenticate, (req, res) => { //browser requests this route with a token in the headers; the callback will be called when the next() is used in the middleware function
  res.send(req.user); //accessing the property created in the authenticate middleware
});




/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//API for the react redux course
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//browser/postman requests to get all documents from MongoDB database
app.get('/api/posts', (req,res) => { //bodyParser converts the JSON req to object

    Post.find() //mongoose query; https://mongoosejs.com/docs/queries.html
    .then((docs) => {
        //console.log(JSON.stringify(docs,null,2));
        res.send(docs);
    })
    .catch((err) => {
        res.status(400).send(err);  //httpstatuses.com
    });
});
app.get('/api/posts/:id', (req, res) => {
    //res.send(req.params);   //vs req.query, req.body
    const id = req.params.id;
    //validate the ID format
    if (!ObjectID.isValid(id)) {
      return res.status(400).send(); //bad request
    }
    //find the document
    Post.findById(id)
    .then((doc) => {
      if(!doc){
        return res.status(404).send({status: 404, error: 'Not found'});  //not found
      }
      res.send(doc);
    })
    .catch((err) => {
        res.status(400).send();
    })
});
//browser/postman requests to save document in MongoDB database
app.post('/api/posts', (req,res) => { //bodyParser converts the JSON req to object
    //create new instance of Todo:
    const post = new Post(req.body);  //OR {text: req.body.text}

    //save to MongoDB database:
    post.save()
    .then((doc) => {
        //console.log(JSON.stringify(doc,null,2));
        res.send(doc);
    })
    .catch((err) => {
        res.status(400).send(err);  //httpstatuses.com
    });
});
app.delete('/api/posts/:id', (req, res) => {
    const id = req.params.id;

    //validate the ID format
    if (!ObjectID.isValid(id)) {
      return res.status(400).send(); //bad request
    }
    //remove the document
    Post.findByIdAndRemove(id)
    .then((doc) => {
      if(!doc){
        return res.status(404).send();  //not found
      }
      res.send(doc);
    }).catch((err) => {
        res.status(400).send();
    });
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports.app = app;  //used by server.test.js only!
