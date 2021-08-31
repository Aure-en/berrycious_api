const request = require('supertest');
const app = require('./app');

const createComment = async (post) => {
  const res = await request(app)
    .post(`/posts/${post._id}/comments`)
    .set({
      'Content-Type': 'application/json',
    })
    .send({
      username: 'User',
      content: 'Content',
    });
  return res.body;
};

module.exports = createComment;
