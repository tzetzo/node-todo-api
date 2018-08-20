const mongoose = require('mongoose');

mongoose.Promise = global.Promise;  //use the built-in promise library
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/TodoApp',{ useNewUrlParser: true }); //process.env.MONGODB_URI is used by Heroku when connecting to the Mongolab MongoDB

module.exports = {mongoose};