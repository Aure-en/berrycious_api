const request = require('supertest');
const path = require('path');
const app = require('./app');

const createPost = async (user, { ingredient, category, published }) => {
  if (ingredient && category) {
    const res = await request(app)
      .post('/posts')
      .set({
        Authorization: `Bearer ${user.token}`,
      })
      .attach('images', path.resolve(__dirname, '../assets/1.png'))
      .field('title', 'Title')
      .field('text', 'Text')
      .field('published', published || true)
      .field('ingredient', ingredient._id)
      .field('category', category._id);
    return res.body;
  }

  if (ingredient && !category) {
    const res = await request(app)
      .post('/posts')
      .set({
        Authorization: `Bearer ${user.token}`,
      })
      .attach('images', path.resolve(__dirname, '../assets/1.png'))
      .field('title', 'Title')
      .field('text', 'Text')
      .field('published', published || true)
      .field('ingredient', ingredient._id);
    return res.body;
  }

  if (category && !ingredient) {
    const res = await request(app)
      .post('/posts')
      .set({
        Authorization: `Bearer ${user.token}`,
      })
      .attach('images', path.resolve(__dirname, '../assets/1.png'))
      .field('title', 'Title')
      .field('text', 'Text')
      .field('published', published || true)
      .field('category', category._id);
    return res.body;
  }

  const res = await request(app)
    .post('/posts')
    .set({
      Authorization: `Bearer ${user.token}`,
    })
    .attach('images', path.resolve(__dirname, '../assets/1.png'))
    .field('title', 'Title')
    .field('text', 'Text')
    .field('published', published || true);
  return res.body;
};

module.exports = createPost;
