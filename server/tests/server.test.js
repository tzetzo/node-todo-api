const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../server');
const {Todo} = require('../models/todo'); //usd for additional testing

const todos = [{_id: new ObjectID(), text: 'first test todo'},
{text: 'second test todo'}];

//delete all documents in the collection & insert the todos documents in the collection; that way we have control over what values we are testing
beforeEach((done) => {
  Todo.remove({}).then(() => {  //delete all documents in the DB
    return Todo.insertMany(todos);
  }).then((docs) => {
    // id = docs[0]._id;
    done();
  });
});

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
    })

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
          expect(res.body).toEqual({})  //using expect library
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
