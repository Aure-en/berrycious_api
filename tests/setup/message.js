const request = require('supertest');
const app = require('./app');

const createMessage = async () => {
  const res = await request(app)
    .post('/messages')
    .set({
      'Content-Type': 'application/json',
    })
    .send({
      name: 'Name',
      email: 'Email',
      message: 'Message',
    });
  return res.body;
};

module.exports = createMessage;
