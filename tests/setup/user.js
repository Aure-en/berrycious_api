const request = require('supertest');
const app = require('./app');

const createUser = async () => {
  const res = await request(app).post('/auth/signup').send({
    username: 'User',
    password: 'password',
  });
  return res.body;
};

module.exports = createUser;
