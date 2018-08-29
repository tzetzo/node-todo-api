const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../server');
const {Todo} = require('../models/todo'); //used for additional testing
const {User} = require('../models/user'); //used for additional testing

const {todos, populateTodos, users, populateUsers} = require('./seed/seed')


//delete all documents in the collection & insert the todos documents in the collection; that way we have control over what values we are testing
beforeEach(populateTodos);
//beforeEach runs before every use case i.e. before every if()
beforeEach(populateUsers);

describe('POST /todos', () => {

    it('should create a new todo document', (done) => {

      const text = 'test todo text';
      request(app)  //using supertest library
        .post('/todos')
        .send({text})
        .expect(200)
        .expect((res) => {
          expect(res.body.text).toBe(text);  //using expect library  //OR expect(res.body.text).toBe(text))
        })
        .end((err,res) => { //some additional testing
          if(err){
            return done(err);
          }
          Todo.find({text}).then((todos) => {
            expect(todos.length).toBe(1);
            expect(todos[0].text).toBe(text);
            done();
          })
          .catch((err) => done(err));
        });
    });

    it('should not create todo with invalid body data', (done) => {
      request(app)  //using supertest library
        .post('/todos')
        .send({})
        .expect(400)
        .end((err,res) => {
          if(err) {
            return done(err);
          }
          Todo.find().then((todos) => {
            expect(todos.length).toBe(2);
            done();
          }).catch((e) => done(e));
        });
    });

});

describe('GET /todos', () => {

    it('should find all todo documents', (done) => {

      request(app)  //using supertest library
        .get('/todos')
        .expect(200)
        .expect((res) => {
          expect(res.body.docs.length).toBe(2)  //using expect library
        })
        .end(done);
    })

});

describe('GET /todos/:id', () => {

    it('should return 400 Bad request when ID is not valid', (done) => {
      //console.log(id);
      request(app)  //using supertest library
        .get('/todos/123')  //using invalid mongoDB ID!
        .expect(400)
        .expect((res) => {
          // console.log(res.body);
          expect(res.body).toEqual({})  //using expect library
        })
        .end(done);
    })
    it('should return 404 Not found when there is no doc with that ID', (done) => {

      request(app)  //using supertest library
        .get(`/todos/${new ObjectID().toHexString()}`) //using non-existing mongoDB ID!
        .expect(404)
        .expect((res) => {
          expect(res.body).toEqual({status: 404, error: 'Not found'})  //using expect library
        })
        .end(done);
    })
    it('should return a doc according to its ID', (done) => {

      request(app)  //using supertest library
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .expect(200)
        .expect((res) => {
          //console.log(res.body);
          expect(res.body.doc._id).toBe(`${todos[0]._id}`) ; //using expect library
          expect(res.body.doc.text).toBe(todos[0].text) ;
        })
        .end(done);
    })

});

describe('DELETE /todos/:id', () => {

    it('should return 400 Bad request when ID is not valid', (done) => {
      //console.log(id);
      request(app)  //using supertest library
        .delete('/todos/123')  //using invalid mongoDB ID!
        .expect(400)
        .expect((res) => {
          // console.log(res.body);
          expect(res.body).toEqual({})  //using expect library
        })
        .end(done);
    })
    it('should return 404 Not found when there is no doc with that ID', (done) => {

      request(app)  //using supertest library
        .delete(`/todos/${new ObjectID().toHexString()}`) //using non-existing mongoDB ID!
        .expect(404)
        .expect((res) => {
          expect(res.body).toEqual({})  //using expect library
        })
        .end(done);
    })
    it('should return the deleted doc', (done) => {

      request(app)  //using supertest library
        .delete(`/todos/${todos[0]._id.toHexString()}`)
        .expect(200)
        .expect((res) => {
          //console.log(res.body);
          expect(res.body.doc._id).toBe(`${todos[0]._id.toHexString()}`) ; //using expect library
          expect(res.body.doc.text).toBe(todos[0].text) ;
        })
        .end((err,res) => {
          if(err) {
            return done(err);
          }
          Todo.findById(todos[0]._id.toHexString())
            .then((todo) => { //should be null since deleted already
              // console.log(todo);
              expect(todo).toNotExist();
              done();
            })
            .catch((e) => done(e));
        });
    })

});



