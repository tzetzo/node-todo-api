const {SHA256} = require('crypto-js');  //256 is the number of bits used for the resulting hash; npm i crypto-js --save-dev
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const password = '123abc';  //comes from the user

// bcrypt.genSalt(10, (err, salt) => {  //number of rounds to generate the salt
//   bcrypt.hash(password, salt, (err, hash) => {
//     console.log(hash);
//   });
// });

const hashedPassword = '$2a$04$PW/E0sejbx9ujgfk4QmAwuE1eoIywCc2HkIpxdN6XaaLvTtw5qcxm'; //say comes from DB

bcrypt.compare(password, hashedPassword, (err, res) => {
  console.log(res);
});

// var data ={
//   id: 10
// };
//
// var token = jwt.sign(data, '123abc');      //takes the object & the salt secret string, hashes it & returns the token
// console.log(token);
// var decoded = jwt.verify(token, '123abc') ;   //takes the token and the salt secret string & makes sure the data was not manipulated
// console.log('decoded', decoded);

// //hash a string
// var message = 'I am user number 3';
// var hash = SHA256(message).toString();
// console.log(`message: ${message}`);
// console.log(`hash: ${hash}`);
//
// //data sent from the server to the browser:
// var data = {
//   id:4  //say this is the ID of a user saved in the Document he created
// };
// //instead of sending the data to the browser we create and send a token:
// var token = {
//   data, //same as data:data
//   hash: SHA256(JSON.stringify(data) + 'somesecret').toString() //hashed value of data + salt secret string
// }
//
//
// //changing the token on the browser side before making new requests to the server
// token.data.id = 5;
// token.hash = SHA256(JSON.stringify(token.data)).toString(); //browser does not know the salt/somesecret string
//
//
// //testing if the token received from the browser was changed
// var resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString();
// if(resultHash === token.hash){
//   console.log('Dat was not changed');
// } else {
//   console.log('Data was changed. Do not trust!');
// }
