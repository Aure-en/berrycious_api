const request = require('supertest');
const { dbConnect, dbDisconnect } = require('../setup/mongoTesting');
const createUser = require('../setup/user');
const createPost = require('../setup/post');
const createComment = require('../setup/comment');
const app = require('../setup/app');

let user;
let post;

beforeAll(async () => {
  await dbConnect();
  user = await createUser();
  post = await createPost(user, {});
});

afterAll(() => dbDisconnect());

describe('Comment creation', () => {
  test('Comments can be written on a post anonymously', async () => {
    const res = await request(app)
      .post(`/posts/${post._id}/comments`)
      .set({
        'Content-Type': 'application/json',
      })
      .send({
        username: 'User',
        content: 'Content',
      });

    const comment = res.body;
    expect(comment.username).toBe('User');
    expect(comment.content).toBe('Content');
    expect(comment.post).toBe(post._id);
  });
});

describe('Comments can be nested', () => {
  let comment;
  beforeAll(async () => {
    // Create a comment
    comment = await createComment(post);
  });

  test('Comment can reply to another comment', async () => {
    const res = await request(app)
      .post(`/posts/${post._id}/comments/${comment._id}`)
      .set({
        'Content-Type': 'application/json',
      })
      .send({
        username: 'User 2',
        content: 'Nested comment',
      })
      .redirects(1);
    expect(res.body.parent).toBe(comment._id);
  });
});

describe('Comment deletion', () => {
  let comment;
  beforeAll(async () => {
    // Create a comment
    comment = await createComment(post);
  });

  test('Anonymous users cannot delete comments', async () => {
    const res = await request(app).delete(`/posts/${post._id}/comments/${comment._id}`);
    expect(res.status).toBe(401);
  });

  test('Post author can delete comments on their posts', async () => {
    const res = await request(app)
      .delete(`/posts/${post._id}/comments/${comment._id}`)
      .set({
        Authorization: `Bearer ${user.token}`,
        'Content-Type': 'application/json',
      });
    expect(res.body.success).toBeDefined();
  });
});