describe('PATCH /todos/:id', () => {

    it('should update the todo', (done) => {
      const body = {text: 'first test todo changed', completed: true, fakeprop: 'nooooo'}; //the last property simulates an unwanted input coming from the user
      //console.log(id);
      request(app)  //using supertest library
        .patch(`/todos/${todos[0]._id.toHexString()}`)  //using invalid mongoDB ID!
        .send(body)
        .expect(200)
        .expect((res) => {
          // console.log(res.body);
          expect(res.body.doc.completed).toBe(true);  //using expect library
          expect(res.body.doc.completedAt).toBeA('number');
          expect(res.body.doc.text).toBe(body.text);
        })
        .end(done);
    });

    it('should clear completedAt when todo is not completed', (done) => {
      let body = {text: 'second test todo changed', completed: false, fakeprop: 'nooooo'}; //the last property simulates an unwanted input coming from the user
      request(app)  //using supertest library
        .patch(`/todos/${todos[1]._id.toHexString()}`)  //using invalid mongoDB ID!
        .send(body)
        .expect(200)
        .expect((res) => {
          expect(res.body.doc.completed).toBe(false);  //using expect library
          expect(res.body.doc.completedAt).toNotExist();
          expect(res.body.doc.text).toBe(body.text);
        })
        .end(done);
    });

});




describe('GET /users/me', () => {
    it('should return user user if authenticated', (done) => {
        request(app)
          .get('/users/me')
          .set('x-auth', users[0].tokens[0].token)
          .expect(200)
          .expect((res) => {
              expect(res.body._id).toBe(users[0]._id.toHexString());
              expect(res.body.email).toBe(users[0].email);
          })
          .end(done);
    });

    it('should return 401 if not authenticated', (done) => {
      request(app)
          .get('/users/me')
          // .set('x-auth', 'token')
          .expect(401)
          .expect((res) => {
              expect(res.body).toEqual({});
          })
          .end(done);
    });
});


 describe('POST /users', () => {
    const email = 'veneta@example.com';
    const password = '1162cm';

    it('should create a user', (done) => {

        request(app)
          .post('/users')
          .send({email, password})
          .expect(200)
          .expect((res) => {
            expect(res.headers['x-auth']).toExist();
            expect(res.body._id).toExist();
            expect(res.body.email).toBe(email);
          })
          .end((err,res) => {
            if(err) {   //if error the test will fail
              return done(err);
            }
            User.find({ email })
              .then((user) => { //should be null since deleted already
                expect(user).toExist();
                expect(user.password).toNotBe(password);
                done();
              })
              .catch((e) => done(e));
          });
    });

    it('should return validation errors if request invalid', (done) => {
          request(app)
            .post('/users')
            .send({email: users[0].email, password: 'wrong'})
            .expect(400)
            .end(done);

          // request(app)
          //   .post('/users')
          //   .send({email: 'asen@example.com', password: 'wrong'})
          //   .expect(400)
          //   .end(done);
    });

    it('should not create user if email in use', (done) => {
          request(app)
            .post('/users')
            .send({email: users[0].email, password: users[0].password})
            .expect(400)
            .end(done);
    });
 })




 describe('POST /users/login', () => {

    it('should login user and return auth token', (done) => {
      request(app)
        .post('/users/login')
        .send({email: users[1].email, password: users[1].password})
        .expect(200)
        .expect((res) => {
          expect(res.headers['x-auth']).toExist();
        })
        .end((err, res) => {
            if(err) {
              return done(err);
            }
            User.findById(users[1]._id).then((user) => {
                expect(user.tokens[0]).toInclude({
                  access: 'auth',
                  token: res.headers['x-auth']
                });
                done();
            }).catch((e) => done(e));
        });
    });

    it('should reject invalid login', (done) => {
      request(app)
        .post('/users/login')
        .send({email: users[1].email, password: 'wrong'})
        .expect(400)
        .expect((res) => {
          expect(res.headers['x-auth']).toNotExist();
        })
        .end((err, res) => {
            if(err) {
              return done(err);
            }
            User.findById(users[1]._id).then((user) => {  //also check if no token has been created
                expect(user.tokens.length).toBe(0);
                done();
            }).catch((e) => done(e));
        });
    });

 })


 describe('DELETE /users/me/token', () => {

    it('should remove auth token on logout', (done) => {
      request(app)
        .delete('/users/me/token')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .end((err,res) => {
          if(err) {   //if error the test will fail
            return done(err);
          }
          User.findById(users[0]._id.toHexString())
            .then((user) => {
              expect(user.tokens.length).toBe(0);
              done();
            })
            .catch((e) => done(e));
        });
    });


 })
