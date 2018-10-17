//Configure Mongoose//

const mongoose = require('mongoose');

//setup mongoose to use Promises:
mongoose.Promise = global.Promise;  //use the built-in Promise library instead of mongoose default callbacks!
//connect to the MongoDB Server;
//when deployed on Heroku process.env.MONGODB_URI is auto set by it:
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true }); //process.env.MONGODB_URI is used by Heroku when connecting to the Mongolab MongoDB; git bash -> heroku config

//used by all Mongoose queries behind the scenes! - todo.save(), Todo.find() etc.
module.exports = {mongoose};
