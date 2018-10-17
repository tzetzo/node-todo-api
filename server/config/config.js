//heroku sets process.env.NODE_ENV to 'production';
//package.json sets it to 'test' if the test script is executed
const env = process.env.NODE_ENV || 'development';

console.log('env *****', env);

//manage local environment variables;
//Heroku environment variables are set by Heroku itself:
if(env === 'development' || env === 'test') {
    //config.json should not be committed to github!
    //contains all environment variables - process.env.PORT/MONGODB_URI/JWT_SECRET
    //eventual third party API keys should be kept secret
    const config = require('./config.json'); //auto converts the JSON to Object!
    //console.log(JSON.stringify(config, null,2));  //node server/config/config.js

    //when you want to use variable to access an object property you have to use subscript notation:
    const envConfig = config[env];  //access either development or test environment object

    Object.keys(envConfig).forEach((key) => { //you can set as many environment variables as you need with process.env
        process.env[key] = envConfig[key];  //process.env.JWT_SECRET for heroku production is not set in config.json!
    });
    //example output:
    // process.env.PORT = 3000;
    // process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
    // process.env.JWT_SECRET = '9834uncr9m3n48cmv48';
}
