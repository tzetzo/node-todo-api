require('./config/config.js');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');  //import a Collection Model
const {User} = require('./models/user');  //import a Collection Model
const {Post} = require('./models/post');  //import a Collection Model
const {authenticate} = require('./middleware/authenticate');

const app = express();

const port = process.env.PORT || 3000;

app.use(bodyParser.json()); //middleware for enabling JSON requests
app.use(cors()); //middleware for removing "No 'Access-Control-Allow-Origin' header"



//browser/postman requests to save document in MongoDB database
app.post('/todos', (req,res) => { //bodyParser converts the JSON req to object

    //create new instance of Todo:
    const todo = new Todo({text: req.body.text});  //make sure only text is requested!;

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
app.get('/todos', (req,res) => { //bodyParser converts the JSON req to object

    Todo.find() //mongoose query; https://mongoosejs.com/docs/queries.html
    .then((docs) => {
        //console.log(JSON.stringify(docs,null,2));
        res.send({docs}); //{docs} is equivalent to {docs: docs}; better way to return res instead of just an array
    })
    .catch((err) => {
        res.status(400).send(err);  //httpstatuses.com
    });
});



app.get('/todos/:id', (req, res) => {
    //res.send(req.params);   //vs req.query, req.body
    const id = req.params.id;
    //validate the ID
    if (!ObjectID.isValid(id)) {
      return res.status(400).send(); //bad request
    }
    //find the document
    Todo.findById(id)
    .then((doc) => {
      if(!doc){
        return res.status(404).send({status: 404, error: 'Not found'});  //not found
      }
      res.send({doc});  //gives us more flexibility as to what to send back like custom status etc;
    })
    .catch((err) => {
        res.status(400).send();
    })
});



app.delete('/todos/:id', (req, res) => {
    const id = req.params.id;

    //validate the ID
    if (!ObjectID.isValid(id)) {
      return res.status(400).send(); //bad request
    }
    //remove the document
    Todo.findByIdAndRemove(id)
    .then((doc) => {
      if(!doc){
        return res.status(404).send();  //not found
      }
      res.send({doc});
    }).catch((err) => {
        res.status(400).send();
    });
});



//update a resource/document
app.patch('/todos/:id', (req, res) => {
    const id = req.params.id;
    // console.log(req.body);  //req.body can be {text: 'some text here', completed: true, not_needed: 'text'}
    const body = _.pick(req.body, ['text', 'completed']); //only keep the text & copleted properties; body will be {text: 'some text here', completed: true}
    // console.log(body);
    //validate the ID
    if (!ObjectID.isValid(id)) {
      return res.status(400).send(); //bad request
    }

    if(_.isBoolean(body.completed) && body.completed) {
      body.completedAt = new Date().getTime();
    } else {
      body.completed = false;
      body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}) //similar to returnOriginal from MongoDB-update
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




//Signup by creating email & password in MongoDB & obtaining a Token; browser/postman requests to save document(signup user) in MongoDB database(document password is hashed before the save if not already hashed), add a JWT & save in MongoDB again, return the JWT & the document to the browser
app.post('/users', (req,res) => { //this route is used for signup!; bodyParser converts the JSON req to object
    const body = _.pick(req.body, ['email', 'password']); //returns an object with the email & password properties & values;

    //create new instance of User:
    const user = new User(body);

    //save the new user to the  MongoDB database:
    user.save() //UserSchema.pre() mongoose  middleware defined in user.js is called before save() to hash the password
    .then(() => {
        return user.generateAuthToken();  //call method which will add token to the user & save it again to the MongoDB database
    })
    .then((token) => {
        res.header('x-auth', token).send(user); //x-auth is a custom header; return the document containing only the _id & email to the browser -> the mongoose toJSON method overrided in user.js is used behind the scenes
    })
    .catch((err) => {
        res.status(400).send(err);  //httpstatuses.com
    });
});

//Login with email & password already in MongoDB & obtaining a Token
app.post('/users/login', (req,res) => { //this route is used for login existing users!; bodyParser converts the JSON req to object
    const body = _.pick(req.body, ['email', 'password']); //returns an object with the email & password properties & values;
    const {email, password} = body;
    let loggedInUser;

    //find the user in mongoDB
    User.findByCredentials(email, password) //should immediately return Promise object in order to be able to use the following then():
    .then((user) => { //to be able to use then() here we return asynchronous code
      loggedInUser = user;
      return user.generateAuthToken();  //creates additional token to the one/s already created for that user
    })
    .then((token) => {
        res.header('x-auth', token).send(loggedInUser); //x-auth is a custom header; return the document containing only the _id & email to the browser -> the mongoose toJSON method overrided in user.js is used behind the scenes
    })
    .catch((e) => {
        res.status(400).send();
    });
});

//Logout route; logout by deleting the Token;
app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token)
    .then(() => {
        res.status(200).send();
    }).catch(() => {
        res.status(400).send();
    });
});

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
    //validate the ID
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

    //validate the ID
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

module.exports.app = app;
