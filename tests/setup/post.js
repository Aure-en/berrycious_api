const request = require('supertest');
const app = require('./app');

const createPost = async (user, ingredient, published = true) => {
  const res = await request(app)
    .post('/posts')
    .set({
      Authorization: `Bearer ${user.token}`,
      'Content-Type': 'application/json',
    })
    .send({
      title: 'Title',
      text: 'Text',
      ingredient,
      published,
    });
  return res.body;
};

module.exports = createPost;
