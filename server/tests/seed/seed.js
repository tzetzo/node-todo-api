const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('../../models/todo'); //usd for additional testing
const {User} = require('../../models/user');

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const users = [
    {
      _id: userOneId,
      email: 'tzetzo@example.com',
      password: 'userOnePass',
      tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString()
      }]
    },
    {
      _id: userTwoId,
      email: 'kateto@example.com',
      password: 'userTwoPass'
    }
];

const populateUsers = (done) => {
  User.deleteMany({}).then(() => {
    const userOne = new User(users[0]).save(); //individually save each document so that the UserSchema.pre('save'...) from user.jscan run and hash the password
    const userTwo = new User(users[1]).save();  //asynchronous call to MongoDB

    Promise.all([userOne, userTwo]); //makes sure 2+ promises are resolved
  }).then(() => done());
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const todos = [{
  _id: new ObjectID(),
  text: 'First test todo'
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: true,
  completedAt: 333
}];

const populateTodos = (done) => {
  Todo.deleteMany({}).then(() => {  //delete all documents in the DB
    Todo.insertMany(todos);
  }).then((docs) => {
    // id = docs[0]._id;
    done();
  });
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = {todos, populateTodos, users, populateUsers}
