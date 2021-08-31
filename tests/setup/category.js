const request = require('supertest');
const app = require('./app');

const createCategory = async (user, name = 'Category') => {
  const res = await request(app)
    .post('/categories')
    .set({
      Authorization: `Bearer ${user.token}`,
      'Content-Type': 'application/json',
    })
    .send({ name });
  return res.body;
};

module.exports = createCategory;
