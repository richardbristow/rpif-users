const mongoose = require('mongoose');
const request = require('supertest');

const app = require('../app.js');
const User = require('../UserSchema');

const testUsers = [
  {
    username: 'test-aUsername1',
    email: 'test-email1@example.com',
    password: 'test-password',
    active: true,
  },
  {
    username: 'test-aUsername2',
    email: 'test-email2@example.com',
    password: 'test-password',
    active: false,
  },
];

const responseBodyProperties = [
  '_id',
  'username',
  'email',
  'active',
  'createdAt',
];

const checkResponseBodyProperties = (response, propertyArray) =>
  propertyArray.forEach((prop) => expect(response).toHaveProperty(prop));

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/rpifusers-test');
});

beforeEach(async () => {
  await User.create(testUsers);
});

afterEach(async () => {
  await mongoose.connection.dropCollection('users');
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

test('/create: should have status code 200 and return object with responseBodyPropertiess', async () => {
  await request(app)
    .post('/create')
    .send({
      username: 'test-aUsername3',
      email: 'test-email3@example.com',
      password: 'test-password',
      active: true,
    })
    .expect(200)
    .expect((res) => {
      checkResponseBodyProperties(res.body, [
        ...responseBodyProperties,
        'password',
      ]);
    });
});

test('/create: should return error "User validation failed"', async () => {
  await request(app)
    .post('/create')
    .send({
      username: 'test-aUsername5',
      email: 'test-email5@example.com',
      active: true,
    })
    .expect((res) => {
      expect(res.body).toHaveProperty('name', 'ValidationError');
      expect(res.body.message).toEqual(
        expect.stringContaining('User validation failed'),
      );
    });
});

test('/login: should return a token', async () => {
  await request(app)
    .post('/login')
    .send({
      username: 'test-aUsername1',
      password: 'test-password',
    })
    .expect(200)
    .expect((res) => {
      expect(res.body).toHaveProperty('token');
    });
});

test('/login: should have status code 401 and return "Incorrect Password"', async () => {
  await request(app)
    .post('/login')
    .send({
      username: 'test-aUsername1',
      password: 'wrong-password',
    })
    .expect(401)
    .expect((res) => {
      expect(res.body).toHaveProperty('name', 'Error');
      expect(res.body).toHaveProperty('message', 'Incorrect password');
    });
});

test('/all: should have status code 200, return array of length 3, objects should have responseBodyProperties', async () => {
  await request(app)
    .get('/all')
    .expect(200)
    .expect((res) => {
      expect(res.body).toHaveLength(2);
      checkResponseBodyProperties(res.body[0], responseBodyProperties);
      checkResponseBodyProperties(res.body[1], responseBodyProperties);
    });
});

test('/id/:id: should have status code 200, return "test-aUsername4" object ', async () => {
  const testId = await new User({
    username: 'test-aUsername4',
    email: 'test-email4@example.com',
    password: 'test-password',
    active: true,
  }).save();
  await request(app)
    .get(`/id/${testId._id.toString()}`)
    .expect(200)
    .expect((res) => {
      expect(res.body._id).toEqual(testId._id.toString());
    });
});

test('/delete/:id: should return error "No token provided"', async () => {
  const testUser2 = await User.findOne({ username: 'test-aUsername2' });

  await request(app)
    .delete(`/delete/${testUser2._id.toString()}`)
    .expect(401)
    .expect((res) => {
      expect(res.body).toHaveProperty('name', 'Error');
      expect(res.body).toHaveProperty('message', 'No token provided');
    });
});

test('/delete/:id: should delete user "test-aUsername2"', async () => {
  const testUser2 = await User.findOne({ username: 'test-aUsername2' });

  const {
    body: { token },
  } = await request(app).post('/login').send({
    username: 'test-aUsername1',
    password: 'test-password',
  });

  await request(app)
    .delete(`/delete/${testUser2._id.toString()}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect((res) => {
      checkResponseBodyProperties(res.body, [
        ...responseBodyProperties,
        'password',
      ]);
    });

  const allUsers = await User.find({});
  expect(allUsers).toHaveLength(1);
});
