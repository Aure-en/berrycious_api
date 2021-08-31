const request = require('supertest');
const app = require('./app');

const createPost = async (user, { ingredient, category, published }) => {
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
      category,
      published: published || true,
    });
  return res.body;
};

module.exports = createPost;
