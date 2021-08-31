const request = require('supertest');
const path = require('path');
const { dbConnect, dbDisconnect } = require('../setup/mongoTesting');
const createUser = require('../setup/user');
const createCategory = require('../setup/category');
const createIngredient = require('../setup/ingredient');
const createPost = require('../setup/post');
const app = require('../setup/app');

let user;
let ingredient;
let category;

beforeAll(async () => {
  await dbConnect();
  user = await createUser();
  ingredient = await createIngredient(user);
  category = await createCategory(user);
});

afterAll(() => dbDisconnect());

describe('Post creation', () => {
  test('Anonymous users cannot create posts', async () => {
    const res = await request(app)
      .post('/posts')
      .set({
        'Content-Type': 'application/json',
      })
      .send({
        title: 'Title',
        text: 'Text',
      });
    expect(res.status).toBe(401);
  });

  test('Authenticated users can create posts', async () => {
    const res = await request(app)
      .post('/posts')
      .set({
        Authorization: `Bearer ${user.token}`,
      })
      .attach('images', path.resolve(__dirname, '../assets/1.png'))
      .field('title', 'Title')
      .field('text', 'Text')
      .field('published', true)
      .field('ingredient', ingredient._id)
      .field('category', category._id);

    const post = res.body;
    expect(post.images.length).toBe(1);
    expect(post.category.length).toBe(1);
    expect(post.ingredient.length).toBe(1);
    expect(post.author).toBe(user.user._id);
    expect(post.title).toBe('Title');
    expect(post.text).toBe('Text');
    expect(post.published).toBe(true);
  });
});

describe('Post update', () => {
  let post;
  beforeAll(async () => {
    post = await createPost(user, {
      ingredient,
      category,
      published: true,
    });
  });

  test('Anonymous users cannot update posts', async () => {
    const res = await request(app)
      .put(`/posts/${post._id}`)
      .send({
        title: 'Updated Title',
        text: 'Updated Text',
        published: false,
      });
    expect(res.status).toBe(401);
  });

  test('A post author can update their post', async () => {
    const res = await request(app)
      .put(`/posts/${post._id}`)
      .set({
        Authorization: `Bearer ${user.token}`,
      })
      .send({
        title: 'Updated Title',
        text: 'Updated Text',
        published: false,
      });

    const updatedPost = res.body;
    expect(updatedPost.title).toBe('Updated Title');
    expect(updatedPost.text).toBe('Updated Text');
    expect(updatedPost.published).toBe(false);
  });
});

describe('Post deletion', () => {
  let post;
  beforeAll(async () => {
    post = await createPost(user, {
      ingredient,
      category,
      published: true,
    });
  });

  test('Anonymous users cannot delete posts', async () => {
    const res = await request(app)
      .delete(`/posts/${post._id}`);
    expect(res.status).toBe(401);
  });

  test('Post authors can delete their posts', async () => {
    const res = await request(app)
      .delete(`/posts/${post._id}`)
      .set({
        Authorization: `Bearer ${user.token}`,
      });
    expect(res.body.success).toBeDefined();
  });
});

describe('Post list', () => {
  let post;
  beforeAll(async () => {
    post = await createPost(user, {
      ingredient,
      category,
      published: true,
    });
  });

  test('Users can see posts', async () => {
    const res = await request(app).get('/posts');
    expect(res.body.length).toBeGreaterThan(1);
  });
});

describe('Post detail', () => {
  let post;
  beforeAll(async () => {
    post = await createPost(user, {
      ingredient,
      category,
      published: true,
    });
  });

  test('Users can see a specific post', async () => {
    const res = await request(app).get(`/posts/${post._id}`);
    expect(res.body.title).toBe(post.title);
    expect(res.body.text).toBe(post.text);
  });
});
