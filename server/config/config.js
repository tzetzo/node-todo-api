const env = process.env.NODE_ENV || 'development';  //heroku sets it to 'production'; package.json sets it to 'test' if the test script is executed
//console.log('env *****', env);
if(env === 'development') {
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
} else if (env === 'test') {
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest'; //using different database for the tests
}
