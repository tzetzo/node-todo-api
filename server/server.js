require('./config/config.js');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');

const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');  //import a Model
const {User} = require('./models/user');  //import a Model

const app = express();

const port = process.env.PORT || 3000;

app.use(bodyParser.json()); //middleware for enabling JSON requests



//browser/postman requests to save document in MongoDB database
app.post('/todos', (req,res) => { //bodyParser converts the JSON req to object
    //create new instance of Todo:
    const todo = new Todo(req.body);  //OR {text: req.body.text}

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
})



app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports.app = app;
