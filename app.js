require('dotenv').config();
const express = require('express');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const util = require('util');

const User = require('./UserSchema');

const sign = util.promisify(jwt.sign);
const verify = util.promisify(jwt.verify);

const app = express();

// body-parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create user
app.post('/create', async (req, res, next) => {
  console.log('POST body: ', req.body);

  try {
    // const hashPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      active: req.body.active,
    });
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

// Get all users
app.get('/all', async (req, res, next) => {
  try {
    const data = await User.find({});
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});

// Get via ID
app.get('/id/:id', async (req, res, next) => {
  console.log('PARAMS: ', req.params);

  try {
    const data = await User.findById(req.params.id);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});

// Get with query params
app.get('/search', async (req, res, next) => {
  console.log('QUERY: ', req.query);

  try {
    const data = await User.find(req.query);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});

// Delete via id
app.delete('/delete/:id', async (req, res, next) => {
  console.log('PARAMS: ', req.params);

  const authorizationHeader = req.headers.authorization;

  try {
    if (authorizationHeader) {
      const token = authorizationHeader.split(' ')[1];
      await verify(token, process.env.JWTSECRETKEY);
      const data = await User.findByIdAndDelete(req.params.id);
      res.status(200).json(data ? data : {});
    } else {
      throw new Error('No token provided');
    }
  } catch (error) {
    next(error);
  }
});

// Delete query
app.delete('/delete', async (req, res, next) => {
  console.log('QUERY: ', req.query);

  const authorizationHeader = req.headers.authorization;

  try {
    if (authorizationHeader) {
      const token = authorizationHeader.split(' ')[1];
      await verify(token, process.env.JWTSECRETKEY);
      const data = await User.deleteMany(req.query);
      res.status(200).json(data);
    } else {
      throw new Error('No token provided');
    }
  } catch (error) {
    next(error);
  }
});

// authenticate user and return token
app.post('/login', async (req, res, next) => {
  console.log('POST body; ', req.body);

  try {
    const loginUser = await User.findOne({
      username: req.body.username,
    }).select('username email password');

    const passwordCheck = await bcrypt.compare(
      req.body.password,
      loginUser.password,
    );

    if (passwordCheck) {
      const token = await sign(
        { username: loginUser.username, email: loginUser.email },
        process.env.JWTSECRETKEY,
      );

      res.status(200).json({ token });
    } else {
      throw new Error('Incorrect password');
    }
  } catch (error) {
    next(error);
  }
});

// catch-all unknown routes
app.get('*', (req, res) => {
  res.status(404).json({ name: 'Bad Request', message: 'Unknown route.' });
});

// middleware error handling
app.use((error, req, res, next) => {
  const errorObject = {
    name: error.name,
    message: error.message,
    // stack: error.stack,
  };

  if (
    // error.name === 'UnauthorizedError' ||
    error.name === 'JsonWebTokenError' ||
    error.message === 'Incorrect password' ||
    error.message === 'No token provided'
  ) {
    res.status(401).json(errorObject);
  } else if (error.message.includes('E11000 duplicate key error')) {
    res.status(409).json(errorObject);
  } else {
    res.status(500).json(errorObject);
  }
});

module.exports = app;
