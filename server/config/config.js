const env = process.env.NODE_ENV || 'development';  //heroku sets it to 'production'; package.json sets it to 'test' if the test script is executed

console.log('env *****', env);

//manage local environment variables:
if(env === 'development' || env === 'test') {
    const config = require('./config.json');  //auto converts the JSON to Object!
    const envConfig = config[env];  //access either development or test environment object

    Object.keys(envConfig).forEach((key) => { //you can set as many environment variables as you need with process.env
        process.env[key] = envConfig[key];  //process.env.JWT_SECRET for heroku production is not set in config.json!
    });
    //example output:
    // process.env.PORT = 3000;
    // process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
    // process.env.JWT_SECRET = '9834uncr9m3n48cmv48';
}
